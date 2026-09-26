// Content source: the company blog, the shape nexus/atlas/alphalens proved.
//
// The fumadocs-mdx Macro API is compile-time: `defineCollections` may only
// appear at top level in this module with a literal `dir`, and the module must
// not re-export the macro. Frontmatter is fumadocs' page schema plus the
// blog's date/tags/draft — no www-specific fields. www has no docs corpus
// (locked scope: landing + about + blog), so there is no docs collection.
import { defineCollections } from 'fumadocs-mdx/macro';
import { loader } from 'fumadocs-core/source';
import { pageSchema } from 'fumadocs-core/source/schema';
import { z } from 'zod';

/** Folder-per-post blog: required ISO date, display-only tags, drafts excluded. */
export const blog = defineCollections({
  type: 'doc',
  dir: 'content/blog',
  schema: pageSchema.extend({
    date: z.string(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const blogSource = loader({
  baseUrl: '/blog',
  source: blog.toFumadocsSource(),
});
