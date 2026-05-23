import { mkdirSync, renameSync, rmSync, statSync, unlinkSync, existsSync, rmdirSync, readdirSync } from 'node:fs';
import { dirname, join, basename } from 'node:path';
import { spawnSync } from 'node:child_process';
import type { Reporter, TestCase, TestResult, FullResult } from '@playwright/test/reporter';

// Demo-suite reporter. Two responsibilities:
//   1. Per-test, after the run is fully finished: rename each recorded
//      .webm into a stable e2e/demo/recordings/<slug>.webm path, then
//      convert to .mp4 via ffmpeg if available (better for embedding in
//      the README + GitHub video previews).
//   2. Discard videos for the warmup scenarios (00-warmup-...) since
//      they're throwaways absorbing the Playwright 0-byte-first-test bug.
//
// All work happens in onEnd, not onTestEnd — Playwright doesn't guarantee
// the video file is fully flushed when onTestEnd fires.
const OUTPUT_DIR = join(process.cwd(), 'e2e', 'demo', 'recordings');
const WARMUP_PREFIX = '00-warmup';

interface QueuedVideo {
  sourcePath: string;
  slug: string;
  isWarmup: boolean;
}

export default class DemoReporter implements Reporter {
  private queue: QueuedVideo[] = [];

  onTestEnd(test: TestCase, result: TestResult): void {
    const video = result.attachments.find((a) => a.name === 'video');
    if (!video?.path) return;
    const slug = slugify(test.titlePath().join('-'));
    // Detect warmups by the source feature file path. titlePath doesn't
    // include the "00-warmup" filename prefix.
    const sourceFile = test.location?.file ?? '';
    const isWarmup = sourceFile.includes(WARMUP_PREFIX) || slug.includes(WARMUP_PREFIX);
    this.queue.push({ sourcePath: video.path, slug, isWarmup });
  }

  async onEnd(_result: FullResult): Promise<void> {
    if (this.queue.length === 0) return;
    mkdirSync(OUTPUT_DIR, { recursive: true });

    const ffmpegAvailable = which('ffmpeg');
    let converted = 0;
    let skippedEmpty = 0;
    let skippedWarmup = 0;

    for (const item of this.queue) {
      if (!existsSync(item.sourcePath)) continue;

      // Discard warmup videos AND clean up their per-test folder.
      if (item.isWarmup) {
        safeUnlink(item.sourcePath);
        removeEmptyParent(item.sourcePath);
        skippedWarmup++;
        continue;
      }

      // Playwright occasionally writes a 0-byte video on the first real
      // slot under single-worker. Don't feed an empty file to ffmpeg.
      const size = statSync(item.sourcePath).size;
      if (size === 0) {
        safeUnlink(item.sourcePath);
        removeEmptyParent(item.sourcePath);
        skippedEmpty++;
        continue;
      }

      const webmDest = join(OUTPUT_DIR, `${item.slug}.webm`);
      renameSync(item.sourcePath, webmDest);
      removeEmptyParent(item.sourcePath);

      if (ffmpegAvailable) {
        const mp4Dest = join(OUTPUT_DIR, `${item.slug}.mp4`);
        const result = spawnSync(
          'ffmpeg',
          [
            '-y',
            '-i', webmDest,
            '-c:v', 'libx264',
            '-preset', 'veryfast',
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',
            mp4Dest,
          ],
          { stdio: 'ignore' },
        );
        if (result.status === 0) {
          safeUnlink(webmDest);
          converted++;
        }
      }
    }

    const ffmpegNote = ffmpegAvailable
      ? `${converted} mp4 file(s) in ${OUTPUT_DIR}`
      : `${this.queue.length - skippedWarmup - skippedEmpty} webm file(s) in ${OUTPUT_DIR} (install ffmpeg for mp4 conversion)`;
    console.log(`[demo-reporter] ${ffmpegNote}, skipped ${skippedWarmup} warmup + ${skippedEmpty} empty`);
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function safeUnlink(path: string): void {
  try { unlinkSync(path); } catch { /* ignore */ }
}

function removeEmptyParent(filePath: string): void {
  const dir = dirname(filePath);
  try {
    if (existsSync(dir) && readdirSync(dir).length === 0) {
      rmdirSync(dir);
    }
  } catch { /* ignore */ }
}

function which(cmd: string): boolean {
  const result = spawnSync('which', [cmd], { stdio: 'ignore' });
  return result.status === 0;
}
