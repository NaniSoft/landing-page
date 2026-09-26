import { render, screen } from '@testing-library/react';
import { beforeAll, describe, expect, it } from 'vitest';

import { PrismThemeModeProvider } from '@nanisoft/prism-ui/provider';

import HomePage from '@/app/page';
import { FINAL_CTA, HERO, PIPELINE, PRODUCTS } from '@/lib/landing-content';

/** Renders the landing inside the chrome's mode context, as the layout does. */
function renderLanding(): void {
  render(
    <PrismThemeModeProvider pack="blue" defaultMode="dark">
      <HomePage />
    </PrismThemeModeProvider>,
  );
}

// jsdom has no IntersectionObserver; the landing's reveal observer needs one.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root: Element | Document | null = null;
  readonly rootMargin = '';
  readonly scrollMargin = '';
  readonly thresholds: ReadonlyArray<number> = [];
  disconnect(): void {}
  observe(): void {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
  unobserve(): void {}
}

beforeAll(() => {
  window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;
  // jsdom has no canvas backend; the network canvas guards on a null context.
  window.HTMLCanvasElement.prototype.getContext = () => null;
  // matchMedia exists in jsdom but returns no matches; reduced-motion reads it.
  window.matchMedia = (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
});

describe('landing', () => {
  it('owns the thesis', () => {
    renderLanding();
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading.textContent).toBe(HERO.title);
  });

  it('shows every pipeline stage, issue to release', () => {
    renderLanding();
    for (const stage of PIPELINE.stages) {
      expect(screen.getAllByText(stage.name).length).toBeGreaterThan(0);
    }
  });

  it('links the three products on their own subdomains', () => {
    renderLanding();
    for (const product of PRODUCTS.rows) {
      const link = screen.getAllByRole('link', { name: new RegExp(product.name) })[0];
      expect(link?.getAttribute('href')).toBe(product.url);
    }
  });

  it('closes at the factory', () => {
    renderLanding();
    expect(screen.getByRole('heading', { level: 2, name: FINAL_CTA.title })).toBeTruthy();
  });
});
