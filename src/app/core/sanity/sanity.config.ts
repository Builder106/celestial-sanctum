// Sanity connection config — non-secret (project IDs and dataset names are
// public-by-design for the CDA). For private-data access you'd add a token,
// which is NOT what this file is for.
//
// Replace these values after running `npm create sanity@latest -- --output-path studio`
// from the repo root. Until then the SanityService falls back to hardcoded
// content so the build keeps working.
export const sanityConfig = {
  projectId: 'jsf7d3td',
  dataset: 'production',
  apiVersion: '2025-01-01',
  // useCdn:false hits api.sanity.io directly (no CDN cache). The fetch is
  // server-side per request anyway, so the CDN's edge-caching doesn't help
  // an SSR app, and it caused stale empty arrays after the initial seed
  // (CDN cached "no documents" before the import landed). Free tier rate
  // limits (25 rps/project) are plenty for a parish site.
  useCdn: false,
} as const;

export const isSanityConfigured = (): boolean => sanityConfig.projectId.length > 0;
