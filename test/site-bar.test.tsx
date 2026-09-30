import { render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { SiteBar } from '@/components/site-bar';
import { COPY, NAV, SITES } from '@/lib/bar';
import { DEFAULT_MODE, GROUND_PACK, SITE_PRODUCT } from '@/lib/site';

/**
 * The bar this site now publishes.
 *
 * Four of the five controls are new to this repository and the fifth is a decision
 * rather than a feature, so the assertions are about the shape a reader meets: every
 * control announces a word this site wrote, this site's own two routes are the
 * navigation, the family's five sites are one control away, and there is nothing here
 * that can repaint the ground.
 *
 * The bar is `SiteNavbar` and most of what it does is the design system's business,
 * tested in that package. What is this site's is the data it is handed and the
 * control it declines to hand over, and that is what this file holds.
 *
 * Assertions are plain `getAttribute` rather than `toHaveAttribute`, because this
 * repository does not load `jest-dom` and a matcher it has not installed is a test
 * that cannot run.
 */

/**
 * The theme outlives a test.
 *
 * The mode is the class on `<html>`, and the provider resolves from the document
 * before it resolves from the store, because that is what stops a server-rendered mode
 * flashing. So a `dark` class left by one test is read as this site's own default by
 * the next, and a test asserting the control's name fails for a reason that has
 * nothing to do with the control. Each test starts from a page nobody has chosen
 * anything on, which is the state this site actually serves.
 */
beforeEach(() => {
  document.documentElement.removeAttribute('data-pack');
  document.documentElement.removeAttribute('data-theme-origin');
  document.documentElement.classList.remove('dark');
  localStorage.clear();
});

afterEach(() => {
  document.documentElement.classList.remove('dark');
  localStorage.clear();
});

/** The name the mode control carries while the page is in this site's own mode. */
const MODE_LABEL = DEFAULT_MODE === 'dark' ? COPY.toLight : COPY.toDark;

describe('the site bar', () => {
  it('is the design system Block, and the lockup is the mark the footer also draws', () => {
    const { container } = render(<SiteBar />);
    expect(container.querySelector('[data-slot="site-navbar"]')).toBeTruthy();
    // One mark for the site, in the site's own pack: the bar and the footer cannot
    // name this page in two different colours.
    const lockup = container.querySelector('header [data-slot="product-mark"]');
    expect(lockup?.getAttribute('data-pack')).toBe(GROUND_PACK);
    expect(SITE_PRODUCT.pack).toBe(GROUND_PACK);
  });

  it("carries this site's own two routes, and names the region they are in", () => {
    render(<SiteBar />);
    const nav = screen.getByRole('navigation', { name: COPY.nav });
    expect([...nav.querySelectorAll('a')].map((a) => a.getAttribute('href'))).toEqual(
      NAV.map((link) => link.href),
    );
  });

  it('gives every control a name a reader can hear, and the names are the ones passed in', () => {
    render(<SiteBar />);
    for (const name of [COPY.search, COPY.sites, MODE_LABEL, COPY.menuOpen]) {
      expect(screen.getByRole('button', { name }), `no control named "${name}"`).toBeTruthy();
    }
  });

  it('reaches the whole family from one control, and this site is one of the five', () => {
    render(<SiteBar />);
    expect(SITES).toHaveLength(5);
    const hrefs = SITES.map((site) => site.href);
    expect(hrefs).toContain('https://nexus.nanisoft.com');
    expect(hrefs).toContain('https://atlas.nanisoft.com');
    expect(hrefs).toContain('https://alphalens.nanisoft.com');
    expect(hrefs).toContain('https://prism.nanisoft.com');
    // The control announces that it opens a menu rather than navigating, so a reader
    // who cannot see the icon is told what pressing it will do.
    const trigger = screen.getByRole('button', { name: COPY.sites });
    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('opens search as a dialog over a static index, because this site has no server', () => {
    render(<SiteBar />);
    const trigger = screen.getByRole('button', { name: COPY.search });
    expect(trigger.getAttribute('aria-haspopup')).toBe('dialog');
    expect(trigger.getAttribute('aria-label')).toBe(COPY.search);
  });

  it('has no colour chooser, because a ground is a property of the page', () => {
    const { container } = render(<SiteBar />);
    // A reader who could repaint the ground would be on a page that is not this one,
    // and this site publishes one. The control exists in the Block and is simply not
    // asked for, which is the difference between a decision and an omission: a Block
    // that shipped one would be offering it to every consumer.
    expect(container.querySelector('[data-slot="site-navbar-theme-trigger"]')).toBeNull();
    expect(screen.queryByRole('button', { name: /Colour theme/ })).toBeNull();
  });

  it('prints no control name as visible text, because four of the five are icon-only', () => {
    const { container } = render(<SiteBar />);
    const words = (container.textContent ?? '').replace(/\s+/g, ' ').trim();
    // The search trigger, the sites trigger, the mode control and the mobile trigger
    // are all round icons. Their names live in `aria-label`, so a reader who cannot
    // see the icon is still told what it is, and a reader who can sees a row of four
    // buttons rather than four sentences competing with the navigation.
    for (const phrase of [COPY.search, COPY.sites, COPY.toDark, COPY.toLight, COPY.menuOpen]) {
      expect(words, `"${phrase}" is printed in the bar`).not.toContain(phrase);
    }
    // And the navigation labels are the visible text, which is the other half: a bar
    // with no words at all would be a bar with nothing to read.
    for (const link of NAV) expect(words).toContain(link.label);
  });

  it('carries every destination below the row threshold too, so nothing is phone-only', () => {
    const { container } = render(<SiteBar />);
    // The panel is a Sheet and is rendered on demand, so what is asserted here is
    // that the control which opens it exists and is named. The panel's contents are
    // the design system's, and they are the same `NAV` array.
    expect(container.querySelector('[data-slot="site-navbar-mobile-trigger"]')).toBeTruthy();
    expect(screen.getByRole('button', { name: COPY.menuOpen }).getAttribute('aria-haspopup')).toBe(
      'dialog',
    );
  });
});

/**
 * The bar's own data, held apart from its markup.
 *
 * These are the facts the layout, the bar and the search index all read, and each one
 * is a claim about this site rather than about the Block. The alternative is a bar
 * that renders and a search that quietly indexes the wrong site, and no assertion
 * about markup can see either.
 */
describe('the bar data', () => {
  it('names every site once, and this site is a member of its own set', () => {
    const ids = SITES.map((site) => site.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(SITE_PRODUCT.id).toBe('www');
    expect(ids).toContain(SITE_PRODUCT.id);
  });

  it('sends every other site off this origin rather than to a route here', () => {
    // A member of the set that is not this site is a different origin. A relative
    // href would render as a working link and land on a 404, which the links gate
    // cannot see because it only resolves destinations it believes are internal.
    for (const site of SITES) {
      if (site.id === SITE_PRODUCT.id) continue;
      expect(site.href, `${site.id} does not leave this site`).toMatch(/^https:\/\//);
    }
  });

  it('leaves Prism with no pack, because prism.nanisoft.com has none of its own', () => {
    // A mark with no pack is drawn as the spectrum, and it is the one member of the
    // set that is distinguishable without a hue. The directory is the single place a
    // site picks this, so a site that gave Prism a pack would be claiming one its
    // stylesheet does not emit.
    expect(SITES.find((site) => site.id === 'prism')?.pack ?? null).toBeNull();
  });

  it('writes the two result labels as a pair, because the count is announced with them', () => {
    // The dialog announces a number and then one of these two. A site whose language
    // does not inflect the noun with the number supplies its own pair; one string for
    // both would announce "1 results".
    expect(COPY.searchOne).not.toBe(COPY.searchOther);
  });

  it('gives the bar the same default mode the document element is rendered from', () => {
    // Both come from `lib/site.ts`, and this is the assertion that they have not been
    // given two answers: a control that disagreed with the server about what a reader
    // with no stored choice sees is a flash on every page load.
    expect(DEFAULT_MODE).toBe('dark');
    expect(SITE_PRODUCT.pack).toBe(GROUND_PACK);
  });
});
