import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * This repository ships no client code, and the two laws that used to need prose to
 * hold it are enforced by that fact rather than by prose.
 *
 * The canvas law said a runtime token read must not carry a hard-coded fallback,
 * because a read that cannot fail hides its own failure. The reveal law said a
 * CSS-authored hidden state must be able to dismiss itself. Both were laws about
 * client code, and this repository has none: the landing is a server component, the
 * pages are server components, the theme is two attributes on the document element
 * and a blocking script the design system ships.
 *
 * So the enforceable version of both laws is the shape of the tree, and this file is
 * that assertion. A clause earns a gate when its violation is silent, and a
 * `'use client'` line at the top of a component is exactly that: nothing throws, the
 * page still builds, and the reader gets a runtime that resolves colours once at
 * mount and paints them on a dark page in light values.
 *
 * **The site bar is the test of whether that is still true, and it is.** The bar is a
 * search trigger, a menu of the family's five sites, a light and dark control and a
 * panel for narrow viewports, which is four pieces of reader state and cannot be a
 * server render. It is `SiteNavbar` from the design system, so the boundary that
 * carries those four controls is a line in that package and not a line here, and
 * `components/site-bar.tsx` composes it from props on the server like any other
 * Block. This file still finds no `'use client'` in this repository, which is the
 * outcome worth having: the page gained a working search and a mode toggle and the
 * client code is still somewhere this repository does not own.
 *
 * If a future change needs client code *here*, this test is where the argument
 * happens, and the answer is a question rather than a deletion: what does the client
 * need that a server render cannot give it?
 */
const ROOT = path.resolve(__dirname, '..');
const SOURCE = /\.(ts|tsx)$/;

/**
 * Directories that hold the site's own source. A list, so a new one is a decision.
 *
 * `components` joined this list with the site bar: a directory that holds one server
 * Component is still a directory this repository owns, and a root that is not scanned
 * is a root where a `'use client'` could be added without this file noticing.
 */
const ROOTS = ['app', 'components', 'lib', 'test'];

/** The two configuration files at the root, which are source too. */
const ROOT_FILES = ['next.config.ts', 'vitest.config.ts'];

function sourceFiles(dir: string, found: string[] = []): string[] {
  if (!existsSync(dir)) return found;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) sourceFiles(full, found);
    else if (SOURCE.test(entry.name)) found.push(full);
  }
  return found;
}

const files = [
  ...ROOTS.flatMap((root) => sourceFiles(path.join(ROOT, root))),
  ...ROOT_FILES.map((file) => path.join(ROOT, file)),
].filter((file) => !file.includes(`${path.sep}test${path.sep}`));

describe('the site has no client code', () => {
  it('reads the whole source tree, so this is not a pass over nothing', () => {
    // Every source file the repository owns is in this list, which is the assertion
    // that matters: a file that is not in the list is a file no law here reaches.
    expect(files.map((file) => path.relative(ROOT, file).split(path.sep).join('/')).sort()).toEqual([
      'app/about/page.tsx',
      'app/api/search/route.ts',
      'app/blog/[[...slug]]/page.tsx',
      'app/layout.tsx',
      'app/not-found.tsx',
      'app/page.tsx',
      'components/site-bar.tsx',
      'lib/bar.ts',
      'lib/landing-content.ts',
      'lib/mdx-components.ts',
      'lib/navigation.tsx',
      'lib/site.ts',
      'lib/source.ts',
      'next.config.ts',
      'vitest.config.ts',
    ]);
  });

  it('carries no use client directive', () => {
    const offenders = files.filter((file) => /^\s*['"]use client['"]/m.test(readFileSync(file, 'utf8')));
    expect(offenders, `a client boundary in ${offenders.join(', ')}`).toEqual([]);
  });

  it('reads no token at runtime, and takes no colour from a computed style', () => {
    // The runtime token-read law, as an assertion about the whole tree rather than
    // about a canvas. The law's wording is in the gate kit and its gate runs over this
    // same tree; this test is here for the other half, which is the file list above. A
    // test that repeats the law's wording is a second copy of the law, and the failure
    // this programme exists to end is four copies of a sentence.
    const pattern = /getPropertyValue|getComputedStyle/;
    const offenders = files.filter((file) => pattern.test(readFileSync(file, 'utf8')));
    expect(offenders, `a runtime token read in ${offenders.join(', ')}`).toEqual([]);
  });

  it('authors no hidden state, so the reveal law has nothing to govern', () => {
    // The reveal law, as an assertion: a CSS-authored hidden state needs an escapable
    // condition, and the cheapest way to be sure there is none is that the stylesheet
    // declares no opacity or visibility of zero at all. The gate kit's hidden-state
    // gate runs here vacuously and prints that it did, which is the half this test
    // cannot see.
    const css = readFileSync(path.join(ROOT, 'app', 'globals.css'), 'utf8');
    expect(css).not.toMatch(/opacity:\s*0\b/);
    expect(css).not.toMatch(/visibility:\s*hidden/);
    expect(css).not.toMatch(/data-reveal|\.is-in/);
  });

  it('imports the design system stylesheet exactly once, in the root layout', () => {
    const importers = files.filter((file) => /@nanisoft\/prism-ui\/styles\.css/.test(readFileSync(file, 'utf8')));
    expect(importers.map((file) => path.relative(ROOT, file).split(path.sep).join('/'))).toEqual([
      'app/layout.tsx',
    ]);
  });
});
