// The www landing's copy, as data (nexus's pattern): the page that renders it
// stays composition, and every claim lives here where it can be read, and audited,
// as prose.
//
// Honesty law (inherited from the product sites): the factory is in development,
// described in the present tense of design, never shipped features. Copy traces to
// the agent-factory spec and the platform as it exists today, five sites live, one
// design language.
//
// Nothing in this file is edited by the migration onto the new design system. Not
// one word of it moves: the sections are composed from catalogue items in a
// different order of markup, and this file is the record that proves the words are
// the same words. Where a string has no slot on the item that now draws it, the
// omission is recorded in `scripts/content-parity-expectations.json` with its
// reason, rather than papered over with a rewrite of the sentence.

import type { DiagramNode, DiagramRelation } from '@nanisoft/prism-ui/components/diagram';

export const HERO = {
  eyebrow: 'Nanisoft',
  title: 'Software that builds software.',
  lede: 'One factory built every product we ship. This is how.',
  primaryCta: { label: 'Meet Nexus', href: 'https://nexus.nanisoft.com' },
  secondaryCta: { label: 'Walk the pipeline', href: '#pipeline' },
} as const;

export const TICKER = [
  'issue #142 → planning',
  'pr #87 → tests passing',
  'board → 3 awaiting review',
  'build 12:04 → deployed',
] as const;

export const PIPELINE = {
  index: '01',
  label: 'The pipeline — issue to release',
  caption: 'One packet on the line is one issue becoming a reviewed change.',
  stages: [
    { name: 'Idea', caption: 'A GitHub issue arrives. That is the whole intake form.' },
    { name: 'Planning', caption: 'The orchestrator drafts a task graph and opens a worker container.' },
    { name: 'Architecture', caption: 'Interfaces and data contracts are written before any code.' },
    { name: 'Implementation', caption: 'Agents build inside the container; the board shows every move.' },
    { name: 'Testing', caption: 'Unit, integration, and end-to-end suites run before a human looks.' },
    { name: 'Deployment', caption: 'You approve on the board. The merge and release follow.' },
  ],
} as const;

export const PRODUCTS = {
  index: '02',
  label: 'Products — all built by Nexus',
  rows: [
    {
      id: 'nexus',
      name: 'Nexus',
      tagline: 'The Agent Factory',
      url: 'https://nexus.nanisoft.com',
      line: 'Autonomous software creation, supervised by you.',
    },
    {
      id: 'atlas',
      name: 'Atlas',
      tagline: 'The Digital Twin Platform',
      url: 'https://atlas.nanisoft.com',
      line: 'Living models of real systems — built by the factory.',
    },
    {
      id: 'alphalens',
      name: 'AlphaLens',
      tagline: 'Market research, quantified',
      url: 'https://alphalens.nanisoft.com',
      line: 'Quantitative trading research for the Indian market — the factory’s newest build.',
    },
  ],
} as const;

/**
 * The five things the architecture schematic draws, and the relations between them.
 *
 * The old drawing put a role under every name (the shared language, the engine,
 * digital twins, market research, built next) and no word on any edge. The Component
 * that draws a schematic takes a name per thing and a required word per relation,
 * so the roles became the edge words and the thing-names are unchanged. The whole
 * sentence is still carried in `ARCHITECTURE.aria`, which is the only thing a screen
 * reader reads from the drawing, and it says the same thing the five subtitles did.
 *
 * Positions are the old drawing's own coordinates. The Component fits them into its
 * canvas, so the shape a reader sees is the shape that was drawn by hand.
 *
 * The two edges into Future Products are marked indirect, which is how the drawing
 * has always distinguished "this holds, but not by this route" from the four edges
 * that carry the same claim.
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
  index: '03',
  label: 'Architecture — one engine, everything on it',
  caption:
    'Prism is the language they all wear. Nexus is the engine that builds them. Peach is reserved for what the factory builds next.',
  aria: 'NaniSoft architecture: Prism, the shared language, feeds Nexus; Nexus builds Atlas and AlphaLens; both point at future products.',
  nodes: ARCHITECTURE_NODES,
  relations: ARCHITECTURE_RELATIONS,
} as const;

export const WHY = {
  index: '04',
  label: 'Why Nanisoft',
  pillars: [
    {
      name: 'Autonomy',
      line: 'The factory runs the repeatable ninety percent — scaffolding, tests, merges — and asks only when judgment is required.',
    },
    {
      name: 'Intelligence',
      line: 'Planning happens before code: architecture and task graphs are written, reviewed, then executed.',
    },
    {
      name: 'Scale',
      line: 'One factory, many projects. Round-robin orchestration keeps every repository moving.',
    },
  ],
  features: [
    {
      name: 'Multi-Agent Orchestration',
      line: 'Specialist agents plan, code, review, and verify — coordinated by one orchestration core.',
    },
    {
      name: 'Autonomous Development',
      line: 'Every issue runs in its own container with a full toolchain and a clean git state.',
    },
    {
      name: 'Continuous Validation',
      line: 'Nothing merges unproven. Suites gate every change, on every attempt.',
    },
    {
      name: 'Adaptive Learning',
      line: 'Rejection reasons come back as instructions. Each feedback round shapes the next attempt.',
    },
    {
      name: 'Assembly Pipelines',
      line: 'Approved work auto-merges and ships. Review happens on the board, not in a bottleneck.',
    },
  ],
} as const;

export const PHILOSOPHY = {
  index: '05',
  label: 'Philosophy',
  manifesto:
    'Every product NaniSoft ships is built by Nexus. Atlas, AlphaLens, and Prism are not case studies — they are output. If the factory cannot build it, we do not ship it.',
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
