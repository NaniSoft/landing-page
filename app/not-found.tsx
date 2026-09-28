import type { ReactElement } from 'react';

import { NotFoundPage } from '@nanisoft/prism-ui/pages/not-found-page';

/**
 * The not-found screen, from the design system's Page for it.
 *
 * The code is the `h1` and the sentence is the `h2`, which is the reverse of what a
 * reader sees first and the right way round for anything that reads the outline. The
 * one way out is the site itself, labelled with the site's own name rather than with
 * a new word: the old screen had no way out at all, and the catalogue's Page is right
 * that a dead end with a message on it is not a not-found page.
 */
export default function NotFound(): ReactElement {
  return (
    <NotFoundPage
      code="404"
      title="This page does not exist (yet)."
      links={[{ label: 'NaniSoft', href: '/' }]}
      linksLabel="Ways out"
    />
  );
}
