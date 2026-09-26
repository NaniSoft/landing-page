import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

// Blog content contract: the company blog's launch posts, frontmatter schema,
// and honesty shape. This reads `content/` from disk rather than importing
// lib/source: fumadocs' `defineCollections` is a compile-time macro that only
// the bundler plugin expands, so the loaders cannot run under vitest (the
// finding every site of the family shares).

const ROOT = path.resolve(__dirname, '..');
const BLOG = path.join(ROOT, 'content', 'blog');

const LAUNCH_POSTS = [
  'the-company-that-builds-the-builder',
  'one-design-language-five-sites',
  'directed-by-a-person-built-by-agents',
  'where-the-products-stand',
] as const;

/** Frontmatter body of an MDX file, or null when it has none. */
async function frontmatter(file: string): Promise<string | null> {
  const source = await readFile(file, 'utf8');
  const match = /^---\n([\s\S]*?)\n---/.exec(source);
  return match ? (match[1] ?? null) : null;
}

/** Every folder-post in content/blog. */
async function postSlugs(): Promise<string[]> {
  return (await readdir(BLOG, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

describe('blog content', () => {
  it('ships the launch posts', async () => {
    const slugs = await postSlugs();
    for (const slug of LAUNCH_POSTS) {
      expect(slugs, `missing launch post: ${slug}`).toContain(slug);
    }
  });

  it.each(LAUNCH_POSTS)('%s carries a complete frontmatter', async (slug) => {
    const meta = await frontmatter(path.join(BLOG, slug, 'index.mdx'));
    expect(meta, 'no frontmatter block').toBeTruthy();
    expect(meta).toMatch(/^title: \S/m);
    expect(meta).toMatch(/^description: \S/m);
    // Required ISO date — the index sorts on it.
    expect(meta).toMatch(/^date: '\d{4}-\d{2}-\d{2}'$/m);
    expect(meta).toMatch(/^tags:/m);
    expect(meta).not.toMatch(/^draft: true$/m);
  });

  it.each(LAUNCH_POSTS)('%s has a real body', async (slug) => {
    const source = await readFile(path.join(BLOG, slug, 'index.mdx'), 'utf8');
    const body = source.replace(/^---\n[\s\S]*?\n---/, '').trim();
    expect(body.length, 'post body is too slight to publish').toBeGreaterThan(400);
  });

  it('keeps every post at company level (no product-docs quickstarts)', async () => {
    const posts = await postSlugs();
    for (const slug of posts) {
      const source = (await readFile(path.join(BLOG, slug, 'index.mdx'), 'utf8')).toLowerCase();
      // The company blog tells the platform story; step-by-step product
      // material belongs on the product sites' docs.
      expect(source, `${slug} drifts into quickstart territory`).not.toMatch(/^## quickstart/m);
      expect(source, `${slug} drifts into install steps`).not.toMatch(/^## install/m);
    }
  });
});
