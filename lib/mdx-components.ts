// Headless MDX component mapping (fumadocs-core headless: the site owns the
// HTML). This site writes no custom MDX components: the prose elements are plain
// HTML and the design system's Prose component styles them. The hook stays so a
// page has one place to add a mapping later without touching the loader.
import type { ComponentType } from 'react';

type MdxComponentMap = Record<string, ComponentType<Record<string, unknown>>>;

/** Merge extra mappings into the site's base component map. */
export function getMdxComponents(extra?: MdxComponentMap): MdxComponentMap {
  return { ...extra };
}
