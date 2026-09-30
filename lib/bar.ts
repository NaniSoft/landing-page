/**
 * The bar's own facts, as data.
 *
 * Everything the bar needs that is not the content tree: the theme a reader with no
 * stored choice gets, the two routes this site publishes, and every sentence the
 * bar's controls can say. They are one module because they are one decision, and a
 * bar whose control names live in three files is a bar where a reader finds
 * "Search" in one place and "No matches." in another.
 *
 * **No pack chooser, and the omission is the point.** `SiteNavbar` takes a colour
 * menu, and this site does not pass one: a page's ground is stable for the life of
 * the page, so a control that let a reader repaint it would be a control offering
 * them a page that is not this one. Prism's own site is the site whose subject is
 * its palettes, and it is the one that gets the chooser.
 *
 * **The mode toggle is here even though the theme is otherwise fixed**, because the
 * mode is the one axis that is a reader's rather than the page's, and because the
 * whole family stores it under the same key: a reader who chose dark on one NaniSoft
 * site arrives in dark on the other four.
 */
import type { SwitcherProduct } from '@nanisoft/prism-ui/components/product-switcher';

import { PRODUCTS, SITE_PRODUCT } from './site';

/** This site's own destinations, in the order the bar shows them. */
export const NAV = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
] as const;

/** The family's five sites, which is the set the bar's sites menu moves between. */
export const SITES: readonly SwitcherProduct[] = PRODUCTS;

/**
 * Every sentence the bar and the search dialog can say.
 *
 * A Block ships no copy, which is the right rule and it is why this object exists
 * rather than a default inside the package: the words a reader hears on this site
 * are this site's words. The two result labels are a pair because English inflects
 * the noun with the number, and the pair is where a site whose language does not put
 * the number first would supply its own order.
 */
export const COPY = {
  nav: 'This site',
  sites: 'The family',
  search: 'Search this site',
  searchHint: 'Type to search the landing, about and every post.',
  searchClose: 'Close search',
  searchLoading: 'Loading the search index.',
  searchFailed: 'The search index could not be loaded.',
  searchEmpty: 'No matches.',
  searchOne: 'result.',
  searchOther: 'results.',
  toDark: 'Switch to dark mode',
  toLight: 'Switch to light mode',
  menuOpen: 'Open menu',
  menuClose: 'Close menu',
} as const;

/** The product this bar belongs to, which is the same mark the footer draws. */
export const BAR_PRODUCT = SITE_PRODUCT;
