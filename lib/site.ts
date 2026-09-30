/**
 * The site's own facts, read from `site.json` and typed by the design system's
 * vocabulary.
 *
 * Three decisions live here and nowhere else, which is why they are one module:
 * the page's ground pack, the mode a visitor who has never chosen gets, and the set
 * of products the switcher moves between. The old line kept the same three facts in
 * about twenty lines of theme module, and patching that module one import at a time
 * passed a read-through and failed a build.
 *
 * **The ground is `sky` and it does not change.** A page's ground is stable for the
 * life of the page; it is a property of the page, not of the reader. It is applied
 * declaratively on the document element and never read back, so a stored theme can
 * repaint the page's marks and its mode and cannot repaint the ground out from under
 * a section that is not a boundary.
 *
 * The pack vocabulary is Prism's, so `pack` below is a compile error rather than a
 * string that matches no emitted rule. A pack identifier that resolves to nothing
 * inherits the ground silently, and a page that shows the ground's colour while
 * claiming a product's is the exact failure the catalogue's marks exist to remove.
 */
import { PACKS, themeAttributes, type Mode, type PackId } from '@nanisoft/prism-ui/theming';
import type { SwitcherProduct } from '@nanisoft/prism-ui/components/product-switcher';

import site from './site.json';

/** Every pack the token build emits, so a mistyped id fails here rather than silently. */
const PACK_IDS: readonly string[] = PACKS;

function check(value: string): PackId {
  if (!PACK_IDS.includes(value)) {
    throw new Error(
      `site.json: "${value}" is not one of the published packs (${PACK_IDS.join(', ')}), so a mark ` +
        'carrying it would match no emitted rule and would paint the ground instead.',
    );
  }
  return value as PackId;
}

/**
 * One product's pack, or null for the member of the set that has none.
 *
 * `null` is a value here rather than an omission, because it is the answer Prism gets:
 * `prism.nanisoft.com` renders its own document with no `data-pack` attribute, which is
 * the neutral base pack, so Prism owns no hue and this directory will not invent one
 * for it. A mark drawn with no pack is the one case `ProductMark` draws as the full
 * spectrum rather than as a colourless dot, and it is also what keeps the five marks in
 * the switcher distinct from each other without a fifth pastel that belongs to nothing.
 *
 * Everything else is still checked: an unrecognised id throws here rather than becoming
 * a `data-pack` attribute that matches no emitted rule and silently paints the ground.
 */
function optionalPack(value: string | null): PackId | null {
  return value === null ? null : check(value);
}

/**
 * The pack the whole page sits on.
 *
 * A separate function from the one a product's mark is drawn from, because a ground can
 * never be the answer Prism gets: `null` here would mean a document with no pack at all,
 * which is Prism's own site and not this one. Reading it through `optionalPack` would
 * type the ground as nullable and quietly allow that.
 */
export const GROUND_PACK: PackId = check(site.ground);

/** What a reader who has never chosen a theme sees. Beam-dark, the platform precedent. */
export const DEFAULT_MODE = site.defaultMode as Mode;

/**
 * The two attributes that carry the theme, for the document element.
 *
 * Spread onto `<html>` and the whole page is themed with no client runtime at all: no
 * provider, no context, no hook, no class swap. That is the declarative form the
 * design system documents as the default, and it is why the old line's mode
 * provider, its pack class and its baked variable rulesets are all gone rather than
 * reimplemented. The boot script reads the document's own attributes first, so what
 * the server rendered and what the reader stored cannot disagree about the mode.
 */
export const THEME_ATTRIBUTES = themeAttributes({ pack: GROUND_PACK, mode: DEFAULT_MODE });

/** The product this site is, as the mark the chrome draws it with. */
export const SITE_PRODUCT = {
  id: site.siteId,
  name: 'NaniSoft',
  pack: GROUND_PACK,
} as const;

/**
 * The set of products the switcher moves between, in the order a reader meets them.
 *
 * This company site is the apex, so its set is every product in the family, itself
 * first. Its own mark wears `sky` rather than the spectrum, because this site does have
 * a pack: `sky` is the ground, and a brand lockup drawn in the colour the page is
 * painted in is the honest mark for the page that is not a product.
 *
 * Prism is the fifth member and the only one with no pack, because it is the design
 * system these four are built in rather than a fifth thing built alongside them. That
 * makes it the one entry a mark is drawn as the spectrum for, and it is what leaves
 * `peach` unowned: four products own four pastels, this site owns the ground, and the
 * fifth pastel is still free for whatever the factory builds next.
 *
 * The directory is a JSON file rather than a list in this module, because two
 * independent readers need it and a TypeScript module is not one of them: the test
 * imports it, and the pack-boundary gate in `@nanisoft/prism-ui/gates` reads the file the same way it reads
 * the pack map it is checked against.
 */
export const PRODUCTS: readonly SwitcherProduct[] = site.products.map((product) => ({
  id: product.id,
  name: product.name,
  pack: optionalPack(product.pack),
  href: product.href,
}));
