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
 * If a future change needs client code on this site, this test is where the argument
 * happens, and the answer is a question rather than a deletion: what does the client
 * need that a server render cannot give it?
 */
const ROOT = path.resolve(__dirname, '..');
const SOURCE = /\.(ts|tsx)$/;

/** Directories that hold the site's own source. A list, so a new one is a decision. */
const ROOTS = ['app', 'lib', 'test'];

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
      'app/blog/[[...slug]]/page.tsx',
      'app/layout.tsx',
      'app/not-found.tsx',
      'app/page.tsx',
      'lib/landing-content.ts',
      'lib/mdx-components.ts',
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
    // The canvas law, as an assertion about the whole tree rather than about a canvas.
    const pattern = /getPropertyValue|getComputedStyle|prismBrandPacks|prismCssVarKey/;
    const offenders = files.filter((file) => pattern.test(readFileSync(file, 'utf8')));
    expect(offenders, `a runtime token read in ${offenders.join(', ')}`).toEqual([]);
  });

  it('authors no hidden state, so the reveal law has nothing to govern', () => {
    // The reveal law, as an assertion: a CSS-authored hidden state needs an escapable
    // condition, and the cheapest way to be sure there is none is that the stylesheet
    // declares no opacity or visibility of zero at all.
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
