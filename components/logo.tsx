import type { ReactElement } from 'react';

/**
 * The company mark: the products converge into the ink the company signs with.
 *
 * The favicon's own drawing, drawn for the page: the three rays are the theme's
 * own chart hues through token classes, this theme's cast of the family's three
 * products, and the node and the beam are `currentColor`, because the one thing
 * the mark says is that many hues become one ink, and the ink they become is
 * the ink it sits beside. Prism's mark casts the same fan outward; the two are
 * mirror marks on one grid. A logo that named a hex would be the one element on
 * the page a theme could not reach.
 */
export function NaniSoftLogo({
  size = 24,
  className,
}: {
  size?: number;
  className?: string;
}): ReactElement {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      role="img"
      aria-label="NaniSoft"
      className={className ? `site-logo ${className}` : 'site-logo'}
    >
      <g strokeLinecap="round" strokeWidth="2.5">
        <path d="M4 8 L17 14" className="site-logo__ray-1" />
        <path d="M4 16 L17 16" className="site-logo__ray-2" />
        <path d="M4 24 L17 18" className="site-logo__ray-3" />
        <path d="M21 16 L28 16" stroke="currentColor" />
        <path d="M17 16 L21 11.5 L21 20.5 Z" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
