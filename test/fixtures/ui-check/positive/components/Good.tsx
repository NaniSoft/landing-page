import { DSImage } from '@nanisoft/prism-ui/components/ds-image';
import { DSIcon } from '@nanisoft/prism-ui/components/ds-icon';
import { DSStack } from '@nanisoft/prism-ui/components/ds-stack';
import { DSGrid } from '@nanisoft/prism-ui/components/ds-grid';
export function Good(){ return <DSStack gap="md"><DSGrid columns={2} gap="md"><DSImage src="/assets/hero.webp" alt="Hero" variant="hero" width={1920} height={1080} srcSet="/assets/hero.webp 1920w" /></DSGrid><DSIcon name="search" size="md" label="Search" /></DSStack> }
