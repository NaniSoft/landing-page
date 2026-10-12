import type { MetadataRoute } from 'next';

/**
 * `robots.txt` is a file, not a request this site answers, so it is stated static.
 */
export const dynamic = 'force-static';

/**
 * Everything public on this site is meant to be read, so every crawler is allowed
 * everywhere and is told where the map is.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: '*', allow: '/' },
    sitemap: 'https://nanisoft.com/sitemap.xml',
  };
}
