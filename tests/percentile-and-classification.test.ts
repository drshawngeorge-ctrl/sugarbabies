import { describe, it, expect } from 'vitest';
import { estimatePercentile, interpAtPercentile } from '../src/lib/percentiles';
import { classifyGrowth } from '../src/lib/classify';
import { REF } from '../src/lib/ref';

describe('Percentile calculations and classification', () => {
  it('term male 40wk 3613g is p50 and AGA', () => {
    const result = estimatePercentile(3613, 40, 0, 'male' as any);
    expect(result.outOfRange).toBe(false);
    expect(result.pct).not.toBeNull();
    expect(result.classification).toBe('AGA');
    expect(REF.male[40].p50).toBe(3613);
    expect(Math.abs((result.pct as number) - 50)).toBeLessThan(1e-6);
    expect(classifyGrowth(result)).toBe('AGA');
  });

  it('SGA threshold under 10th percentile', () => {
    const result = estimatePercentile(2950, 40, 0, 'male' as any);
    expect(result.pct).not.toBeNull();
    expect(result.pct as number).toBeLessThan(10);
    expect(result.classification).toBe('SGA');
    expect(classifyGrowth(result)).toBe('SGA');
  });

  it('LGA above 90th percentile', () => {
    const result = estimatePercentile(4300, 40, 0, 'male' as any);
    expect(result.pct).not.toBeNull();
    expect(result.pct as number).toBeGreaterThan(90);
    expect(result.classification).toBe('LGA');
    expect(classifyGrowth(result)).toBe('LGA');
  });

  it('interpolates numeric percentiles between p90 and p95 (e.g. ~92-93rd)', () => {
    const { p90, p95 } = REF.male[40];
    const bw = Math.round((p90 + p95) / 2);
    const result = estimatePercentile(bw, 40, 0, 'male' as any);
    expect(result.outOfRange).toBe(false);
    expect(result.pct).not.toBeNull();
    expect(result.pct as number).toBeGreaterThan(90);
    expect(result.pct as number).toBeLessThan(95);
    expect(result.classification).toBe('LGA');
    expect(classifyGrowth(result)).toBe('LGA');
  });

  it('interpolates numeric percentiles between p95 and p97 (e.g. ~96th)', () => {
    const { p95, p97 } = REF.male[40];
    const bw = Math.round((p95 + p97) / 2);
    const result = estimatePercentile(bw, 40, 0, 'male' as any);
    expect(result.outOfRange).toBe(false);
    expect(result.pct).not.toBeNull();
    expect(result.pct as number).toBeGreaterThan(95);
    expect(result.pct as number).toBeLessThan(97);
    expect(result.classification).toBe('LGA');
    expect(classifyGrowth(result)).toBe('LGA');
  });

  it('interpolates a value just under the 97th centile as calculable, in-range, and >90', () => {
    const { p97 } = REF.male[40];
    const result = estimatePercentile(p97 - 1, 40, 0, 'male' as any);
    expect(result.outOfRange).toBe(false);
    expect(result.pct).not.toBeNull();
    expect(result.pct as number).toBeGreaterThan(90);
    expect(result.pct as number).toBeLessThan(97);
    expect(result.classification).toBe('LGA');
  });

  it('interpolates by days between weeks', () => {
    const mid = estimatePercentile((REF.male[39].p50 + REF.male[40].p50) / 2, 39, 3, 'male' as any);
    expect(mid.pct).not.toBeNull();
    expect(mid.pct as number).toBeGreaterThan(0);
  });

  it('female 37+1 2310g remains below the 10th percentile and is classified SGA', () => {
    const result = estimatePercentile(2310, 37, 1, 'female' as any);
    expect(result.outOfRange).toBe(false);
    expect(result.pct).not.toBeNull();
    expect(result.pct as number).toBeLessThan(10);
    expect(result.classification).toBe('SGA');
    expect(classifyGrowth(result)).toBe('SGA');
  });

  it('interpolates female week 37 to 38 centiles from corrected source anchors', () => {
    expect(REF.female[37]).toEqual({ p3: 2177, p5: 2286, p10: 2452, p50: 2968, p90: 3543, p95: 3752, p97: 3886 });
    expect(REF.female[38]).toEqual({ p3: 2406, p5: 2502, p10: 2658, p50: 3169, p90: 3738, p95: 3931, p97: 4061 });
    expect(interpAtPercentile(37, 1, 'female' as any, 'p10')).toBeCloseTo(2481.4285714285716, 6);
  });

  it('preserves corrected female source rows from week 25 onward', () => {
    const expected: Record<number, typeof REF.female[37]> = {
      25: { p3: 469, p5: 508, p10: 578, p50: 751, p90: 918, p95: 982, p97: 1060 },
      26: { p3: 516, p5: 562, p10: 645, p50: 858, p90: 1060, p95: 1139, p97: 1247 },
      27: { p3: 569, p5: 624, p10: 717, p50: 976, p90: 1218, p95: 1313, p97: 1446 },
      28: { p3: 634, p5: 697, p10: 802, p50: 1109, p90: 1390, p95: 1499, p97: 1657 },
      29: { p3: 716, p5: 787, p10: 903, p50: 1259, p90: 1578, p95: 1701, p97: 1885 },
      30: { p3: 814, p5: 894, p10: 1022, p50: 1427, p90: 1783, p95: 1918, p97: 2121 },
      31: { p3: 938, p5: 1026, p10: 1168, p50: 1613, p90: 2004, p95: 2150, p97: 2347 },
      32: { p3: 1089, p5: 1184, p10: 1346, p50: 1817, p90: 2242, p95: 2399, p97: 2578 },
      33: { p3: 1264, p5: 1369, p10: 1548, p50: 2035, p90: 2494, p95: 2664, p97: 2825 },
      34: { p3: 1467, p5: 1581, p10: 1768, p50: 2266, p90: 2761, p95: 2948, p97: 3097 },
      35: { p3: 1695, p5: 1813, p10: 1998, p50: 2506, p90: 3037, p95: 3242, p97: 3384 },
      36: { p3: 1935, p5: 2052, p10: 2227, p50: 2744, p90: 3307, p95: 3523, p97: 3660 },
      37: { p3: 2177, p5: 2286, p10: 2452, p50: 2968, p90: 3543, p95: 3752, p97: 3886 },
      38: { p3: 2406, p5: 2502, p10: 2658, p50: 3169, p90: 3738, p95: 3931, p97: 4061 },
      39: { p3: 2589, p5: 2680, p10: 2825, p50: 3334, p90: 3895, p95: 4076, p97: 4202 },
      40: { p3: 2722, p5: 2814, p10: 2955, p50: 3470, p90: 4034, p95: 4212, p97: 4331 },
      41: { p3: 2809, p5: 2906, p10: 3051, p50: 3576, p90: 4154, p95: 4330, p97: 4444 },
      42: { p3: 2849, p5: 2954, p10: 3114, p50: 3655, p90: 4251, p95: 4423, p97: 4554 },
      43: { p3: 2862, p5: 2975, p10: 3159, p50: 3717, p90: 4333, p95: 4495, p97: 4685 },
    };

    expect(REF.female).toMatchObject(expected);
  });

  it('below 3rd centile returns null pct, outsideRange=true, SGA classification', () => {
    const result = estimatePercentile(REF.male[40].p3 - 1, 40, 0, 'male' as any);
    expect(result.outOfRange).toBe(true);
    expect(result.pct).toBeNull();
    expect(result.classification).toBe('SGA');
    expect(result.message).toContain('< 3rd centile');
  });

  it('above 97th centile returns null pct, outsideRange=true, LGA classification', () => {
    const result = estimatePercentile(REF.male[40].p97 + 1, 40, 0, 'male' as any);
    expect(result.outOfRange).toBe(true);
    expect(result.pct).toBeNull();
    expect(result.classification).toBe('LGA');
    expect(result.message).toBe('> 97%ile, outside calculable range, verify manually');
  });

  it('at 3rd and 97th centiles remains calculable and in-range', () => {
    const low = estimatePercentile(REF.male[40].p3, 40, 0, 'male' as any);
    expect(low.outOfRange).toBe(false);
    expect(low.pct).not.toBeNull();
    expect(low.classification).toBe('SGA');

    const high = estimatePercentile(REF.male[40].p97, 40, 0, 'male' as any);
    expect(high.outOfRange).toBe(false);
    expect(high.pct).not.toBeNull();
    expect(high.classification).toBe('LGA');
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
