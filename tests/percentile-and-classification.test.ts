import { describe, it, expect } from 'vitest';
import { estimatePercentile } from '../src/lib/percentiles';
import { classifyGrowth } from '../src/lib/classify';
import { REF } from '../src/lib/ref';

describe('Percentile calculations and classification', () => {
  it('term male 40wk 3613g is p50 and AGA', () => {
    const result = estimatePercentile(3613, 40, 0, 'male' as any);
    expect(result.outOfRange).toBe(false);
    expect(result.pct).not.toBeNull();
    expect(REF.male[40].p50).toBe(3613);
    expect(Math.abs((result.pct as number) - 50)).toBeLessThan(1e-6);
    expect(classifyGrowth(result)).toBe('AGA');
  });

  it('SGA threshold under 10th percentile', () => {
    const result = estimatePercentile(2950, 40, 0, 'male' as any);
    expect(result.pct).not.toBeNull();
    expect(result.pct as number).toBeLessThan(10);
    expect(classifyGrowth(result)).toBe('SGA');
  });

  it('LGA above 90th percentile', () => {
    const result = estimatePercentile(4300, 40, 0, 'male' as any);
    expect(result.pct).not.toBeNull();
    expect(result.pct as number).toBeGreaterThan(90);
    expect(classifyGrowth(result)).toBe('LGA');
  });

  it('interpolates by days between weeks', () => {
    const mid = estimatePercentile((REF.male[39].p50 + REF.male[40].p50) / 2, 39, 3, 'male' as any);
    expect(mid.pct).not.toBeNull();
    expect(mid.pct as number).toBeGreaterThan(0);
  });

  it('below 3rd centile returns null pct, outsideRange=true, OUTSIDE_RANGE classification', () => {
    const result = estimatePercentile(REF.male[40].p3 - 1, 40, 0, 'male' as any);
    expect(result.outOfRange).toBe(true);
    expect(result.pct).toBeNull();
    expect(result.message).toContain('< 3rd centile');
    expect(classifyGrowth(result)).toBe('OUTSIDE_RANGE');
  });

  it('above 97th centile returns null pct, outsideRange=true, OUTSIDE_RANGE classification', () => {
    const result = estimatePercentile(REF.male[40].p97 + 1, 40, 0, 'male' as any);
    expect(result.outOfRange).toBe(true);
    expect(result.pct).toBeNull();
    expect(result.message).toContain('> 97th centile');
    expect(classifyGrowth(result)).toBe('OUTSIDE_RANGE');
  });

  it('exactly at 3rd centile remains calculable and classified in-range', () => {
    const result = estimatePercentile(REF.male[40].p3, 40, 0, 'male' as any);
    expect(result.outOfRange).toBe(false);
    expect(result.pct).toBe(3);
    expect(classifyGrowth(result)).toBe('SGA');
  });

  it('exactly at 97th centile remains calculable and classified in-range', () => {
    const result = estimatePercentile(REF.male[40].p97, 40, 0, 'male' as any);
    expect(result.outOfRange).toBe(false);
    expect(result.pct).toBe(97);
    expect(classifyGrowth(result)).toBe('LGA');
  });
});
