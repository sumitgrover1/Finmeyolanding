import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/site';

/**
 * One page, so one entry.
 *
 * A host of its own needs a sitemap of its own: the main site's cannot list a
 * URL on another host, and a search engine will not take its word for one.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
