import type { CSSProperties } from 'react'

/**
 * The company landing's editorial figure: the factory floor as a schematic.
 *
 * It is a placeholder for a real photograph, and it is honest about being a
 * drawing: a gantry, six stations on one conveyor, a packet crossing them, and
 * the products that come off the far end. It is drawn from the same semantic
 * tokens the page uses, so it follows the pack and the mode rather than carrying
 * a colour of its own.
 *
 * The packet is the one moving part. It rides `prism-ambient-travel`, which is
 * priced by the token package and stopped by the universal reduced-motion rule.
 * Every station is visible with the animation stopped, so the figure still says
 * what it says.
 *
 * It is decorative: the band's copy carries the meaning, and the figure is
 * `aria-hidden`.
 */
export function EditorialFactory() {
  return (
    <svg
      viewBox="0 0 1200 675"
      role="presentation"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
      className="h-full w-full"
    >
      <rect width="1200" height="675" className="fill-muted" />

      <g className="fill-foreground/5 stroke-border" strokeWidth="1.5">
        <rect x="110" y="118" width="980" height="392" rx="12" />
        <rect x="146" y="154" width="908" height="320" rx="8" />
      </g>

      <g className="stroke-border" strokeWidth="1.5" fill="none">
        <path d="M 110 205 H 1090" />
        <path d="M 180 154 V 474 M 1020 154 V 474" />
        <path d="M 146 300 H 1054" strokeDasharray="2 10" />
      </g>

      <g className="fill-foreground/10">
        {Array.from({ length: 6 }, (_, index) => {
          const x = 220 + index * 128
          return (
            <g key={index}>
              <rect x={x} y={232} width="64" height="86" rx="6" />
              <rect x={x + 10} y={244} width="44" height="8" rx="3" opacity="0.5" />
              <rect x={x + 10} y={262} width="30" height="6" rx="3" opacity="0.35" />
              <rect x={x + 10} y={278} width="38" height="6" rx="3" opacity="0.35" />
            </g>
          )
        })}
      </g>

      <g className="text-primary/60" fill="currentColor">
        {Array.from({ length: 5 }, (_, index) => (
          <circle key={index} cx={252 + index * 128} cy={360} r="5" />
        ))}
      </g>

      <g className="stroke-border" strokeWidth="1.5" fill="none">
        <path d="M 100 500 H 1100" />
        <path d="M 100 500 L 164 456 H 1036 L 1100 500" />
        <path d="M 100 500 L 164 544 H 1036 L 1100 500" />
        {Array.from({ length: 10 }, (_, index) => (
          <path key={index} d={`M ${180 + index * 94} 456 V 544`} />
        ))}
      </g>

      <g className="text-foreground/25" fill="currentColor">
        {Array.from({ length: 4 }, (_, index) => (
          <g key={index}>
            <rect x={900 + index * 42} y={300 - index * 8} width="26" height="26" rx="4" />
            <rect x={900 + index * 42} y={334 - index * 8} width="26" height="8" rx="3" opacity="0.5" />
          </g>
        ))}
      </g>

      <g className="text-foreground/20" stroke="currentColor" strokeWidth="1.5" fill="none">
        <circle cx="600" cy="330" r="238" strokeDasharray="6 10" />
        <circle cx="600" cy="330" r="170" />
        <circle cx="600" cy="330" r="104" strokeDasharray="3 8" />
      </g>

      <g className="text-primary" fill="currentColor">
        <rect
          x="176"
          y="482"
          width="28"
          height="22"
          rx="4"
          className="prism-ambient-travel"
          style={{ '--ambient-travel-distance': '812px' } as CSSProperties}
        />
      </g>
    </svg>
  )
}
