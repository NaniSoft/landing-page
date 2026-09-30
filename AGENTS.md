# AGENTS.md — NaniSoft

## Project

**www.nanisoft.com** — the NaniSoft company site: landing + about + blog (company level; no docs section). The site wears `sky` as its ground and puts the packs products own on marks; Prism owns none, so its mark is drawn as the spectrum.

Part of the five-site Nanisoft web platform (www + nexus + atlas + alphalens + prism), one design language: Prism.

## How to build here

- Items come from their own subpath, never the root barrel: `@nanisoft/prism-ui/blocks/<item>`, `/components/<item>`, `/pages/<page>`, and `/theming` for the pack and mode vocabulary.
- `@nanisoft/prism-ui/styles.css` is imported once, in the root layout, before this site's own sheet. It carries every token, every utility and every base rule.
- A Block takes data and content as props.
- A consumer cannot write a Prism utility class: the consumer does not run Tailwind, so a utility exists in the emitted sheet only if a Prism component already uses it. Anything this site needs for itself goes in `app/globals.css` as a site class.
- Two attributes on `<html>`, from `lib/site.ts`: `data-pack` for the ground and `class="dark"` for the mode. A blocking `PrismThemeScript` in `<head>` applies a stored choice before first paint and is the only writer of the theme's origin.
- A pack boundary is an attribute on an element: it repoints that pack's colour **and** its corner radius beneath it, and it wears the mode of the nearest ancestor carrying `.dark`. `scripts/pack-map.json` is the map, `scripts/pack-regions.mjs` names a region from the DOM, and the gate checks the map from the built export in both modes.

## What is enforced, and where the words live

The laws are not in this file. They are the failure messages of the gates in
`@nanisoft/prism-ui/gates`, run by `pnpm check`, so a fix to one reaches this site
in one release and cannot be declined here. The four repositories that run them
share the programs and hold none of the wording.

This site's own halves are in `prism-gates.json` and the two files above it. When a
build fails, the law's text is in the failing message: read that rather than
looking for a rule here.

## Wayfinding

This file is this repository's own instructions. `README.md` is what the site is
and how it is built and deployed. The cross-repository laws are not here and not in
a document beside this one: they are the failure messages of the gates in
`@nanisoft/prism-ui/gates`. `prism-gates.json` is this
site's half of that contract and holds only what this site knows: its sheets, its
pack map, its coverage floors. `scripts/pack-map.json` says where a second pack may
appear and why. `scripts/pack-regions.mjs` names a region from the DOM.

## Stack

- Next 16 static export (`output: 'export'`) at the repo root — flat single-app, no workspace.
- pnpm + TypeScript strict + oxlint + Vitest (jsdom + Testing Library).
- Deploys: push to main → GitHub Actions runs the checks and then the deploy (`wrangler deploy`) with the org-level Cloudflare secrets. The deploy is a job that needs the checks, so a push that fails cannot deploy.

## Commands

- `pnpm dev` — dev server
- `pnpm build` — static export to `out/`
- `pnpm lint` / `pnpm typecheck` / `pnpm test`
- `pnpm check` — the consumer gate kit (see README); run it after `pnpm build`
- `pnpm deploy` — build + wrangler deploy (local wrangler auth)

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
