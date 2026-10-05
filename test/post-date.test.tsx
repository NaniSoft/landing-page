import { readFileSync } from 'node:fs';
import path from 'node:path';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { BlogPostPage } from '@nanisoft/prism-ui/pages/blog-post-page';

import { PostDate } from '@/components/post-date';
import { displayDate, isoDate } from '@/lib/post-date';

/**
 * A post's date, as the two strings it is.
 *
 * Both of this site's screens were printing one of them. The blog index put the
 * frontmatter's own value inside its `time` element, so a reader saw `2026-09-26` under
 * every title on the page, and the post Page was handed that same value twice, once as
 * the words a reader reads and once as the machine value on the element. The design
 * system's Page now refuses that pair at render, on the grounds that a Page rendering a
 * date has no business making a reader parse ISO.
 *
 * **Both halves are asserted against rendered output, not against the formatter alone.**
 * A formatter test would pass while the page kept printing the raw value, and the whole
 * defect is that the page printed the raw value. So the two elements below are the two
 * elements the two screens render, each one checked for the property that matters: what
 * the reader reads is not the machine value, and the machine value is still exactly what
 * a feed reader and a crawler need.
 *
 * The design system's `BlogPostPage` is rendered here rather than this site's own post
 * route, because `blogSource` is a compile-time macro and cannot load under a test
 * runner: that is why `test/content.test.ts` reads `content/` from disk. Rendering the
 * Page the post route composes is the half that can be checked here, and it is checked
 * against the version this repository pins.
 */

/** One of the four published posts, read off the frontmatter this site ships. */
const POSTED = '2026-09-26';

describe("a post's date", () => {
  it('shows a reader the words and keeps the machine value for the machine', () => {
    expect(displayDate(POSTED)).toBe('26 September 2026');
    // The half that matters, stated as both directions: the reading is not the ISO
    // string, and the ISO string is still exactly what it was.
    expect(displayDate(POSTED)).not.toBe(POSTED);
    expect(isoDate(POSTED)).toBe(POSTED);
  });

  it('prints the reading on the index and the machine value on the element', () => {
    const { container } = render(<PostDate value={POSTED} />);
    const time = container.querySelector('time');
    expect(time, 'the index prints no time element').toBeTruthy();
    expect(time?.textContent).toBe('26 September 2026');
    expect(time?.textContent).not.toBe(POSTED);
    // Attribute name read through the DOM, because a `datetime` attribute and a
    // `dateTime` prop are the same attribute and React lower-cases it.
    expect(time?.getAttribute('datetime')).toBe(POSTED);
  });

  it('hands the design system Page a reading and a machine value it will both accept', () => {
    // The Page takes `date` as the words a reader sees and `dateTime` as the value on the
    // `time` element, and it is the Page that renders the element, so this is the render
    // the post route produces. It is also what proves the consumer side is correct
    // against the version this repository pins: 0.15.0 renders this pair without
    // complaint, and the unpublished Page throws on a pair where the two are the same
    // string, which is what the next assertion is about.
    const { container } = render(
      <BlogPostPage
        title="Where the products stand"
        date={displayDate(POSTED)}
        dateTime={isoDate(POSTED)}
        trailLabels={{ previous: 'Previous', next: 'Next' }}
        trailLabel="More posts"
      >
        <p>The body.</p>
      </BlogPostPage>,
    );
    const time = container.querySelector('time');
    expect(time, 'the Page rendered no time element').toBeTruthy();
    expect(time?.textContent).toBe('26 September 2026');
    expect(time?.textContent).not.toBe(POSTED);
    expect(time?.getAttribute('datetime')).toBe(POSTED);
  });

  it('gives the two props values that cannot be the same string', () => {
    // The refusal the unpublished Page makes at render, asserted as the property it
    // refuses rather than as the throw, because the pinned version has no throw to catch
    // and a test that waited for one would be green on a Page that renders the mistake.
    expect(displayDate(POSTED)).not.toBe(isoDate(POSTED));
    for (const value of ['2026-01-05', '2026-12-31', '2026-09-01']) {
      expect(displayDate(value)).not.toBe(value);
      expect(displayDate(value)).toMatch(/^\d{1,2} \w+ \d{4}$/);
      expect(isoDate(value)).toBe(value);
    }
  });

  it('reads the same day on every host, because a static export renders once', () => {
    // `2026-09-26` parses as midnight UTC. A build machine west of Greenwich formatting
    // it in its own zone renders 25 September, so the time zone is pinned rather than
    // inherited; this is the assertion that says so. The reading is spelled out and
    // day-first, next to a `YYYY-MM-DD` value it cannot be confused with.
    expect(displayDate('2026-01-01')).toBe('1 January 2026');
    expect(displayDate('2026-12-31')).toBe('31 December 2026');
  });

  it('refuses a value that is not a calendar date, rather than narrowing it blindly', () => {
    // The frontmatter schema is a `z.string()`, so the narrowing is where a value that
    // stopped being a date fails. The build must fail: a `datetime` attribute holding
    // something no feed reader can parse is a wrong date that nothing on the page shows.
    expect(() => isoDate('26 September 2026')).toThrow(/YYYY-MM-DD/);
    expect(() => isoDate('')).toThrow(/YYYY-MM-DD/);
    expect(() => isoDate('2026-9-6')).toThrow(/YYYY-MM-DD/);
    expect(() => displayDate('soon')).toThrow(/YYYY-MM-DD/);
  });

  it('hands the post route neither raw value, in either slot', () => {
    // The two renders above cover the two elements; this covers the wiring, because an
    // element the site renders correctly and a page that still passes the raw value to it
    // are two different states and only one of them is the defect.
    //
    // It reads the route as text because that route cannot be rendered here: `blogSource`
    // is a compile-time macro, so the loader does not exist at run time and this is the
    // same wall `test/content.test.ts` reads `content/` from disk to get around. The
    // strings asserted are the props and the component, not the prose, so a rewording of
    // the route does not fail this and a reversion of the pairing does.
    const route = readFileSync(
      path.resolve(__dirname, '..', 'app', 'blog', '[[...slug]]', 'page.tsx'),
      'utf8',
    );
    expect(route, 'the index prints the frontmatter value as the text of its time element').not.toMatch(
      />\{post\.data\.date\}</,
    );
    expect(route, 'the Page is handed the frontmatter value as the words a reader reads').not.toMatch(
      /date=\{page\.data\.date\}/,
    );
    expect(route, 'the Page is handed the frontmatter value unformatted as its machine value').not.toMatch(
      /dateTime=\{page\.data\.date\}/,
    );
    expect(route).toMatch(/date=\{displayDate\(page\.data\.date\)\}/);
    expect(route).toMatch(/dateTime=\{isoDate\(page\.data\.date\)\}/);
    expect(route, 'the index prints its own markup rather than the element that carries both').toMatch(
      /<PostDate value=\{post\.data\.date\} \/>/,
    );
  });
});