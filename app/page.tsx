import type { ReactElement } from 'react';

import { CtaLink } from '@nanisoft/prism-ui/components/cta-link';
import { Diagram } from '@nanisoft/prism-ui/components/diagram';
import { Prose } from '@nanisoft/prism-ui/components/prose';
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section';
import { Cta01 } from '@nanisoft/prism-ui/blocks/cta-01';
import { FeatureGrid01 } from '@nanisoft/prism-ui/blocks/feature-grid-01';
import { LogoStrip01 } from '@nanisoft/prism-ui/blocks/logo-strip-01';
import { NoteGrid01 } from '@nanisoft/prism-ui/blocks/note-grid-01';
import { ProductGrid01 } from '@nanisoft/prism-ui/blocks/product-grid-01';

import {
  ARCHITECTURE,
  FINAL_CTA,
  HERO,
  PHILOSOPHY,
  PIPELINE,
  PRODUCTS,
  TICKER,
  TICKER_LABEL,
  WHY,
} from '@/lib/landing-content';
import { GROUND_PACK, PRODUCTS as SITE_PRODUCTS } from '@/lib/site';

/**
 * The landing, composed from the design system's catalogue and nothing else.
 *
 * This file is composition and nothing else: every word is in `lib/landing-content.ts`,
 * every claim about a pack is in `lib/site.json`, and every rule about what a Block
 * may be given belongs to the design system. There is no local component here and no
 * local stylesheet, which is the point of the migration: the old page needed a client
 * boundary, a scroll-reveal observer, a canvas, a hand-written graph and eleven
 * kilobytes of CSS to draw what eight catalogue items draw.
 *
 * It is a server component. It ships no client JavaScript, takes no hook, reads no
 * context, and needs no provider mounted above it, because every item resolves its
 * colours through the cascade rather than by reading a value once at mount.
 *
 * **The order is the site's, and the section indices are copy.** Sections 01 to 05
 * render in the order they have always rendered in, each carrying its own published
 * index and label. Where a Block owns its own heading, the index is passed as that
 * heading's eyebrow, because the eyebrow is the one slot a Block offers for a
 * machine annotation above a title. The string rendered is the same string either
 * way, and `scripts/content-parity-expectations.json` is where every string that did
 * not survive is recorded with the reason it had nowhere to go.
 *
 * **Two bands carry a second pack, and both are in `scripts/pack-map.json`.** The
 * product section and the header's switcher. Every one of those boundaries lands on
 * a `ProductMark`, which is a fully rounded disc, and nowhere else. The rule is
 * arithmetic rather than taste: a pack boundary also re-points `--radius`, and this
 * page's ground is `sky`, the tightest of the five at 0.5rem, so a section wearing
 * any other pack would put that section's index into its corner radius.
 *
 * One class name here is a Prism utility and three are this site's own, and the
 * difference matters for the three sites that copy this file: a utility exists in the
 * emitted stylesheet only if a Prism component uses it, because the consumer does not
 * run Tailwind, so `mb-12` is safe and a utility Prism happens not to use would
 * silently do nothing. Anything a site needs for itself goes in the site's own sheet.
 */

/** The two calls to action under the thesis, as real links. */
function heroActions(): ReactElement {
  return (
    <div className="site-hero__actions">
      <CtaLink href={HERO.primaryCta.href} size="lg" variant="default">
        {HERO.primaryCta.label}
      </CtaLink>
      <CtaLink href={HERO.secondaryCta.href} size="lg" variant="outline">
        {HERO.secondaryCta.label}
      </CtaLink>
    </div>
  );
}

/** The pack a product row's mark is drawn in, from the site's own directory. */
function markPack(productId: string) {
  return SITE_PRODUCTS.find((entry) => entry.id === productId)?.pack ?? GROUND_PACK;
}

export default function Landing(): ReactElement {
  return (
    <>
      {/* The thesis, and the page's own h1. The band above the numbered sections is
          deliberately empty: the old hero's canvas was aria-hidden atmosphere behind
          the type, and a band that says one thing should not carry a drawing that
          says nothing. */}
      <Section className="site-hero">
        <SectionHeading
          as="h1"
          align="center"
          eyebrow={HERO.eyebrow}
          title={HERO.title}
          description={HERO.lede}
        />
        {heroActions()}
      </Section>

      {/* The transition band between the thesis and the first numbered section. */}
      <LogoStrip01 items={[...TICKER]} label={TICKER_LABEL} />

      {/* 01, the pipeline, at the address the hero's second action links to. The
          wrapper carries `id="pipeline"` because the catalogue's Blocks spread no
          props: a deep link into this page has to keep resolving, and the one rule
          the catalogue gives a consumer is that it owns the element. The catalogue's
          process rail admits two, three or four steps and refuses five in the type,
          and this page states six, so the six stages are a grid of short points
          instead: a title and one line each, in the order the process runs. The word
          the old rail printed on its last step has no slot on the item that now draws
          this section, and it is recorded as removed rather than rewritten into a
          stage caption. */}
      <div id="pipeline">
        <NoteGrid01
          eyebrow={PIPELINE.index}
          title={PIPELINE.label}
          notes={PIPELINE.stages.map((stage) => ({ title: stage.name, body: stage.caption }))}
          caption={PIPELINE.caption}
        />
      </div>

      {/* 02, the products. One of the two bands that carry a second pack: each row's
          mark is its product's own boundary, and the mark is the only element in
          this section that carries one. */}
      <ProductGrid01
        eyebrow={PRODUCTS.index}
        title={PRODUCTS.label}
        products={PRODUCTS.rows.map((product) => ({
          id: product.id,
          name: product.name,
          pack: markPack(product.id),
          tagline: product.tagline,
          href: product.url,
        }))}
      />

      {/* 03, the architecture. The old five-node graph was a client component because
          it resolved five pack inks in JavaScript at mount, which is why a light-mode
          reader was served dark-mode ink until hydration; the schematic it drew is
          now a server Component whose every stroke and fill names a semantic token,
          so the cascade restyles all of them and a boundary above it would too. */}
      <Section>
        <SectionHeading
          as="h2"
          align="left"
          index={ARCHITECTURE.index}
          title={ARCHITECTURE.label}
          className="mb-12"
        />
        <Diagram label={ARCHITECTURE.aria} nodes={ARCHITECTURE.nodes} relations={ARCHITECTURE.relations} />
        <p className="site-caption">{ARCHITECTURE.caption}</p>
      </Section>

      {/* 04, why Nanisoft: the three pillars, then the five-card grid under them. */}
      <NoteGrid01
        eyebrow={WHY.index}
        title={WHY.label}
        notes={WHY.pillars.map((pillar) => ({ title: pillar.name, body: pillar.line }))}
      />
      <FeatureGrid01
        variant="bare"
        numbered
        features={WHY.features.map((feature) => ({ title: feature.name, body: feature.line }))}
      />

      {/* 05, philosophy, set quiet and narrow. */}
      <Section>
        <SectionHeading
          as="h2"
          align="left"
          index={PHILOSOPHY.index}
          title={PHILOSOPHY.label}
          className="mb-12"
        />
        <Prose className="site-manifesto" size="lg">
          <p>{PHILOSOPHY.manifesto}</p>
        </Prose>
      </Section>

      {/* The closing band. Both actions are anchors, and that is the one rendered
          change the whole migration exists to make: the old page passed a destination
          to a component that rendered a button, so the page's primary action was
          announced as a command that navigated nothing. */}
      <Cta01
        title={FINAL_CTA.title}
        action={FINAL_CTA.primaryCta}
        secondaryAction={FINAL_CTA.secondaryCta}
      />
    </>
  );
}
