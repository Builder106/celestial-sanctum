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
  useCdn: true,
} as const;

export const isSanityConfigured = (): boolean => sanityConfig.projectId.length > 0;
