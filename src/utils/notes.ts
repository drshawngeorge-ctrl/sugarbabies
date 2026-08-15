import { InfantInput, Factor } from '../types';

export function generateBriefNote(input: InfantInput, percentile: number | null, growth: string, duration: number, outOfRange: boolean, rangeMessage?: string) {
  const pctText = outOfRange
    ? `${rangeMessage ?? 'outside calculable range, verify manually'} (${growth})`
    : `${(percentile as number).toFixed(1)}th percentile (${growth})`;
  const parts = [
    `${input.gaWeeks}+${input.gaDays} weeks`,
    `${input.sex}`,
    `${input.birthweight} g`,
    pctText
  ];
  const risks: string[] = [];
  if (input.gaWeeks < 37) risks.push('Preterm');
  if (growth === 'SGA') risks.push('SGA');
  if (growth === 'LGA') risks.push('LGA');
  if (input.diabetes !== 'none') risks.push('IDM');
  if (input.maternalBetaBlocker) risks.push('Maternal beta-blocker*');
  if (input.iugr) risks.push('IUGR*');
  if (input.perinatalAsphyxia) risks.push('Perinatal asphyxia*');
  if (input.antenatalSteroids) risks.push('Antenatal steroids*');

  return `Neonate ${parts.join(' · ')}. Risk factors: ${risks.length ? risks.join(', ') : 'none'}. Recommended asymptomatic glucose surveillance: continue to ${duration}h.`;
}

export function generateFullAssessment(
  input: InfantInput,
  percentile: number | null,
  growth: string,
  duration: number,
  factors: Factor[],
  outOfRange: boolean,
  rangeMessage?: string
) {
  const pctLine = outOfRange
    ? `${rangeMessage ?? 'outside calculable range, verify manually'} (${growth})`
    : `${(percentile as number).toFixed(2)}th (${growth})`;
  const header = `Full assessment — ${input.gaWeeks}+${input.gaDays} weeks · ${input.sex} · ${input.birthweight} g\nEstimated percentile: ${pctLine}\n`;
  const factorLines = factors.length ? factors.map(f => `- ${f.label}${f.assumption ? ' (assumption)' : ''}`).join('\n') : '- None';
  const timeline = `Recommended surveillance: first check at 2h, then every 3–6h; continue to ${duration}h. Stop when minimum duration reached, feeding established, and all readings ≥2.6 mmol/L.`;
  return `${header}\nRisk factors:\n${factorLines}\n\n${timeline}\n\nNotes: Percentile is estimated by linear interpolation of Canadian birthweight-for-gestational-age reference centiles.`;
}
