import { readFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { REF as canonicalREF } from '../src/lib/ref';
import { estimatePercentile as estimateCanonicalPercentile } from '../src/lib/percentiles';

function loadPrototype() {
  const here = path.dirname(fileURLToPath(import.meta.url));
  const html = readFileSync(path.resolve(here, '../docs/original-claude-prototype.html'), 'utf8');
  const match = html.match(/<script>([\s\S]*?)<\/script>\s*<\/body>/);

  if (!match) {
    throw new Error('Could not find prototype script block');
  }

  const ids = [
    'symptomatic', 'persistent', 'nicu', 'metabolic', 'exclusionBanner',
    'mainForm', 'gaWeeks', 'gaDays', 'sex', 'bw', 'diabetes', 'betaBlocker',
    'iugr', 'asphyxia', 'steroids', 'results'
  ] as const;

  const elements = Object.fromEntries(ids.map((id) => [id, {
    checked: false,
    value: '',
    style: {},
    innerHTML: '',
    addEventListener() {}
  }]));

  const sandbox = {
    document: {
      getElementById: (id: string) => elements[id as keyof typeof elements],
      querySelectorAll: () => ({ forEach: (callback: (element: { addEventListener: () => void }) => void) => Object.values(elements).forEach(callback) })
    },
    globalThis: {}
  };

  vm.runInNewContext(`${match[1]}\nglobalThis.__prototype__ = { REF, estimatePercentile, computeAll };`, sandbox);

  return {
    ...((sandbox.globalThis as { __prototype__: { REF: typeof canonicalREF; estimatePercentile: typeof estimateCanonicalPercentile; computeAll: () => void } }).__prototype__),
    elements
  };
}

describe('published standalone prototype parity', () => {
  it('uses the same official BWGA table as the canonical app for both sexes and weeks 22-43', () => {
    const { REF } = loadPrototype();
    expect(REF).toEqual(canonicalREF);
  });

  it('matches the canonical female 37+1 2310 g regression and classifies SGA', () => {
    const { estimatePercentile } = loadPrototype();
    const prototypeResult = estimatePercentile(2310, 37, 1, 'female');
    const canonicalResult = estimateCanonicalPercentile(2310, 37, 1, 'female');

    expect(prototypeResult).toEqual(canonicalResult);
    expect(prototypeResult.outOfRange).toBe(false);
    expect(prototypeResult.classification).toBe('SGA');
    expect(prototypeResult.pct).not.toBeNull();
    expect(prototypeResult.pct as number).toBeLessThan(5);
  });

  it('keeps exact p3 and p97 values in range rather than marking them outside the table', () => {
    const { estimatePercentile } = loadPrototype();

    expect(estimatePercentile(canonicalREF.female[37].p3, 37, 0, 'female')).toMatchObject({
      pct: 3,
      classification: 'SGA',
      outOfRange: false
    });

    expect(estimatePercentile(canonicalREF.female[37].p97, 37, 0, 'female')).toMatchObject({
      pct: 97,
      classification: 'LGA',
      outOfRange: false
    });
  });

  it('renders the standalone prototype result as SGA for female 37+1 weeks and 2310 g', () => {
    const { computeAll, elements } = loadPrototype();

    elements.gaWeeks.value = '37';
    elements.gaDays.value = '1';
    elements.sex.value = 'female';
    elements.bw.value = '2310';
    elements.diabetes.value = 'none';

    computeAll();

    expect(elements.results.innerHTML).toContain('Glucose surveillance indicated');
    expect(elements.results.innerHTML).toContain('SGA');
    expect(elements.results.innerHTML).not.toContain('10.9th percentile');
  });
});
