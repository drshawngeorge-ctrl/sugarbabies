import type { InfantInput } from '../types';

export interface Factor { key: string; label: string; assumption: boolean }

const DURATION_HOURS: Record<string, number> = {
  IDM: 12,
  LGA: 12,
  MATERNAL_BB: 12,
  SGA: 24,
  PRETERM: 24,
  IUGR: 24,
  ASPHYXIA: 24,
  ANTENATAL_STEROIDS: 24
};

export function detectRisks(input: InfantInput, growth: 'SGA'|'AGA'|'LGA') {
  const factors: Factor[] = [];
  if (input.gaWeeks < 37) factors.push({ key: 'PRETERM', label: 'Preterm (<37w)', assumption: false });
  if (growth === 'SGA') factors.push({ key: 'SGA', label: 'SGA (<10th %ile)', assumption: false });
  if (growth === 'LGA') factors.push({ key: 'LGA', label: 'LGA (>90th %ile)', assumption: false });
  if (input.diabetes !== 'none') factors.push({ key: 'IDM', label: 'Infant of diabetic mother', assumption: false });
  if (input.maternalBetaBlocker) factors.push({ key: 'MATERNAL_BB', label: 'Maternal beta-blocker', assumption: true });
  if (input.iugr) factors.push({ key: 'IUGR', label: 'IUGR', assumption: true });
  if (input.perinatalAsphyxia) factors.push({ key: 'ASPHYXIA', label: 'Perinatal asphyxia', assumption: true });
  if (input.antenatalSteroids) factors.push({ key: 'ANTENATAL_STEROIDS', label: 'Antenatal steroid exposure', assumption: true });
  return factors;
}

export function computeSurveillanceDuration(factors: Factor[]) {
  if (factors.length === 0) return 0;
  return Math.max(...factors.map(f => DURATION_HOURS[f.key] ?? 0));
}
