import { ProductMark } from '@nanisoft/prism-ui/components/product-mark'

import { AlphaLensMark, AtlasMark, NexusMark, PrismMark } from '@/components/family-marks'
import { NaniSoftLogo } from '@/components/logo'
import { IDENTITY } from '@/lib/landing-content'
import { PRODUCTS as DIRECTORY } from '@/lib/site'

/**
 * The hero's family constellation: the company at the centre, the four products
 * and the design system on the orbits around it.
 *
 * The drawings are the family's own marks, so a reader who arrives from a
 * product site meets the same sign here that they left there. Every node is a
 * real anchor and every node carries the product's own pack through
 * `ProductMark`, which is the one element on this page the pack-boundary law
 * allows a second pack on.
 *
 * The figure is a mechanism rather than a decoration: the rings are the family,
 * the lines are the factory's own route from the company to each product, and the
 * central ring pulses on the ambient cycle. Stop the animation and the whole
 * constellation is still there, still labelled, still a link.
 *
 * On a phone it becomes the list it always was: the centre first, then the four
 * satellites, each with its role line. The absolute layout is a wide-screen
 * arrangement and is not worth shrinking an orbit to a thumbnail for.
 */
const DRAWINGS = {
  www: <NaniSoftLogo className="site-product-mark" />,
  nexus: <NexusMark className="site-product-mark" />,
  atlas: <AtlasMark className="site-product-mark" />,
  alphalens: <AlphaLensMark className="site-product-mark" />,
  prism: <PrismMark className="site-product-mark" />,
} as const

/** The four satellites and the point of the orbit each one sits on. */
const ORBITS = {
  prism: 'top',
  nexus: 'right',
  atlas: 'bottom',
  alphalens: 'left',
} as const

export function FamilyConstellation() {
  const centre = DIRECTORY.find((product) => product.id === 'www')
  const centreRole = IDENTITY.entries.find((entry) => entry.id === 'www')?.role
  const satellites = DIRECTORY.filter((product) => product.id !== 'www')

  if (!centre || !centreRole) return null

  return (
    <div className="site-constellation">
      <svg
        viewBox="0 0 400 400"
        aria-hidden="true"
        className="site-constellation__orbit"
        fill="none"
        stroke="currentColor"
      >
        <circle cx="200" cy="200" r="168" strokeDasharray="2 8" strokeWidth="1" />
        <circle cx="200" cy="200" r="112" strokeWidth="1" />
        <path d="M200 32V368M32 200H368" strokeDasharray="2 10" strokeWidth="1" />
        <circle cx="200" cy="88" r="5" fill="currentColor" stroke="none" />
        <circle cx="312" cy="200" r="5" fill="currentColor" stroke="none" />
        <circle cx="200" cy="312" r="5" fill="currentColor" stroke="none" />
        <circle cx="88" cy="200" r="5" fill="currentColor" stroke="none" />
        <circle
          cx="200"
          cy="200"
          r="76"
          strokeWidth="1"
          className="stroke-primary prism-ambient-pulse"
          style={{ transformOrigin: '200px 200px' }}
        />
      </svg>

      <a href={centre.href} className="site-constellation__centre">
        <ProductMark
          id={centre.id}
          name={centre.name}
          pack={centre.pack}
          mark={DRAWINGS.www}
          size="lg"
        />
        <span className="site-constellation__role">{centreRole}</span>
      </a>

      <ul className="site-constellation__set">
        {satellites.map((product) => {
          const role = IDENTITY.entries.find((entry) => entry.id === product.id)?.role
          const orbit = ORBITS[product.id as keyof typeof ORBITS] ?? 'top'

          return (
            <li key={product.id} data-orbit={orbit} className="site-constellation__node">
              <a href={product.href} className="site-constellation__link">
                <ProductMark
                  id={product.id}
                  name={product.name}
                  pack={product.pack ?? null}
                  mark={DRAWINGS[product.id as keyof typeof DRAWINGS]}
                  size="lg"
                />
                {role ? <span className="site-constellation__role">{role}</span> : null}
              </a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
