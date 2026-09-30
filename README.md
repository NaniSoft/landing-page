# NaniSoft

> Software that builds software.

Part of the [NaniSoft](https://www.nanisoft.com) web platform — five sites, one design language ([Prism](https://prism.nanisoft.com)).

- **Live**: https://www.nanisoft.com, with the apex https://nanisoft.com — both Cloudflare Custom Domains on the `nanisoft-www` Worker, which serves this static export
- **Pack**: `sky` is the ground, on the document element, and it does not change. Two regions of a page carry a pack that is not the ground, and both are rows of marks: the hero's identity column and the products section. Four products own four pastels, this site wears the ground, and Prism owns none because `prism.nanisoft.com` renders with no `data-pack` at all, so its mark is drawn as the full spectrum. The bar's family of five is a menu rather than a row of marks, and a closed menu paints nothing, so the third region this map used to declare is gone: a reader at first paint sees one ground and the second packs reach them when they ask to leave. That is the whole layering, `peach` is the one published pack no product claims, and `scripts/pack-map.json` is the map and the pack-boundary gate in `@nanisoft/prism-ui/gates` is the gate, checked in both light and dark mode
- **Stack**: Next 16 static export · fumadocs-mdx · pnpm · TypeScript strict · oxlint · Vitest (jsdom + Testing Library) · Cloudflare Workers
- **Chrome and every section**: [@nanisoft/prism-ui](https://www.npmjs.com/package/@nanisoft/prism-ui) 0.13.0, pinned exactly. It brings the token package at the exact version it was released against, so this repository declares one first-party dependency and cannot be handed a mismatched pair. This repository authors no client module: every page is a server component, so the only JavaScript this site ships is the bar's own controls, and those are client components inside the pinned package rather than a boundary drawn here

## What ships

- **Landing** (`/`) — "Software that builds software." The thesis as the page's `h1` at a display step the catalogue has no token for, the factory strip, then six sections: **the pipeline** (the factory figure at full width, then the six stages it draws, in three columns) · **products** (Nexus, Atlas, AlphaLens, each row a mark in that product's own pack and a whole-row link to its live site) · **architecture** (the schematic: Prism feeds Nexus, Nexus builds Atlas and AlphaLens, both point at what the factory builds next) · **why Nanisoft** (three pillars as tinted panels on `--accent` with a `--primary` hairline) · **philosophy** (the manifesto, set quiet and narrow) · the closing band. Eight bands, eight layout families, and no two of them the same shape. The hero's right column is the whole product set as five rows of marks, one per member: four in a pastel of its own, this site in the ground, and Prism in the spectrum.
- **About** (`/about`) — "The company that builds the builder": Nexus as the Agent Factory, the proof that the rest of nanisoft.com is output rather than case study, the say-what-is-true rule, and a three-row fact list.
- **Chrome** — `components/site-chrome.tsx` composes the design system's `SiteNavbar` with this site's own two routes as a `nav` and the whole family as a sites menu, and `SiteFooter` with two columns and a legal line. Each page renders that chrome against the route it is serving, so the bar can mark the page a reader is on. Before this the site published `/about` and `/blog` and linked to neither: the only `<nav>` on any page was the switcher, and the footer was a brand lockup with nothing under it. A route nothing links to renders exactly like a route something does, which is why the `links` gate could not see it: that gate asks whether a link a reader follows arrives somewhere, and a page with no link to it asks nothing.
- **Search** (`/api/search`) — seven entries as one JSON array, prerendered because the export has no server: this site's own three pages and the four posts, with the prose read from the MDX beside each route so a post a reader can reach is a post a search can find. The bar's search control fetches it when it opens and filters in the browser.
- **Blog** (`/blog`) — the four company posts over `content/blog/`, folder-per-post with a required ISO `date`, optional `tags` and `draft` (drafts never export). The index is this site's own composition and this site's own CSS, because the four blog lists in this family are four deliberate designs and the design system deliberately ships none. Each post is the design system's blog post Page, which owns the byline, the date in both its display and its machine form, and the trail to the neighbouring posts.
- **Not found** — the design system's not-found Page: the code as the page's heading, the sentence under it, and one way out.

There is no docs section here, by design. `lib/source.ts` declares only the blog collection; the docs corpus belongs to Prism, Nexus, Atlas and AlphaLens.

## How it is put together

```
app/layout.tsx        the document: two theme attributes, the boot script, the page
app/page.tsx          the landing, composed from catalogue items and nothing else
app/about/page.tsx    a page header, the prose at the measure, a fact list
app/not-found.tsx     the not-found Page
app/blog/…            the blog index (site's own) and the blog post (the catalogue's)
app/api/search/route.ts  the search index, prerendered because the export has no server
app/globals.css       476 lines: the blog index, the hero, the pipeline band, the
                      pillar panels, two utility classes
components/site-chrome.tsx  the bar, the main, the footer, and the current page
lib/site.json         the ground, the default mode, the product directory
lib/site.ts           those facts, typed by the design system's pack vocabulary
lib/bar.ts            the bar's own data and every word it prints
lib/navigation.tsx    this site's own destinations, for the footer
lib/landing-content.ts every word of the landing, as data
scripts/              the pack map, the region resolver, the parity expectations
prism-gates.json      this site's half of the cross-repository contract: data only
```

Three things are worth knowing before changing anything here.

**A consumer cannot write a design-system utility class.** The emitted stylesheet is
compiled from the design system's own source, so a utility exists in it only if a
Prism component uses it. `mb-12` is safe; a utility Prism happens not to use would do
nothing and say nothing. Anything this site needs for itself goes in
`app/globals.css` as a site class.

**A site class may not restyle a catalogue item, and this sheet does not.** It
composes three bands the catalogue does not ship, declares the one display step the
catalogue has no token for, and sets the reading measure. Its colour comes entirely
from the page's own ground pack, because a pack boundary may only land on a
`ProductMark`, which is what makes the hero five rows of marks and not five tinted
sections. It declares no corner radius at all, so the page has one.

**The site stylesheet owns almost nothing.** It must not declare the page ground, the
body ink, a focus outline or a hairline colour on a selector with no class in it, and
it must not carry a `:focus` rule at all: the design system's base layer is layered
and this sheet is not, so a bare-element rule here wins the cascade whatever the
cascade then does with it. That sentence is the reason the gate exists rather than the
gate's rule: the rule is the failure message, and when `pnpm check` is red the message
says which of these it was and why it matters.

**A pack boundary is not only colour.** It repoints the pack's corner radius beneath
it, and it wears the mode of the nearest ancestor carrying `.dark`, which is why a
server-rendered boundary has no mode class of its own. All five light grounds are the
same white and the five dark grounds span about three steps of near-neutral, so a
section ground buys almost nothing and costs a shape change. `scripts/pack-map.json`
says which regions may carry a pack other than the ground and why, and
`scripts/pack-regions.mjs` names a region from the structure that carries it rather
than from a section's own printed ordinal, so deleting a heading cannot rename a pack
region. Three regions carry a second pack today, all three are rows of marks, and the
gate checks the count and the identifiers in both modes.

## Develop

```bash
pnpm install
pnpm dev          # dev server
pnpm build        # static export to out/
pnpm lint         # oxlint
pnpm typecheck    # next typegen && tsc --noEmit
pnpm test         # vitest
pnpm check        # the consumer gate kit; run after pnpm build
```

`pnpm check` runs `prism-gates`, the gate kit in `@nanisoft/prism-ui/gates`. The
laws themselves are not in this repository: they are the failure messages of those
gates, so a fix to one reaches this site in one release and cannot be declined here.
The four repositories of the family run the same programs and hold none of the
wording. What this site holds is its own half, in `prism-gates.json` and the two
files it names: its stylesheets, its pack map and the reason each region exists, its
region resolver, and its coverage floors. Every one of those is data.

What the kit enforces here, by name, so a failure message is findable:

| gate | law |
| --- | --- |
| `pin` | The design system is an exact version, and the token package is the component package's dependency rather than this site's. |
| `retired-line` | No trace of the retired component library: no dependency, no import, no generated stylesheet, no build step, no living instruction. The lockfile is read as a graph. |
| `stylesheet-ownership` | The site's own sheet owns no surface the design system owns, and no `color-mix()` takes a `var()` as an operand. |
| `token-read` | Every custom property this sheet reads is declared. A read that resolves to nothing is not a wrong colour; it is no declaration at all. |
| `links` | Every internal destination and every in-page fragment resolves to something this site emits. |
| `pack-boundary` | The pack map, from the built export, in both modes: the region set, the identifiers, a boundary on a mark and nowhere else, and each boundary's own pack resolved against the published token contract. |
| `runtime-token-read` | No token is read at runtime, because a read resolves once and a resolved value does not follow the cascade. |

`hidden-state` is in the kit and not in this site's list: this site authors no hidden
state, so the gate would pass vacuously. It runs there anyway, and the run reports the
rule count it read, so a vacuous pass is distinguishable from a scan of nothing.

The kit's limits, which it prints on every run: it reads text rather than resolving a
cascade, it reads the emitted export rather than a browser, and it cannot see an
attribute a runtime sets after paint.

The content-parity comparison was a one-time instrument for the migration sweep and is
gone with its baseline, which lived outside the repository and was destroyed at the
close of that sweep. What it did is worth recording, because it is the reason
`check:links` is the gate that survived: it read the built export through a document
parser rather than a digest of `content/`, so it saw the copy in
`lib/landing-content.ts` and in JSX, which a content-tree digest would have been blind
to. Every difference had to be declared in `scripts/content-parity-expectations.json`
with the reason it was a rendering change and not a copy change, and a declaration
that matched nothing was itself a finding. The permanent successor asks a question
that is true of every future build rather than of one migration: does a reader who
follows a link on this site arrive somewhere.

## Deploy

Push to `main` → GitHub Actions runs the checks and then, as a job that needs them,
`wrangler deploy` for the `nanisoft-www` Worker, authenticated with the org-level
`CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets. A push that fails its
checks cannot deploy, because the deploy job is never reached. `pnpm deploy` is the
local lane and needs wrangler auth. The Worker is assets-only: it serves `out/` and
runs no Worker script.

## Status

Live at https://www.nanisoft.com and the apex https://nanisoft.com. What is built is
what ships: the landing, About, and the four company blog posts. Nexus, the Agent
Factory, is in development and its site describes the design, never a shipped feature,
which is the ledger the "Where the products stand" post publishes and what this README
defers to.

The wayfinder map these sites were built from is retired, and it and its ticket numbers
are gone from this repository's documents. The standing references are `AGENTS.md`
(this repository's own scope, stack and commands), `prism-gates.json` (this site's
half of the cross-repository contract, which is data only) and this file. The laws
themselves are not a reference in this repository: they are the failure messages of
the gates in `@nanisoft/prism-ui/gates`, which this site installs by pinning that
package exactly.
