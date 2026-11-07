import type { ReactElement } from 'react';

/**
 * The family's marks, as this site draws them.
 *
 * The company site lists the family in its hero, and a list of members is a
 * list of signs: the reader is shown which product is which, not which hue is
 * which. Each drawing here is the member's own mark, the same geometry its own
 * site draws in its own bar, held in step with the file that owns it there:
 * `nexus/components/logo.tsx`, `atlas/components/logo.tsx`,
 * `alphalens/components/logo.tsx` and the design system's own
 * `apps/site/src/components/logo.tsx`. A drawing that drifted from its owner
 * would be a family portrait with one wrong face, and the check is a look, in
 * the same way the pack directory's check is a look.
 *
 * Every drawing follows the family grammar the five marks share: ink strokes
 * in `currentColor`, so the mark follows the ink of the row it sits in, and
 * accents through token classes, so the pack boundary `ProductMark` carries
 * repaints the accent without touching this file. A drawing that named a hex
 * would be the one element on the page a theme could not reach, and this page
 * draws each member under its own pack's boundary on purpose.
 */

/** The Nexus mark: the three stages of one cycle, its bright node the pack's own primary. */
export function NexusMark({ className }: { className?: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Nexus"
      className={className}
    >
      <g stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
        <path d="M17.5 10.1 L22 17.9" />
        <path d="M20.5 20.5 L11.5 20.5" />
        <path d="M10 17.9 L14.5 10.1" />
      </g>
      <circle cx="16" cy="7.5" r="2.8" className="site-logo__accent" />
      <circle cx="23.5" cy="20.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="8.5" cy="20.5" r="2.6" fill="none" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

/** The Atlas mark: the estate in ink and its twin in the pack's primary, meeting at one peak. */
export function AtlasMark({ className }: { className?: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Atlas"
      className={className}
    >
      <g strokeLinecap="round" strokeWidth="2.5">
        <path d="M4 21.5 L16 16" stroke="currentColor" />
        <path d="M16 16 L28 21.5" className="site-logo__accent-stroke" />
      </g>
      <circle cx="16" cy="16" r="2.4" className="site-logo__accent" />
    </svg>
  );
}

/** The AlphaLens mark: the market in as parallel ink rays, the lens bending them to one point. */
export function AlphaLensMark({ className }: { className?: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="AlphaLens"
      className={className}
    >
      <g strokeLinecap="round" strokeWidth="2.5">
        <path d="M4 12 L17.5 12" stroke="currentColor" />
        <path d="M4 20 L17.5 20" stroke="currentColor" />
        <path d="M17.5 12 L28 16" className="site-logo__accent-stroke" />
        <path d="M17.5 20 L28 16" className="site-logo__accent-stroke" />
      </g>
      <circle cx="17.5" cy="16" r="6.5" className="site-logo__accent-stroke" />
      <circle cx="28" cy="16" r="1.9" className="site-logo__point" />
    </svg>
  );
}

/**
 * The Prism mark: one beam in, refracted through the chart hues, which is the
 * design system's whole claim in one drawing. It reads the chart tokens rather
 * than a pack's primary, because Prism owns no hue: the spectrum follows the
 * page it is drawn on, and this page draws it on the ground.
 */
export function PrismMark({ className }: { className?: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      role="img"
      aria-label="Prism"
      className={className}
    >
      <g strokeLinecap="round">
        <path d="M4 16 L13 16" stroke="currentColor" strokeWidth="2.5" />
        <path d="M15 14 L28 8" className="site-logo__ray-1" strokeWidth="2.5" />
        <path d="M15 16 L28 16" className="site-logo__ray-2" strokeWidth="2.5" />
        <path d="M15 18 L28 24" className="site-logo__ray-3" strokeWidth="2.5" />
        <path d="M13 12 L15 20 L13 20 Z" className="site-logo__point" stroke="none" />
      </g>
    </svg>
  );
}
