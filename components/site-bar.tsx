import { SiteNavbar } from '@nanisoft/prism-ui/blocks/site-navbar';

import { COPY, NAV, SITES } from '@/lib/bar';
import { DEFAULT_MODE, GROUND_PACK, SITE_PRODUCT } from '@/lib/site';

/**
 * The bar, composed once.
 *
 * **This exists because the pack-map test used to compose its own header, and the two
 * compositions drifted.** The test rendered a `SiteHeader` with a product switcher
 * because that is what the site published when it was written; the site moved to
 * `SiteNavbar` and the test kept asserting a switcher the page no longer had, so the
 * two independent readers of `scripts/pack-map.json` were reading two different pages.
 * A test that hand-assembles what it is testing stops testing it the moment the
 * assembly is not what ships, and it fails in the direction that looks like a
 * regression in the map.
 *
 * So the bar is a component, the layout renders it and the test renders it, and
 * there is one composition rather than two that have to be kept in step. The test
 * still holds its own copy of the region rules, which is the half that genuinely
 * needs two readers: a region named one way in the script and another way in the
 * test is a difference the built-export gate would report as an unnamed region, and
 * two readers is what makes that difference visible.
 *
 * The controls and every word they can say are in `lib/bar.ts`, so the bar's data,
 * its copy and its markup are three files rather than one, and the test that renders
 * it is reading the same data the page is.
 */
export function SiteBar() {
  return (
    <SiteNavbar
      product={SITE_PRODUCT}
      defaultPack={GROUND_PACK}
      defaultMode={DEFAULT_MODE}
      navLabel={COPY.nav}
      mobileLabels={{ open: COPY.menuOpen, close: COPY.menuClose }}
      nav={NAV}
      sitesLabel={COPY.sites}
      currentSiteId={SITE_PRODUCT.id}
      sites={SITES}
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
  );
}
