'use client';

// The www landing (ticket 04's locked design): variant B's hero over variant
// A's sections — the page opens as Refraction's single beam (full-viewport,
// monochrome, the agent network as atmosphere behind the display type) and
// continues as the Factory Floor (one beam-dark ground, mono section indices,
// hairline instruments). The five-pack law is packs-as-signal: packs appear
// as dots, inks, and accents — never full-bleed pack grounds — and peach is
// reserved for the Future Products node in the architecture graph.
//
// Motion law ADR-0001: canvas ambient runs linear; reveals ride 280ms
// decelerating with 40–80ms staggers; reduced motion renders settled frames.

import type { CSSProperties, ReactElement, ReactNode } from 'react';

import { Button } from '@nanisoft/prism-ui/components/button';
import { usePrismThemeMode } from '@nanisoft/prism-ui/provider';
import { prismBrandPacks, type PrismPackId } from '@nanisoft/prism-tokens';

import { AgentNetworkCanvas } from '@/components/landing/AgentNetworkCanvas';
import { FiveNodeGraph } from '@/components/landing/FiveNodeGraph';
import { reveal, useRevealRoot } from '@/components/landing/reveal';
import {
  ARCHITECTURE,
  FINAL_CTA,
  HERO,
  PHILOSOPHY,
  PIPELINE,
  PRODUCTS,
  TICKER,
  WHY,
} from '@/lib/landing-content';

function Section({
  id,
  index,
  label,
  children,
}: {
  id?: string;
  index: string;
  label: string;
  children: ReactNode;
}): ReactElement {
  return (
    <section id={id} className="www-section">
      <div className="www-shell">
        <div className="www-section__head" {...reveal()}>
          <span className="www-section__index">{index}</span>
          <span className="www-section__label">{label}</span>
        </div>
        {children}
      </div>
    </section>
  );
}

export function Landing(): ReactElement {
  const root = useRevealRoot();
  // Pack inks are mode-selected: the ledger's dots and the graph derive from
  // the live mode, so a toggle re-inks them (the prototype's hardcoded dark
  // inks would wash out on a light ground — the class of bug ticket 11 caught
  // on the canvas, applied to CSS instead).
  const { mode } = usePrismThemeMode();

  return (
    <div className="www" ref={root}>
      {/* The single beam — monochrome full-viewport hero, the network as
          atmosphere behind the type. */}
      <section className="www-hero">
        <div className="www-hero__net" aria-hidden>
          <AgentNetworkCanvas />
        </div>
        <div className="www-shell www-hero__copy">
          <p className="www-eyebrow" {...reveal()}>
            {HERO.eyebrow}
          </p>
          <h1 className="www-display www-display--xl" {...reveal(80)}>
            {HERO.title}
          </h1>
          <p className="www-lede" {...reveal(160)}>
            {HERO.lede}
          </p>
          <div className="www-cta-row" {...reveal(220)}>
            <Button type="primary" size="large" href={HERO.primaryCta.href}>
              {HERO.primaryCta.label}
            </Button>
            <Button size="large" href={HERO.secondaryCta.href}>
              {HERO.secondaryCta.label}
            </Button>
          </div>
        </div>
      </section>

      {/* The factory ticker — the hero→pipeline transition. */}
      <div className="www-shell">
        <div className="www-ticker" {...reveal()}>
          {TICKER.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>

      {/* 01 — the conveyor: six stages, one packet traveling the line. */}
      <Section id="pipeline" index={PIPELINE.index} label={PIPELINE.label}>
        <div className="www-rail" {...reveal()}>
          <div className="www-rail__packet" aria-hidden />
          {PIPELINE.stages.map((stage, index) => (
            <div className="www-stage" key={stage.name}>
              <span className="www-stage__no">{String(index + 1).padStart(2, '0')}</span>
              <span className="www-stage__name">{stage.name}</span>
              <span className="www-stage__caption">{stage.caption}</span>
            </div>
          ))}
          <span className="www-rail__merged">merged</span>
        </div>
        <p className="www-caption">{PIPELINE.caption}</p>
      </Section>

      {/* 02 — products as a ledger, not cards: one hairline row each. The
          pack dot is the row's only pack ground — packs-as-signal. */}
      <Section id="products" index={PRODUCTS.index} label={PRODUCTS.label}>
        <div className="www-ledger">
          {PRODUCTS.rows.map((product, index) => {
            const ink = prismBrandPacks[product.pack as PrismPackId].ink[mode];
            return (
              <a
                className="www-row"
                key={product.id}
                href={product.url}
                {...reveal(index * 60)}
                style={{ '--www-ink': ink } as CSSProperties}
              >
                <span className="www-row__dot" aria-hidden />
                <span className="www-row__name">{product.name}</span>
                <span className="www-row__tagline">{product.tagline}</span>
                <span className="www-row__line">{product.line}</span>
                <span className="www-row__url">{product.url.replace('https://', '')} →</span>
              </a>
            );
          })}
        </div>
      </Section>

      {/* 03 — architecture: the thesis, drawn as a schematic. */}
      <Section index={ARCHITECTURE.index} label={ARCHITECTURE.label}>
        <div className="www-diagram" {...reveal()}>
          <FiveNodeGraph ariaLabel={ARCHITECTURE.aria} />
          <p className="www-caption">{ARCHITECTURE.caption}</p>
        </div>
      </Section>

      {/* 04 — why: three pillars, then the five-card grid (3+2). */}
      <Section id="why" index={WHY.index} label={WHY.label}>
        <div className="www-pillars">
          {WHY.pillars.map((pillar, index) => (
            <div className="www-pillar" key={pillar.name} {...reveal(index * 60)}>
              <h3>{pillar.name}</h3>
              <p>{pillar.line}</p>
            </div>
          ))}
        </div>
        <div className="www-cards">
          {WHY.features.map((feature, index) => (
            <div className="www-card" key={feature.name} {...reveal(index * 40)}>
              <span className="www-card__no">{String(index + 1).padStart(2, '0')}</span>
              <h4>{feature.name}</h4>
              <p>{feature.line}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* 05 — philosophy: set quiet, narrow. */}
      <Section index={PHILOSOPHY.index} label={PHILOSOPHY.label}>
        <div className="www-manifesto" {...reveal()}>
          <p>{PHILOSOPHY.manifesto}</p>
        </div>
      </Section>

      {/* The closing band. */}
      <section id="cta" className="www-cta">
        <div className="www-shell" {...reveal()}>
          <h2 className="www-display www-display--md">{FINAL_CTA.title}</h2>
          <div className="www-cta-row www-cta-row--center">
            <Button type="primary" size="large" href={FINAL_CTA.primaryCta.href}>
              {FINAL_CTA.primaryCta.label}
            </Button>
            <Button size="large" href={FINAL_CTA.secondaryCta.href}>
              {FINAL_CTA.secondaryCta.label}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
