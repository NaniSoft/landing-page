import type { Metadata } from 'next';
import type { ReactElement } from 'react';

export const metadata: Metadata = {
  title: 'About',
  description:
    'NaniSoft builds the factory that builds software — Nexus, the Agent Factory, and the products it ships: Atlas, AlphaLens, and Prism.',
};

export default function AboutPage(): ReactElement {
  return (
    <div className="site-about">
      <p className="site-eyebrow">nanisoft — about</p>
      <h1>The company that builds the builder.</h1>

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

      <dl className="site-about__facts">
        <div className="site-about__fact">
          <dt>Platform</dt>
          <dd>Nexus, the Agent Factory — orchestration, worker containers, and a human feedback loop. In development, described honestly.</dd>
        </div>
        <div className="site-about__fact">
          <dt>Products</dt>
          <dd>Atlas, digital twins; AlphaLens, market research for the Indian market; Prism, the shared design language.</dd>
        </div>
        <div className="site-about__fact">
          <dt>Design</dt>
          <dd>One language across everything: Spectral Refraction — hairline structure, pastel packs, beam-dark, motion that never bounces.</dd>
        </div>
      </dl>

      <p>
        Start at <a href="https://nexus.nanisoft.com">the factory</a>, tour{' '}
        <a href="https://prism.nanisoft.com">the design system</a>, or read{' '}
        <a href="/blog">the company blog</a>.
      </p>
    </div>
  );
}
