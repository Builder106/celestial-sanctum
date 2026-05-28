import type { VercelRequest, VercelResponse } from '@vercel/node';
import { timingSafeEqual } from 'crypto';

// POST /api/sanity-publish-hook — receives a Sanity webhook on every doc
// publish and creates an empty commit on `main` via the GitHub API. The
// commit message identifies the publish source ("CMS: published <type>/<id>"),
// which then appears in Vercel's deployment list view when the resulting
// git push triggers an automatic build. Gives the parish a real audit
// trail in `git log` for every content change without polluting the repo
// with content data.
//
// Env vars:
//   GITHUB_PUBLISH_TOKEN     — fine-grained PAT with Contents:write on
//                              Builder106/celestial-sanctum
//   SANITY_WEBHOOK_SECRET    — optional. If set, the function checks for
//                              a matching `X-Webhook-Secret` header on each
//                              request. Configure the header in Sanity's
//                              webhook "Headers" section. Recommended for
//                              production (rejects random POSTs to this URL).

const REPO = 'Builder106/celestial-sanctum';
const BRANCH = 'main';
const GH = 'https://api.github.com';

interface SanityWebhookPayload {
  _type?: string;
  _id?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  // Wrap the entire handler so any unexpected throw (parse error, missing
  // header, etc.) becomes a logged 500 instead of FUNCTION_INVOCATION_FAILED.
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Optional shared-secret check. Sanity is configured to send a static
    // `X-Webhook-Secret: <value>` header (set in the webhook's Headers
    // section). We compare it to the env var using a constant-time compare.
    //
    // We deliberately do NOT use Sanity's HMAC-signed `sanity-webhook-signature`
    // header here — Vercel's @vercel/node auto-parses JSON bodies before this
    // handler runs, so we can't reconstruct the exact bytes Sanity signed.
    const secret = process.env['SANITY_WEBHOOK_SECRET'];
    if (secret) {
      const provided = req.headers['x-webhook-secret'];
      const providedStr = Array.isArray(provided) ? provided[0] : provided;
      if (typeof providedStr !== 'string') {
        res.status(401).json({ error: 'Missing X-Webhook-Secret header' });
        return;
      }
      const a = Buffer.from(secret);
      const b = Buffer.from(providedStr);
      if (a.length !== b.length || !timingSafeEqual(a, b)) {
        res.status(401).json({ error: 'Invalid webhook secret' });
        return;
      }
    }

    const token = process.env['GITHUB_PUBLISH_TOKEN'];
    if (!token) {
      console.error('[sanity-publish-hook] GITHUB_PUBLISH_TOKEN not set');
      res.status(500).json({ error: 'GitHub token not configured' });
      return;
    }

    const payload = (req.body ?? {}) as SanityWebhookPayload;
    const docType = payload._type ?? 'unknown';
    const docId = payload._id ?? 'unknown';
    const message = `CMS: published ${docType}/${docId}\n\nTriggered automatically by Sanity webhook.`;

    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'Content-Type': 'application/json',
    };

    // 1. Read current HEAD of main.
    const refRes = await fetch(`${GH}/repos/${REPO}/git/refs/heads/${BRANCH}`, { headers });
    if (!refRes.ok) throw new Error(`HEAD ref lookup: ${refRes.status} ${await refRes.text()}`);
    const refJson = (await refRes.json()) as { object: { sha: string } };
    const headSha = refJson.object.sha;

    // 2. Look up that commit's tree SHA so we can reuse it (no file changes).
    const commitRes = await fetch(`${GH}/repos/${REPO}/git/commits/${headSha}`, { headers });
    if (!commitRes.ok) throw new Error(`commit lookup: ${commitRes.status} ${await commitRes.text()}`);
    const commitJson = (await commitRes.json()) as { tree: { sha: string } };
    const treeSha = commitJson.tree.sha;

    // 3. Create a new commit pointing at the same tree (empty diff, just metadata).
    const newCommitRes = await fetch(`${GH}/repos/${REPO}/git/commits`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ message, tree: treeSha, parents: [headSha] }),
    });
    if (!newCommitRes.ok) throw new Error(`commit create: ${newCommitRes.status} ${await newCommitRes.text()}`);
    const newCommit = (await newCommitRes.json()) as { sha: string };

    // 4. Fast-forward main to the new commit. Vercel's git integration
    // picks up the push from here and starts a build.
    const updateRes = await fetch(`${GH}/repos/${REPO}/git/refs/heads/${BRANCH}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ sha: newCommit.sha }),
    });
    if (!updateRes.ok) throw new Error(`ref update: ${updateRes.status} ${await updateRes.text()}`);

    res.status(200).json({ ok: true, sha: newCommit.sha, message });
  } catch (err) {
    const detail = err instanceof Error ? `${err.name}: ${err.message}` : String(err);
    console.error('[sanity-publish-hook] handler failed', detail);
    res.status(500).json({ error: 'Handler failed', detail });
  }
}
