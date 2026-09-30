import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { PrismThemeScript } from '@nanisoft/prism-ui/provider';

import { DEFAULT_MODE, GROUND_PACK, THEME_ATTRIBUTES } from '@/lib/site';

// The one stylesheet. Every token, every utility and every base rule on this site
// arrives in this one import: the design system compiles its own source into it, and
// a consumer adds its own sheet after it and nothing else.
import '@nanisoft/prism-ui/styles.css';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'NaniSoft, software that builds software.',
    template: '%s · NaniSoft',
  },
  description: 'Software that builds software.',
};

/**
 * The document: the two theme attributes, one blocking script, the chrome, the page.
 *
 * **No provider, no client runtime, no baked stylesheet.** The old layout mounted a
 * theme provider, imported a registry for a component library that no longer exists,
 * and loaded 126 KB of generated variables to define the sixty custom properties the
 * site's own CSS read. The theme is now two attributes on the document element and a
 * blocking script that applies a stored choice to them before first paint, which is
 * the arrangement the design system documents as the default and the one the whole
 * page is built for: a server render, no client JavaScript, and a page that is correct
 * with scripting disabled.
 *
 * The switcher moves between the five members of the company's product set, so all
 * five pastel packs are on every page rather than on one page of one site. The
 * navigation beside it is this site's own two routes and the footer's two columns,
 * both from `lib/navigation.ts`, so the header and the footer cannot disagree about
 * where this site can be reached: before this, `/about` and `/blog` were published,
 * indexed and linked from nowhere.
 *
 * `navLabel` is the accessible name of the header's own navigation and
 * `productsLabel` is the name of the switcher. They are different sets of places, so
 * they get different words: one is where this site goes, the other is where the
 * family goes.
 */
// The design system's own first family, and the only file this site loads.
//
// `--font-sans` in prism's emitted sheet reads `Inter, ui-sans-serif, system-ui, ...`.
// Naming a family is not shipping it: 0.6.0 carries no font file, so a site that
// loads nothing renders in the platform's UI face, which is the one face a design
// system never means by its first choice. The fallback list prism declares is kept
// verbatim behind this one, so nothing about the design system's intent changes; the
// only difference is that its first entry now exists.
//
// The migration dropped this site's Archivo and JetBrains Mono and let the display
// type fall back to the platform face. That was not in the ticket, and it is the
// most visible change the migration made. The typeface belongs to the design system
// and lands with it (the open item is that `@nanisoft/prism-ui` should ship one), so
// a site supplies the file the token already names rather than choosing its own.
/**
 * The document, and nothing else: the two theme attributes, one blocking script, the
 * page.
 *
 * **The chrome left this file.** It is in `components/site-chrome.tsx` now, and each page
 * renders it against the page it is serving, because a layout is rendered once per route
 * and is handed no pathname, so a bar that lives here can never mark the page a reader is
 * on. That was the last difference between this site's bar and the other four, and it
 * was a difference about the stack rather than about the design: a server render is handed
 * the route it is rendering, so the mark is a prop and the Block resolves `aria-current`
 * on the server.
 *
 * Everything this file still owns is the document. The bar's data, its copy and its
 * markup are in `components/site-chrome.tsx` and `lib/bar.ts`, and this site's own source
 * still carries no `'use client'` directive at all, which is what lets the bar's search,
 * sites menu and mode control be a client island inside the pinned package rather than a
 * boundary drawn here.
 */
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable} {...THEME_ATTRIBUTES} suppressHydrationWarning>
      <head>
        {/* Before paint, on the same attributes the server rendered: a stored choice
            is applied and a stored value that no longer parses is left in place, so
            nothing a reader chose is ever cleared by this site. */}
        <PrismThemeScript defaultPack={GROUND_PACK} defaultMode={DEFAULT_MODE} />
      </head>
      <body>{children}</body>
    </html>
  );
}
