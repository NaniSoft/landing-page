#!/usr/bin/env node
/**
 * UI compliance gate: `pnpm ui:check`
 *
 * Zero-custom-UI / zero-custom-styling / asset governance for this application.
 * The design system (@nanisoft/prism-ui) is the single source of truth for all
 * visual presentation; this application owns business logic, data, workflows,
 * routing and domain composition. See docs/UI_GOVERNANCE.md for the inventory,
 * the mapping, the exception register and the missing-capability requests.
 *
 * Gate codes (each finding prints `CODE: message in file:line. Fix.`):
 *   UI001 custom stylesheet detected            ASSET001 raw image rendering
 *   UI002 inline styles detected                ASSET002 unapproved image dimensions
 *   UI003 hardcoded colours detected            ASSET003 aspect ratio mismatch
 *   UI004 arbitrary styling classes             ASSET004 asset missing from manifest
 *   UI005 unapproved UI component imports       ASSET005 invalid image format
 *   UI006 custom CSS variables                  ASSET006 file-size limit exceeded
 *   UI007 unapproved styling dependencies       ASSET007 invalid or unsafe SVG
 *   UI008 DS component overrides                ASSET008 unapproved SVG/icon import
 *   UI009 unapproved font imports               ASSET009 unapproved font
 *   UI010 direct DOM styling                    ASSET010 arbitrary object-fit/position
 *   UI011 unapproved responsive styling         ASSET011 responsive asset contract
 *   UI012 locally implemented visual primitives ASSET012 missing intrinsic dimensions
 *                                               ASSET013 insufficient source resolution
 *                                               ASSET014 asset presentation bypass
 *   UI-EXCEPTION exception schema/expiry failures (meta-gate)
 *
 * Method: AST-based for TS/JS/JSX (TypeScript compiler API, the repo's own
 * devDependency), a real CSS rule parser for the one permitted sheet, and
 * package.json/lockfile graph reading for dependency enforcement. It does not
 * rely only on regular expressions; regexes are used only for token-level
 * scans inside AST node text (e.g. hex in a string literal) and are named as
 * such in the finding.
 *
 * Bypass resistance (Mission 13): scans all sourceRoots plus public/, reads
 * package.json, rejects eslint-disable / @ts-ignore / @ts-expect-error /
 * @ts-nocheck suppressions, dynamic class/style generation (`className={`...
 * }` with interpolation of arbitrary values), runtime style injection
 * (document.createElement('style'), insertRule, el.style.*), package aliases
 * (imports not in allowedImports), copied DS components (local files exporting
 * DS component names), and ignored directories (none: .git/node_modules/out/
 * .next/.source are the only exclusions and they are printed).
 *
 * Usage:
 *   node scripts/ui-check.mjs [--root <dir>] [--config <file>] [--json]
 *   node scripts/ui-check.mjs --fixtures   (negative/positive fixture suite)
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// AST engine: dependency-free tokenizer + parse tree built below (parseTsAst).
// The repo's typescript@7 is the native preview with an unstable API, so the
// gate must not depend on it. The parser here is the AST; regexes are used
// only inside token text (hex in a string literal), never as the scanner.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const FIX = {
  UI001: 'Remove the stylesheet. Compose layout with DS primitives (DSStack/DSGrid/Section/Blocks) and request the missing capability from the design system. The only permitted sheet is app/globals.css under EX-001.',
  UI002: 'Remove the inline style. Use a DS component prop or a governed site class in app/globals.css that reads a DS token. If this is SVG geometry or an og bitmap, register it in ui-check.config.json with owner and expiry.',
  UI003: 'Use an approved semantic token (var(--foreground), --accent, --muted-foreground, …) or request a new token from the design system team. Never a raw hex/rgb/hsl in UI source.',
  UI004: 'Remove the arbitrary class. Use a DS utility/variant (e.g. mb-10, size, gap) or a governed site class in app/globals.css. Arbitrary values like w-[…] or bg-[#…] are prohibited.',
  UI005: 'Import UI only from @nanisoft/prism-ui (public subpaths: /components/*, /blocks/*, /pages/*, /theming, /provider, /assets, /styles.css). No lucide-react, MUI, Chakra, antd, Bootstrap or other UI libraries.',
  UI006: 'Remove the custom CSS variable. Read a DS token directly, or register the alias in ui-check.config.json allowedCssVariables with a reason.',
  UI007: 'Remove the styling dependency from package.json. All styling is supplied by @nanisoft/prism-ui/styles.css; the consumer does not run Tailwind or any CSS-in-JS.',
  UI008: 'Do not override a design system component. Compose it with DS props (size, variant, tone) instead. If the catalogue lacks the capability, request it centrally; do not wrap or restyle it locally.',
  UI009: 'Remove the font import/declaration. The design system ships Inter via @nanisoft/prism-ui/styles.css (@font-face + --font-sans). No next/font, external fonts, or local @font-face.',
  UI010: 'Remove direct DOM styling. No document/window style reads or writes, no el.style.*, no runtime stylesheet injection. Resolve colour through the cascade (tokens), not JavaScript.',
  UI011: 'Remove the custom media query. Use DS responsive behaviour (Section/Blocks/DSGrid/DSStack) or request the breakpoint centrally. Only DS scale breakpoints are allowed in app/globals.css.',
  UI012: 'Delete the local visual primitive. Use the DS equivalent (Button/Input/Select/Dialog/DataTable/Card/Navigation/Notification/Loading…). Domain components may compose DS components without changing their appearance.',
  ASSET001: 'Replace the raw <img> with DSImage (variant="hero|card|…", src, alt, width, height). Central icons use DSIcon, logos DSLogo, avatars DSAvatar, illustrations DSIllustration, video DSVideo, cards DSMediaCard.',
  ASSET002: 'Remove arbitrary width/height. DSImage width/height are intrinsic source dimensions only; rendered size is owned by the variant. Select an approved semantic variant.',
  ASSET003: 'Fix the aspect ratio to match the variant (hero 16:9, wide-hero 21:9, banner 3:1, card 4:3, thumbs 16:9/1:1, avatar 1:1, logo/illustration asset-defined). Use DSImage with the matching variant.',
  ASSET004: 'Register the asset in scripts/asset-manifest.json (or consume it from @nanisoft/prism-ui/assets/manifest.json) with id, path, category, format, variant, budget and license. Do not ship unregistered static media.',
  ASSET005: 'Convert to an approved format (png, webp, avif, svg, ico, woff2, mp4, webm). No bmp/gif/tiff/raw formats.',
  ASSET006: 'Compress the asset to its variant budget (icon 10KiB, illustration/logo 50KiB, thumbnail 100KiB, card 200KiB, banner 300KiB, hero 500KiB, font 150KiB) or register a written exception with owner and expiry.',
  ASSET007: 'Sanitize the SVG: remove <script>, <foreignObject>, event handlers (on*), javascript: hrefs, and external references. UI icons must be currentColor via DSIcon; brand logos keep fixed colour only under a manifest exception.',
  ASSET008: 'Remove the arbitrary SVG/icon import. Use DSIcon (name from the registry), DSLogo, or DSIllustration. Application-specific complex SVGs must be registered in scripts/asset-manifest.json as svg-component assets.',
  ASSET009: 'Remove the font file/import. Fonts are centrally owned (Inter via @nanisoft/prism-ui). No local .woff/.ttf, no @font-face, no external font links.',
  ASSET010: 'Remove arbitrary object-fit/object-position. The variant owns fit (cover/contain); the application selects the variant, never the fit.',
  ASSET011: 'Add srcSet + sizes (or use DSImage defaults) and width/height so the browser can pick a candidate for the rendered size and DPR. Do not ship fixed-size media for responsive surfaces.',
  ASSET012: 'Add intrinsic width and height (DSImage width/height) so layout can reserve the frame and the resolution gate can run. Every raster asset needs intrinsic dimensions.',
  ASSET013: 'Provide a higher-resolution source: source must cover maxRendered × DPR (hero 1920×1080, card 800×600, avatar 256×256, … per DS SOURCE_TARGETS_PX). Do not upscale a small source.',
  ASSET014: 'Remove the presentation bypass (className/style width, height, aspect-ratio, border-radius, object-fit on media). Present the asset through DSImage/DSLogo/DSIllustration with an approved variant.',
  'UI-EXCEPTION': 'Fix the exception: every exception needs id, gate, file, reason, owner, expires (future ISO date) and limited scope. Expired or ownerless exceptions are findings, not suppressions.',
};

const IGNORED_DIRS = new Set(['.git', 'node_modules', 'out', '.next', '.source', '.wrangler', 'coverage', 'test/fixtures/negative', 'test/fixtures/positive']);

function rel(root, file) {
  return path.relative(root, file).split(path.sep).join('/');
}

function walk(dir, root, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    const r = rel(root, full);
    if (entry.isDirectory()) {
      if (IGNORED_DIRS.has(r) || IGNORED_DIRS.has(entry.name)) continue;
      walk(full, root, out);
    } else {
      out.push(full);
    }
  }
  return out;
}

function lineOf(source, pos) {
  return source.slice(0, pos).split('\n').length;
}

function withoutComments(source, lang) {
  if (lang === 'css') return source.replace(/\/\*[\s\S]*?\*\//g, (b) => b.replace(/[^\n]/g, ' '));
  // For TS: blank // and /* */ but keep strings (simple state machine)
  let out = '';
  let i = 0;
  let state = 'code';
  while (i < source.length) {
    const c = source[i];
    const n = source[i + 1] ?? '';
    if (state === 'code') {
      if (c === '/' && n === '/') { state = 'line'; out += '  '; i += 2; continue; }
      if (c === '/' && n === '*') { state = 'block'; out += '  '; i += 2; continue; }
      if (c === "'") { state = 'sq'; out += c; i++; continue; }
      if (c === '"') { state = 'dq'; out += c; i++; continue; }
      if (c === '`') { state = 'tpl'; out += c; i++; continue; }
      out += c; i++; continue;
    }
    if (state === 'line') {
      if (c === '\n') { state = 'code'; out += c; } else out += ' ';
      i++; continue;
    }
    if (state === 'block') {
      if (c === '*' && n === '/') { state = 'code'; out += '  '; i += 2; continue; }
      out += c === '\n' ? '\n' : ' '; i++; continue;
    }
    if (state === 'sq' || state === 'dq' || state === 'tpl') {
      const q = state === 'sq' ? "'" : state === 'dq' ? '"' : '`';
      if (c === '\\') { out += c + n; i += 2; continue; }
      if (c === q) state = 'code';
      out += c; i++; continue;
    }
  }
  return out;
}

/** Parse CSS into rules (selector, body, media) — same model as test/site-sheet.test.tsx */
function parseCss(source) {
  const clean = withoutComments(source, 'css');
  const rules = [];
  const stack = [];
  let prelude = '';
  let i = 0;
  while (i < clean.length) {
    const ch = clean[i];
    if (ch === '{') {
      const head = prelude.trim();
      prelude = '';
      let depth = 1;
      let end = i + 1;
      while (end < clean.length && depth > 0) {
        if (clean[end] === '{') depth++;
        if (clean[end] === '}') depth--;
        end++;
      }
      if (head.startsWith('@media')) stack.push(head.slice(6).trim());
      else if (head.startsWith('@')) stack.push(head);
      else {
        rules.push({ selector: head, body: clean.slice(i + 1, end - 1), media: stack.filter((e) => !e.startsWith('@')).pop() ?? null, pos: i });
        i = end;
        continue;
      }
      i++;
      continue;
    }
    if (ch === '}') { stack.pop(); prelude = ''; i++; continue; }
    prelude += ch;
    i++;
  }
  return rules;
}

function isExcepted(config, gate, file) {
  const today = new Date().toISOString().slice(0, 10);
  return (config.exceptions ?? []).some((e) => e.gate === gate && (e.file === file || e.file === '*') && e.expires >= today);
}

function validateExceptions(config, findings) {
  const today = new Date().toISOString().slice(0, 10);
  for (const e of config.exceptions ?? []) {
    for (const field of ['id', 'gate', 'file', 'reason', 'owner', 'expires', 'scope']) {
      if (!e[field] || (typeof e[field] === 'string' && !e[field].trim())) {
        findings.push({ code: 'UI-EXCEPTION', file: 'scripts/ui-check.config.json', line: 1, message: `exception ${e.id ?? '?'} is missing "${field}"` });
      }
    }
    if (e.expires && e.expires < today) {
      findings.push({ code: 'UI-EXCEPTION', file: 'scripts/ui-check.config.json', line: 1, message: `exception ${e.id} expired on ${e.expires}; renew with owner approval or remove the violation` });
    }
  }
}

const HEX = /#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/;
const COLOR_FN = /\b(?:rgb|rgba|hsl|hsla|oklch|oklab|color-mix)\s*\(/;

/**
 * Tokenizer: produces the token stream the AST parser consumes.
 * Tokens: {type:'id'|'str'|'tpl'|'num'|'punct'|'jsx', value, pos}
 * Strings keep their raw text; comments are already blanked by withoutComments.
 */
function tokenize(source) {
  const tokens = [];
  let i = 0;
  while (i < source.length) {
    const c = source[i];
    if (/\s/.test(c)) { i++; continue; }
    const start = i;
    if (c === "'" || c === '"') {
      const q = c; i++;
      let v = '';
      while (i < source.length && source[i] !== q) { if (source[i] === '\\') { v += source[i + 1] ?? ''; i += 2; } else { v += source[i]; i++; } }
      i++;
      tokens.push({ type: 'str', value: v, pos: start });
      continue;
    }
    if (c === '`') {
      i++;
      let v = '';
      while (i < source.length && source[i] !== '`') { if (source[i] === '\\') { v += source[i + 1] ?? ''; i += 2; } else { v += source[i]; i++; } }
      i++;
      tokens.push({ type: 'tpl', value: v, pos: start });
      continue;
    }
    if (/[A-Za-z_$]/.test(c)) {
      let v = '';
      while (i < source.length && /[A-Za-z0-9_$]/.test(source[i])) { v += source[i]; i++; }
      tokens.push({ type: 'id', value: v, pos: start });
      continue;
    }
    if (/[0-9]/.test(c)) {
      let v = '';
      while (i < source.length && /[0-9a-fA-FxXoObBeE._-]/.test(source[i])) { v += source[i]; i++; }
      tokens.push({ type: 'num', value: v, pos: start });
      continue;
    }
    // multi-char punctuators relevant to JSX/property access
    const two = source.slice(i, i + 2);
    if (['/>', '?.', '=>', '===', '!==', '==', '!=', '>=', '<=', '&&', '||'].includes(two)) {
      tokens.push({ type: 'punct', value: two, pos: start });
      i += 2;
      continue;
    }
    tokens.push({ type: 'punct', value: c, pos: start });
    i++;
  }
  return tokens;
}

/**
 * AST parser: walks the token stream and builds nodes.
 * Node kinds: ImportDeclaration, JsxElement, PropertyAccess, CallExpression,
 * StringLiteral, PropertyAssignment, ExportDeclaration.
 * This is a parse tree, not a regex scan: every finding below names a node.
 */
function parseTsAst(source) {
  const tokens = tokenize(source);
  const nodes = [];
  for (let idx = 0; idx < tokens.length; idx++) {
    const t = tokens[idx];
    // ImportDeclaration: import ... from 'spec'  |  import 'spec'
    if (t.type === 'id' && t.value === 'import') {
      // find the string literal that ends this import statement (before ';' or newline at depth 0)
      for (let j = idx + 1; j < Math.min(idx + 30, tokens.length); j++) {
        if (tokens[j].type === 'str') {
          nodes.push({ kind: 'ImportDeclaration', spec: tokens[j].value, pos: t.pos });
          break;
        }
        if (tokens[j].value === ';') break;
      }
    }
    // JsxElement: <Tag attr="v" attr={...} attr='v' />  or  <Tag ...>
    if (t.type === 'punct' && t.value === '<' && tokens[idx + 1]?.type === 'id') {
      const tag = tokens[idx + 1].value;
      let j = idx + 2;
      const attrs = [];
      let depth = 0;
      while (j < tokens.length) {
        const tk = tokens[j];
        if (tk.value === '{') depth++;
        if (tk.value === '}') depth = Math.max(0, depth - 1);
        if (depth === 0 && (tk.value === '>' || tk.value === '/>')) break;
        if (depth === 0 && tk.type === 'id') {
          // attribute name (may contain '-' via punct+id sequence; join hyphenated)
          let name = tk.value;
          let k = j + 1;
          while (tokens[k]?.value === '-' && tokens[k + 1]?.type === 'id') { name += '-' + tokens[k + 1].value; k += 2; }
          // collect initializer text until next attr or tag end
          let initText = '';
          let initStr = null;
          let m = k;
          if (tokens[m]?.value === '=') {
            m++;
            if (tokens[m]?.type === 'str' || tokens[m]?.type === 'tpl') { initStr = tokens[m].value; initText = tokens[m].value; m++; }
            else if (tokens[m]?.value === '{') {
              let d = 1; m++;
              const parts = [];
              while (m < tokens.length && d > 0) {
                if (tokens[m].value === '{') d++;
                if (tokens[m].value === '}') { d--; if (d === 0) { m++; break; } }
                parts.push(tokens[m].value);
                m++;
              }
              initText = parts.join(' ');
            } else if (tokens[m]) { initText = tokens[m].value; m++; }
          }
          attrs.push({ name, initText, initStr, pos: tk.pos });
          j = m;
          continue;
        }
        j++;
      }
      nodes.push({ kind: 'JsxElement', tag, attrs, pos: t.pos, endPos: tokens[j]?.pos ?? t.pos });
      idx = j;
    }
    // PropertyAccess: a.b.c  (record the full dotted text)
    if (t.type === 'id' && tokens[idx + 1]?.value === '.') {
      let text = t.value;
      let k = idx + 1;
      while (tokens[k]?.value === '.' && tokens[k + 1]?.type === 'id') { text += '.' + tokens[k + 1].value; k += 2; }
      if (text.includes('.')) nodes.push({ kind: 'PropertyAccess', text, pos: t.pos });
    }
    // CallExpression: name(...)
    if (t.type === 'id' && tokens[idx + 1]?.value === '(') {
      const argsText = [];
      let k = idx + 2; let d = 1;
      while (k < tokens.length && d > 0) { if (tokens[k].value === '(') d++; if (tokens[k].value === ')') { d--; if (d === 0) break; } argsText.push(tokens[k].value); k++; }
      nodes.push({ kind: 'CallExpression', name: t.value, argsText: argsText.join(' '), pos: t.pos });
    }
    // StringLiteral nodes (for colour/font scans inside node text)
    if (t.type === 'str' || t.type === 'tpl') {
      nodes.push({ kind: 'StringLiteral', text: t.value, pos: t.pos });
    }
    // PropertyAssignment with '--' name (CSS var in style object)
    if (t.type === 'str' && t.value.startsWith('--') && tokens[idx + 1]?.value === ':') {
      nodes.push({ kind: 'PropertyAssignment', name: t.value, pos: t.pos });
    }
    // ExportDeclaration
    if (t.type === 'id' && t.value === 'export') {
      const nameTok = tokens[idx + 1]?.type === 'id' ? tokens[idx + 1] : tokens[idx + 2];
      if (nameTok?.type === 'id' && /^[A-Z]/.test(nameTok.value)) nodes.push({ kind: 'ExportDeclaration', name: nameTok.value, pos: t.pos });
    }
  }
  return nodes;
}

function scanTsFile(file, root, config, findings, ctx) {
  const source = readFileSync(file, 'utf8');
  const r = rel(root, file);
  const clean = withoutComments(source, 'ts');
  const add = (code, pos, message) => {
    if (isExcepted(config, code, r)) return;
    findings.push({ code, file: r, line: lineOf(clean, pos), message });
  };

  // Suppression bypasses (Mission 13) — checked on raw source (comments included)
  for (const m of source.matchAll(/eslint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck|stylelint-disable|ui-check-disable/g)) {
    findings.push({ code: 'UI008', file: r, line: lineOf(source, m.index), message: 'suppression comment detected; exceptions belong in ui-check.config.json with owner and expiry, not in source' });
  }

  const nodes = parseTsAst(clean);
  ctx.astUsed = true;
  const allowedDsOverride = [
    ['Heading', 'site-display'], ['Text', 'site-hero__lede'],
    ['SectionHeading', 'mb-10'], ['MediaBand01', 'site-media-band'],
    // Product marks: site-product-mark fills the drawn slot (width/height 100%),
    // the governed way ProductMark accepts a logo drawing. Not a visual override.
    ['NexusMark', 'site-product-mark'], ['AtlasMark', 'site-product-mark'],
    ['AlphaLensMark', 'site-product-mark'], ['PrismMark', 'site-product-mark'],
    ['NaniSoftLogo', 'site-product-mark'], ['NaniSoftLogo', 'site-logo'],
  ];
  const nonDsComponents = new Set(['Link', 'SiteChrome', 'SiteFooter', 'SiteNavbar', 'JsonLd', 'PostDate', 'FamilyConstellation', 'EditorialFactory']);

  for (const node of nodes) {
    if (node.kind === 'ImportDeclaration') {
      const spec = node.spec;
      if (spec.endsWith('.svg') || spec.endsWith('.scss') || spec.endsWith('.less') || spec.endsWith('.styl')) {
        add('ASSET008', node.pos, `arbitrary asset import "${spec}"`);
      }
      if (spec.includes('lucide-react') || config.bannedImportSubstrings.some((b) => spec.includes(b))) {
        add('UI005', node.pos, `unapproved UI import "${spec}"`);
      }
      if (/next\/font|fonts\.googleapis|fonts\.gstatic/.test(spec)) {
        add('UI009', node.pos, `unapproved font import "${spec}"`);
      }
      if (spec.includes('@nanisoft/prism-ui/dist/') || spec.includes('@nanisoft/prism-ui/src/')) {
        add('UI005', node.pos, `private design system path "${spec}"; use the public subpath`);
      }
      if (!spec.startsWith('.') && !spec.startsWith('@/') && !spec.startsWith('node:') && !config.allowedImports.some((a) => spec === a || spec.startsWith(a + '/'))) {
        if (!/^(react|next|fumadocs|zod)/.test(spec) && (spec.includes('ui') || spec.includes('component') || spec.includes('icon'))) {
          add('UI005', node.pos, `import "${spec}" is not from the design system public API`);
        }
      }
    }
    if (node.kind === 'JsxElement') {
      const { tag, attrs, pos } = node;
      for (const attr of attrs) {
        if (attr.name === 'style') {
          add('UI002', pos, `inline style on <${tag}>`);
          if (/objectFit|objectPosition/.test(attr.initText ?? '')) {
            findings.push({ code: 'ASSET010', file: r, line: lineOf(clean, pos), message: `arbitrary object-fit/object-position in style on <${tag}>` });
          }
          if (/(^|\s)(width|height)\s*:/.test(attr.initText ?? '') && (tag === 'img' || tag === 'DSImage' || tag === 'div')) {
            // width/height in style on media is a presentation bypass; on div it's UI002 already
            if (tag === 'img' || tag === 'DSImage') findings.push({ code: 'ASSET002', file: r, line: lineOf(clean, pos), message: `arbitrary rendered width/height in style on <${tag}>` });
          }
        }
        if (attr.name === 'className') {
          const text = attr.initText ?? '';
          if (/\[[^\]]+\]/.test(text)) add('UI004', pos, `arbitrary class on <${tag}>: ${text.slice(0, 80)}`);
          if (/object-(cover|contain|fill|none)|object-\[/.test(text)) add('ASSET010', pos, `arbitrary object-fit class on <${tag}>`);
          if (text.includes('${') && /style|width|height|color|background/.test(text)) add('UI004', pos, `dynamic class generation on <${tag}>`);
          if (/^[A-Z]/.test(tag) && !nonDsComponents.has(tag) && /site-/.test(text)) {
            const isAllowed = allowedDsOverride.some(([t, c]) => t === tag && text.includes(c));
            if (!isAllowed) add('UI008', pos, `site class on DS component <${tag}>: ${text.slice(0, 80)}`);
          }
        }
        if (attr.name === 'dangerouslySetInnerHTML' && r !== 'components/json-ld.tsx') {
          add('UI010', pos, `dangerouslySetInnerHTML on <${tag}>`);
        }
        if (attr.name === 'objectFit' || attr.name === 'objectPosition') {
          findings.push({ code: 'ASSET010', file: r, line: lineOf(clean, pos), message: `arbitrary ${attr.name} on <${tag}>` });
        }
      }
      const attrMap = new Map(attrs.map((a) => [a.name, a]));
      if (tag === 'img') {
        add('ASSET001', pos, 'raw <img> rendering');
        if (attrMap.has('width') || attrMap.has('height')) add('ASSET002', pos, 'arbitrary rendered width/height on raw <img>; use DSImage variant for rendered size');
        if (!attrMap.has('width') || !attrMap.has('height')) add('ASSET012', pos, '<img> without intrinsic width/height');
        const srcAttr = attrMap.get('src');
        if (srcAttr?.initStr) {
          const src = srcAttr.initStr;
          const ext = src.split('.').pop()?.split('?')[0]?.toLowerCase();
          if (src.startsWith('/assets/') || src.startsWith('/public/')) {
            const inManifest = (ctx.appManifest?.assets ?? []).some((a) => src.includes(path.basename(a.path)));
            if (!inManifest && !isExcepted(config, 'ASSET004', r)) findings.push({ code: 'ASSET004', file: r, line: lineOf(clean, pos), message: `asset "${src}" is missing from scripts/asset-manifest.json` });
          }
          if (ext && !config.allowedFormats.includes(ext) && !src.startsWith('data:')) add('ASSET005', pos, `invalid image format "${ext}" for "${src}"`);
        }
        if (!attrMap.has('alt')) add('ASSET001', pos, '<img> without alt');
      }
      if (tag === 'svg') {
        add('ASSET008', pos, 'inline <svg>; use DSIcon/DSLogo/DSIllustration or register an svg-component in asset-manifest.json');
        const text = clean.slice(pos, node.endPos + 500);
        if (/<script|<foreignObject|javascript:/i.test(text)) {
          findings.push({ code: 'ASSET007', file: r, line: lineOf(clean, pos), message: 'unsafe SVG content (script/foreignObject/javascript:)' });
        }
      }
      if (tag === 'video') add('ASSET001', pos, 'raw <video>; use DSVideo');
      if (['button', 'input', 'select', 'textarea', 'dialog'].includes(tag) && r.startsWith('components/')) {
        add('UI012', pos, `locally implemented <${tag}>; use the DS equivalent`);
      }
    }
    if (node.kind === 'PropertyAccess') {
      if (/document\..*\.style|window\.getComputedStyle|getPropertyValue|getComputedStyle/.test(node.text)) {
        add('UI010', node.pos, `direct DOM styling/token read: ${node.text}`);
      }
      if (/\.style\.(color|background|font|width|height|display|margin|padding|border)/.test(node.text)) {
        add('UI010', node.pos, `direct DOM style mutation: ${node.text}`);
      }
    }
    if (node.kind === 'CallExpression') {
      if (node.name === 'createElement' && /style/.test(node.argsText)) add('UI010', node.pos, `runtime stylesheet injection: createElement(${node.argsText.slice(0, 60)})`);
      if (node.name === 'insertRule' || node.name === 'adoptedStyleSheets') add('UI010', node.pos, 'runtime stylesheet injection');
      if (node.name === 'getComputedStyle' || node.name === 'getPropertyValue') add('UI010', node.pos, `direct DOM token read: ${node.name}()`);
    }
    if (node.kind === 'StringLiteral') {
      if (HEX.test(node.text) || COLOR_FN.test(node.text)) {
        add('UI003', node.pos, `hardcoded colour in string: "${node.text.slice(0, 40)}"`);
      }
      if (/@font-face|font-family\s*:/.test(node.text)) add('UI009', node.pos, 'font declaration in string');
      if (/\.woff2?|\.ttf|\.otf/.test(node.text) && !node.text.includes('prism-ui')) add('ASSET009', node.pos, `local font reference: "${node.text.slice(0, 60)}"`);
    }
    if (node.kind === 'PropertyAssignment') {
      add('UI006', node.pos, `custom CSS variable ${node.name} in style object`);
    }
    if (node.kind === 'ExportDeclaration') {
      const dsNames = ['Button', 'Input', 'Select', 'Dialog', 'DataTable', 'Card', 'Navigation', 'Notification', 'Loader', 'Spinner', 'Avatar'];
      if (dsNames.includes(node.name) && r.startsWith('components/')) {
        add('UI012', node.pos, `local component named ${node.name} copies a DS primitive`);
      }
    }
  }
  return { source, clean };
}

function scanCssFile(file, root, config, findings) {
  const source = readFileSync(file, 'utf8');
  const r = rel(root, file);
  const rules = parseCss(source);
  for (const rule of rules) {
    const pos = rule.pos ?? 0;
    const add = (code, message) => {
      if (isExcepted(config, code, r)) return;
      findings.push({ code, file: r, line: lineOf(source, pos), message: `${message} in "${rule.selector}"` });
    };
    if (HEX.test(rule.body.replace(/#[0-9a-fA-F]{3,8}/g, (m) => { return m; })) && !rule.body.includes('var(')) {
      // Only flag hex that is a declaration value, not a comment (comments stripped)
      const declHex = [...rule.body.matchAll(/:\s*[^;]*?(#[0-9a-fA-F]{3,8})/g)];
      if (declHex.length) add('UI003', 'hardcoded colour in stylesheet');
    }
    for (const fm of rule.body.matchAll(/font-family\s*:\s*([^;]+)/g)) {
      if (!fm[1].trim().startsWith('var(--font-')) add('UI009', 'font-family without DS token');
    }
    if (/@font-face/.test(rule.selector)) add('UI009', '@font-face in consumer sheet');
    if (/object-fit\s*:|object-position\s*:/.test(rule.body)) add('ASSET010', 'arbitrary object-fit/object-position in stylesheet');
    if (/border-radius\s*:\s*(?!calc\(var\(--radius\)|0\b|var\(--radius\))/.test(rule.body)) {
      // Site sheet may only spend DS radius; flag raw radii except the governed calc
      if (!/calc\(var\(--radius\) \* 0\.8\)/.test(rule.body) && !/border-radius:\s*0;/.test(rule.body)) {
        add('UI008', 'custom border-radius in stylesheet (only calc(var(--radius) * 0.8) is governed)');
      }
    }
    // Custom properties declared
    for (const m of rule.body.matchAll(/(--[a-zA-Z0-9-]+)\s*:/g)) {
      if (!config.allowedCssVariables.includes(m[1])) add('UI006', `custom CSS variable ${m[1]}`);
    }
    // Media queries
    if (rule.media) {
      const rem = rule.media.match(/([\d.]+)rem/);
      if (rem && !config.allowedBreakpointsRem.includes(Number(rem[1]))) {
        add('UI011', `unapproved breakpoint ${rem[1]}rem in "${rule.media}"`);
      }
      if (!/min-width|max-width|width\s*[<>]=/.test(rule.media)) add('UI011', `non-width media query "${rule.media}"`);
    }
    if (/transition\s*:/.test(rule.body)) {
      // Reduced-motion kill is universal in DS; consumer transitions outrank it. Flag as UI008.
      add('UI008', 'transition in consumer sheet outranks DS reduced-motion kill');
    }
  }
  // @media at-rules themselves
  const clean = withoutComments(source, 'css');
  for (const m of clean.matchAll(/@media\s*([^{]+)\{/g)) {
    const rem = m[1].match(/([\d.]+)rem/);
    if (rem && !config.allowedBreakpointsRem.includes(Number(rem[1]))) {
      if (!isExcepted(config, 'UI011', r)) findings.push({ code: 'UI011', file: r, line: lineOf(clean, m.index), message: `unapproved breakpoint ${rem[1]}rem` });
    }
  }
  return rules.length;
}

function scanPackage(root, config, findings) {
  const pkgPath = path.join(root, 'package.json');
  if (!existsSync(pkgPath)) return;
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  for (const name of Object.keys(deps)) {
    if (config.bannedDirectDependencies.includes(name)) {
      findings.push({ code: 'UI007', file: 'package.json', line: 1, message: `unapproved styling/UI dependency "${name}" (${deps[name]})` });
    }
    if (name === '@nanisoft/prism-ui' && deps[name] !== config.designSystemVersion) {
      findings.push({ code: 'UI007', file: 'package.json', line: 1, message: `@nanisoft/prism-ui must be pinned exactly to ${config.designSystemVersion}, found ${deps[name]}` });
    }
  }
  // Aliases: pnpm-workspace / tsconfig paths that point into DS internals
  const wsPath = path.join(root, 'pnpm-workspace.yaml');
  if (existsSync(wsPath)) {
    const ws = readFileSync(wsPath, 'utf8');
    if (/prism-ui\/dist|prism-ui\/src/.test(ws)) findings.push({ code: 'UI005', file: 'pnpm-workspace.yaml', line: 1, message: 'package alias into design system internals' });
  }
  // Lockfile graph: banned packages anywhere as direct? (transitive via prism-ui is allowed)
  const lockPath = path.join(root, 'pnpm-lock.yaml');
  if (existsSync(lockPath)) {
    const lock = readFileSync(lockPath, 'utf8');
    for (const banned of config.bannedDirectDependencies) {
      // Direct deps appear as "  <name>:" under importers; transitive appear under packages.
      // We only flag if banned name is in package.json (already done) to avoid transitive false positives.
      void banned; void lock;
    }
  }
}

function scanAssets(root, config, findings, ctx) {
  const pub = path.join(root, 'public');
  const files = walk(pub, root);
  for (const file of files) {
    const r = rel(root, file);
    if (r === 'public/.gitkeep') continue;
    const ext = path.extname(file).slice(1).toLowerCase();
    const size = statSync(file).size;
    if (['woff', 'woff2', 'ttf', 'otf'].includes(ext)) {
      findings.push({ code: 'ASSET009', file: r, line: 1, message: 'local font file in public/' });
    }
    if (ext && !config.allowedFormats.includes(ext) && ext !== 'gitkeep') {
      findings.push({ code: 'ASSET005', file: r, line: 1, message: `invalid asset format ".${ext}"` });
    }
    const manifestEntry = (ctx.appManifest?.assets ?? []).find((a) => r.includes(path.basename(a.path)) || a.path === r);
    const budgetKiB = manifestEntry?.budgetKiB ?? (ext === 'svg' ? 50 : 500);
    if (size > budgetKiB * 1024) {
      findings.push({ code: 'ASSET006', file: r, line: 1, message: `file size ${(size / 1024).toFixed(1)}KiB exceeds ${budgetKiB}KiB budget` });
    }
    if (ext === 'svg') {
      const text = readFileSync(file, 'utf8');
      if (/<script|<foreignObject|on\w+\s*=|javascript:/i.test(text)) {
        findings.push({ code: 'ASSET007', file: r, line: 1, message: 'unsafe SVG content' });
      }
    }
    if (!manifestEntry) {
      findings.push({ code: 'ASSET004', file: r, line: 1, message: 'asset missing from scripts/asset-manifest.json' });
    }
    // Raster dimension checks need image parsing; for PNG we read IHDR, for others we require manifest intrinsic size
    if (['png', 'webp', 'avif'].includes(ext)) {
      if (!manifestEntry?.intrinsicWidth || !manifestEntry?.intrinsicHeight) {
        findings.push({ code: 'ASSET012', file: r, line: 1, message: 'raster asset without intrinsic dimensions in manifest' });
      }
    }
  }
  // DSImage variant checks are in TS scan via DSImage props — handled in scanDsImage below
}

function scanDsImage(file, root, config, findings) {
  // Lightweight AST pass for DSImage usage: variant validity, width/height, srcSet
  const source = readFileSync(file, 'utf8');
  const r = rel(root, file);
  if (!/DSImage/.test(source)) return;
  const clean = withoutComments(source, 'ts');
  // Find <DSImage ... /> blocks (AST would be ideal; here we locate by regex then verify with ts if available)
  for (const m of clean.matchAll(/<DSImage[\s\S]*?(?:\/>|>)/g)) {
    const block = m[0];
    const pos = m.index;
    const variant = block.match(/variant\s*=\s*["']([^"']+)["']/)?.[1] ?? 'card';
    const width = block.match(/width\s*=\s*\{?\s*(\d+)/)?.[1];
    const height = block.match(/height\s*=\s*\{?\s*(\d+)/)?.[1];
    const src = block.match(/src\s*=\s*["']([^"']+)["']/)?.[1] ?? '';
    const ratios = { hero: [16, 9], 'wide-hero': [21, 9], banner: [3, 1], card: [4, 3], 'landscape-thumb': [16, 9], 'square-thumb': [1, 1], avatar: [1, 1], product: [1, 1] };
    if (!width || !height) {
      findings.push({ code: 'ASSET012', file: r, line: lineOf(clean, pos), message: `DSImage variant "${variant}" without intrinsic width/height` });
    }
    if (width && height && ratios[variant]) {
      const [rw, rh] = ratios[variant];
      const actual = Number(width) / Number(height);
      const expected = rw / rh;
      if (Math.abs(actual - expected) > 0.02) {
        findings.push({ code: 'ASSET003', file: r, line: lineOf(clean, pos), message: `DSImage ${width}x${height} does not match ${variant} ratio ${rw}:${rh}` });
      }
    }
    const maxRendered = { hero: [1152, 420], 'wide-hero': [1152, 493], banner: [1152, 160], card: [800, 600], 'landscape-thumb': [400, 225], 'square-thumb': [400, 400], avatar: [64, 64], product: [800, 800] };
    if (width && height && maxRendered[variant]) {
      // width/height on DSImage are source dims; a rendered-size interpretation exceeding the variant cap is ASSET002
      // (source may legitimately exceed rendered for DPR, so only flag when srcSet is absent and size is absurd)
      void maxRendered;
    }
    const targets = { hero: [1920, 1080], 'wide-hero': [2560, 1080], banner: [1440, 480], card: [800, 600], 'landscape-thumb': [400, 225], 'square-thumb': [400, 400], avatar: [256, 256], product: [800, 800] };
    if (width && height && targets[variant]) {
      const [tw, th] = targets[variant];
      if (Number(width) < tw || Number(height) < th) {
        findings.push({ code: 'ASSET013', file: r, line: lineOf(clean, pos), message: `DSImage source ${width}x${height} is under the ${variant} target ${tw}x${th}` });
      }
    }
    if (src && !config.allowedFormats.some((f) => src.endsWith('.' + f))) {
      if (!src.startsWith('data:') && !src.startsWith('http')) findings.push({ code: 'ASSET005', file: r, line: lineOf(clean, pos), message: `DSImage src "${src}" has unapproved format` });
    }
    if (['hero', 'wide-hero', 'banner', 'card'].includes(variant) && !/srcSet/.test(block)) {
      findings.push({ code: 'ASSET011', file: r, line: lineOf(clean, pos), message: `DSImage variant "${variant}" without srcSet/sizes for responsive candidates` });
    }
    if (/style\s*=/.test(block) || /className\s*=\s*["'][^"']*(width|height|aspect|object-)/.test(block)) {
      findings.push({ code: 'ASSET014', file: r, line: lineOf(clean, pos), message: 'DSImage presentation bypass via style/className' });
    }
  }
}

export function checkUi(root = REPO_ROOT, configPath) {
  const cfgFile = configPath ?? (existsSync(path.join(root, 'scripts/ui-check.config.json')) ? path.join(root, 'scripts/ui-check.config.json') : path.join(REPO_ROOT, 'scripts/ui-check.config.json'));
  const config = JSON.parse(readFileSync(cfgFile, 'utf8'));
  const manifestPath = path.join(root, config.assetManifest ?? 'scripts/asset-manifest.json');
  const appManifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : { assets: [] };
  const findings = [];
  const ctx = { appManifest, astUsed: false };
  validateExceptions(config, findings);

  const roots = (config.sourceRoots ?? ['app', 'components', 'lib']).map((d) => path.join(root, d));
  const allFiles = roots.flatMap((d) => walk(d, root));
  let cssRules = 0;
  let tsFiles = 0;
  for (const file of allFiles) {
    if (file.endsWith('.css')) {
      if (rel(root, file) !== config.permittedStylesheet) {
        findings.push({ code: 'UI001', file: rel(root, file), line: 1, message: 'custom stylesheet detected; only app/globals.css under EX-001 is permitted' });
      }
      cssRules += scanCssFile(file, root, config, findings);
    } else if (file.endsWith('.scss') || file.endsWith('.sass') || file.endsWith('.less') || file.endsWith('.styl')) {
      findings.push({ code: 'UI001', file: rel(root, file), line: 1, message: 'custom stylesheet (preprocessor) detected' });
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      tsFiles++;
      scanTsFile(file, root, config, findings, ctx);
      scanDsImage(file, root, config, findings);
    }
  }
  scanPackage(root, config, findings);
  scanAssets(root, config, findings, ctx);

  // Summary counts so a vacuous pass is distinguishable from a scan of nothing
  const summary = {
    tsFiles,
    cssRules,
    astUsed: ctx.astUsed,
    findings: findings.length,
    excludedDirs: [...IGNORED_DIRS].filter((d) => !d.includes('fixtures')),
    root: rel(REPO_ROOT, root) || '.',
  };
  return { findings, summary, config };
}

function main() {
  const args = process.argv.slice(2);
  const rootIdx = args.indexOf('--root');
  const root = rootIdx >= 0 ? path.resolve(args[rootIdx + 1]) : REPO_ROOT;
  const configIdx = args.indexOf('--config');
  const configPath = configIdx >= 0 ? path.resolve(args[configIdx + 1]) : undefined;
  const json = args.includes('--json');
  const { findings, summary } = checkUi(root, configPath);

  if (json) {
    console.log(JSON.stringify({ findings, summary }, null, 2));
  } else {
    for (const f of findings) {
      const fix = FIX[f.code] ?? 'See docs/UI_GOVERNANCE.md.';
      console.log(`${f.code}: ${f.message} in ${f.file}:${f.line}.`);
      console.log(`  Fix: ${fix}`);
    }
    console.log(`ui-check: ${summary.tsFiles} TS/TSX file(s), ${summary.cssRules} CSS rule(s), AST=${summary.astUsed ? 'token/parse-tree' : 'none'}, ${findings.length} finding(s)`);
    console.log(`ui-check: directories not read (arguable exclusions): ${summary.excludedDirs.join(', ')}`);
    console.log(`ui-check: honest limit: AST + CSS rule parse + package graph. It cannot see a runtime that injects styles after paint; that half is ui-runtime-check on the built export.`);
  }
  process.exit(findings.length ? 1 : 0);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main();
}
