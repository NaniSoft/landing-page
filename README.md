# NaniSoft

> Software that builds software.

Part of the [NaniSoft](https://www.nanisoft.com) web platform — five sites, one design language ([Prism](https://prism.nanisoft.com)).

- **Live**: https://www.nanisoft.com, with the apex https://nanisoft.com — both Cloudflare Custom Domains on the `nanisoft-www` Worker, which serves this static export
- **Pack**: blue, mode-switchable, beam-dark by default; the landing layers all five packs as signal — pack inks on the product ledger and the architecture graph, never full-bleed pack grounds
- **Stack**: Next 16 static export · fumadocs-mdx · pnpm · TypeScript strict · oxlint · Vitest (jsdom + Testing Library) · Cloudflare Workers
- **Chrome**: [@nanisoft/prism-ui](https://www.npmjs.com/package/@nanisoft/prism-ui) (SiteHeader / SiteFooter) — npm dependency, never copied into this repo

## What ships

- **Landing** (`/`) — "Software that builds software." The page opens as the single beam: a full-viewport monochrome hero with the `AgentNetworkCanvas` agent network as atmosphere behind the display type, two calls to action, and the factory ticker beneath it. Five hairline-instrument sections follow, numbered 01–05: **the pipeline** (six stages from Idea to Deployment as one packet on a conveyor rail) · **products** (a three-row ledger — Nexus, Atlas, AlphaLens — each row carrying its own pack ink and live subdomain) · **architecture** (`FiveNodeGraph`: Prism feeds Nexus, Nexus builds Atlas and AlphaLens, both point at Future Products, which is drawn dashed and un-filled) · **why NaniSoft** (three pillars over a five-card grid) · **philosophy** (the manifesto, set quiet and narrow). It closes on a centred band back to the factory.
- **About** (`/about`) — "The company that builds the builder": Nexus as the Agent Factory, the proof the rest of nanisoft.com is output rather than case study, the say-what-is-true rule, and a three-row fact list (platform / products / design). It is a hand-written server component (`app/about/page.tsx`), not a content collection.
- **Blog** (`/blog`) — the four company posts over `content/blog/`, folder-per-post with a required ISO `date`, optional `tags`, and `draft` (drafts never export). The index is reverse-chronological; each post gets chronological prev/next. The posts are the company story, not product quickstarts: what NaniSoft is, how the five sites came to share one design language, how the sites were actually built, and where every product honestly stands.

There is no docs section here, by design. `lib/source.ts` declares only the blog collection — the docs corpus belongs to Prism, Nexus, Atlas, and AlphaLens.

## Develop

```bash
pnpm install
pnpm dev      # bake + dev server
pnpm build    # bake + static export to out/
pnpm test
pnpm lint
```

The landing is a client subtree (`components/landing/Landing.tsx`) because the reveal observer and the network canvas both need the DOM; `app/page.tsx` stays a server component. Every word of landing copy lives in `lib/landing-content.ts` as data, so the rendering file stays plumbing and each claim can be read and audited as prose. `test/smoke.test.tsx` asserts the hero, every pipeline stage, the product links, and the closing CTA. `test/content.test.ts` reads `content/` off disk — fumadocs' `defineCollections` is a compile-time macro, so the loaders cannot run under vitest.

## Deploy

Push to `main` → GitHub Actions runs `pnpm build` + `wrangler deploy` for the `nanisoft-www` Worker, authenticated with the org-level `CLOUDFLARE_API_TOKEN` / `CLOUDFLARE_ACCOUNT_ID` secrets. Pull requests run CI (lint → test → build). `pnpm deploy` is the local lane and needs wrangler auth. The Worker is assets-only — it serves `out/` and runs no Worker script.

## Status

Live at https://www.nanisoft.com and the apex https://nanisoft.com; the `nanisoft-www` Worker claims both as Custom Domains and serves the static export. What is built is what ships: the five-pack landing, About, and the four company blog posts. Nexus, the Agent Factory, is in development and its site describes the design, never a shipped feature — the same ledger the "Where the products stand" post publishes, and it is what the README defers to.

The wayfinder map these sites were built from is retired, and it and its ticket numbers are gone from this repo's documents. The standing references are `CONSISTENCY.md` (the five-repo consistency contract) and `AGENTS.md` (this repo's own scope, stack, and commands).
