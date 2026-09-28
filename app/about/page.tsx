import type { Metadata } from 'next';
import type { ReactElement } from 'react';

import { FactList } from '@nanisoft/prism-ui/components/fact-list';
import { Prose } from '@nanisoft/prism-ui/components/prose';
import { Section } from '@nanisoft/prism-ui/components/section';
import { PageHeader01 } from '@nanisoft/prism-ui/blocks/page-header-01';

export const metadata: Metadata = {
  title: 'About',
  description:
    'NaniSoft builds the factory that builds software — Nexus, the Agent Factory, and the products it ships: Atlas, AlphaLens, and Prism.',
};

/** The three facts, as the definition list a reader scans down its left edge. */
const FACTS = [
  {
    label: 'Platform',
    value:
      'Nexus, the Agent Factory — orchestration, worker containers, and a human feedback loop. In development, described honestly.',
  },
  {
    label: 'Products',
    value: 'Atlas, digital twins; AlphaLens, market research for the Indian market; Prism, the shared design language.',
  },
  {
    label: 'Design',
    value:
      'One language across everything: Spectral Refraction — hairline structure, pastel packs, beam-dark, motion that never bounces.',
  },
] as const;

/**
 * About, composed from the catalogue: a page header, the prose at the reading
 * measure, and a fact list.
 *
 * The words are the words. The three paragraphs, their five inline links, the three
 * facts and the closing paragraph are unchanged; what changed is who owns the
 * measure, the rhythm and the link treatment. `Prose` owns all three, which is why
 * `app/globals.css` no longer has a rule for this page at all.
 *
 * One visible change, and it is the design system's decision rather than this site's:
 * the inline links read in the body ink with an underline instead of in the pack's
 * `primary`, because a pastel `primary` fails 4.5:1 as text and the underline is the
 * affordance that carries the link instead.
 */
export default function AboutPage(): ReactElement {
  return (
    <Section>
      <PageHeader01
        headingLevel="h1"
        breadcrumbs={[{ label: 'nanisoft — about' }]}
        title="The company that builds the builder."
      />

      <Prose>
        <p>
          NaniSoft exists to build an autonomous software-creation engine — and to prove, with every
          product it ships, that the approach works. The engine is{' '}
          <a href="https://nexus.nanisoft.com">Nexus</a>, the Agent Factory: it takes a GitHub issue,
          plans the work, builds it in its own container, tests it, and hands a reviewed change to a
          human for a decision. Approval merges; rejection closes the ticket.
        </p>

        <p>
          The proof is everything else on nanisoft.com. Four sites — this one,{' '}
          <a href="https://nexus.nanisoft.com">Nexus</a>,{' '}
          <a href="https://atlas.nanisoft.com">Atlas</a>, and{' '}
          <a href="https://alphalens.nanisoft.com">AlphaLens</a> — plus{' '}
          <a href="https://prism.nanisoft.com">Prism</a>, the design system they all wear. Every one
          of them was built by coding agents under a person&rsquo;s direction: a human setting the
          standard, agents doing the building, test suites gating every change. That loop is real
          today. Nexus is how it becomes repeatable — an issue in, a reviewed change out, with the
          human deciding rather than typing.
        </p>

        <p>
          We hold the whole family to one rule: say what is true. Product sites separate the live,
          the in-development, and the designed — and never let the categories blur. If the factory
          cannot build it, we do not ship it.
        </p>

        <FactList facts={FACTS.map((fact) => ({ ...fact }))} />

        <p>
          Start at <a href="https://nexus.nanisoft.com">the factory</a>, tour{' '}
          <a href="https://prism.nanisoft.com">the design system</a>, or read{' '}
          <a href="/blog">the company blog</a>.
        </p>
      </Prose>
    </Section>
  );
}
