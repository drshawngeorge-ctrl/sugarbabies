import { describe, it, expect } from 'vitest';
import { detectRisks, computeSurveillanceDuration } from '../src/lib/risk';
import { InfantInput } from '../src/types';

function baseInput(): InfantInput {
  return {
    gaWeeks: 40, gaDays: 0, sex: 'male', birthweight: 3613, diabetes: 'none',
    maternalBetaBlocker: false, iugr: false, perinatalAsphyxia: false,
    antenatalSteroids: false, symptomatic: false, persistent: false, nicu: false, metabolic: false
  };
}

describe('Risk detection and durations', () => {
  it('no factors yields zero duration', () => {
    const input = baseInput();
    const factors = detectRisks(input, 'AGA');
    expect(factors.length).toBe(0);
    expect(computeSurveillanceDuration(factors)).toBe(0);
  });

  it('IDM yields 12h', () => {
    const input = { ...baseInput(), diabetes: 'gdm' };
    const factors = detectRisks(input, 'AGA');
    expect(factors.some(f => f.key === 'IDM')).toBe(true);
    expect(computeSurveillanceDuration(factors)).toBe(12);
  });

  it('SGA yields 24h', () => {
    const input = baseInput();
    const factors = detectRisks(input, 'SGA');
    expect(computeSurveillanceDuration(factors)).toBe(24);
  });

  it('Maternal beta-blocker yields 12h', () => {
    const input = { ...baseInput(), maternalBetaBlocker: true };
    const factors = detectRisks(input, 'AGA');
    expect(factors.some(f => f.key === 'MATERNAL_BB')).toBe(true);
    expect(computeSurveillanceDuration(factors)).toBe(12);
  });

  it('IUGR and LGA -> 24h ceiling', () => {
    const input = { ...baseInput(), iugr: true };
    const factors = detectRisks(input, 'LGA');
    expect(computeSurveillanceDuration(factors)).toBe(24);
  });

  it('preterm + IDM -> 24h (preterm ceiling)', () => {
    const input = { ...baseInput(), gaWeeks: 34, diabetes: 'type1' };
    const factors = detectRisks(input, 'AGA');
    expect(computeSurveillanceDuration(factors)).toBe(24);
  });
});
