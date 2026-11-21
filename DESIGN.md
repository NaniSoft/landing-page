---
name: NaniSoft (www.nanisoft.com)
description: The NaniSoft company home: one sky-lit ground, five satellite sites, and software that builds software.
colors:
  beam: "#9bd1ff"
  on-beam: "#001a2f"
  beam-day: "#6cb2eb"
  ground: "#16191b"
  ground-day: "#eaedf0"
  ink: "#eaedf0"
  ink-day: "#2b2e32"
  muted-ink: "#c6cbd0"
  muted-ink-day: "#565c60"
  wash: "#004671"
  wash-day: "#deefff"
  hairline: "#3e4347"
  hairline-day: "#dadee2"
  glass-card: "rgba(234, 237, 240, 0.07)"
  rail-glass: "rgba(62, 67, 71, 0.88)"
  brand-ink: "#c2e2ff"
  brand-ink-day: "#135f93"
  ray-cyan: "#7fdaf0"
  ray-mint: "#9ddcad"
  ray-gold: "#edc47d"
  ray-sky: "#9bd1ff"
typography:
  display:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 6.4vw, 4.25rem)"
    fontWeight: 600
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  heading:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 600
  body:
    fontFamily: "Inter, Inter Fallback, ui-sans-serif, system-ui, sans-serif"
    fontWeight: 400
    fontSize: "1rem"
  label:
    fontFamily: "ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace"
    fontSize: "0.625rem"
    letterSpacing: "0.1em"
rounded:
  xs: "0.125rem"
  sm: "0.3rem"
  base: "0.5rem"
  site: "calc(var(--radius) * 0.8)"
  xl: "0.7rem"
  4xl: "1.3rem"
spacing:
  unit: "0.25rem"
  section: "4rem"
  section-wide: "6rem"
components:
  button-primary:
    backgroundColor: "{colors.beam}"
    textColor: "{colors.on-beam}"
    rounded: "{rounded.site}"
  button-outline:
    textColor: "{colors.ink}"
    rounded: "{rounded.site}"
  card:
    backgroundColor: "{colors.glass-card}"
    textColor: "{colors.ink}"
    rounded: "{rounded.base}"
---

# Design System: NaniSoft (www.nanisoft.com)

## Overview

**Creative North Star: "The Family Constellation"**

The company home is the center of an orbit. Five sites share one design language, and this page draws that fact as a living schematic: NaniSoft at the middle, Prism, Nexus, Atlas and AlphaLens on a dashed orbit around it, one pastel ray per satellite, everything stroked in semantic tokens so the whole figure repaints when the mode turns. The sky pack supplies the light: a beam-blue accent on a near-neutral dark ground (dark is the default; every band exists in light too), never more than one voice of color per section.

The atmosphere is one continuous ground. A fixed aurora-and-particle layer sits behind the entire page at z-index -1, and nothing else competes with it: sections are separated by hairlines and accent washes, not by alternate background bands. Structure is hairline discipline: 1px rules, 2px primary band tops, translucent glass cards, and corners that are always a fraction of the pack radius, never a new number. Motion never bounces; ambient light travels, pulses and sweeps on token-priced cycles and stops cleanly for readers who prefer reduced motion.

This is the only site in the family with a small site-authored stylesheet (app/globals.css). It is a layer over the design system, not a second system: no raw color, no new radii, no transitions, one alias variable, and every class named for what it draws (site-display, site-hero, site-pillar, site-factory, site-constellation).

**Sources of truth:** every value below is recorded from the pinned `@nanisoft/prism-ui@1.11.0` stylesheet (`data-pack="sky"`), which is normative, plus `app/globals.css` for the site classes. Dark values are the default rendering; `-day` siblings are the light mode. The family accents (ray-cyan, ray-mint, ray-gold, ray-sky) may appear only inside product marks.

**Key Characteristics:**
- One sky ground, dark first, one beam of accent color per section
- Every heading carries its semantic tail in animated spectrum ink
- Pack color lives only inside the five product marks; sections stay ground-palette
- Hairline structure: 1px rules, 2px primary band tops, glass at token-transparency
- Diagrams as figures: the constellation orbit and the editorial factory floor
- Corners are spent, never declared: a fraction of the 0.5rem pack radius
- Motion that never bounces: token durations, expo-out eases, scroll-driven reveals

## Colors

One pastel sky beam on a near-neutral dark ground, with the other three packs held in reserve inside product marks. The palette reads as daylight through glass: translucent white-on-dark surfaces, hairline borders, and one saturated voice at a time.

### Primary
- **Beam Sky** (#9bd1ff dark, #6cb2eb light): the pack beam. Primary buttons, focus rings, the constellation's pulsing ring, the 2px rule on top of pillar bands, and the warm middle of spectrum ink. Primary text on it is always deep navy (#001a2f).
- **Brand Ink** (#c2e2ff dark, #135f93 light): the drawing ink for marks and wordmarks, one step quieter than the beam.

### Secondary
- **Ray Cyan** (#7fdaf0): Nexus, inside its mark only.
- **Ray Mint** (#9ddcad): Atlas, inside its mark only.
- **Ray Gold** (#edc47d): AlphaLens, inside its mark only.
- **The Prism Spectrum** (gradient #ec88a0, #bc97e7, #73bf88, #6cb2eb, #e4965e): the Prism mark carries no pack and is drawn as the full fan. The same five stops power the spectrum-ink heading tails.

### Neutral
- **Ground** (#16191b dark, #eaedf0 light): the page. One continuous ground under every band.
- **Ink** (#eaedf0 dark, #2b2e32 light): text at rest.
- **Muted Ink** (#c6cbd0 dark, #565c60 light): descriptions, meta, captions.
- **Wash** (#004671 dark, #deefff light): accent panel fills, the pillar bands' backgrounds.
- **Hairline** (#3e4347 dark, #dadee2 light): all 1px structure and input borders.
- **Glass Card** (rgba(234, 237, 240, 0.07) dark, rgba(255, 255, 255, 0.72) light): card and panel fills, priced on the veil ladder.
- **Rail Glass** (rgba(62, 67, 71, 0.88)): popovers and menus.
- **Status**: alarm #f87171, grow #4ade80, hold #fcd34d in dark; #dc2626, #15803d, #f59e0b in light. Status is always a word beside the color, never color alone.

### Named Rules
**The Mark-as-Boundary Rule.** Second-pack color exists only inside the five product marks. Sections, panels, buttons and rules stay strictly ground-palette; the pack-boundary gate reads the built export to enforce it.
**The One Ground Rule.** The page has one background. Bands are separated by hairlines and washes, never by alternating surface colors.
**The Spectrum Tail Rule.** The last words of a heading, never the whole heading, run in spectrum ink: a foreground-to-beam-to-teal gradient that sweeps once per ambient cycle.

## Typography

**Display Font:** Inter (shipped inside the design system stylesheet, with an Inter Fallback metric clone of Arial)
**Body Font:** Inter (the same family; the site loads no font of its own)
**Label Font:** the system mono stack, uppercase with widest tracking

**Character:** one quiet sans across every role, differentiated by weight, size and case rather than by family. Mono is a measuring instrument: eyebrows, meta, dates and figure labels, always small and always uppercase.

### Hierarchy
- **Display** (600, clamp(2.5rem, 6.4vw, 4.25rem), 1.02 line height, -0.035em tracking, max 16ch, balanced): the hero line only, via the site-display class; tightens to 0.98 line height at 64rem and wider.
- **Heading** (600, the design system scale up to 2.25rem): section headings, with their semantic tail in spectrum ink.
- **Title** (600, 1rem): card titles, nav lockups, pillar names in brand ink.
- **Body** (400, 1rem): reading text at the 42rem measure; descriptions in muted ink.
- **Label** (mono, 0.625rem, 0.1em tracking, uppercase): eyebrows, meta rows, figure legends. Dates read like instrument readouts, not prose.

### Named Rules
**The Only Inter Rule.** Inter ships once, inside the design system stylesheet. No page, script or package may load another font, and no site CSS may redeclare the font stack.

## Layout

A single 72rem page column (the design system container-page token) holds every band; reading text holds to the 42rem measure. Sections breathe at 4rem of vertical padding, widening to 6rem at small breakpoints and up. The landing is eight bands long and no two bands share a shape: hero split, logo ticker, live pipeline panel with its station roster, product ledger rows, framed architecture schematic, three differently-shaped pillar washes, media band, closing call. The pipeline's figure and roster share one row from 64rem and up; below it the figure stands above the list, because a drawing that names six stages cannot shrink to a phone's column and still be read.

The hero is a split grid: copy in the left column, the FamilyConstellation orbit in the right, converging at 64rem and stacking below it, where the orbit degrades to a hairline-divided list. Fixed chrome sits above: a sticky navbar that is transparent over the ground and turns to glass (background at veil-glass transparency plus a 12px blur) once the page scrolls; the footer bottoms out because the body is a flex column.

Responsive behavior is mostly owned by the design system's blocks; the site stylesheet touches only five breakpoints (30rem, 40rem, 48rem, 63.9375rem for the constellation teardown, 64rem). The design system's scale is 40rem, 48rem, 64rem, 90rem; the 30rem step is a sanctioned exception for CTA columns.

## Elevation & Depth

Depth is layered glass on one continuous ground, and light behaves like light. Shadows are never gray blobs: each is composed from four token colors, a top rim highlight, an inner ring, a tight contact shadow and a wide ambient shade, in three strengths (shadow-xs, shadow-sm, shadow-md). The site itself authors none of them; shadows belong to design system components (navbar, popovers, cards). Site depth is hairlines and washes: 1px border rules, 2px primary band tops, accent panels, and translucency priced on the veil ladder (5% faint to 90% cover, glass at 72%).

### Shadow Vocabulary (design system components only)
- **shadow-xs** (rim + 1px contact): resting cards and inputs.
- **shadow-sm** (rim + inner ring + contact + 4px 16px ambient shade): raised panels, the glass navbar on scroll.
- **shadow-md** (rim + inner ring + 2px contact + 12px 32px ambient shade): popovers, dialogs, menus.

### Named Rules
**The Light-Behavior Rule.** Every shadow is rim, ring, contact and shade from the elevation tokens. A raw box-shadow value is a defect, and the site stylesheet declares none at all.
**The Veil Price Rule.** Every translucent surface quotes the veil ladder by name (faint, whisper, soft, light, quiet, glass, scrim, cover); arbitrary alpha values are not spent.

## Shapes

The sky pack is the tightest pack in the family: 0.5rem base radius, with derived steps at 0.3rem, 0.7rem and 1.3rem. Site classes spend a fraction of the base, `calc(var(--radius) * 0.8)`, so a site-drawn corner always matches the design system component beside it. Corners are spent by calculation, never declared as new pixel values. Product marks are fully rounded discs precisely so a pack boundary can re-point radius without moving anything.

Form language is drawn, not boxed: figures are SVG schematics stroked in semantic tokens and the faint veil rungs, dashed orbit lines, solid hairline dividers, and one pulsing ring. Panels frame figures like instruments: a header row, a state word, and a captioned body inside a hairline border. The favicon's three rays converge into one ink; the Prism mark fans the same grid outward, and the two are mirror marks.

## Components

### Buttons
- **Shape:** the site corner (0.4rem, the spent fraction of the 0.5rem pack radius).
- **Primary:** beam background, deep navy text, sized large in the hero, one per section.
- **Outline:** hairline border, ink text, transparent fill; the quiet twin of the primary.
- **Hover / Focus:** token-priced state changes; hover washes are deliberately instant (no site transitions), focus rings take the ring token.

### Cards / Containers
- **Corner Style:** the 0.5rem family.
- **Background:** glass card on the veil ladder; pillar panels take the wash color instead.
- **Shadow Strategy:** none authored by the site; design system components carry the shadow vocabulary.
- **Border:** 1px hairline; pillar band shapes add a 2px primary rule on top and the framed shape adds a full hairline border.
- **Internal Padding:** the design system spacing scale; pillar bands cap at 64ch.

### Navigation
The navbar is sticky and transparent over the ground, turning to glass on scroll. Left: the NaniSoft lockup and its mark. Center: About and Blog, with the current page marked. Right: the family menu (five sites, each drawn with its own pack-colored mark, opened only on demand), a search dialog over a static index, and the mode toggle. There is no pack chooser: repainting the ground is not a reader control.

### The Family Constellation (signature)
A 400-by-400 SVG orbit: dashed outer ring, inner ring, cross axes, four satellite dots, and a central ring pulsing once per ambient cycle around the NaniSoft mark. Satellites are anchors with mark and role; below 64rem the whole figure becomes a stacked hairline list. Fully legible with animation stopped.

### The Editorial Factory (signature)
A schematic factory floor: gantry, six stations, and one packet riding the ambient-travel cycle across the line. Drawn in token strokes and veil rungs, aria-hidden, and true with every animation stopped.

### The Station Roster (signature)
The pipeline band's six stages, hung as a single column beside the live figure from 64rem up. Each stage hangs from its own hairline with one full-primary dot seated on the rule, the same ink the factory's conveyor stops are drawn in, so the roster and the figure read as two halves of one sentence: the dots are the stops, the travelling marker is the packet between them. No ordinal is drawn; the `<ol>` already knows the order.

### The Products Ledger (signature)
Three hairline ledger rows, one per product, each opening and closing on a rule. A row is the link, and its three columns are the three facts a reader decides from: the product's mark and the name it carries, the sentence about the product at the body step, and a mono readout naming the pack the row stands in and the domain the product lives at. The hover wash is instant and rounds at the site corner, so a pointer moving down the band can see the row it is on.

### The Framed Schematic
The architecture drawing, shown in the instrument panel the pipeline figure uses at its neutral state, capped at the same 46rem so the page's two framed drawings share one width. The bar names the figure a drawing; the footnote states the stroke convention the dashed edges obey.

### Blog Index
Site-owned by decision (the family's four blog lists are four deliberate designs): a 72rem catalog column, a mono uppercase eyebrow, a clamped display title, and a simple list where titles read in brand ink, descriptions in muted ink, and meta in mono.

### Named Rules
**The One View System Rule.** Prism is the view system for every component: pages compose design system Components, Blocks and Pages, and the pinned stylesheet styles them. The one site stylesheet (app/globals.css) draws only site-owned figures and layout, under site-* class names; it never restyles a design system component, and it never declares a color, radius, transition or font of its own (its single sanctioned variable is an alias to a design system token).

## Do's and Don'ts

### Do:
- **Do** keep every section strictly ground-palette and put all second-pack color inside product marks.
- **Do** carry the spectrum tail on section headings: the last semantic words only.
- **Do** spend corners as fractions of the 0.5rem pack radius (`calc(var(--radius) * 0.8)` in site classes).
- **Do** draw figures in semantic tokens and veil rungs so they survive both modes and stopped animation.
- **Do** state facts in the present tense of design: the page says what the system is, and dates its facts.
- **Do** wrap only scrolled-to bands in Reveal; the hero, the ticker and the closing call stay still.

### Don't:
- **Don't** introduce a second background surface; the ground is one continuous layer.
- **Don't** author a raw shadow, transition, radius value or color in site CSS; the design system owns all of them.
- **Don't** use an em dash or en dash in any string a reader sees, and no decorative section numbers.
- **Don't** add a second logo near the navbar; the lockup is already there.
- **Don't** let a figure imply liveliness it does not have; a drawn thing says what it is.
- **Don't** ship a raster image in the page; the site's imagery is drawn.
