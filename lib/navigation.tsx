/**
 * This site's own destinations: the header's navigation and the footer's columns.
 *
 * **Why this file exists.** The site published `/about` and `/blog` and linked to
 * neither. `SiteHeader` takes a `nav` and the root layout passed none, so the only
 * `<nav>` on any page was the product switcher and both routes were reachable only
 * by typing them. `SiteFooter` takes `columns` and the layout passed none, so the
 * footer was a brand lockup with nothing under it. A route nothing links to renders
 * exactly like a route something does, which is why the `links` gate could not see
 * it: the gate asks whether a link a reader follows arrives somewhere, and a page
 * with no link to it asks nothing.
 *
 * The destinations are data rather than JSX so the header, the footer and any future
 * page header read the same one list. Two words for one route is two facts to keep in
 * step, and this is a page whose whole argument is that one factory builds everything,
 * so it should not ship a footer that disagrees with its header.
 *
 * **No `current` is set, and that is a decision rather than an omission.**
 * `SiteHeaderLink.current` is how the Block marks the page a reader is on, and marking
 * it is the right thing to do. This layout is shared by every route and the App Router
 * gives a server-rendered layout no way to know which route it is rendering, so the
 * only two answers are a client component reading the pathname, which would put
 * JavaScript on a site whose entire architecture is that it ships none, or leaving the
 * marking off. Leaving it off is the honest half: the link is a real link either way,
 * and a switcher beside it already carries `aria-current="page"` for the product the
 * reader is in.
 */
import type { SiteFooterColumn } from '@nanisoft/prism-ui/blocks/site-footer';
import type { SiteHeaderLink } from '@nanisoft/prism-ui/blocks/site-header';

/** The site's own pages, in the order a reader should meet them. */
export const SITE_NAV: readonly SiteHeaderLink[] = [
  { label: 'About', href: '/about' },
  { label: 'Blog', href: '/blog' },
];

/**
 * The footer's two groups, and the honest split between them.
 *
 * One column for this site and one for the rest of the family, because those are two
 * different questions a reader is asking: where else on this site can I go, and what
 * else does this company make. Collapsing them into a single list of six links would
 * answer neither.
 *
 * Every product destination is declared `newTab`. Prism's footer defaults external
 * links to a new browsing context, and the second column is external by definition,
 * so saying it here rather than relying on the default keeps the fact in this file
 * next to the URLs it applies to.
 */
export const FOOTER_COLUMNS: readonly SiteFooterColumn[] = [
  {
    title: 'This site',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Blog', href: '/blog' },
    ],
  },
  {
    title: 'The family',
    links: [
      { label: 'Nexus', href: 'https://nexus.nanisoft.com', newTab: true },
      { label: 'Atlas', href: 'https://atlas.nanisoft.com', newTab: true },
      { label: 'AlphaLens', href: 'https://alphalens.nanisoft.com', newTab: true },
      { label: 'Prism', href: 'https://prism.nanisoft.com', newTab: true },
    ],
  },
];

/**
 * The line at the foot of the footer.
 *
 * Prism's footer takes a `legal` slot precisely because a year is a fact about one
 * product on one day and a Block that held it would be a Block that went stale in
 * January. So this slot carries no copyright year: it carries the two sentences that
 * are true on every page and that a reader who reached the bottom of a company landing
 * has not been told yet, which product set exists and that the factory builds it. A
 * copyright line belongs here too and is the consumer's to add.
 */
export const FOOTER_LEGAL = (
  <>
    <p>NaniSoft builds five sites and one design language.</p>
    <p>Every product on nanisoft.com is built by Nexus, the Agent Factory.</p>
  </>
);
