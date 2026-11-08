import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, writeFileSync, rmSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Negative/positive fixtures for `pnpm ui:check` (Mission 16).
 *
 * Each directory under test/fixtures/ui-check/negative/<gate>/ is a
 * deliberate violation that must fail with its gate code. The positive/
 * fixture is approved DS composition that must pass with zero findings.
 * The checker is run as a child process against each fixture root with
 * the no-exceptions config, so an exception in the real config cannot
 * mask a fixture failure (and vice versa).
 */
const ROOT = path.resolve(__dirname, '..');
const FIXTURES = path.join(ROOT, 'test', 'fixtures', 'ui-check');
const NEGATIVE = path.join(FIXTURES, 'negative');
const CONFIG = path.join(FIXTURES, 'config.json');
const CHECKER = path.join(ROOT, 'scripts', 'ui-check.mjs');

function runChecker(root: string): { code: number; output: string } {
  try {
    const output = execFileSync('node', [CHECKER, '--root', root, '--config', CONFIG, '--json'], {
      encoding: 'utf8',
      cwd: ROOT,
    });
    return { code: 0, output };
  } catch (error) {
    const err = error as { status?: number; stdout?: string };
    return { code: err.status ?? 1, output: err.stdout ?? '' };
  }
}

function codes(output: string): string[] {
  try {
    const parsed = JSON.parse(output) as { findings: Array<{ code: string }> };
    return parsed.findings.map((f) => f.code);
  } catch {
    return [];
  }
}

const EXPECTED: Record<string, string> = {
  'ui001-custom-css': 'UI001',
  'ui002-inline-style': 'UI002',
  'ui003-hardcoded-colour': 'UI003',
  'ui004-arbitrary-class': 'UI004',
  'ui005-unapproved-import': 'UI005',
  'ui005b-private-path': 'UI005',
  'ui006-custom-var': 'UI006',
  'ui007-bad-dep': 'UI007',
  'ui007b-unpinned': 'UI007',
  'ui008-ds-override': 'UI008',
  'ui009-font-import': 'UI009',
  'ui009b-font-css': 'UI009',
  'ui010-dom-styling': 'UI010',
  'ui010b-token-read': 'UI010',
  'ui011-media-query': 'UI011',
  'ui012-local-primitive': 'UI012',
  'ui012b-raw-button': 'UI012',
  'asset001-raw-img': 'ASSET001',
  'asset002-raw-dims': 'UI002',
  'asset003-ratio': 'ASSET003',
  'asset004-missing-manifest': 'ASSET004',
  'asset005-format': 'ASSET005',
  'asset007-unsafe-svg': 'ASSET007',
  'asset008-svg-import': 'ASSET008',
  'asset008b-inline-svg': 'ASSET008',
  'asset009-font': 'ASSET009',
  'asset010-objectfit': 'ASSET010',
  'asset011-srcset': 'ASSET011',
  'asset012-missing-dims': 'ASSET012',
  'asset013-resolution': 'ASSET013',
  'asset014-bypass': 'ASSET014',
  suppression: 'UI008',
};

describe('ui:check negative fixtures', () => {
  const dirs = existsSync(NEGATIVE)
    ? readdirSync(NEGATIVE, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
    : [];
  it('covers every gate in the fixture map', () => {
    for (const name of dirs) {
      expect(EXPECTED[name], `fixture ${name} has no expected gate`).toBeTruthy();
    }
  });
  it.each(dirs)('%s fails with its gate code', (name) => {
    const { code, output } = runChecker(path.join(NEGATIVE, name));
    expect(code, `${name} should fail ui:check`).not.toBe(0);
    expect(codes(output), `${name} findings`).toContain(EXPECTED[name]);
  });

  it('asset006: an oversized asset fails with ASSET006 (generated at runtime, not committed)', () => {
    const tmp = path.join(ROOT, 'test', 'fixtures', 'ui-check', 'negative', '__tmp-asset006');
    const pub = path.join(tmp, 'public', 'assets');
    mkdirSync(pub, { recursive: true });
    writeFileSync(path.join(pub, 'big.png'), Buffer.alloc(600 * 1024));
    try {
      const { code, output } = runChecker(tmp);
      expect(code).not.toBe(0);
      expect(codes(output)).toContain('ASSET006');
    } finally {
      rmSync(tmp, { recursive: true, force: true });
    }
  });
});

describe('ui:check positive fixture', () => {
  it('approved DS composition passes with zero findings', () => {
    const { code, output } = runChecker(path.join(FIXTURES, 'positive'));
    expect(code, output).toBe(0);
    expect(codes(output)).toEqual([]);
  });
});

describe('ui:check on this repository', () => {
  it('passes with the governed exceptions (scripts/ui-check.config.json)', () => {
    const output = execFileSync('node', [CHECKER, '--json'], { encoding: 'utf8', cwd: ROOT });
    const parsed = JSON.parse(output) as { findings: unknown[]; summary: { tsFiles: number; cssRules: number; astUsed: boolean } };
    expect(parsed.findings).toEqual([]);
    // Not a vacuous pass: files and rules were actually read.
    expect(parsed.summary.tsFiles).toBeGreaterThan(10);
    expect(parsed.summary.cssRules).toBeGreaterThan(10);
    expect(parsed.summary.astUsed).toBe(true);
  });
});
