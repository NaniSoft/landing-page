// The www landing's copy, as data (nexus's pattern): the client Landing tree
// stays rendering plumbing, and every claim lives here where it can be read —
// and audited — as prose.
//
// Honesty law (inherited from the product sites): the factory is in
// development, described in the present tense of design, never shipped
// features. Copy traces to the agent-factory spec and the platform as it
// exists today — five sites live, one design language.

export const HERO = {
  eyebrow: 'Nanisoft',
  title: 'Software that builds software.',
  lede: 'One factory built every product we ship. This is how.',
  primaryCta: { label: 'Meet Nexus', href: 'https://nexus.nanisoft.com' },
  secondaryCta: { label: 'Walk the pipeline', href: '#pipeline' },
  aria: 'An atmospheric network of agent nodes passing packets through one central orchestration hub.',
} as const;

/** The hero→pipeline transition: the factory floor's live strip. */
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
      pack: 'lavender',
      tagline: 'The Agent Factory',
      url: 'https://nexus.nanisoft.com',
      line: 'Autonomous software creation, supervised by you.',
    },
    {
      id: 'atlas',
      name: 'Atlas',
      pack: 'green',
      tagline: 'The Digital Twin Platform',
      url: 'https://atlas.nanisoft.com',
      line: 'Living models of real systems — built by the factory.',
    },
    {
      id: 'alphalens',
      name: 'AlphaLens',
      pack: 'rose',
      tagline: 'Market research, quantified',
      url: 'https://alphalens.nanisoft.com',
      line: 'Quantitative trading research for the Indian market — the factory’s newest build.',
    },
  ],
} as const;

export const ARCHITECTURE = {
  index: '03',
  label: 'Architecture — one engine, everything on it',
  caption:
    'Prism is the language they all wear. Nexus is the engine that builds them. Peach is reserved for what the factory builds next.',
  aria: 'NaniSoft architecture: Prism, the shared language, feeds Nexus; Nexus builds Atlas and AlphaLens; both point at future products.',
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
