import type { ReactElement } from 'react';

import { CtaLink } from '@nanisoft/prism-ui/components/cta-link';
import { Diagram } from '@nanisoft/prism-ui/components/diagram';
import { ProductMark } from '@nanisoft/prism-ui/components/product-mark';
import { Prose } from '@nanisoft/prism-ui/components/prose';
import { PulseGraph } from '@nanisoft/prism-ui/components/pulse-graph';
import { Section, SectionHeading } from '@nanisoft/prism-ui/components/section';
import { Heading, Text } from '@nanisoft/prism-ui/components/typography';
import { Cta01 } from '@nanisoft/prism-ui/blocks/cta-01';
import { InstrumentPanel01 } from '@nanisoft/prism-ui/blocks/instrument-panel-01';
import { LogoStrip01 } from '@nanisoft/prism-ui/blocks/logo-strip-01';
import { ProductGrid01 } from '@nanisoft/prism-ui/blocks/product-grid-01';

import {
  ARCHITECTURE,
  FINAL_CTA,
  HERO,
  IDENTITY,
  PHILOSOPHY,
  PIPELINE,
  PIPELINE_FIGURE,
  PRODUCTS,
  TICKER,
  TICKER_LABEL,
  WHY,
} from '@/lib/landing-content';
import { SiteChrome } from '@/components/site-chrome';
import { PRODUCTS as SITE_PRODUCTS } from '@/lib/site';

/**
 * The landing, composed from the design system and nothing else.
 *
 * Every word is in `lib/landing-content.ts`, every claim about a pack is in
 * `lib/site.json`, and every rule about what a Block may be given belongs to the
 * design system. It is a server component: it ships no client JavaScript, takes no
 * hook, reads no context, and needs no provider mounted above it, because every item
 * resolves its colours through the cascade rather than by reading a value once at
 * mount.
 *
 * **Three of the eight bands are composed here rather than taken whole**, and the
 * line is drawn at whether the catalogue ships the band:
 *
 *   - The hero. No Block in the catalogue draws a thesis beside the product set, and
 *     the Block that came closest, `Hero01`, fixed the page's largest type at the same
 *     36px every section heading uses, so a page whose job is to state a thesis had
 *     its thesis set smaller than its own table of contents. Composing it is also what
 *     puts five marks on the page at the largest size a mark is drawn at.
 *   - The pipeline band. No Block draws a live figure beside the six stages it
 *     describes: `ProcessRail01` admits four steps and this page has six, and a rail
 *     cannot hold a panel.
 *   - The "why" band. `NoteGrid01` renders a hairline and no fill, `FeatureGrid01`
 *     requires an icon from a package this repository cannot import, and three tinted
 *     panels are what the section is for.
 *
 * Everything else is a Block, unmodified. The layout families on this page are eight
 * and no two of them are the same shape: a split hero, a strip, a figure beside a list,
 * hairline product rows, a schematic, a tinted panel grid, a narrow measure of prose,
 * and a filled closing band.
 *
 * **One region carries a second pack in the hero, one in the products band, and both
 * are in `scripts/pack-map.json`.** Every one of those boundaries lands on a
 * `ProductMark`, which is a fully rounded disc, and nowhere else. That is not a site
 * decision: the pack-boundary law in `@nanisoft/prism-ui/gates` refuses a boundary on
 * anything else, so a mark is the one element on this site that can wear a colour
 * other than the ground's. It is also why this is the most colour the page can honestly
 * have, and why the count is four pastels and a spectrum rather than five pastels: the
 * fifth member of the set owns no pack.
 *
 * A consumer cannot write a Prism utility class, because the consumer does not run
 * Tailwind, so a utility exists in the emitted stylesheet only if a Prism component
 * uses it. The one class name below that is a Prism utility is `mb-12`; everything
 * else this page needs for itself is a site class in `app/globals.css`.
 */

/**
 * The pack a product's mark is drawn in, from the site's own directory.
 *
 * The `?? GROUND_PACK` this used to carry is gone, and it was a bug waiting to happen:
 * the directory now holds a member with no pack at all, and a nullish coalesce would
 * have handed it the ground and painted the design system's mark in the company site's
 * colour. A member with no pack is drawn as the spectrum, which is the answer, so the
 * lookup returns null rather than reaching for one.
 */
function markPack(productId: string) {
  return SITE_PRODUCTS.find((entry) => entry.id === productId)?.pack ?? null;
}

/** The directory keyed by id, so a mark and the directory cannot disagree about it. */
const DIRECTORY = new Map(SITE_PRODUCTS.map((product) => [product.id, product]));

export default function Landing(): ReactElement {
  return (
    <SiteChrome>
      <>
        {/* The thesis, the page's own h1, and the product set it built.

            There is no eyebrow. The one this band used to carry read "Nanisoft" in a
            rounded chip directly above a headline, which is the brand name restated in
            the position a reader looks first, and a hero's four text slots are better
            spent on the claim, the line under it, the two actions and the thing that
            makes the claim checkable.

            The right column is the product set, one mark per member at the largest size a
            mark is drawn at. Four are a product in a pastel of its own, this site wears
            the ground, and Prism is drawn as the spectrum because it owns no pack. It is
            the visual the page was missing and it is also the only legal one: a
            `data-pack` boundary lands on a mark and nowhere else, so this column is the
            most colour the page can have without breaking the design system's law. */}
        <Section data-slot="nanisoft-hero" className="site-band--tall">
          <div className="site-hero">
            <div className="site-hero__copy">
              <Heading as="h1" size="3xl" className="site-display">
                {HERO.title}
              </Heading>
              <Text size="lg" tone="muted" className="site-hero__lede">
                {HERO.lede}
              </Text>
              <div className="site-hero__actions">
                <CtaLink href={HERO.primaryCta.href} size="lg">
                  {HERO.primaryCta.label}
                </CtaLink>
                <CtaLink href={HERO.secondaryCta.href} size="lg" variant="outline">
                  {HERO.secondaryCta.label}
                </CtaLink>
              </div>
            </div>

            <ul className="site-identity">
              {IDENTITY.entries.map((entry) => {
                const product = DIRECTORY.get(entry.id);
                if (!product) return null;
                return (
                  <li key={entry.id} className="site-identity__row">
                    <a href={product.href} className="site-identity__link">
                      <ProductMark id={product.id} name={product.name} pack={markPack(entry.id)} size="lg" />
                      <span className="site-identity__role">{entry.role}</span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </Section>

        {/* The transition band between the thesis and the pipeline. */}
        <LogoStrip01 items={[...TICKER]} label={TICKER_LABEL} />

        {/* The pipeline, and the factory running beside the six stages.

            The figure moved here from the hero, and it is better here: the band is about
            one issue making the walk from intake to release, and a picture of that walk
            belongs with the list of what the walk is rather than above the page's only
            sentence about itself. The list is an ordered list rather than the
            definition list `NoteGrid01` renders, because six stages of one process are a
            sequence and a definition list says a thing and its explanation.

            The wrapper carries `id="pipeline"` because the catalogue's Blocks spread no
            props and a deep link into this page has to keep resolving. The one rule the
            catalogue gives a consumer is that it owns the element. */}
        <Section id="pipeline">
          <SectionHeading as="h2" align="left" title={PIPELINE.label} className="mb-10" />
          <div className="site-pipeline">
            <div className="site-pipeline__figure">
              <InstrumentPanel01
                label={PIPELINE_FIGURE.panel.label}
                state="live"
                stateLabel={PIPELINE_FIGURE.panel.mode}
                caption={PIPELINE_FIGURE.aria}
                footnote={PIPELINE_FIGURE.panel.footnote}
              >
                <PulseGraph
                  nodes={PIPELINE_FIGURE.nodes}
                  relations={PIPELINE_FIGURE.relations}
                  label={PIPELINE_FIGURE.aria}
                />
              </InstrumentPanel01>
            </div>
            <ol className="site-pipeline__stages">
              {PIPELINE.stages.map((stage) => (
                <li key={stage.name} className="site-pipeline__stage">
                  <h3 className="site-pipeline__name">{stage.name}</h3>
                  <p className="site-pipeline__caption">{stage.caption}</p>
                </li>
              ))}
            </ol>
          </div>
          <p className="site-caption">{PIPELINE.caption}</p>
        </Section>

        {/* The products. One of the two bands that carry a second pack: each row's mark is
            its product's own boundary, and the mark is the only element in this section
            that carries one. */}
        <ProductGrid01
          title={PRODUCTS.label}
          products={PRODUCTS.rows.map((product) => ({
            id: product.id,
            name: product.name,
            pack: markPack(product.id),
            tagline: product.tagline,
            href: product.url,
          }))}
        />

        {/* The architecture. The five-node graph used to be a client component because it
            resolved five pack inks in JavaScript at mount, which is why a light-mode reader
            was served dark-mode ink until hydration; the schematic it drew is now a server
            Component whose every stroke and fill names a semantic token, so the cascade
            restyles all of them and a boundary above it would too. */}
        <Section>
          <SectionHeading as="h2" align="left" title={ARCHITECTURE.label} className="mb-10" />
          <Diagram
            label={ARCHITECTURE.aria}
            nodes={ARCHITECTURE.nodes}
            relations={ARCHITECTURE.relations}
          />
          <p className="site-caption">{ARCHITECTURE.caption}</p>
        </Section>

        {/* Why Nanisoft, as three tinted panels.

            This was eight points across two consecutive bands of the same shape, and the
            second five restated the first three at a lower altitude. Three is what the
            section actually claims. The panels are tinted with the pack's own `accent`
            and carry a `primary` hairline, which is the design system's own rule that a
            pastel is a fill for a large area and never a signal, so three large washes
            read as surface and five small ones would have read as status. */}
        <Section>
          <SectionHeading as="h2" align="left" title={WHY.label} className="mb-10" />
          <ul className="site-pillars">
            {WHY.pillars.map((pillar) => (
              <li key={pillar.name} className="site-pillar">
                <h3 className="site-pillar__name">{pillar.name}</h3>
                <p className="site-pillar__line">{pillar.line}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* The manifesto, set at the narrow measure and given the room a statement wants. */}
        <Section className="site-band--tall">
          <SectionHeading as="h2" align="left" title={PHILOSOPHY.label} className="mb-10" />
          <Prose className="site-manifesto" size="lg">
            <p>{PHILOSOPHY.manifesto}</p>
          </Prose>
        </Section>

        {/* The closing band. Both actions are anchors, and that is the one rendered change
            the migration exists to make: the old page passed a destination to a component
            that rendered a button, so the page's primary action was announced as a command
            that navigated nothing. The note under it carries the honesty law, because this
            is the last thing a reader is told before they leave for the factory. */}
        <Cta01
          title={FINAL_CTA.title}
          action={FINAL_CTA.primaryCta}
          secondaryAction={FINAL_CTA.secondaryCta}
          note="Nexus is in development. Everything else on nanisoft.com was built by it."
        />
      </>
    </SiteChrome>
  );
}
