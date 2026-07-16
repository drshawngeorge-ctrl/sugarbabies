import { describe, it, expect } from 'vitest';
import { estimatePercentile } from '../src/lib/percentiles';
import { classifyGrowth } from '../src/lib/classify';
import { REF } from '../src/lib/ref';

describe('Percentile calculations and classification', () => {
  it('term male 40wk 3613g is p50 and AGA', () => {
    const { pct, outOfRange } = estimatePercentile(3613, 40, 0, 'male' as any);
    expect(outOfRange).toBe(false);
    expect(REF.male[40].p50).toBe(3613);
    expect(Math.abs(pct - 50)).toBeLessThan(1e-6);
    expect(classifyGrowth(pct)).toBe('AGA');
  });

  it('SGA threshold under 10th percentile', () => {
    const { pct } = estimatePercentile(2950, 40, 0, 'male' as any);
    expect(pct).toBeLessThan(10);
    expect(classifyGrowth(pct)).toBe('SGA');
  });

  it('LGA above 90th percentile', () => {
    const { pct } = estimatePercentile(4300, 40, 0, 'male' as any);
    expect(pct).toBeGreaterThan(90);
    expect(classifyGrowth(pct)).toBe('LGA');
  });

  it('interpolates by days between weeks', () => {
    const a = estimatePercentile(REF.male[39].p50, 39, 0, 'male' as any);
    const b = estimatePercentile(REF.male[40].p50, 40, 0, 'male' as any);
    const mid = estimatePercentile((REF.male[39].p50 + REF.male[40].p50) / 2, 39, 3, 'male' as any);
    expect(mid.pct).toBeGreaterThan(0);
  });
});
