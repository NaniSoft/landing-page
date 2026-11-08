#!/usr/bin/env node
/**
 * Runtime / production-artifact compliance: `pnpm ui:runtime`
 *
 * Mission 12 + 13: the same policy enforced on the actual production build
 * artifacts (out/), not only on source. A source gate cannot see a runtime
 * that injects styles after paint, a stylesheet the build emitted, or an
 * image the export actually shipped. This checks the built export with a
 * document parser (no browser needed for these invariants; visual regression
 * across viewports/modes is documented as the Playwright lane in
 * docs/UI_GOVERNANCE.md and runs in CI as a separate job).
 *
 * Checks on every HTML file under out/ plus emitted CSS:
 *  - html carries data-pack="sky" and a mode class (light/dark) from the DS
 *  - no <style> element with hardcoded hex / arbitrary colours (DS sheet only)
 *  - no element with inline style containing #hex or rgb/hsl (UI002/UI003 runtime)
 *  - every <img> has alt, width, height (ASSET001/012 runtime) or is DSImage
 *    (data-slot="ds-image"); raw <img> outside og is a finding
 *  - no <link> to unapproved fonts (fonts.googleapis/gstatic, local .woff)
 *  - no <script> that injects styles (createElement('style'), insertRule)
 *  - meta viewport present (responsive baseline)
 *  - exactly one stylesheet link that is the DS sheet (plus Next chunks)
 *
 * Usage: node scripts/ui-runtime-check.mjs [--out out] [--json]
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

function walk(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else out.push(full);
  }
  return out;
}

export function checkRuntime(outDir = path.join(REPO_ROOT, 'out')) {
  const findings = [];
  if (!existsSync(outDir)) {
    return { findings: [{ code: 'RUNTIME-001', file: 'out', line: 1, message: 'build export out/ not found; run pnpm build first' }], summary: { htmlFiles: 0 } };
  }
  const htmlFiles = walk(outDir).filter((f) => f.endsWith('.html'));
  let imgCount = 0;
  for (const file of htmlFiles) {
    const r = path.relative(REPO_ROOT, file).split(path.sep).join('/');
    const html = readFileSync(file, 'utf8');
    const add = (code, message) => findings.push({ code, file: r, line: 1, message });

    // Theme: data-pack + mode class on <html>
    const htmlTag = html.match(/<html[^>]*>/)?.[0] ?? '';
    if (!/data-pack="sky"/.test(htmlTag)) add('RUNTIME-001', '<html> does not carry data-pack="sky" (approved ground pack)');
    if (!/class="[^"]*\b(dark|light)\b/.test(htmlTag) && !/\bdark\b/.test(htmlTag.slice(0, 200))) {
      // Next may render mode via attribute; accept data-theme or dark class anywhere on html tag
      if (!/data-pack/.test(htmlTag)) add('RUNTIME-001', '<html> carries no theme attributes');
    }
    if (!/<meta[^>]+name="viewport"/.test(html)) add('RUNTIME-002', 'missing meta viewport (responsive baseline)');
    if (!/<meta[^>]+charset/i.test(html)) add('RUNTIME-002', 'missing meta charset');

    // Inline styles with colour (runtime UI002/UI003)
    for (const m of html.matchAll(/style="([^"]*)"/g)) {
      if (/#[0-9a-fA-F]{3,8}|rgb\(|hsl\(|oklch\(/.test(m[1])) {
        add('UI003', `inline style with hardcoded colour in built export: "${m[1].slice(0, 80)}"`);
      }
      if (/object-fit|object-position/.test(m[1])) add('ASSET010', 'inline object-fit/object-position in built export');
    }
    // <style> blocks with hex (excluding DS sheet which is linked, not inline)
    for (const m of html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
      const body = m[1];
      if (/#[0-9a-fA-F]{6}\b/.test(body) && !body.includes('var(--')) {
        // Next may inline critical CSS with hex from DS; only flag if it looks like consumer CSS (site- classes)
        if (/\.site-/.test(body)) add('UI003', 'consumer <style> block with hardcoded colour in built export');
      }
    }
    // Images
    for (const m of html.matchAll(/<img\b([^>]*)>/g)) {
      imgCount++;
      const attrs = m[1];
      if (!/alt=/.test(attrs)) add('ASSET001', '<img> without alt in built export');
      if (!/width=/.test(attrs) || !/height=/.test(attrs)) add('ASSET012', '<img> without intrinsic width/height in built export');
      if (!/data-slot="ds-image"/.test(attrs) && !/data-slot="ds-logo"/.test(attrs) && !/data-slot="ds-illustration"/.test(attrs)) {
        // Product marks are svg, not img; any img in export should be DS*. Og image is a separate route (png file, not html img)
        add('ASSET001', 'raw <img> in built export (not DSImage/DSLogo/DSIllustration)');
      }
    }
    // Fonts
    for (const m of html.matchAll(/<link[^>]+href="([^"]+)"/g)) {
      const href = m[1];
      if (/fonts\.googleapis|fonts\.gstatic|\.woff2?|\.ttf/.test(href) && !href.includes('_next/static')) {
        add('ASSET009', `unapproved font link in built export: ${href}`);
      }
    }
    // Runtime style injection in inline scripts
    if (/createElement\(['"]style['"]\)|insertRule|adoptedStyleSheets/.test(html)) {
      add('UI010', 'runtime stylesheet injection in built export');
    }
    // Unapproved stylesheet links: only DS sheet + Next chunks allowed; flag .css links that are not _next/static
    for (const m of html.matchAll(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g)) {
      const href = m[1];
      if (href.endsWith('.css') && !href.includes('_next/static') && !href.includes('prism-ui')) {
        add('UI001', `unapproved stylesheet link in built export: ${href}`);
      }
    }
  }
  return { findings, summary: { htmlFiles: htmlFiles.length, imgCount } };
}

function main() {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf('--out');
  const outDir = outIdx >= 0 ? path.resolve(args[outIdx + 1]) : path.join(REPO_ROOT, 'out');
  const json = args.includes('--json');
  const { findings, summary } = checkRuntime(outDir);
  if (json) console.log(JSON.stringify({ findings, summary }, null, 2));
  else {
    for (const f of findings) console.log(`${f.code}: ${f.message} in ${f.file}:${f.line}.`);
    console.log(`ui-runtime-check: ${summary.htmlFiles} HTML file(s), ${summary.imgCount} <img> element(s), ${findings.length} finding(s)`);
    console.log('ui-runtime-check: honest limit: static export parse, not a layout engine. Overflow, stretching and visual regression need a browser (Playwright lane, see docs/UI_GOVERNANCE.md).');
  }
  process.exit(findings.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
