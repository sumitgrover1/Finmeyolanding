import type { MetadataRoute } from 'next';
import { fetchContent } from '@/lib/api';
import { SITE_URL } from '@/lib/site';

/**
 * One page, so one entry — and none at all when the console has marked the page
 * noindex. A sitemap entry for a page that tells crawlers to stay out is an
 * instruction that contradicts itself.
 *
 * A host of its own needs a sitemap of its own: the main site's cannot list a
 * URL on another host, and a search engine will not take its word for one.
 */
export const revalidate = 60;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await fetchContent();
  if (content.meta.noindex) return [];

  return [
    {
      url: `${SITE_URL}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
  ];
}
