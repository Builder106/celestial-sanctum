import type { PortableTextBlock } from '@portabletext/types';

// Flattens one Portable Text block to a plain paragraph string. Good enough
// for short-prose sections (pastor letter, about-page paragraphs). For richer
// rendering — links, inline marks beyond italic — switch to
// @portabletext/to-html-string and render via [innerHTML].
export function blockToPlainText(block: PortableTextBlock | string): string {
  if (typeof block === 'string') return block;
  if (!Array.isArray(block.children)) return '';
  return block.children
    .map((child) => ('text' in child && typeof child.text === 'string' ? child.text : ''))
    .join('');
}
