import { readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';

import { blogSource } from '@/lib/source';

/**
 * The static search index, served as a file.
 *
 * **A static export has no server, so the index is a file and this route is how the
 * file is written.** `revalidate = false` is the marker Next accepts on a route
 * handler under `output: 'export'`; without it the export build fails rather than
 * emitting nothing. The bar's dialog fetches this once, on the first search, which
 * is why a static export can have search at all: there is no request to make beyond
 * that one, and no runtime between them.
 *
 * **The shape is Prism's, not this site's.** `SearchDialog` declares the four fields
 * a result is drawn from, and a consumer's index is a contract between a build step
 * the consumer owns and a dialog it does not. It is a hand-written array rather than
 * a generated one because this site has six pages: two written as React, one blog
 * index, and four posts.
 *
 * The list of posts is read from `blogSource`, not from the directory, so a draft is
 * excluded here for the same reason it is excluded from the routes, from the blog
 * index and from prev/next: a page that cannot be reached cannot be a search result
 * that goes nowhere. The prose is read from the MDX source beside it, because the
 * compiled body is a component and not text, and a search index of titles alone
 * finds titles.
 *
 * **A post with no file beside it fails this build rather than being indexed with a
 * title and no body.** The two are read from one tree and joined on the slug, so a
 * join that fails is a page a reader could reach and a search could not read, and
 * that is the silent half-published defect this join is here to prevent.
 */

/** One page in the index. The four fields a result is drawn from, and no more. */
interface IndexEntry {
  id: string;
  title: string;
  url: string;
  description?: string;
  content?: string;
}

/** The three pages this site writes as React rather than as MDX. */
const OWN_PAGES: readonly IndexEntry[] = [
  {
    id: '/',
    title: 'NaniSoft',
    url: '/',
    description: 'Software that builds software.',
    content:
      'Nexus, the Agent Factory. Atlas, the Digital Twin Platform. AlphaLens, quantitative trading research for the Indian market. Prism, the design language every one of them is built in.',
  },
  {
    id: '/about',
    title: 'About',
    url: '/about',
    description:
      'NaniSoft builds the factory that builds software: Nexus, the Agent Factory, and the products it ships.',
    content:
      'Nexus, the Agent Factory: orchestration, worker containers, and a human feedback loop. Atlas, digital twins. AlphaLens, market research for the Indian market. Prism, the shared design language. One language across everything: hairline structure, pastel packs, beam-dark, motion that never bounces.',
  },
  {
    id: '/blog',
    title: 'The company blog',
    url: '/blog',
    description:
      'The platform, the design language, and the honest state of everything we ship.',
  },
];

/** Where this site's MDX lives, relative to the repository root. */
const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');

/**
 * A post's frontmatter, as two strings and nothing else.
 *
 * Parsed by hand rather than with a YAML library because the two fields this index
 * needs are `title` and `description`, both of which are single-line scalars in
 * every post, and a general YAML parser would be a dependency in a build step whose
 * whole job is to read six pages. A field that stops being a single line stops being
 * indexed and says so, rather than being silently mis-parsed.
 */
function frontmatter(source: string): { title?: string; description?: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) return {};
  const fields: { title?: string; description?: string } = {};
  for (const line of (match[1] ?? '').split(/\r?\n/)) {
    const field = /^(title|description):\s*(.+)$/.exec(line);
    if (field) fields[field[1] as 'title' | 'description'] = (field[2] ?? '').trim().replace(/^['"]|['"]$/g, '');
  }
  return fields;
}

/**
 * A post's prose, with the markup taken off.
 *
 * Good enough to match a word a reader can see on the page against, which is the
 * whole of what a substring search does with it. Frontmatter, headings, emphasis,
 * code ticks, link syntax and list bullets are all removed; the words and the spaces
 * between them are left, because those are what the query is matched against.
 */
function prose(source: string): string {
  return source
    .replace(/^---\r?\n[\s\S]*?\r?\n---/, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^\s*[-*+]\s+/gm, '')
    .replace(/^\s*\d+\.\s+/gm, '')
    .replace(/[*_>]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Every published post, read from the loader and joined to the MDX beside it. */
function posts(): IndexEntry[] {
  const directories = new Set(
    readdirSync(BLOG_DIR, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name),
  );

  return blogSource
    .getPages()
    .filter((post) => !post.data.draft)
    .map((post) => {
      const slug = post.url.replace(/^\/blog\/?/, '');
      if (!directories.has(slug)) {
        throw new Error(
          `search index: ${post.url} is published from ${slug} but content/blog/${slug} does not ` +
            'exist, so the route a reader can reach has no body for a search to match. The two are ' +
            'read from one tree on purpose; this is that join failing.',
        );
      }
      const source = readFileSync(path.join(BLOG_DIR, slug, 'index.mdx'), 'utf8');
      const fields = frontmatter(source);
      return {
        id: post.url,
        // The loader's own title and description, not the file's: the loader applies
        // the schema and the defaults, so a post whose frontmatter omits a field
        // gets the value a reader sees on the page rather than the one a regex found.
        title: post.data.title,
        url: post.url,
        description: post.data.description ?? fields.description,
        content: prose(source),
      };
    });
}

function index(): IndexEntry[] {
  return [...OWN_PAGES, ...posts()];
}

export const revalidate = false;

export function staticGET(): Response {
  return Response.json(index());
}

export const GET = staticGET;
