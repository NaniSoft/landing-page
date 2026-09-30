// The www landing's copy, as data (nexus's pattern): the page that renders it
// stays composition, and every claim lives here where it can be read, and audited,
// as prose.
//
// Honesty law (inherited from the product sites): the factory is in development,
// described in the present tense of design, never shipped features. Copy traces to
// the agent-factory spec and the platform as it exists today, five sites live, one
// design language.
//
// Two house rules this file now holds, both checkable by reading it:
//
//   - **No em dash and no en dash in any string a reader sees.** They are the
//     punctuation an LLM reaches for when it wants a sentence to sound considered,
//     and on a page with fourteen other strings they read as a single tic rather
//     than as emphasis. Every separator here is a comma, a colon or a full stop.
//   - **No section numbers.** Five bands used to print `01` through `05` above
//     their own headings. The ordinals were decorative, they collided with the
//     pagination convention every site uses for something else, and they were
//     load-bearing in the worst way: `scripts/pack-regions.mjs` named a pack
//     region by finding two digits in a band, so a pack boundary's region was a
//     fact about typography. Regions are now named from the structure that carries
//     them, and no string on this page exists to be found.

import type { DiagramNode, DiagramRelation } from '@nanisoft/prism-ui/components/diagram';

export const HERO = {
  title: 'Software that builds software.',
  lede: 'One factory built every product we ship. This is how.',
  primaryCta: { label: 'Meet Nexus', href: 'https://nexus.nanisoft.com' },
  secondaryCta: { label: 'Walk the pipeline', href: '#pipeline' },
} as const;

/**
 * The five members of the product set, in the order a reader meets them.
 *
 * The hero's visual is this set, drawn at the largest size a mark is drawn at, one mark
 * per member and each in its own pack's hue. That is the whole colour argument on this
 * page, and it is worth saying plainly why it is the only one available: the
 * pack-boundary gate forbids a `data-pack` boundary on anything except a `ProductMark`,
 * so a mark is the one element on this site that can wear a colour other than the
 * ground's. Five marks are therefore the most colour this page can honestly have, and a
 * page that wanted more would have to break the design system's law to get it.
 *
 * **Every role is one line.** The strip is a scannable edge of the page, five marks down
 * one side, and a role that wraps makes the column taller than the thesis beside it and
 * puts the two columns out of balance. So these are names, not descriptions: the
 * products band below carries the sentence about each one, and this carries the set.
 *
 * The set is read from `lib/site.json` rather than restated here. Each entry is an id
 * and a role; the name, the pack and the destination all come from the directory, so a
 * mark in the hero and a mark in the header switcher cannot disagree about which product
 * they are or what colour they are.
 *
 * `www` is in the set and wears `sky`, which is the page's own ground. A company site's
 * mark drawn in the colour the page is painted in is the honest mark for the page that is
 * not a product, and it is the same reason the header's brand lockup carries the ground
 * rather than a second pack.
 */
export const IDENTITY = {
  entries: [
    { id: 'www', role: 'Five sites, one language.' },
    { id: 'nexus', role: 'The Agent Factory.' },
    { id: 'atlas', role: 'Digital twins of real systems.' },
    { id: 'alphalens', role: 'Market research, quantified.' },
    { id: 'prism', role: 'The design language all five wear.' },
  ],
} as const;

export const TICKER = [
  'issue #142 → planning',
  'pr #87 → tests passing',
  'board → 3 awaiting review',
  'build 12:04 → deployed',
] as const;

export const PIPELINE = {
  label: 'The pipeline: issue to release',
  caption: 'One packet on the line is one issue becoming a reviewed change.',
  stages: [
    { name: 'Idea', caption: 'A GitHub issue arrives. That is the whole intake form.' },
    { name: 'Planning', caption: 'The orchestrator drafts a task graph and opens a worker container.' },
    { name: 'Architecture', caption: 'Interfaces and data contracts are written before any code.' },
    { name: 'Implementation', caption: 'Agents build inside the container, and the board shows every move.' },
    { name: 'Testing', caption: 'Unit, integration and end-to-end suites run before a human looks.' },
    { name: 'Deployment', caption: 'You approve on the board. The merge and the release follow.' },
  ],
} as const;

/**
 * The pipeline as a running figure, which is the shape the pipeline band draws.
 *
 * Six stages on one rail, each a lane, each edge carrying, so the drawing grows a
 * marker that travels from an idea to a deployment. The names are the six stage
 * names this section already lists and the captions are its own, so the figure
 * introduces no claim the list does not already make.
 *
 * A factory is a thing that runs, so the page shows it running, and the figure is
 * beside the six stages rather than above them: the band is about one issue making
 * the walk, and a picture of that walk belongs with the list of what the walk is.
 * It says the same thing with every animation stopped, which is the line Prism's
 * second law of motion draws.
 */
export const PIPELINE_FIGURE = {
  nodes: PIPELINE.stages.map((stage, index) => ({
    id: stage.name.toLowerCase(),
    name: stage.name.toLowerCase(),
    x: index / (PIPELINE.stages.length - 1),
    y: 0.5,
    lane: index,
    emphasis: stage.name === 'Implementation',
  })),
  relations: PIPELINE.stages.slice(0, -1).map((stage, index) => ({
    from: stage.name.toLowerCase(),
    to: PIPELINE.stages[index + 1]!.name.toLowerCase(),
    carries: true,
  })),
  aria:
    'The factory pipeline as six stages on one rail: idea, planning, architecture, implementation, testing and deployment, with a marker travelling from one to the next.',
  panel: {
    label: 'the factory floor, running',
    mode: 'live',
    footnote: 'The six stages one issue passes through. The marker is that issue making the walk.',
  },
} as const;

export const PRODUCTS = {
  label: 'Products: all built by Nexus',
  rows: [
    {
      id: 'nexus',
      name: 'Nexus',
      tagline: 'The Agent Factory. Autonomous software creation, supervised by you.',
      url: 'https://nexus.nanisoft.com',
    },
    {
      id: 'atlas',
      name: 'Atlas',
      tagline: 'The Digital Twin Platform. Living models of real systems, built by the factory.',
      url: 'https://atlas.nanisoft.com',
    },
    {
      id: 'alphalens',
      name: 'AlphaLens',
      tagline: 'Market research, quantified. The factory’s newest build.',
      url: 'https://alphalens.nanisoft.com',
    },
  ],
} as const;

/**
 * The five things the architecture schematic draws, and the relations between them.
 *
 * The Component that draws a schematic takes a name per thing and a required word per
 * relation, so the roles the old drawing put under every name became the edge words
 * and the thing-names are unchanged. The whole sentence is still carried in
 * `ARCHITECTURE.aria`, which is the only thing a screen reader reads from the drawing.
 *
 * Positions are the old drawing's own coordinates. The Component fits them into its
 * canvas, so the shape a reader sees is the shape that was drawn by hand.
 *
 * The two edges into Future Products are marked indirect, which is how the drawing has
 * always distinguished "this holds, but not by this route" from the four edges that
 * carry the same claim.
 */
const ARCHITECTURE_NODES: DiagramNode[] = [
  { id: 'prism', name: 'Prism', x: 380, y: 62 },
  { id: 'nexus', name: 'Nexus', x: 380, y: 196 },
  { id: 'atlas', name: 'Atlas', x: 205, y: 330 },
  { id: 'alphalens', name: 'AlphaLens', x: 555, y: 330 },
  { id: 'future', name: 'Future Products', x: 380, y: 442 },
];

const ARCHITECTURE_RELATIONS: DiagramRelation[] = [
  { from: 'prism', to: 'nexus', label: 'feeds' },
  { from: 'nexus', to: 'atlas', label: 'builds' },
  { from: 'nexus', to: 'alphalens', label: 'builds' },
  { from: 'atlas', to: 'future', label: 'points at', indirect: true },
  { from: 'alphalens', to: 'future', label: 'points at', indirect: true },
];

export const ARCHITECTURE = {
  label: 'Architecture: one engine, everything on it',
  caption:
    'Prism is the language they all wear. Nexus is the engine that builds them. Peach is reserved for what the factory builds next.',
  aria: 'NaniSoft architecture: Prism, the shared language, feeds Nexus; Nexus builds Atlas and AlphaLens; both point at future products.',
  nodes: ARCHITECTURE_NODES,
  relations: ARCHITECTURE_RELATIONS,
} as const;

/**
 * Why Nanisoft, as three points.
 *
 * This used to be eight: three pillars over a five-card grid, every one of them a bold
 * noun followed by a sentence, on two consecutive bands. Eight near-identical objects
 * is not an argument, it is a list that runs long, and the second five restated the
 * first three at a lower altitude. Three is the number of claims this section actually
 * makes, and the five-card grid is gone rather than moved: what it carried that the
 * pillars do not is already on this page, as the pipeline, the schematic and the
 * products.
 */
export const WHY = {
  label: 'Why Nanisoft',
  pillars: [
    {
      name: 'Autonomy',
      line: 'The factory runs the repeatable ninety percent, scaffolding, tests and merges, and asks only where judgment is required.',
    },
    {
      name: 'Intelligence',
      line: 'Planning happens before code. Architecture and task graphs are written, reviewed, then executed.',
    },
    {
      name: 'Scale',
      line: 'One factory, many projects. Round-robin orchestration keeps every repository moving.',
    },
  ],
} as const;

export const PHILOSOPHY = {
  label: 'Philosophy',
  manifesto:
    'Every product NaniSoft ships is built by Nexus. Atlas, AlphaLens and Prism are not case studies, they are output. If the factory cannot build it, we do not ship it.',
} as const;

export const FINAL_CTA = {
  title: 'Start at the factory.',
  primaryCta: { label: 'Meet Nexus', href: 'https://nexus.nanisoft.com' },
  secondaryCta: { label: 'Tour the design system', href: 'https://prism.nanisoft.com' },
} as const;

/**
 * The strip of factory state between the hero and the first numbered section.
 *
 * A name for the list rather than a heading above it: the words are the content and
 * a heading about a heading is noise. "the factory floor" is this repository's own
 * name for the band, from the landing's own header comment before the migration.
 */
export const TICKER_LABEL = 'the factory floor';
