import { ImageResponse } from 'next/og';

/**
 * The share card for the company site.
 *
 * **Generated once, at build.** Under `output: 'export'` a metadata route has to be
 * told it is static, and the image is painted from constants with no request to be
 * dynamic with. Without a card, every link to this site shared into a chat client
 * renders as bare text.
 *
 * **The card is the site's own default mode.** NaniSoft opens dark, on the sky
 * pack, so the card is the dark sky theme's own values written out as literals: an
 * image is painted once into a bitmap, there is no cascade and no `data-pack`, and
 * a token read here would resolve to the neutral base and contradict the page it
 * previews. The chips are the four product packs the family wears, and the spectrum
 * bar stands for Prism, whose mark owns no single hue.
 */
export const alt = 'NaniSoft, software that builds software.'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export const dynamic = 'force-static'

const GROUND = '#16191b'
const INK = '#eaedf0'
const MUTED = '#a6adb3'
const HAIRLINE = '#3e4347'
const SKY = '#9bd1ff'
const CYAN = '#7fdaf0'
const MINT = '#9ddcad'
const GOLD = '#edc47d'

const SPECTRUM =
  'linear-gradient(90deg, #ec88a0 0%, #bc97e7 25%, #73bf88 50%, #6cb2eb 75%, #e4965e 100%)'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: GROUND,
          color: INK,
          padding: '72px 80px',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'flex', fontSize: 26, letterSpacing: 2, color: SKY }}>
            THE AI-NATIVE SOFTWARE COMPANY
          </div>
          <div
            style={{
              display: 'flex',
              fontSize: 88,
              fontWeight: 600,
              letterSpacing: -3,
              lineHeight: 1.02,
              maxWidth: 940,
            }}
          >
            Building the platforms that build the future.
          </div>
          <div style={{ display: 'flex', fontSize: 34, color: MUTED, lineHeight: 1.35 }}>
            One factory built every product we ship.
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: `2px solid ${HAIRLINE}`,
            paddingTop: 32,
          }}
        >
          <div style={{ display: 'flex', fontSize: 26, color: MUTED }}>nanisoft.com</div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[SKY, CYAN, MINT, GOLD].map((colour) => (
                <div
                  key={colour}
                  style={{ display: 'flex', width: 30, height: 30, borderRadius: 15, background: colour }}
                />
              ))}
            </div>
            <div
              style={{
                display: 'flex',
                width: 54,
                height: 30,
                borderRadius: 15,
                background: SPECTRUM,
              }}
            />
          </div>
        </div>
      </div>
    ),
    size,
  )
}
