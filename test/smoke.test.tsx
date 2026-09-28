import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from '@/app/page';
import { ARCHITECTURE, FINAL_CTA, HERO, PHILOSOPHY, PIPELINE, PRODUCTS, TICKER, WHY } from '@/lib/landing-content';
import { GROUND_PACK, PRODUCTS as SITE_PRODUCTS } from '@/lib/site';

/**
 * The landing, rendered as the browser would receive it.
 *
 * The old version of this file mocked an `IntersectionObserver`, a canvas context and
 * a `matchMedia`, and rendered the page inside a theme provider, because the page was
 * a client subtree that needed all three. None of that is here any more, and its
 * absence is the cheapest single measure of the migration: the page is a server
 * component, so it renders with no provider mounted, no observer, no canvas and no
 * mode of its own.
 *
 * What the assertions hold, in order of what they would have caught:
 *
 *   - The thesis is the page's own `h1` and it is the page's own words.
 *   - The composition is the catalogue's, in the site's order. A section that silently
 *     stopped rendering is a hole where a numbered section was, and the old file could
 *     not have seen it.
 *   - Both calls to action are anchors with a destination. This is the assertion the
 *     old page could not make, because its actions were buttons with a `href` prop the
 *     component dropped: the page's primary action was a command that navigated
 *     nothing, and nothing threw.
 *   - Every stage name and every stage caption is on the page. A Block that renders a
 *     title and silently drops the body is the most likely new failure on a page whose
 *     copy is frozen.
 *   - No canvas, and no inline style carrying a colour. The two decorations the old
 *     page resolved in JavaScript are gone, and their absence is asserted rather than
 *     assumed.
 */
function renderLanding(): HTMLElement {
  const { container } = render(<HomePage />);
  return container;
}

describe('the landing', () => {
  it('owns the thesis as the page h1', () => {
    renderLanding();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe(HERO.title);
    expect(heading.textContent).toContain(HERO.title);
  });

  it('composes the catalogue in the site order, with no band of its own', () => {
    const container = renderLanding();
    // The sections a reader meets, in order, named by their own headings.
    const headings = [...container.querySelectorAll('h1, h2')].map((heading) => heading.textContent?.trim());
    expect(headings).toEqual([
      HERO.title,
      PIPELINE.label,
      PRODUCTS.label,
      ARCHITECTURE.label,
      WHY.label,
      PHILOSOPHY.label,
      FINAL_CTA.title,
    ]);
  });

  it('is composed from catalogue items, and every one of them is identifiable in the markup', () => {
    const container = renderLanding();
    for (const slot of [
      'logo-strip',
      'note-grid',
      'product-grid',
      'diagram',
      'product-mark',
      'cta-link',
    ]) {
      expect(container.querySelectorAll(`[data-slot="${slot}"]`).length, `no element carries data-slot="${slot}"`)
        .toBeGreaterThan(0);
    }
    // The two decorative canvases are deleted, not disabled.
    expect(container.querySelector('canvas')).toBeNull();
    expect(document.querySelector('canvas')).toBeNull();
  });

  it('links both calls to action as real links', () => {
    renderLanding();
    for (const cta of [HERO.primaryCta, HERO.secondaryCta, FINAL_CTA.primaryCta, FINAL_CTA.secondaryCta]) {
      const link = screen.getAllByRole('link', { name: cta.label })[0] as HTMLElement | undefined;
      expect(link, `no link named "${cta.label}"`).toBeTruthy();
      expect(link?.tagName).toBe('A');
      expect(link?.getAttribute('href')).toBe(cta.href);
    }
  });

  it('keeps every pipeline stage, its caption, and the strip above it', () => {
    renderLanding();
    for (const item of TICKER) expect(screen.getAllByText(item).length).toBeGreaterThan(0);
    for (const stage of PIPELINE.stages) {
      expect(screen.getAllByText(stage.name).length, `no stage named ${stage.name}`).toBeGreaterThan(0);
      expect(screen.getAllByText(stage.caption).length, `no caption for ${stage.name}`).toBeGreaterThan(0);
    }
    expect(screen.getAllByText(PIPELINE.caption).length).toBeGreaterThan(0);
  });

  it('keeps the three products, their marks, and their own live destinations', () => {
    const container = renderLanding();
    const rows = [...container.querySelectorAll('[data-slot="product-grid-row"]')];
    expect(rows).toHaveLength(PRODUCTS.rows.length);
    for (const product of PRODUCTS.rows) {
      const row = rows.find((candidate) => candidate.querySelector(`[data-product="${product.id}"]`));
      expect(row, `no row for ${product.name}`).toBeTruthy();
      const link = row?.querySelector('a');
      expect(link?.getAttribute('href')).toBe(product.url);
      expect(within(row as HTMLElement).getByText(product.tagline)).toBeTruthy();
      // The row's mark is its own boundary, and it is a mark.
      const mark = row?.querySelector(`[data-slot="product-mark"][data-pack]`);
      expect(mark, `the ${product.name} mark carries no boundary`).toBeTruthy();
    }
  });

  it('keeps the three pillars and the five features, each with its line', () => {
    renderLanding();
    for (const pillar of WHY.pillars) {
      expect(screen.getAllByText(pillar.name).length).toBeGreaterThan(0);
      expect(screen.getAllByText(pillar.line).length).toBeGreaterThan(0);
    }
    for (const feature of WHY.features) {
      expect(screen.getAllByText(feature.name).length).toBeGreaterThan(0);
      expect(screen.getAllByText(feature.line).length).toBeGreaterThan(0);
    }
  });

  it('draws the schematic with the names and the relations the old graph drew', () => {
    const container = renderLanding();
    const diagram = container.querySelector('[data-slot="diagram"]');
    expect(diagram, 'no diagram on the page').toBeTruthy();
    expect(diagram?.getAttribute('role')).toBe('img');
    // The one thing a screen reader reads from the drawing is the whole sentence.
    expect(diagram?.getAttribute('aria-label')).toBe(ARCHITECTURE.aria);
    expect(diagram?.getAttribute('data-unresolved-relations')).toBe('0');
    for (const node of ARCHITECTURE.nodes) {
      expect(container.querySelector(`[data-node="${node.id}"]`), `no node ${node.id}`).toBeTruthy();
      expect(screen.getAllByText(node.name).length).toBeGreaterThan(0);
    }
    for (const relation of ARCHITECTURE.relations) {
      expect(
        container.querySelector(`[data-relation="${relation.from}-${relation.to}"]`),
        `no relation ${relation.from} to ${relation.to}`,
      ).toBeTruthy();
    }
  });

  it('resolves no colour in JavaScript', () => {
    const container = renderLanding();
    // The old page wrote three resolved hexes into the exported HTML as a custom
    // property on each ledger row, which is a colour the cascade cannot move.
    for (const element of container.querySelectorAll('[style]')) {
      expect(element.getAttribute('style')).not.toMatch(/--\w+-ink|#/);
    }
    expect(GROUND_PACK).toBe('sky');
    expect(SITE_PRODUCTS.length).toBe(5);
  });

  it('closes at the factory', () => {
    renderLanding();
    expect(screen.getByRole('heading', { level: 2, name: FINAL_CTA.title })).toBeTruthy();
  });
});
