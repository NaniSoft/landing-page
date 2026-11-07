import type { ReactNode } from 'react';

import { SiteFooter } from '@nanisoft/prism-ui/blocks/site-footer';
import { SiteNavbar } from '@nanisoft/prism-ui/blocks/site-navbar';
import { AlphaLensMark, AtlasMark, NexusMark, PrismMark } from '@nanisoft/prism-ui/components/product-marks';

import { COPY, NAV, SITES } from '@/lib/bar';
import { FOOTER_COLUMNS, FOOTER_LEGAL } from '@/lib/navigation';
import { DEFAULT_MODE, GROUND_PACK, SITE_PRODUCT } from '@/lib/site';
import { NaniSoftLogo } from '@/components/logo';

/**
 * The chrome, in one place, and the reason it is not in the root layout.
 *
 * **This file exists because the pack-map test used to compose its own header, and the
 * two compositions drifted.** The test rendered a `SiteHeader` with a product switcher
 * because that is what the site published when it was written; the site moved to
 * `SiteNavbar` and the test kept asserting a switcher the page no longer had, so the two
 * independent readers of `scripts/pack-map.json` were reading two different pages. A test
 * that hand-assembles what it is testing stops testing it the moment the assembly is not
 * what ships, and it fails in the direction that looks like a regression in the map.
 *
 * So the chrome is a component, each page renders it and the test renders it, and there
 * is one composition rather than two that have to be kept in step. The test still holds
 * its own copy of the region rules, which is the half that genuinely needs two readers: a
 * region named one way in the script and another way in the test is a difference the
 * built-export gate would report as an unnamed region, and two readers is what makes
 * that difference visible.
 *
 * **A server render knows the route; a root layout does not.** The bar was in
 * `app/layout.tsx` until the other three sites had moved theirs, which is what made this
 * the one bar in the family that could never mark the page a reader was on: a layout is
 * rendered once per route and is handed no pathname. Each page now renders this with the
 * route it is serving, the mark is a prop, and nothing became a client component to get
 * it. The Block's other way of doing this is `currentPath`, which resolves the mark in
 * the browser; a server render never needed it.
 *
 * **The bar is the design system's, and its client island is inside the package rather
 * than in this repository.** `SiteNavbar`'s lockup and navigation are server Components
 * and its search trigger, sites menu and mode control are one client boundary. So this
 * site's own source still carries no `'use client'` directive at all, and
 * `test/server-only.test.ts` still asserts exactly that: the reader gets a working mode
 * toggle and a working search, and the boundary that carries them is a line in a package
 * rather than a line in this repository.
 *
 * **There is no colour chooser on this site, and that is the decision rather than an
 * omission.** A page's ground is stable for the life of the page, so a control that let a
 * reader repaint it would be offering them a page that is not this one. The mode is the
 * axis that is the reader's rather than the page's, and because the whole family stores
 * it under one key, a reader who chose dark here arrives in dark on the other four sites.
 *
 * The search index is this site's own, emitted as a static file from the same content
 * tree the routes are generated from, so a post a reader can reach is a post a search can
 * find.
 */
export type SiteSection = '/about' | '/blog';

/*
 * The product, as the chrome draws it: the same three facts the bar and the
 * footer have always read, plus the drawing. The mark is the company's own
 * convergence mark, and it is the sign in the row, in the mobile panel and at
 * the foot of the page from this one fact, so a reader meets one sign three
 * times rather than a disc twice and a drawing once.
 */
const PRODUCT = { ...SITE_PRODUCT, mark: <NaniSoftLogo className="site-product-mark" /> };

/**
 * The family's marks, as the bar's sites menu draws them.
 *
 * The directory in `lib/site.json` carries each product's id, name, pack and
 * destination, and not its drawing: a JSON file cannot hold a React node. The
 * drawings live here beside the mark this bar already draws for its own product,
 * so the menu shows each member's own logo rather than the two-colour disc, and a
 * reader recognises a destination by its sign before they read its name.
 */
const SITE_MARKS: Record<string, ReactNode> = {
  www: <NaniSoftLogo className="site-product-mark" />,
  nexus: <NexusMark className="site-product-mark" />,
  atlas: <AtlasMark className="site-product-mark" />,
  alphalens: <AlphaLensMark className="site-product-mark" />,
  prism: <PrismMark className="site-product-mark" />,
};

/** The family, with each member's drawn mark attached to its directory entry. */
const SITES_WITH_MARKS = SITES.map((site) => ({ ...site, mark: SITE_MARKS[site.id] }));

export function SiteChrome({
  current,
  children,
}: {
  /** The destination this page is serving, so the bar can mark the reader's place. */
  current?: SiteSection;
  children: ReactNode;
}): ReactNode {
  return (
    <>
      <SiteNavbar
        product={PRODUCT}
        defaultPack={GROUND_PACK}
        defaultMode={DEFAULT_MODE}
        navLabel={COPY.nav}
        mobileLabels={{ open: COPY.menuOpen, close: COPY.menuClose }}
        nav={NAV.map((link) => ({ ...link, current: current === link.href }))}
        sitesLabel={COPY.sites}
        currentSiteId={SITE_PRODUCT.id}
        sites={SITES_WITH_MARKS}
        search={{
          indexUrl: '/api/search',
          label: COPY.search,
          hint: COPY.searchHint,
          messages: {
            close: COPY.searchClose,
            loading: COPY.searchLoading,
            failed: COPY.searchFailed,
            empty: COPY.searchEmpty,
            one: COPY.searchOne,
            other: COPY.searchOther,
          },
        }}
        mode={{ lightLabel: COPY.toDark, darkLabel: COPY.toLight }}
      />
      <main className="site-main">{children}</main>
      <SiteFooter
        product={PRODUCT}
        about={
          // The one sentence a reader who reached the bottom has not been told
          // yet, and it is the site's own description of itself, so the foot
          // and the metadata cannot disagree about what the company is. The
          // tagline above it is the page's claim, in the ink of the brand.
          <div className="site-footer-about">
            <p className="site-footer-tagline">Software that builds software.</p>
            <p>
              NaniSoft is the AI-native software company whose products are built by its
              own Agent Factory.
            </p>
          </div>
        }
        columns={FOOTER_COLUMNS}
        legal={FOOTER_LEGAL}
      />
    </>
  );
}
