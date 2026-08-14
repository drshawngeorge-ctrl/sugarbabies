import { REF, KEYS, BANDS } from './ref';
import type { Sex, PercentileResult } from '../types';

function clampWeek(w: number) { return Math.max(22, Math.min(43, Math.floor(w))); }

export function interpAtPercentile(gaWeeks: number, gaDays: number, sex: Sex, key: typeof KEYS[number]) {
  const w = clampWeek(gaWeeks);
  const a = REF[sex][w];
  const b = REF[sex][Math.min(43, w + 1)];
  const frac = Math.max(0, Math.min(1, gaDays / 7));
  return a[key] + frac * (b[key] - a[key]);
}

export function estimatePercentile(bw: number, gaWeeks: number, gaDays: number, sex: Sex): PercentileResult {
  const values = KEYS.map(k => interpAtPercentile(gaWeeks, gaDays, sex, k));
  if (bw < values[0]) {
    return { pct: null, outOfRange: true, message: '< 3rd centile, outside calculable range, verify manually' };
  }
  if (bw > values[values.length - 1]) {
    return { pct: null, outOfRange: true, message: '> 97th centile, outside calculable range, verify manually' };
  }
  for (let i = 0; i < values.length - 1; i++) {
    if (bw >= values[i] && bw <= values[i + 1]) {
      const frac = (bw - values[i]) / (values[i + 1] - values[i]);
      return { pct: BANDS[i] + frac * (BANDS[i + 1] - BANDS[i]), outOfRange: false };
    }
  }
  return { pct: 50, outOfRange: false };
}
