import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';

import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';
import { HERO, WHY } from '@/lib/landing-content';

/**
 * Four claims about `app/globals.css`, and the geometry three of them cannot reach.
 *
 * This sheet is the only place a consumer can express anything the catalogue does not
 * ship, so it is also the only place a consumer can get the cascade wrong in a way no
 * reviewer sees: Prism's base layer is layered and this sheet is not, so an unlayered
 * rule here outranks the design system's at any specificity, and the page still looks
 * plausible. Three of the four things below were exactly that.
 *
 * **jsdom cannot express the geometry, and this file does not pretend to.** It has no
 * layout engine: `getBoundingClientRect()` returns zeros, `offsetHeight` is 0, and
 * nothing computes a used value for `flex`, `minmax()` or a `ch` unit. So "the footer's
 * top edge is inside the viewport" is not a thing this runner can measure, and a test
 * that asserted it would either be skipped or would be asserting that the markup exists
 * and calling that the geometry. What is asserted instead is the mechanism the geometry
 * depends on, read out of the sheet and out of the rendered DOM, and the measured
 * before-and-after numbers are a render a human does.
 *
 * The reader is `app/globals.css` as text. That is the same move `test/content.test.ts`
 * makes with `content/`, and for the same reason: the thing under test is a file this
 * repository owns and nothing else renders it into a place a runner can measure.
 */

/** This site's own sheet, which is the file all four claims are about. */
const SHEET = path.resolve(__dirname, '..', 'app', 'globals.css');

/**
 * The design system's shipped sheet, resolved through its own export map rather than
 * through a path written here.
 *
 * The reduced-motion assertion is a claim about what the design system does, so the
 * reference has to be the design system's own emitted file. Resolving it the way the
 * package resolves it means a renamed subpath is an error in this test rather than a
 * test that quietly measures nothing.
 */
const SYSTEM_SHEET = createRequire(import.meta.url).resolve('@nanisoft/prism-ui/styles.css');

/** A rule this sheet declares: its selector, its body, its line, and its media query. */
interface Rule {
  selector: string;
  body: string;
  media: string | null;
}

/**
 * Comments blanked to spaces, newlines left where they were.
 *
 * A `}` inside prose closes a block if the prose is still there, and this sheet is three
 * quarters comment. Blanking rather than deleting keeps every line number the file had,
 * so a failure names the line a reader will find.
 */
function withoutComments(source: string): string {
  return source.replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '));
}

/**
 * Every rule a sheet declares, at the top level or inside one `@media` or `@layer` block.
 *
 * Hand-rolled rather than a CSS parser because the sheet is a flat list of rules and the
 * kit already declines to parse a cascade; a parser here would be a dependency and a
 * resolver, and the four things asserted below need a selector, a body and a flag saying
 * whether the rule is inside a media query. An at-rule this file does not care about is
 * still descended into rather than skipped, because the design system's own sheet puts
 * every rule it ships inside `@layer`.
 */
function parse(source: string): Rule[] {
  const found: Rule[] = [];
  const open: string[] = [];
  let prelude = '';
  let i = 0;
  while (i < source.length) {
    const character = source[i] as string;
    if (character === '{') {
      const head = prelude.trim();
      prelude = '';
      let depth = 1;
      let end = i + 1;
      while (end < source.length && depth > 0) {
        const inner = source[end];
        if (inner === '{') depth += 1;
        if (inner === '}') depth -= 1;
        end += 1;
      }
      if (head.startsWith('@media')) {
        open.push(head.slice('@media'.length).trim());
      } else if (head.startsWith('@')) {
        open.push(head);
      } else {
        found.push({
          selector: head,
          body: source.slice(i + 1, end - 1),
          /* The innermost width query, not merely the innermost at-rule: the design system
             nests `@media` inside `@layer utilities` and a rule in there is still in that
             query. */
          media: open.filter((entry) => !entry.startsWith('@')).pop() ?? null,
        });
        i = end;
        continue;
      }
      i += 1;
      continue;
    }
    if (character === '}') {
      open.pop();
      prelude = '';
      i += 1;
      continue;
    }
    prelude += character;
    i += 1;
  }
  return found;
}

function rules(): Rule[] {
  return parse(withoutComments(readFileSync(SHEET, 'utf8')));
}

/** One declaration of one rule, by property name, or undefined. */
function declared(rule: Rule | undefined, property: string): string | undefined {
  const match = rule?.body.match(new RegExp(`(?:^|[;{\\s])${property}\\s*:\\s*([^;]+)`));
  return match?.[1]?.trim();
}

/** The property names a rule declares, which is what two rules being different means. */
function properties(body: string): string[] {
  return body
    .split(';')
    .map((declaration) => declaration.match(/^\s*([a-z-]+)\s*:/)?.[1])
    .filter((name): name is string => typeof name === 'string')
    .sort();
}

/**
 * The comment block immediately above the rule whose selector matches.
 *
 * Read from the raw sheet rather than the blanked one, because the point of it is the
 * words and blanking replaces them with spaces.
 */
function record(selector: string): string {
  const raw = readFileSync(SHEET, 'utf8');
  const at = raw.search(new RegExp(`^\\s*${selector}\\s*\\{`, 'm'));
  expect(at, `app/globals.css has no ${selector} to record`).toBeGreaterThan(-1);
  const start = raw.slice(0, at).lastIndexOf('/*');
  expect(start, `no comment above ${selector}`).toBeGreaterThan(-1);
  const end = raw.indexOf('*/', start);
  expect(end, `the comment above ${selector} is not closed`).toBeGreaterThan(-1);
  return raw.slice(start, end + 2);
}

describe('the sticky footer', () => {
  it('is a column that grows main, rather than a main padded to a whole viewport', () => {
    // What jsdom cannot do is measure whether the footer's top edge is inside the
    // viewport, so what is asserted is the arrangement that decides it. Before the fix
    // this sheet had no `body` rule at all and `.site-main` declared
    // `min-height: 100dvh`, which put the footer's top edge at 957px on `/404` at 1440
    // by 900: a bar at 57px above a main at 900px. Growing main inside a column at
    // least one viewport tall puts the footer's bottom edge on the viewport's bottom
    // edge, which is the property being asked for.
    const body = rules().find((rule) => rule.selector === 'body');
    expect(body, 'app/globals.css declares no bare-element rule on body').toBeTruthy();
    expect(declared(body, 'display')).toBe('flex');
    expect(declared(body, 'flex-direction')).toBe('column');
    expect(declared(body, 'min-height')).toBe('100dvh');

    const main = rules().filter((rule) => rule.selector === '.site-main');
    expect(main, 'main carries more than one rule and this file reads only the one').toHaveLength(1);
    // `1 0 auto` and not `1`: a shrink factor of 1 with a zero basis would let a page
    // taller than the viewport be compressed to fit the column.
    expect(declared(main[0], 'flex')).toBe('1 0 auto');
    expect(main[0]?.body, 'the rule that pushed the footer below the fold is back').not.toMatch(
      /min-height/,
    );
  });

  it('renders the footer as the sibling after main, which is what lets main push it down', () => {
    // The other half, and the half jsdom *can* answer. `main` growing is only a sticky
    // footer if the footer is a following sibling in the same column, so this asserts
    // the three children in the order the bar, the page and the footer are rendered in.
    const { container } = render(<HomePage />);
    const main = container.querySelector('main.site-main');
    expect(main, 'the chrome renders main without the site class').toBeTruthy();
    expect(main?.previousElementSibling?.tagName).toBe('HEADER');
    expect(main?.nextElementSibling?.tagName).toBe('FOOTER');
  });
});

describe('the reduced-motion policy', () => {
  it('is a universal kill in the design system sheet, and this site is under it', () => {
    // Read rather than assumed, because the claim below rests on what that rule says.
    // It is one universal selector with `transition: none` on it, so the only thing that
    // can beat it is an unlayered rule with a class in it, which is what this sheet is
    // full of and what the next test is about.
    const shipped = readFileSync(SYSTEM_SHEET, 'utf8');
    const at = shipped.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(at, 'the design system sheet states no reduced-motion rule').toBeGreaterThan(-1);
    const kill = shipped.slice(at, at + 200);
    expect(kill).toMatch(/\*\s*,\s*::?before\s*,\s*::?after\s*\{/);
    expect(kill).toMatch(/transition:\s*none/);
    expect(kill).toMatch(/animation:\s*none/);
  });

  it('declares no transition in this sheet, because an unlayered one outranks the kill', () => {
    // The defect, stated as the thing that would reintroduce it. The rule that used to
    // be on `.site-identity__link` measured `transition-duration: 0.16s` on all five
    // identity rows with the preference set, because this selector is a class rule and
    // this sheet is unlayered: that beats the design system's universal selector at any
    // specificity. Asserted over the whole sheet rather than over that one selector,
    // because the same class of hole is not specific to the hero.
    const offenders = rules().filter((rule) =>
      /(?:^|[;{\s])transition(?:-[a-z]+)?\s*:/.test(rule.body),
    );
    expect(
      offenders.map((rule) => rule.selector),
      'a consumer transition outranks the design system universal reduced-motion kill',
    ).toEqual([]);
  });

  it('keeps the hover wash, because a background change is not what the policy is about', () => {
    // The rule this one deleted also carried the wash, and the wash is worth keeping: it
    // is the only thing that tells a pointer which of the five rows it is on. Dropping the
    // transition is not a way of saying the hover does not matter.
    const wash = rules().find((rule) => rule.selector === ".site-identity__link:hover");
    expect(declared(wash, 'background-color')).toBe('var(--accent)');
  });
});

describe('the display step', () => {
  it('records what the measure does, which is that the thesis sets on two lines', () => {
    // A comment that names a fact is a record and this repository keeps the two apart.
    // This one named a decision the CSS does not make: `16ch` at the 4.25rem ceiling is
    // about three fifths of a 28-character string, so the thesis wraps at every viewport,
    // and the record claimed it fitted on one line at 1440.
    const text = record('.site-display');
    // Tolerating a line break: the claim it forbade was wrapped across two lines, which
    // is exactly why a reader skimming the record could miss that it was there.
    expect(text, 'the record still claims the line fits once').not.toMatch(/fits the line\s+once/i);
    expect(text).toMatch(/two lines/);
    // The arithmetic the record rests on, read from the page's own copy and its own cap
    // rather than from a browser: a cap of 16 zero-advances cannot hold 28 characters.
    expect(HERO.title.length).toBeGreaterThan(16);
  });

  it('keeps the cap that produces the two lines', () => {
    const display = rules().find((rule) => rule.selector === '.site-display');
    expect(declared(display, 'max-width')).toBe('16ch');
    // Without this, the record above is describing a rule that is not there.
    expect(declared(display, 'text-wrap')).toBe('balance');
  });
});

describe('the three claims', () => {
  it('renders one container per claim, and the container is named by the claim', () => {
    const { container } = render(<HomePage />);
    const panels = [...container.querySelectorAll('.site-pillar')];
    expect(panels).toHaveLength(3);

    const drawn = panels.map((panel) => panel.getAttribute('data-shape'));
    expect(new Set(drawn).size, 'the three panels resolved to the same container').toBe(3);
    for (const pillar of WHY.pillars) {
      expect(drawn, `${pillar.name} renders in no container`).toContain(pillar.shape);
    }
  });

  it('declares the three containers differently, and at the top level of the sheet', () => {
    // Two halves. The first is that the three are not the same box: before, all three
    // resolved to the same wash, the same rule and the same padding. The second is that
    // each difference is a base rule rather than a `min-width` one, which is what makes
    // the three as different at 390 as at 1440 rather than identical until a breakpoint
    // arrives and past it.
    const bodies = WHY.pillars.map((pillar) => {
      const own = rules().filter(
        (rule) => rule.media === null && rule.selector.includes(`[data-shape='${pillar.shape}']`),
      );
      expect(own.length, `no base rule for the ${pillar.shape} container`).toBeGreaterThan(0);
      return own.map((rule) => rule.body).join(';');
    });
    expect(new Set(bodies).size, 'two of the three containers are the same rule').toBe(3);
    expect(
      new Set(bodies.map((body) => properties(body).join(','))).size,
      'two of the three containers declare the same properties',
    ).toBe(3);
  });

  it('gives the three no ordinal, no icon and no badge', () => {
    // This band carried a decorative ordinal once and it was removed for exactly this
    // reason, so the guard is here rather than in a review: the numbers were never on
    // this page's argument, and the copy spells its own ("the repeatable ninety
    // percent"), which is why the digit assertion can be strict.
    const { container } = render(<HomePage />);
    for (const panel of container.querySelectorAll('.site-pillar')) {
      expect(panel.textContent ?? '', 'a panel prints a digit').not.toMatch(/\d/);
      expect(panel.querySelector('svg, img, [data-slot="badge"], [data-slot="badge-group"]')).toBeNull();
    }
  });

  it('sets no body copy narrower than the readable measure, and no panel narrower than it needs', () => {
    /*
     * **The test above and this one are two halves of one claim, and this is the half that
     * was missing.** "The three are different containers" passed for two rounds while the
     * ledger rendered its sentence twelve lines down at 8 characters to the line, because
     * two of the three were broken rather than different: the grid handed each panel one of
     * six 168px tracks and the section's argument came out as a column of single words.
     * Distinctness is therefore asserted here in the only form that cannot be satisfied by
     * damage — every panel's body copy, resolved out of this sheet and the design system's
     * own tokens, sets at no fewer than 38 characters, and every panel is at least as wide
     * as that measure plus the frame it draws it in.
     *
     * jsdom has no layout engine, so none of this is measured off a rendered box. It is
     * arithmetic over the two stylesheets and the class list `Section` actually renders,
     * which is why it can run here at all: the grid is resolved, the tracks are resolved,
     * each panel's content box is resolved and the cap on the body copy is resolved in
     * `ch`. What it cannot do is measure a string, so the two numbers below that come from
     * the font rather than from a stylesheet are named here with the measurement in them,
     * and they are the two lines to re-check in a browser if this package ever ships
     * another face.
     */

    /** The floor, in characters. Why 38 and not 45 is the arithmetic further down. */
    const FLOOR_CH = 38;

    /**
     * `ch` is the advance of `0` in the element's own font, so a measure written in `ch`
     * is a number only once the face is known. This is the shipped face's: `Inter`, in
     * `@nanisoft/prism-ui/dist/fonts/inter-latin-400.woff2`, is 2048 units per em and its
     * `0` is 1292 units wide, which is 0.630859 of an em. Read out of the `woff2` by hand,
     * because there is no font parser in this repository and no dependency may be added to
     * make one.
     */
    const CH_EM = 1292 / 2048;

    /**
     * The max-content width of the ledger's term, `Intelligence` at `--text-base`, which is
     * 5.4375em and so 87px exactly. This is the number an `auto` track resolves to, and the
     * ledger's term track is asserted to be `auto` below, which is what lets the
     * definition have the rest of the panel at every width including 390.
     */
    const TERM_PX = 87;

    /** The page's own rem: the browser's default and the design system's, 16px. */
    const PX_PER_REM = 16;

    /*
     * **The floor is 38 characters, and the reason is arithmetic rather than taste.**
     * Running text is set at 45 to 75 characters: below 45 the eye loses the start of the
     * next line, above 75 it loses the end of this one. A row of two panels cannot have 45
     * in both of them below about a 1,076px viewport — the ledger's panel needs 540px to put
     * 45 characters beside its term, the framed cell's would need 455px and its own cap is
     * 38, the gap is 16px, and the container is 960px at 1024 — so the floor here is 38
     * characters: 84% of the lower bound, and the width this sheet already caps panel body
     * copy at, so the cap and the floor are one number in one file and cannot drift apart.
     * In pixels, at the two steps these three panels set their body copy at, that is 335.6px
     * at `--text-sm` and 383.6px at `--text-base`.
     *
     * The floor is asserted at every width whose container can hold it and not below that,
     * because below it no arrangement can: the narrowest box that reaches 38 characters is
     * the framed cell's at 393.6px, and the container at 390 is 342px. What is asserted there
     * instead is the strongest thing a narrow viewport can be held to — one panel per row,
     * every panel the container's full width, and the ledger's definition taking everything
     * its term does not.
     */

    /** Float arithmetic; a hundredth of a pixel is noise rather than slack. */
    const EPSILON = 0.05;

    const systemSheet = withoutComments(readFileSync(SYSTEM_SHEET, 'utf8'));
    const systemRules = parse(systemSheet);

    function token(name: string): string {
      const found = systemSheet.match(new RegExp(`^\\s*${name}:\\s*([^;]+);`, 'm'));
      if (!found?.[1]) throw new Error(`the design system sheet declares no ${name}`);
      return found[1].trim();
    }

    function toPx(value: string): number {
      const rem = value.match(/^([\d.]+)rem$/);
      if (rem) return Number(rem[1]) * PX_PER_REM;
      const bare = value.match(/^([\d.]+)px$/);
      if (bare) return Number(bare[1]);
      throw new Error(`this file cannot resolve "${value}" to px`);
    }

    /** A `var(--spacing-N)` or a length, as pixels. */
    function space(value: string | undefined): number {
      if (value === undefined) throw new Error('a length this file needs is not declared');
      const name = value.match(/var\((--spacing-[\d.]+)\)/)?.[1];
      return name ? toPx(token(name)) : toPx(value);
    }

    /** A `var(--text-N)` or a length, as pixels: the type step a panel sets its body at. */
    function step(value: string | undefined): number {
      if (value === undefined) throw new Error('a type step this file needs is not declared');
      const name = value.match(/var\((--text-[\w-]+)\)/)?.[1];
      if (!name) throw new Error(`this file cannot resolve the type step "${value}"`);
      return toPx(token(name));
    }

    /** The width of a border shorthand's first length, which is all these sheets declare. */
    function border(value: string | undefined): number {
      return value ? toPx(value.split(/\s+/)[0] as string) : 0;
    }

    function holds(media: string | null, viewport: number): boolean {
      if (media === null) return true;
      /* Both spellings, because the design system writes `width >= 64rem` and a consumer
         sheet here writes `min-width: 64rem`, and neither means anything else here. */
      const min = media.match(/(?:min-width|width\s*>=)\s*:?\s*([\d.]+)(rem|px)/);
      if (!min?.[1]) throw new Error(`this file cannot resolve the width query "${media}"`);
      return viewport >= (min[2] === 'rem' ? Number(min[1]) * PX_PER_REM : Number(min[1]));
    }

    /**
     * The declarations this sheet declares for one selector at one viewport, and only those.
     *
     * The caller spreads the rule nested under a panel over the base one, which is what the
     * cascade does here: the nested selector carries an attribute and a second class and so
     * outranks the base class wherever it sits in the file, and `.site-pillar__line` is
     * declared *after* the band's own override of it. Resolving by source order alone would
     * hand the base rule the last word and read every panel at the base step.
     */
    function resolved(selector: string, viewport: number, under?: string): Record<string, string> {
      const winner: Record<string, string> = {};
      for (const rule of rules()) {
        if (under ? rule.selector !== `${under} ${selector}` : rule.selector !== selector) continue;
        if (!holds(rule.media, viewport)) continue;
        for (const declaration of rule.body.split(';')) {
          const parsed = declaration.match(/^\s*([a-z-]+)\s*:\s*([^;]+)$/);
          if (parsed?.[1]) winner[parsed[1]] = (parsed[2] as string).trim();
        }
      }
      return winner;
    }

    /** One track in a `grid-template-columns`, however this section writes one. */
    const TRACK = /minmax\([^()]*\)|\[[^\]]*\]|auto|min-content|max-content|[\d.]+(?:fr|rem|px)/g;

    /**
     * `repeat(n, …)` written out, because this file counts tracks rather than parses them.
     *
     * This is here because of what it caught: with `repeat(6, minmax(0, 1fr))` left folded,
     * the track list resolved to one track of the container's full width and this whole test
     * passed on exactly the grid that broke the section. A resolver that cannot count the
     * tracks is not a resolver.
     */
    function expanded(value: string): string {
      const repeated = value.match(/^repeat\((\d+),\s*(.+)\)$/);
      if (!repeated) return value;
      return Array.from({ length: Number(repeated[1]) }, () => expanded(repeated[2] as string)).join(' ');
    }

    function trackCount(value: string): number {
      return [...expanded(value).matchAll(TRACK)].length;
    }

    /**
     * Resolve tracks to pixels, which is the whole of what a grid does with `fr`: hand the
     * fixed tracks their length, split what is left by the flex factors. `auto` is given the
     * width of the content that sits in it, which for the ledger's term track is the term.
     */
    function tracks(value: string, available: number, auto = 0): number[] {
      const parts = [...expanded(value).matchAll(TRACK)].map((match) => {
        const atom = match[0] as string;
        const fixedMax = atom.match(/minmax\([^,]+,\s*([\d.]+)(rem|px)\)/);
        if (fixedMax) return { fixed: toPx(`${fixedMax[1]}${fixedMax[2]}`) };
        const flexible = atom.match(/minmax\([^,]+,\s*([\d.]+)fr\)/);
        if (flexible) return { fr: Number(flexible[1]) };
        if (atom === 'auto' || atom === 'min-content' || atom === 'max-content') return { fixed: auto };
        const bare = atom.match(/^([\d.]+)(fr|rem|px)$/);
        if (!bare) throw new Error(`this file cannot resolve the track "${atom}"`);
        return bare[2] === 'fr' ? { fr: Number(bare[1]) } : { fixed: toPx(`${bare[1]}${bare[2]}`) };
      });
      const free = available - parts.reduce((sum, part) => sum + (part.fixed ?? 0), 0);
      const flex = parts.reduce((sum, part) => sum + (part.fr ?? 0), 0);
      return parts.map((part) => part.fixed ?? (free * (part.fr as number)) / flex);
    }

    /**
     * The container the three panels are laid into, read from the class list the `Section`
     * block renders rather than written here, so a change to the block's markup fails this
     * test instead of quietly moving the width everything below it is measured against.
     */
    const { container } = render(<HomePage />);
    const wrapper = container.querySelector('.site-pillars')?.closest('div[class]');
    const wrapperClasses = (wrapper?.getAttribute('class') ?? '').split(/\s+/);
    expect(wrapperClasses, 'the why band renders outside the page container').toEqual(
      expect.arrayContaining(['max-w-page', 'px-6', 'lg:px-8']),
    );

    const utility = (selector: string) => {
      const rule = systemRules.find((candidate) => candidate.selector === selector);
      if (!rule) throw new Error(`the design system sheet declares no ${selector}`);
      return rule;
    };
    const pageWidthRule = utility('.max-w-page');
    const padRule = utility('.px-6');
    const widePadRule = utility('.lg\\:px-8');

    const pageWidthToken = declared(pageWidthRule, 'max-width')?.match(/var\((--[\w-]+)\)/)?.[1];
    const pageCap = toPx(token(pageWidthToken as string));

    /** One panel, resolved: its border box, its inline frame and the measure it sets at. */
    interface Panel {
      shape: string;
      width: number;
      frame: number;
      step: number;
      measure: number;
      cap: number;
      /** What the panel spends on itself and on its own internal arrangement. */
      overhead: number;
    }

    function layout(viewport: number) {
      const inline = holds(widePadRule.media, viewport)
        ? space(declared(widePadRule, 'padding-inline'))
        : space(declared(padRule, 'padding-inline'));
      const containerWidth = Math.min(viewport, pageCap) - 2 * inline;

      const list = resolved('.site-pillars', viewport);
      const gap = space(list['gap']);
      const columns = trackCount(list['grid-template-columns'] ?? 'minmax(0, 1fr)');
      const columnWidths = tracks(
        list['grid-template-columns'] ?? 'minmax(0, 1fr)',
        containerWidth - gap * (columns - 1),
      );

      const panels: Panel[] = WHY.pillars.map((pillar, index) => {
        const selector = `.site-pillar[data-shape='${pillar.shape}']`;
        const shape = { ...resolved('.site-pillar', viewport), ...resolved(selector, viewport) };
        const line = {
          ...resolved('.site-pillar__line', viewport),
          ...resolved('.site-pillar__line', viewport, selector),
        };

        /* The frame is what the panel spends on itself: its own pad down both sides of the
           text and, on the one panel that draws a box, the 1px border down both sides. The
           2px rule along the top is not in it, because that is block space and this is a
           claim about how wide the text is. */
        const frame = 2 * space(shape['padding']) + 2 * border(shape['border']);
        const bodyStep = step(line['font-size']);

        const spans = (shape['grid-column'] ?? '').includes('-1');
        const column = spans || index === 0 ? 0 : (index - 1) % columns;
        const width = spans ? containerWidth : (columnWidths[column] as number);

        const innerGap = space(shape['column-gap'] ?? shape['gap'] ?? list['gap']);
        const declaredTracks = shape['grid-template-columns'];
        const innerCount = declaredTracks ? trackCount(declaredTracks) : 1;
        const content = width - frame;
        const inner = declaredTracks
          ? tracks(declaredTracks, content - innerGap * (innerCount - 1), TERM_PX)
          : [content];

        const bodyColumn = inner.length === 2 ? (inner[1] as number) : content;
        const capCh = line['max-width']?.match(/^([\d.]+)ch$/);
        const cap = capCh
          ? Number(capCh[1]) * CH_EM * bodyStep
          : line['max-width'] && line['max-width'] !== 'none'
            ? toPx(line['max-width'])
            : Infinity;

        return {
          shape: pillar.shape,
          width,
          frame,
          step: bodyStep,
          measure: Math.min(bodyColumn, cap),
          cap,
          /* Everything between the panel's edge and the body copy's own measure: the frame,
             and whatever its internal arrangement takes — the band's 10rem name column and
             the gap beside it, the ledger's term and the gap beside it. */
          overhead: frame + (content - bodyColumn),
        };
      });

      return { containerWidth, columns, gap, panels };
    }

    const floorPx = (bodyStep: number) => FLOOR_CH * CH_EM * bodyStep;
    /* The ledger's term track is `auto`, which is what the TERM_PX constant above is. */
    const ledgerTracks = resolved(".site-pillar[data-shape='ledger']", 1440)['grid-template-columns'];
    expect(
      ledgerTracks?.split(/\s+/)[0],
      'the ledger gives its term an `auto` track, so the definition has the rest of the panel',
    ).toBe('auto');

    for (const viewport of [1440, 1024, 768, 390]) {
      const { containerWidth, columns, panels } = layout(viewport);
      const where = `at ${viewport}px, where the container is ${containerWidth.toFixed(2)}px`;

      /*
       * The width at which the floor becomes reachable at all: each panel's own overhead
       * plus the floor, and the largest of the three is the width the section needs. A
       * container narrower than that cannot render one of these three legibly in any
       * arrangement, so asserting the floor there would be asserting nothing. At 390 the
       * container is 342px and the largest of the three is the ledger's, which is why the
       * numbers at 390 sit below the floor.
       */
      const reachable = Math.max(...panels.map((panel) => floorPx(panel.step) + panel.overhead));

      if (containerWidth + EPSILON < reachable) {
        /*
         * Too narrow for the floor to exist: one panel per row, and every panel the whole
         * container.
         *
         * And here the ledger gives nothing away to its own arrangement, because the
         * floor is unreachable precisely because of that arrangement. It used to keep its
         * two columns all the way down and left its definition 199px wide, 22.8 characters
         * at `--text-sm`, which is narrower than the framed cell's own 38-character cap at
         * the same container: a panel whose arrangement costs more measure than the panel
         * next to it. The sheet now drops the term track below 30rem, so on a phone the
         * ledger is one column and the definition is the 302px of panel that is left.
         *
         * The assertion is the whole content column rather than a literal, so it still
         * fails if the two columns come back at a width that cannot afford them: the term
         * track would take 87px of a 302px column again and this would be 199px.
         */
        expect(columns, `the section is not one panel per row ${where}`).toBe(1);
        for (const panel of panels) {
          expect(
            panel.width,
            `the ${panel.shape} panel is not the container's full width ${where}, and one panel ` +
              `per row is the only arrangement a narrow container can hold`,
          ).toBeCloseTo(containerWidth, 1);
        }
        const ledger = panels.find((panel) => panel.shape === 'ledger') as Panel;
        expect(
          ledger.measure,
          `the ledger's definition does not take the whole of the panel ${where}, so the term ` +
            `track is still there on a container that cannot afford it`,
        ).toBeCloseTo(containerWidth - ledger.frame, 1);
        continue;
      }

      for (const panel of panels) {
        const floor = floorPx(panel.step);
        expect(
          panel.measure,
          `the ${panel.shape} body copy sets at ${panel.measure.toFixed(2)}px, which is ` +
            `${(panel.measure / (CH_EM * panel.step)).toFixed(1)} characters ${where}; the floor ` +
            `is ${FLOOR_CH} characters, ${floor.toFixed(2)}px at ${panel.step}px, and this ` +
            `panel's cap is ${panel.cap === Infinity ? 'none' : `${panel.cap.toFixed(2)}px`}`,
        ).toBeGreaterThanOrEqual(floor - EPSILON);

        expect(
          panel.width,
          `the ${panel.shape} panel is ${panel.width.toFixed(2)}px ${where}, which is under the ` +
            `${floor.toFixed(2)}px of measure plus the ${panel.frame}px it spends on itself`,
        ).toBeGreaterThanOrEqual(floor + panel.frame - EPSILON);
      }
    }
  });
});