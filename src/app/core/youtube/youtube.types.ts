/**
 * One video from the parish YouTube channel feed.
 *
 * Field shapes are flat strings/numbers so the TransferState handoff
 * round-trips through JSON cleanly. The browser deserializes the publish
 * date only when it needs to format it for display.
 */
export interface YouTubeVideo {
  id: string;
  title: string;
  url: string;
  thumbnailUrl: string;
  publishedAt: string;
  description: string;
  views?: number;
}
