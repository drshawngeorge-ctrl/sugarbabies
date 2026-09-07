import { describe, it, expect } from 'vitest';
import { initialFormState, toInfantInput } from '../src/lib/form';

describe('Initial form state', () => {
  it('starts blank instead of pre-populated with 40 week male 3613 g', () => {
    expect(initialFormState.gaWeeks).toBe('');
    expect(initialFormState.gaDays).toBe('');
    expect(initialFormState.birthweight).toBe('');
    expect(initialFormState.sex).toBe('');
  });

  it('does not produce a usable InfantInput while blank', () => {
    expect(toInfantInput(initialFormState)).toBeNull();
  });

  it('returns null when only some fields are filled in', () => {
    expect(toInfantInput({ ...initialFormState, gaWeeks: 40 })).toBeNull();
    expect(toInfantInput({ ...initialFormState, gaWeeks: 40, gaDays: 0 })).toBeNull();
    expect(toInfantInput({ ...initialFormState, gaWeeks: 40, gaDays: 0, birthweight: 3613 })).toBeNull();
  });

  it('returns a valid InfantInput once all numeric fields are entered', () => {
    const infant = toInfantInput({ ...initialFormState, gaWeeks: 40, gaDays: 0, birthweight: 3613, sex: 'male' });
    expect(infant).toEqual({
      gaWeeks: 40,
      gaDays: 0,
      sex: 'male',
      birthweight: 3613,
      diabetes: 'none',
      maternalBetaBlocker: false,
      iugr: false,
      perinatalAsphyxia: false,
      antenatalSteroids: false,
      symptomatic: false,
      persistent: false,
      nicu: false,
      metabolic: false,
    });
  });

  it('returns null when sex is not selected', () => {
    expect(toInfantInput({ ...initialFormState, gaWeeks: 40, gaDays: 0, birthweight: 3613, sex: '' })).toBeNull();
  });

  it('rejects a non-positive birthweight', () => {
    expect(toInfantInput({ ...initialFormState, gaWeeks: 40, gaDays: 0, birthweight: 0, sex: 'male' })).toBeNull();
    expect(toInfantInput({ ...initialFormState, gaWeeks: 40, gaDays: 0, birthweight: -10, sex: 'male' })).toBeNull();
  });
});
