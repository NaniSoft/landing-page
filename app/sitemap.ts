import type { MetadataRoute } from 'next';

import { blogSource } from '@/lib/source';

/**
 * `sitemap.xml` is a file, not a request this site answers, so it is stated static.
 * Under `output: export` Next refuses to emit a metadata route it cannot prove is
 * static, and the proof it asks for is this line rather than an inference.
 */
export const dynamic = 'force-static';

/**
 * The map a crawler is given, built from the corpus rather than written out.
 *
 * The blog routes come out of the same loader the pages themselves are built from,
 * so a page that exists is a row and a row that exists is a page. This site has no
 * docs corpus, so the chrome routes are the site: the landing, the two sections the
 * bar carries, and every published post. A post carries its own published date as
 * its last modification, because it is the one date this site publishes.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = 'https://nanisoft.com';

  const chrome: MetadataRoute.Sitemap = [
    { url: `${origin}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${origin}/about`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${origin}/blog`, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const blog: MetadataRoute.Sitemap = blogSource
    .getPages()
    .filter((post) => !post.data.draft)
    .map((post) => ({
      url: `${origin}${post.url}`,
      lastModified: new Date(post.data.date),
      changeFrequency: 'monthly' as const,
      priority: 0.5,
    }));

  return [...chrome, ...blog];
}
