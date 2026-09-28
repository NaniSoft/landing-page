# NaniSoft

> Software that builds software.

Part of the [NaniSoft](https://www.nanisoft.com) web platform — five sites, one design language ([Prism](https://prism.nanisoft.com)).

- **Live**: https://www.nanisoft.com, with the apex https://nanisoft.com — both Cloudflare Custom Domains on the `nanisoft-www` Worker, which serves this static export
- **Pack**: `sky` is the ground, on the document element, and it does not change. Four other packs are on marks: the header's product switcher carries `lavender`, `mint`, `blush` and `peach`, and the products section carries the three its rows name. That is the whole five-pack layering, and `scripts/pack-map.json` is the map and `scripts/check-pack-map.mjs` is the gate, checked in both light and dark mode
- **Stack**: Next 16 static export · fumadocs-mdx · pnpm · TypeScript strict · oxlint · Vitest (jsdom + Testing Library) · Cloudflare Workers
- **Chrome and every section**: [@nanisoft/prism-ui](https://www.npmjs.com/package/@nanisoft/prism-ui) 0.6.0, pinned exactly. There is no local component and no client runtime: every page is a server component, so the site ships no JavaScript of its own

## What ships

- **Landing** (`/`) — "Software that builds software." The thesis as the page's `h1` with two real links under it, then the factory strip, then five numbered sections: **the pipeline** (six stages, issue to release) · **products** (Nexus, Atlas, AlphaLens, each row a mark in that product's own pack and a whole-row link to its live site) · **architecture** (the schematic: Prism feeds Nexus, Nexus builds Atlas and AlphaLens, both point at what the factory builds next) · **why Nanisoft** (three pillars over a five-card grid) · **philosophy** (the manifesto, set quiet and narrow). It closes on a band back to the factory.
- **About** (`/about`) — "The company that builds the builder": Nexus as the Agent Factory, the proof that the rest of nanisoft.com is output rather than case study, the say-what-is-true rule, and a three-row fact list.
- **Blog** (`/blog`) — the four company posts over `content/blog/`, folder-per-post with a required ISO `date`, optional `tags` and `draft` (drafts never export). The index is this site's own composition and this site's own CSS, because the four blog lists in this family are four deliberate designs and the design system deliberately ships none. Each post is the design system's blog post Page, which owns the byline, the date in both its display and its machine form, and the trail to the neighbouring posts.
- **Not found** — the design system's not-found Page: the code as the page's heading, the sentence under it, and one way out.

There is no docs section here, by design. `lib/source.ts` declares only the blog collection; the docs corpus belongs to Prism, Nexus, Atlas and AlphaLens.

## How it is put together

```
app/layout.tsx        the document: two theme attributes, the boot script, the chrome
app/page.tsx          the landing, composed from catalogue items and nothing else
app/about/page.tsx    a page header, the prose at the measure, a fact list
app/not-found.tsx     the not-found Page
app/blog/…            the blog index (site's own) and the blog post (the catalogue's)
app/globals.css       130 lines: the blog index, three landing elements, two utility classes
lib/site.json         the ground, the default mode, the product directory
lib/site.ts           those facts, typed by the design system's pack vocabulary
lib/landing-content.ts every word of the landing, as data
scripts/              the four gates, the pack map, the parity expectations
```

Three things are worth knowing before changing anything here.

**A consumer cannot write a design-system utility class.** The emitted stylesheet is
compiled from the design system's own source, so a utility exists in it only if a
Prism component uses it. `mb-12` is safe; a utility Prism happens not to use would do
nothing and say nothing. Anything this site needs for itself goes in
`app/globals.css` as a site class.

**The site stylesheet owns almost nothing, and that is a rule.** It must not declare
the page ground, the body ink, a focus outline or a hairline colour on a selector with
no class in it, and it must not carry a `:focus` rule at all: the design system's base
layer is layered and this sheet is not, so a bare-element rule here wins the cascade
whatever the cascade then does with it. `scripts/check-stylesheet-ownership.mjs` is
why that is enforced rather than remembered.

**A pack boundary is not only colour.** It repoints the pack's corner radius beneath
it, and it wears the mode of the nearest ancestor carrying `.dark`, which is why a
server-rendered boundary has no mode class of its own. So a boundary belongs on a
fully rounded mark and nowhere else, and a page that put a second pack on a section
would be encoding its section index in its corner radius. All five light grounds are
the same white and the five dark grounds span about three steps of near-neutral, so a
section ground buys almost nothing and costs a shape change. The map says where two
regions may carry a second pack; the gate says the count and the identifiers, in both
modes, and a third region fails the build.

## Develop

```bash
pnpm install
pnpm dev          # dev server
pnpm build        # static export to out/
pnpm lint         # oxlint
pnpm typecheck    # next typegen && tsc --noEmit
pnpm test         # vitest
pnpm check        # the four gates; run after pnpm build
```

The four gates, and what each is for:

| gate | what it holds |
| --- | --- |
| `check:antd` | No trace of the retired line: no dependency, no import, no generated stylesheet, no build step, no living instruction. The lockfile is read as a dependency graph, and both design-system pins must be exact. |
| `check:stylesheet` | The site's own sheet competes with nothing the design system declares, and no `color-mix()` takes a `var()` as an operand. |
| `check:links` | Every internal destination and every in-page fragment resolves to something this site emits. |
| `check:pack-map` | The pack map, from the built export, in both light and dark mode: the region set, the identifiers, the boundary count, a boundary on a mark and nowhere else, and each boundary's own pack resolved against the published token contract. |

The content-parity comparison is a fifth tool and is not in `pnpm check`, because its
baseline lives outside the repository and is destroyed at the close of the sweep:

```bash
node scripts/check-content-parity.mjs --record <file>            # cut a baseline
node scripts/check-content-parity.mjs --baseline <file> \
  --expect scripts/content-parity-expectations.json              # compare
```

It reads the built export through a document parser, so it sees the copy in
`lib/landing-content.ts` and in JSX as well as the copy in `content/`, which a digest
of the content tree would have been blind to. Every difference must be declared in
`scripts/content-parity-expectations.json` with the reason it is a rendering change
and not a copy change, and a declaration that matches nothing is itself a finding.

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
(this repository's own scope, stack and commands), `CONSISTENCY.md` (the
cross-repository law and the gate that holds each clause) and this file.
