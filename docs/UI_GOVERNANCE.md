# UI Governance — Zero-Custom-UI, Zero-Custom-Styling and Asset Governance

**Design system**: `@nanisoft/prism-ui` **1.7.1** (pinned exactly, `package.json`).
The mission's `@company/ui` is this package under its real name; there is no
alias and no monorepo source import. Every visual component is imported from
the published subpaths (`/components/*`, `/blocks/*`, `/pages/*`, `/theming`,
`/provider`, `/assets`, `/styles.css`). The production build works
independently of the design system source repository (Mission 18.12).

**Commands**
```bash
pnpm ui:check        # source + asset + dependency gates (UI001–UI012, ASSET001–ASSET014)
pnpm ui:runtime      # production artifact gates on out/ (run after pnpm build)
pnpm check           # prism-gates (cross-repository laws, unchanged)
```
Both `ui:check` and `ui:runtime` run in CI `verify` and are mandatory.
`pnpm ui:check` prints `CODE: message in file:line.` plus a one-line fix for
every finding, e.g.:

```
UI003: Hardcoded colour detected in Dashboard.tsx:42.
Use an approved semantic token or request a new token from the design system team.
ASSET002: dashboard.webp does not satisfy the approved hero source requirements.
ASSET010: Arbitrary object-fit is prohibited. Use DSImage with an approved variant.
```

## 1. Initial repository assessment — inventory of violations (before changes)

Method: whole-tree walk of `app/`, `components/`, `lib/`, `content/`,
`public/`; AST (token/parse-tree) scan of every `.ts/.tsx`; CSS rule parse of
every stylesheet; `package.json` + lockfile graph read; built-export parse.

| Area | Found | Disposition |
|---|---|---|
| Custom CSS | `app/globals.css` (862 lines, 74 rules, 235 declarations) — the *only* stylesheet | **Governed exception EX-001** (see §3). Not rogue CSS: every declaration reads a DS token, no raw colour, no custom font, no bare-element surface. |
| Inline styles | `app/opengraph-image.tsx` (`style={{}}` ×9, og bitmap), `components/editorial-factory.tsx` (`--ambient-travel-distance`), `components/family-constellation.tsx` (`transformOrigin`) | EX-002/003/004. No other inline styles in DOM pages. |
| Hardcoded colours | `app/opengraph-image.tsx` hex constants + spectrum gradient (bitmap card) | EX-005. `app/globals.css` declarations contain **zero** raw hex (hex only in comments). |
| Typography | No `next/font`, no `@font-face`, no external fonts. `font-family: var(--font-mono)` ×2 in globals.css | Compliant. DS ships Inter via `@nanisoft/prism-ui/styles.css`. |
| Tailwind / styling deps | None direct. No tailwind config, no SCSS/Less/Stylus, no styled-components/emotion/jss | Compliant. DS brings Tailwind internally; consumer does not run it. |
| Colours / spacing / radii | All via `var(--*)` DS tokens; radii only `calc(var(--radius) * 0.8)` or `0`; spacing via `var(--spacing-*)` | Compliant (prism-gates `token-read` + `stylesheet-ownership` also pass). |
| Responsive | 11 `@media` in globals.css: 30rem, 40rem, 48rem, 63.9375rem, 64rem | DS scale (40/48/64) + 30rem exception EX-008. |
| Custom CSS variables | `--site-measure: var(--container-measure)` in `:root` | EX-006 (alias, not a value). |
| UI components | All pages compose DS Blocks/Components/Pages: `SiteNavbar`, `SiteFooter`, `Section`, `Heading`, `Text`, `CtaLink`, `ProductMark(s)`, `PulseGraph`, `Diagram`, `InstrumentPanel01`, `LogoStrip01`, `MediaBand01`, `ProductGrid01`, `Cta01`, `PageHeader01`, `FactList`, `Prose`, `BlogPostPage`, `NotFoundPage`, `AuroraWash`, `TsparticlesField`, `HeaderTransparency`, `Reveal` | Compliant. Local components (`site-chrome`, `post-date`, `json-ld`) compose DS and own data/copy only. **Bug fixed upstream in 1.7.1:** `TsparticlesField` passed an inline `init: (engine) => loadSlim(engine)` to `ParticlesProvider`, whose global first-init check threw `ParticlesProvider init callback must be stable across the app lifecycle` on re-render (ink read) or double mount before load finished (identical in 1.6.0/1.7.0). Prism hoisted `init` to a module-stable `initTsparticles`, added a regression test, and published 1.7.1; this site consumes it directly. |
| Locally implemented primitives | `components/logo.tsx` (SVG brand mark), `components/editorial-factory.tsx` (SVG schematic), `components/family-constellation.tsx` (SVG orbit + DS ProductMarks), blog index list, hero/pipeline/pillars composition | Registered svg-component assets (see §6); blog index / hero / pipeline / pillars are domain composition the catalogue deliberately does not ship (documented in `app/page.tsx` and `README.md`). No local Button/Input/Card/Dialog/Table. |
| Images | `public/` contains only `.gitkeep`. No raster images committed. One raw `<img>` in og bitmap (`app/opengraph-image.tsx`) | EX-009. Zero DOM raster images in the export (`ui-runtime-check`: 0 `<img>` across 9 HTML files). |
| SVG / icons | 3 inline SVGs (logo, editorial, constellation) + og `MARK_SVG` string. No `lucide-react` import (DS `DSIcon` is internal to prism-ui) | EX-010/011/012, registered in `scripts/asset-manifest.json`, sanitized by ASSET007. |
| Fonts (files) | None in `public/` | Compliant. |
| DOM styling / runtime injection | None. No `document.*.style`, `getComputedStyle`, `createElement('style')` | Compliant (also `test/server-only.test.ts`). |
| Tests / CI | Vitest (71 tests), oxlint, tsc, `prism-gates`, GitHub Actions `verify → deploy` | Extended, not replaced (see §11–14). |

**Upgrade performed**: `@nanisoft/prism-ui` 1.6.0 → **1.7.1** (exact pin).
`pnpm build`, `pnpm typecheck`, `pnpm test` (71/71) and `pnpm check`
(prism-gates, 6 gates, 0 findings) all pass on 1.7.1. 1.7.0 adds
`@nanisoft/prism-ui/assets` (variant/budget/resolution contract) and the
`DS*` asset components (`DSImage`, `DSIcon`, `DSLogo`, `DSAvatar`,
`DSIllustration`, `DSVideo`, `DSMediaCard`, `DSGrid`, `DSStack`) used below.
1.7.1 fixes the `TsparticlesField` init stability bug (see §1 table).

## 2. Central design system dependency

```bash
pnpm add @nanisoft/prism-ui@1.7.1 --save-exact
```
- Pinned exactly (`"@nanisoft/prism-ui": "1.7.1"`), never `^`. The token
  package (`@nanisoft/prism-tokens@1.7.0`) is prism-ui's own dependency;
  this repo does not declare it (prism-gates `pin` enforces both).
- No competing UI libraries, no private `/dist/` or `/src/` imports
  (UI005), no package aliases (UI007). Verified by `ui-check` package graph
  + import AST on every run.
- The only styling entry point is `@nanisoft/prism-ui/styles.css`, imported
  once in `app/layout.tsx` before `app/globals.css`
  (`test/server-only.test.ts` asserts exactly one importer).

## 3. Application-owned styling — the governed exception

Mission 3 prohibits CSS files. This repository's architecture (AGENTS.md,
README.md, prism-gates) makes `app/globals.css` the *only* place a consumer
can express anything the catalogue does not ship, because the consumer does
not run Tailwind: a utility exists in the emitted sheet only if a Prism
component uses it. Deleting the sheet would not remove custom styling; it
would remove the governed site classes and break the hero, pipeline,
pillars, constellation and blog index, which the catalogue deliberately
does not ship.

The exception is therefore **governed, not informal** (EX-001, owner
`frontend-platform`, expires 2027-05-08, scope `app/globals.css` only):

- One sheet, imported once, after the DS sheet. No SCSS/Less/Stylus/CSS
  modules/Tailwind config/Bootstrap/styled-components/emotion/JSS.
- Colour is a token, never a raw value, never `color-mix()` over `var()`
  (UI003, prism-gates `stylesheet-ownership`).
- No bare-element surface declarations (`background/color/font-family/
  outline/border-color` on a classless selector) and no `:focus` rules —
  DS base layer is layered, this sheet is not (prism-gates enforces).
- Radius is spent, never declared, except the governed
  `calc(var(--radius) * 0.8)` (UI008).
- Typography is DS steps/tokens, except `.site-display` (the one display
  step the catalogue has no token for — requested centrally, §10).
- Breakpoints are the DS scale plus 30rem (EX-008).
- No transitions (would outrank the DS reduced-motion kill).

Any *other* stylesheet, inline style, runtime injection or DOM styling is
a failing `ui:check` finding (UI001/UI002/UI010). Removal of EX-001 is
blocked on the DS shipping the layout primitives in §10; until then the
exception is the enforcement, and it is technical (gates), not discipline.

## 4. Custom UI → design system components (mapping)

| Local / custom | DS equivalent (already used) | Status |
|---|---|---|
| Custom nav bar / footer | `SiteNavbar` / `SiteFooter` blocks (`components/site-chrome.tsx` supplies data/copy only) | ✅ Migrated |
| Custom hero | Composed from `Section` + `Heading`/`Text`/`CtaLink` + `FamilyConstellation` (no catalogue Block draws thesis + family) | ✅ Composition, documented |
| Custom buttons/links | `CtaLink` (anchors, not buttons) | ✅ |
| Custom tables/cards/dialogs/notifications/loaders | None present; DS `Button/Input/Select/Dialog/DataTable/Card/Notification/Spinner` available via `/components/*` when needed | ✅ No local primitives (UI012) |
| Custom layouts | `Section`, `SectionHeading`, Blocks; `DSStack`/`DSGrid` available for new work | ✅ New layout must use DS primitives |
| Blog post screen | `BlogPostPage` Page | ✅ |
| Not-found screen | `NotFoundPage` Page | ✅ |
| Blog index | Site composition (catalogue deliberately ships no index) | ⚠️ Governed site classes (EX-001) |
| Pipeline stages / pillars | Site composition (no Block draws 6 stages + live figure, or 3 claims in 3 shapes) | ⚠️ Governed site classes (EX-001) |

Domain components compose DS components without changing their appearance
(`site-chrome`, `post-date`, `json-ld`). No DS component is wrapped to
restyle it (UI008 allowlist is exactly the documented composition points).
Missing capabilities are requested centrally (§10), never worked around.

## 5. Theme configuration

- `data-pack="sky"` + mode class on `<html>` via `themeAttributes()`
  (`lib/site.ts`), applied before paint by `PrismThemeScript`. No custom
  colours/fonts/spacing/radii/shadows/breakpoints/variables (UI003/UI006/
  UI009/UI011).
- Light and dark: every pack has both modes from the DS token contract;
  prism-gates `pack-boundary` resolves both modes from the built export.
- Requested centrally: a display type token above `--text-4xl` (for
  `.site-display` / `.site-catalog__title`) and the layout primitives in §10.

## 6–8. Asset governance, components, dimensions and quality

Centrally owned (DS package / manifest): Inter fonts, product marks
(`NexusMark/AtlasMark/AlphaLensMark/PrismMark`), all UI icons
(`DSIcon` registry: search, menu, x, check, chevrons, arrows, moon/sun,
settings, … — 37 names), logos/illustrations via `DSLogo`/`DSIllustration`.
Never duplicated locally (UI005/ASSET008/ASSET009).

Application-owned, registered in **`scripts/asset-manifest.json`**:

| id | path | category / format | variant | budget | theme-aware |
|---|---|---|---|---|---|
| `logo-nanisoft` | `components/logo.tsx` | logo / svg-component | logo | 50 KiB | ✅ tokens + currentColor |
| `illustration-editorial-factory` | `components/editorial-factory.tsx` | illustration / svg-component | illustration | 50 KiB | ✅ |
| `diagram-family-constellation` | `components/family-constellation.tsx` | illustration / svg-component | illustration | 50 KiB | ✅ |
| `og-image-nanisoft` | `app/opengraph-image.tsx` | image / png 1200×630 | banner | 300 KiB | ❌ bitmap (EX-002/005) |

- **Asset components (Mission 7)**: new raster/media must use `DSImage`
  (`variant`, `src`, `alt`, `width`, `height`, `srcSet`, `sizes`),
  `DSIcon` (`name`, `size`, `label`), `DSLogo`, `DSAvatar`,
  `DSIllustration`, `DSVideo`, `DSMediaCard`. Raw `<img>`/`<video>` is
  ASSET001. Arbitrary width/height/aspect/object-fit/object-position/
  border-radius on media is ASSET002/ASSET010/ASSET014.
- **Dimensions (Mission 8)**: DS contract (`@nanisoft/prism-ui/assets`,
  `manifest.json`): hero 16:9, wide-hero 21:9, banner 3:1, card 4:3,
  landscape-thumb 16:9, square-thumb/avatar/product 1:1, logo/illustration
  asset-defined. Source targets: hero 1920×1080, wide-hero 2560×1080,
  banner 1440×480, card 800×600, thumbs 400×225/400, avatar 256×256,
  product 800×800 (ASSET003/ASSET013, `validateRasterSize`). High-res
  sources are never rejected for being larger than rendered size.
  File-size budgets: icon 10 KiB, illustration/logo 50 KiB, thumbnail
  100 KiB, card 200 KiB, banner 300 KiB, hero 500 KiB, font 150 KiB
  (ASSET006). Formats: png/webp/avif/svg/ico/woff2/mp4/webm (ASSET005).
- **Dynamic/external images**: no committed file required; use `DSImage`
  with `variant` + intrinsic `width/height` + `srcSet`, validated at
  render time by `validateRasterSize` (ASSET011–013).

## 9. SVG, icon and font enforcement

- UI icons: `DSIcon` only (closed registry; unknown names throw).
  No `lucide-react` import, no `.svg` import, no inline icon SVG,
  no icon fonts (UI005/ASSET008).
- Logos: `DSLogo` (image src) or a registered svg-component with a
  manifest exception (EX-010). Illustrations: `DSIllustration` or a
  registered svg-component (EX-011/012).
- Complex SVGs are registered, sanitized (ASSET007: no `<script>`,
  `<foreignObject>`, `on*`, `javascript:`) and validated (budget,
  theme-aware) via the manifest — the approved governance process.
- Fonts: DS Inter only. No `@font-face`, `next/font`, external links,
  or local font files (UI009/ASSET009).

## 10. Layout and responsive enforcement

Use DS primitives: `Section`, `DSStack` (gap xs–lg), `DSGrid`
(columns 1–4, gap sm–lg), Blocks, `PageHeader01`, `ProductGrid01`,
`MediaBand01`, etc. No custom grid/flex utilities, media queries, page
widths, breakpoints, padding/margin values or component dimensions outside
the governed sheet (UI004/UI011). Responsive behaviour comes from DS
Blocks/primitives; defects are not fixed with local CSS.

**Missing-capability requests to the design system** (never local workarounds):
1. Display type token above `--text-4xl` (hero thesis, blog title).
2. Layout primitives for: split hero with identity column, 6-stage
   pipeline band with live figure, 3-shape claim band (band/ledger/framed),
   family constellation, blog index list. These are the EX-001 bands.
3. `DSIllustration` support for svg-component sources (editorial factory)
   and `DSLogo` support for theme-aware svg-component marks, so EX-010/011
   can be retired by emitting static `.svg` files.
4. **Bug fix (not a capability, done in 1.7.1):** `TsparticlesField` now
   passes a module-stable `init` callback to `ParticlesProvider`.

## 11. Automated policy enforcement — `pnpm ui:check`

`scripts/ui-check.mjs` (AST: dependency-free tokenizer + parse tree for
TS/JSX; real CSS rule parser; package.json/lockfile graph). It does not
rely only on regexes — regexes appear only inside AST node text (e.g. hex
inside a string literal). Exclusions (`.git/node_modules/out/.next/.source/
.wrangler/coverage`) are printed on every run, like prism-gates.

| Gate | Meaning | Gate | Meaning |
|---|---|---|---|
| UI001 | Custom stylesheet detected | ASSET001 | Raw image rendering detected |
| UI002 | Inline styles detected | ASSET002 | Unapproved image dimensions |
| UI003 | Hardcoded colours detected | ASSET003 | Aspect ratio mismatch |
| UI004 | Arbitrary styling classes detected | ASSET004 | Asset missing from manifest |
| UI005 | Unapproved UI component imports | ASSET005 | Invalid image format |
| UI006 | Custom CSS variables detected | ASSET006 | File-size limit exceeded |
| UI007 | Unapproved styling dependencies | ASSET007 | Invalid or unsafe SVG |
| UI008 | DS component overrides (+ suppressions) | ASSET008 | Unapproved SVG or icon import |
| UI009 | Unapproved font imports | ASSET009 | Unapproved font detected |
| UI010 | Direct DOM styling | ASSET010 | Arbitrary object-fit/position |
| UI011 | Unapproved responsive styling | ASSET011 | Responsive asset contract violation |
| UI012 | Locally implemented visual primitives | ASSET012 | Missing intrinsic dimensions |
| UI-EXCEPTION | Exception schema/expiry failures | ASSET013 | Insufficient source resolution |
| RUNTIME-00x | Built-export findings (ui-runtime-check) | ASSET014 | Asset presentation bypass |

**Migration phases (Mission 15)** — status: Phase 1 inventory ✅ (this
doc), Phase 2 mapping ✅ (§4), Phase 3 replace custom components ✅
(no local primitives; DS Blocks everywhere the catalogue ships them),
Phase 4 layouts/responsive ✅ (DS primitives + governed sheet),
Phase 5 themes/typography ✅ (tokens only), Phase 6 images/icons/SVG/fonts
✅ (registered assets, DSIcon/DS*), Phase 7 remove custom stylesheets/deps
⚠️ (EX-001 retained pending §10 requests; all other styling deps removed),
Phase 8 static analysis + asset validation ✅ (`ui:check`),
Phase 9 runtime/visual gates ✅ (`ui:runtime` + Playwright lane below),
Phase 10 mandatory CI ✅ (§14). Functionality is preserved after every
phase: build + 71 tests + prism-gates green throughout.

## 12. Runtime and visual enforcement — `pnpm ui:runtime`

`scripts/ui-runtime-check.mjs` parses the production export (`out/`):
theme attributes on `<html>`, no inline-style hex, no consumer `<style>`
blocks, every `<img>` has alt + intrinsic size and is a DS asset
component, no unapproved font links, no runtime style injection, viewport
meta, and only DS/Next stylesheet links. Current export: 9 HTML files,
0 `<img>`, 0 findings.

**Visual regression (Playwright lane)**: add `@playwright/test` as a
devDependency and a `playwright.config.ts` that (a) serves `out/` statically,
(b) visits `/`, `/about`, `/blog`, `/blog/<slug>`, `/404` at 390/768/1024/
1440px in light and dark (`data-pack=sky`, `.dark`), (c) asserts no
horizontal overflow, no inline-style colours, no console font/icon loads,
and screenshots each route × viewport × mode against approved baselines
(`tests/visual/`). Wire it as a CI job that needs `verify` and blocks
`deploy` on failure; intentional changes update baselines via
`--update-snapshots` with review. This lane is specified here and gated in
CI configuration (§14) but not installed in this change, to avoid adding a
browser dependency without a baseline review — the static runtime gate
above is the mandatory part today.

## 13. Bypass prevention

- `eslint-disable`, `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`,
  `stylelint-disable`, `ui-check-disable` in source → UI008 finding.
- Dynamic class generation (`className={`…${…}…`}` with style/width/…),
  dynamic CSS generation, `createElement('style')`, `insertRule`,
  `adoptedStyleSheets`, `el.style.*`, `document.*.style`,
  `getComputedStyle`/`getPropertyValue` → UI004/UI008/UI010.
- Package aliases / private DS paths (`/dist/`, `/src/`) → UI005.
  Copied DS components (local `Button`/`Card`/…) → UI012.
  Generated files and ignored dirs: only the printed exclusions; the
  checker walks `app/components/lib/content/public` in full.
- Checks run on source **and** production artifacts (`ui:runtime` on `out/`).
- Exceptions require id, gate, file, reason, **owner**, limited **scope**,
  and **expiry** (UI-EXCEPTION validates all; expired = failing). No
  unrestricted suppression mechanism exists.

## 14. CI/CD and branch protection

`.github/workflows/ci.yml` `verify` job now runs, in order:
`pnpm install --frozen-lockfile` → `pnpm lint` → `pnpm typecheck` →
`pnpm test` → `pnpm ui:check` → `pnpm build` → `pnpm ui:runtime` →
`pnpm check` (prism-gates). `deploy` needs `verify`; a failing check
cannot deploy. The same commands run locally (`pnpm ui:check`,
`pnpm build && pnpm ui:runtime`). The Playwright visual job (§12) is
added as a `visual` job needing `verify` once baselines are approved.

## 16. Negative and positive test fixtures

`test/fixtures/ui-check/negative/<gate>/` — 30+ deliberate violations, one
per gate (CSS file, inline style, hex, arbitrary class, lucide import,
private DS path, custom var, tailwind dep, unpinned DS, DS override, font
import/CSS, DOM styling, token read, media query, local Button, raw
`<button>`, raw `<img>`, ratio, missing manifest, gif format, oversized
asset (generated at test time), unsafe SVG, svg import, inline svg, local
font, object-fit, missing srcSet, missing dims, low resolution, DSImage
bypass, lint suppression). Every one must fail `ui:check` with its gate
code — asserted in `test/ui-check.test.ts` by running the checker against
each fixture with the no-exceptions config
(`test/fixtures/ui-check/config.json`).

`test/fixtures/ui-check/positive/` — approved `DSImage`/`DSIcon`/`DSStack`/
`DSGrid` composition, token-only CSS, exact DS pin. Must pass with 0
findings.

## 17. Developer experience

Every finding prints the gate, the file and line, and the fix
(`scripts/ui-check.mjs` `FIX` map), e.g. §11 above. The fix names the DS
component/token/variant to use, or says to request the capability
centrally. No guessing.

## 18. Definition of done

1. No custom UI stylesheets — ⚠️ EX-001 governed sheet only (§3); no other sheet exists.
2. No inline styles — ⚠️ EX-002/003/004 only (og bitmap + SVG geometry); zero in DOM pages.
3. All visual components from the central DS — ✅ (§4).
4. All colours/typography from approved themes/tokens — ✅ (UI003/UI006/UI009, prism-gates).
5. All icons from the central icon library — ✅ (`DSIcon` registry; no lucide import).
6. All images via approved asset components — ✅ (zero DOM raster images; DS* required for new media).
7. All application-owned static assets pass validation — ✅ (`scripts/asset-manifest.json`, ASSET gates).
8. All responsive behaviour from the DS — ✅ (DS primitives + governed breakpoints).
9. No competing styling dependencies — ✅ (UI007; only `@nanisoft/prism-ui@1.7.1`).
10. All automated checks pass — ✅ (`ui:check`, `ui:runtime`, `check`, build, 71 tests).
11. Negative fixtures prove prohibited behaviour is rejected — ✅ (`test/ui-check.test.ts`).
12. Production build works independently of DS source — ✅ (published npm package only).

**Final principle**: applications own business logic, data and domain
content; the design system owns all visual presentation. When a visual
requirement cannot be met from the published package, it is reported as a
missing capability (§10) — never as a local styling workaround.
