/**
 * Where this page lives.
 *
 * Its own host, separate from finmeyo.com, so the code can be worked on and
 * deployed by somebody who has no access to the main site. Used for canonical
 * links, the sitemap and structured data — all of which have to name the host
 * a visitor actually reaches, not the one the leads go to.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://loan.finmeyo.com').replace(/\/$/, '');

/** The brand, for titles and structured data. */
export const SITE_NAME = 'Finmeyo';

/** Search engines show about 160 characters of a description, then cut it. */
export const DESCRIPTION_MAX = 158;

/**
 * A description that fits: cut at the last sentence that fits, else the last
 * word, never mid-word. The same rule the main site applies to every page.
 */
export function fitDescription(text: string, max = DESCRIPTION_MAX): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const window = clean.slice(0, max);
  const sentenceEnd = Math.max(window.lastIndexOf('. '), window.lastIndexOf('? '), window.lastIndexOf('! '));
  if (sentenceEnd >= max * 0.6) return window.slice(0, sentenceEnd + 1);
  const wordEnd = window.slice(0, max - 1).lastIndexOf(' ');
  return `${window.slice(0, wordEnd > 0 ? wordEnd : max - 1).replace(/[\s,;:–—-]+$/, '')}…`;
}
