import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';

import HomePage from '@/app/page';
import { SiteBar } from '@/components/site-bar';
import { FOOTER_COLUMNS } from '@/lib/navigation';
import map from '@/scripts/pack-map.json';
import { PRODUCTS, SITE_PRODUCT } from '@/lib/site';

/**
 * The pack map, asserted against the composition rather than against a screenshot.
 *
 * `scripts/pack-map.json` is the declaration. the pack-boundary gate in `@nanisoft/prism-ui/gates` reads it
 * from the built export, where it is also checked in both modes against the emitted
 * CSS and against the published token contract. This file reads the same declaration
 * from the DOM, so the two readers cannot drift: a region that gains a pack fails the
 * test here and fails the build there, and a declaration that stops matching what the
 * page renders fails here first.
 *
 * Why it has to be a check and not a review: the failure this rule exists to prevent
 * is invisible in a screenshot in either mode. A boundary on the wrong element, or on
 * an element whose corner radius the pack moves, produces a page that looks like a
 * design decision, and a reviewer's eye confirms it.
 */
const MARK_SLOT = 'product-mark';

function wholePage() {
  const { container } = render(
    <>
      <SiteBar />
      <main>
        <HomePage />
      </main>
      <SiteFooter product={SITE_PRODUCT} columns={FOOTER_COLUMNS} />
    </>,
  );
  return container;
}

/**
 * Every boundary on the page, with the region it belongs to.
 *
 * The same three rules `scripts/pack-regions.mjs` uses, so a region named differently
 * here and there is a difference one of the two readers would have to explain: a mark
 * in a brand lockup, a mark in the hero band, and a mark in the product grid. A
 * boundary in none of them is `landing.undeclared`, which is what the built-export
 * gate reports as an unnamed region, so the two readers fail the same change for the
 * same reason.
 *
 * **The bar is the one the site renders, not one assembled here.** This file used to
 * compose its own `SiteHeader` with a product switcher, and when the site moved to
 * `SiteNavbar` it kept asserting a switcher the page had stopped publishing, so this
 * reader and the gate were reading two different pages. Rendering `SiteBar` is what
 * makes the second reader a reader of the same thing as the first.
 *
 * The switcher's rule is gone from both copies, and not because the marks moved
 * somewhere harmless: the family's five sites are a menu now, and a menu nobody has
 * opened is not in the static export the gate reads.
 */
function boundaries(container: HTMLElement) {
  return [...container.querySelectorAll('[data-pack]')].map((element) => ({
    pack: element.getAttribute('data-pack') ?? '',
    region: element.closest('header')
      ? 'header.brand'
      : element.closest('footer')
        ? 'footer.brand'
        : element.closest('[data-slot="nanisoft-hero"]')
          ? 'landing.hero'
          : element.closest('[data-slot="product-grid"]')
            ? 'landing.products'
            : 'landing.undeclared',
  }));
}

describe('the pack map', () => {
  it('reads the ground from one place, and the map agrees with the site', () => {
    expect(SITE_PRODUCT.pack).toBe(map.ground);
  });

  it('carries a boundary in exactly the regions the map declares, and no others', () => {
    const container = wholePage();
    const regions = [...new Set(boundaries(container).map((boundary) => boundary.region))].sort();
    expect(regions).toEqual(Object.keys(map.regions).sort());
  });

  it('carries the identifiers the map declares, in each region', () => {
    const container = wholePage();
    for (const [region, declared] of Object.entries(map.regions)) {
      const packs = boundaries(container)
        .filter((boundary) => boundary.region === region)
        .map((boundary) => boundary.pack)
        .sort();
      expect(packs, `${region} carries ${packs.join(', ')}`).toEqual([...declared.packs].sort());
    }
  });

  it('has exactly two regions carrying a pack that is not the ground', () => {
    const container = wholePage();
    const second = boundaries(container)
      .filter((boundary) => boundary.pack !== map.ground)
      .map((boundary) => boundary.region);
    expect([...new Set(second)].sort()).toEqual([...map.secondPackRegions].sort());
    // Stated as a number and not derived from the array above, because a map that
    // quietly grew a third region would still satisfy the comparison two lines up.
    // The law is a ceiling on how much of a page may carry a second pack, and a
    // ceiling that moves with the content is not a ceiling.
    expect(new Set(second).size).toBe(2);
  });

  it('puts no boundary in a band this site has not named, so a new mark is a failing test', () => {
    const container = wholePage();
    for (const boundary of boundaries(container)) {
      expect(boundary.region, 'a boundary sits in a region scripts/pack-regions.mjs cannot name').not.toBe(
        'landing.undeclared',
      );
    }
  });

  it('puts every boundary on a mark, and the mark on a fully rounded shape', () => {
    const container = wholePage();
    for (const boundary of container.querySelectorAll('[data-pack]')) {
      expect(boundary.getAttribute('data-slot'), 'a boundary sits on something that is not a mark').toBe(MARK_SLOT);
      // The shape the boundary may not change: the disc is fully rounded, and the
      // element carrying the boundary has no radius utility of its own.
      const disc = boundary.querySelector('[data-slot="product-mark-disc"]');
      expect(disc?.getAttribute('class')).toContain('rounded-full');
      expect(boundary.getAttribute('class') ?? '').not.toMatch(/\brounded-(?!full\b)/);
    }
  });

  it('puts no pack boundary on a section, a card, a link or a drawing', () => {
    const container = wholePage();
    for (const shape of ['section', 'article', 'a', 'div', 'li', 'svg', 'g', 'path', 'circle', 'rect']) {
      expect(container.querySelectorAll(`${shape}[data-pack]`).length, `a <${shape}> carries a boundary`).toBe(0);
    }
  });

  it('resolves every mark from the site directory, so a mark and the directory cannot disagree', () => {
    const container = wholePage();
    const directory = new Map(PRODUCTS.map((product) => [product.id, product.pack]));
    for (const mark of container.querySelectorAll(`[data-slot="${MARK_SLOT}"]`)) {
      const id = mark.querySelector('[data-product]')?.getAttribute('data-product');
      expect(directory.has(id ?? ''), `no product ${id} in the directory`).toBe(true);
      if (id === SITE_PRODUCT.id) expect(mark.getAttribute('data-pack')).toBe(map.ground);
    }
  });
});
