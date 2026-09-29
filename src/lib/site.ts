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
