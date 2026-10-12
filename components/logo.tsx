import type { ReactElement } from 'react';

/**
 * The company mark: a beam entering a prism and leaving refracted.
 *
 * The favicon's own drawing, drawn for the page: the incoming beam is
 * `currentColor`, so the mark follows the ink it sits beside, and the
 * refraction is the pack's primary through token classes, because the one
 * thing the mark says is that one input becomes a spectrum. A logo that named
 * a hex would be the one element on the page a theme could not reach.
 */
export function NaniSoftLogo({ size = 24 }: { size?: number }): ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="NaniSoft"
      className="site-logo"
    >
      <g strokeLinecap="round">
        <path d="M4 16 L13 16" stroke="currentColor" strokeWidth="2.5" />
        <path d="M15 14 L28 8" className="site-logo__refraction" strokeWidth="2.5" />
        <path d="M15 16 L28 16" className="site-logo__refraction" strokeWidth="2.5" />
        <path d="M15 18 L28 24" className="site-logo__refraction" strokeWidth="2.5" />
        <path d="M13 12 L15 20 L13 20 Z" className="site-logo__prism" stroke="none" />
      </g>
    </svg>
  );
}
