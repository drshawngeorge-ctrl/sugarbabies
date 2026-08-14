import { describe, it, expect } from 'vitest';
import { generateBriefNote, generateFullAssessment } from '../src/utils/notes';
import { InfantInput } from '../src/types';

const base: InfantInput = {
  gaWeeks: 40, gaDays: 0, sex: 'male', birthweight: 3613, diabetes: 'none',
  maternalBetaBlocker: false, iugr: false, perinatalAsphyxia: false,
  antenatalSteroids: false, symptomatic: false, persistent: false, nicu: false, metabolic: false
};

describe('Note generation', () => {
  it('brief note contains summary and duration', () => {
    const brief = generateBriefNote(base, 50, 'AGA', 0, false);
    expect(brief).toContain('3613 g');
    expect(brief).toContain('50.0th percentile');
    expect(brief).toContain('continue to 0h');
  });

  it('full assessment contains risk list and timeline', () => {
    const factors = [{ key: 'IDM', label: 'Infant of diabetic mother', assumption: false }];
    const full = generateFullAssessment(base, 60, 'AGA', 12, factors, false);
    expect(full).toContain('Estimated percentile: 60.00th (AGA)');
    expect(full).toContain('Infant of diabetic mother');
    expect(full).toContain('continue to 12h');
  });

  it('brief note uses range message when outOfRange=true', () => {
    const msg = '< 3rd centile, outside calculable range, verify manually';
    const brief = generateBriefNote({ ...base, birthweight: 100 }, null, 'SGA', 0, true, msg);
    expect(brief).toContain('SGA');
    expect(brief).toContain(msg);
    expect(brief).not.toContain('th percentile');
  });

  it('full assessment uses range message when outOfRange=true', () => {
    const msg = '> 97th centile, outside calculable range, verify manually';
    const full = generateFullAssessment({ ...base, birthweight: 9000 }, null, 'LGA', 0, [], true, msg);
    expect(full).toContain('LGA');
    expect(full).toContain(msg);
    expect(full).not.toContain('th (');
  });
});
