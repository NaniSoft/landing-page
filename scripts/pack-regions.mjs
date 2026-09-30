/**
 * Which region of this page a pack boundary belongs to.
 *
 * The law is in `@nanisoft/prism-ui/gates`: a boundary lands on a mark and nowhere
 * else, and a declared region set is the whole of what may carry a second pack. What
 * is here is the half only this site knows, and it is here rather than in the kit
 * because naming a region means knowing this site's own DOM. Three other repositories
 * run the same gate and each answers the same question about a different page.
 *
 * **Every region is named from the structure that carries it, never from type.** The
 * previous resolver read the two-digit ordinal a band printed above its own heading and
 * called the band `landing.02`, which made a pack boundary's region a fact about
 * typography: deleting the ordinals to get them off the page would have renamed a
 * region and failed the build, so five decorative numbers on five section headings
 * were load-bearing infrastructure. That was the wrong way round, and the reason it
 * happened is that a resolver that has nothing to read will read something. A
 * resolver that reads only markup has nothing to fall back on.
 *
 * So a mark in the switcher is the switcher's, a mark in a brand lockup is the
 * lockup's, a mark in the hero band is the hero's, and a mark in the product grid is
 * the product grid's. A band with no rule here returns null rather than a guess,
 * because a region the gate cannot name is a region it cannot hold to
 * `scripts/pack-map.json`: an unnameable boundary is a build failure, which is the
 * answer a new mark in an undeclared band should get.
 *
 * Read by `pnpm check` and, separately, by `test/pack-map.test.tsx`, which carries the
 * same four rules so the two independent readers of the map cannot drift. Nothing else
 * imports it: this is a declaration about one page, not a library.
 */
export function regionOf(element) {
  if (element.closest('[data-slot="product-switcher"]')) return 'header.switcher'
  if (element.closest('header')) return 'header.brand'
  if (element.closest('footer')) return 'footer.brand'
  if (element.closest('[data-slot="nanisoft-hero"]')) return 'landing.hero'
  if (element.closest('[data-slot="product-grid"]')) return 'landing.products'
  return null
}
