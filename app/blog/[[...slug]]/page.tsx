import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import type { ReactElement } from 'react';
import Link from 'next/link';
import { BlogPostPage } from '@nanisoft/prism-ui/pages/blog-post-page';

import { getMdxComponents } from '@/lib/mdx-components';
import { blogSource } from '@/lib/source';

// Optional catch-all: `/blog` renders the reverse-chronological index,
// `/blog/<slug>` the post. The optional root keeps the static export
// satisfiable; drafts are excluded from params, the index, and prev/next —
// they cannot be reached.

interface PageProps {
  params: Promise<{ slug?: string[] }>;
}

function published() {
  return blogSource
    .getPages()
    .filter((post) => !post.data.draft)
    .sort((a, b) => (a.data.date < b.data.date ? 1 : -1));
}

export function generateStaticParams(): Array<{ slug?: string[] }> {
  // The root entry (`/blog`) is required under `output: export` for an
  // optional catch-all.
  return [{ slug: undefined }, ...published().map((post) => ({ slug: post.slugs }))];
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) {
    return {
      title: 'Blog',
      description:
        'The NaniSoft company blog: the platform, the design language, and the honest state of everything we ship.',
    };
  }
  const page = blogSource.getPage(slug);
  if (!page) return {};
  return { title: page.data.title, description: page.data.description };
}

/**
 * The index stays this site's own content, and the post becomes the design system's
 * Page for one.
 *
 * The index is a deliberate design rather than a default: the four blog lists in this
 * family are four designs, and the design system deliberately ships no index. So the
 * four dates, the four titles and the tag runs are still composed here, in this
 * repository's own stylesheet, and only the post screen moved.
 *
 * The post moved because the frontmatter of a post is a contract, and a contract
 * belongs to something that can be checked. `BlogPostPage` takes the title, the
 * standfirst, the displayed date and the machine date as separate props, so a field
 * that is not passed cannot quietly be missing, and it owns the trail to the
 * neighbouring posts rather than each site deriving it.
 *
 * Two words appear on the page that were not there before: the trail now says
 * `Previous` and `Next` beside the titles, where the old markup drew an arrow glyph.
 * A glyph is punctuation a screen reader reads as punctuation; a word is a label.
 */
export default async function BlogPage({ params }: PageProps): Promise<ReactElement> {
  const { slug } = await params;

  if (!slug) {
    const posts = published();
    return (
      <div className="site-catalog">
        <p className="site-eyebrow">nanisoft, blog</p>
        <h1 className="site-catalog__title">The company blog</h1>
        <p className="site-catalog__lede">
          The platform, the design language, and the honest state of everything we ship.
        </p>
        <ul className="site-blog-list">
          {posts.map((post) => (
            <li key={post.url}>
              <Link href={post.url} className="site-blog-list__title">
                {post.data.title}
              </Link>
              <p className="site-blog-list__description">{post.data.description}</p>
              <p className="site-mono site-blog-list__meta">
                <time dateTime={post.data.date}>{post.data.date}</time>
                {post.data.tags.length > 0 && <span> / {post.data.tags.join(' / ')}</span>}
              </p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const page = blogSource.getPage(slug);
  if (!page || page.data.draft) notFound();

  // Chronological prev/next across published posts.
  const chronological = [...published()].reverse();
  const index = chronological.findIndex((post) => post.url === page.url);
  const previous = index > 0 ? chronological[index - 1] : undefined;
  const next = index >= 0 && index < chronological.length - 1 ? chronological[index + 1] : undefined;

  const MDX = page.data.body;

  return (
    <BlogPostPage
      title={page.data.title}
      description={page.data.description}
      date={page.data.date}
      dateTime={page.data.date}
      tags={page.data.tags.map((tag) => ({ label: tag }))}
      previous={previous ? { title: previous.data.title, href: previous.url } : undefined}
      next={next ? { title: next.data.title, href: next.url } : undefined}
      trailLabels={{ previous: 'Previous', next: 'Next' }}
      trailLabel="More posts"
    >
      <MDX components={getMdxComponents()} />
    </BlogPostPage>
  );
}
