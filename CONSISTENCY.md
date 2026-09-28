# CONSISTENCY.md — the cross-repository law, and where each of it is enforced

This file used to be a mirror of one document across five repositories, differing in
one line, holding forty-one clauses of prose. It was replaced because a clause earns
a gate when its violation is silent, and a mirror in four repositories cannot fail:
the two sites that mattered had already drifted into three implementations of one
rule, and one of the three rules was false.

So the law is the failure message of a check, and the checks live where they can run.
There is no version line in this file: **the pinned package is the version**, and
`scripts/check-antd.mjs` fails if either pin is a range.

| The law | Where it is enforced here | What it stops |
| --- | --- | --- |
| No trace of the retired component library | `scripts/check-antd.mjs` | A dependency line, an import, a generated stylesheet, a build step or a living instruction coming back. The lockfile is read as a dependency graph, because deleting a dependency line does not empty a lockfile while another package declares the library. |
| A site stylesheet does not own a surface the design system owns | `scripts/check-stylesheet-ownership.mjs` | An unlayered bare-element declaration of the page ground, the body ink, a focus outline or a hairline colour, and any `:focus` rule at all. The cascade layer is not the cause of those failures; it is the reason they were invisible. |
| Every internal destination resolves, and every fragment names an element that exists | `scripts/check-links.mjs` | A link that renders, looks right, and goes nowhere. Off-site hosts are listed, not resolved. |
| A pack boundary lands on a mark, and exactly two regions of a page may carry a second pack | `scripts/check-pack-map.mjs`, `test/pack-map.test.tsx`, `scripts/pack-map.json` | A third region wearing a pack, a boundary on something whose corner radius the pack moves, and a boundary that resolves the light block on a dark page. Checked in both modes; a screenshot in one mode is not evidence. |
| No client code, so no runtime token read and no CSS-authored hidden state | `test/server-only.test.ts` | The two laws this repository used to carry in prose. Both were laws about client code; the tree has none, and this asserts that it keeps none. |
| Content tests read from disk | `test/content.test.ts` | A content contract that passes because a compile-time macro made a loader importable. fumadocs' `defineCollections` is expanded by the bundler only, so the loaders cannot run under this runner. |
| The landing is composed from the catalogue, with no local component | `test/smoke.test.tsx` | A hand-written section, a local wrapper, or a Block that silently drops the copy it was given. Every stage name and every stage caption is asserted. |
| The rebuild changed the rendering layer and not the content | `scripts/check-content-parity.mjs` with `scripts/content-parity-expectations.json` | A copy edit during a migration. The baseline is cut before the first edit, lives outside the repository, and is destroyed at the close of the sweep; the permanent gate that outlives it is `check-links.mjs`. |
| In-development is described in the present tense of design | A review convention, and stated here because no gate can hold it | A shipped feature described as live. The honesty gate reads prose, so it cannot see a dishonest data source; that is a content decision and this file is the only place it can be written down. |

## What is not here any more, and why

- **A pinned Prism line as a contract.** The pins are in `package.json`, exact, and the
  gate fails a range. That is the whole clause.
- **A client boundary for shared components.** The design system's items are server
  components, so there is nothing to cross and no file that exists only to cross it.
- **A baked variable ruleset and a pre-paint class swap.** The theme is two attributes
  on the document element and a blocking script the design system ships.
- **Parity-locked shell styles.** The shell moved into the design system, so the
  selectors that four repositories copied by hand match nothing and are deleted.
- **A section-level law about pack grounds.** The old rule was that pack colour is a
  signal and never a ground, and it existed because a stylesheet could hold one pack.
  What replaces it is arithmetic: a boundary moves the corner radius, and a section
  ground would make the corner radius an encoding of the section index. That is
  checkable, so it is in `scripts/pack-map.json` and in a gate, and it is no longer
  prose.

## The three sites that copy this repository

`landing-page` is the first site on the new line and the template for the other three.
What it hands them, in the order the checks name it:

1. A pack map is a data file with a declared region set, and a region that grows a
   pack fails the build. A page with no map is a drift.
2. A consumer cannot write a Prism utility class. The emitted stylesheet contains a
   utility only if a Prism component uses it, so a site's own layout goes in the
   site's own sheet, as a class.
3. The published JavaScript is not loadable by Node's ESM resolver, so a site whose
   tests render a catalogue item has to inline the package in its test runner. This is
   recorded as a defect against the design system, not as a practice.
