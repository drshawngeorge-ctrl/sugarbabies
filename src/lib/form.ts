import type { InfantInput } from '../types';

/**
 * Shape of the raw form state as edited in the UI. Numeric fields and the
 * sex selector start out blank (empty string) so the form renders empty on
 * first load instead of pre-populated with placeholder clinical values.
 */
export type InfantFormState = Omit<InfantInput, 'gaWeeks' | 'gaDays' | 'birthweight' | 'sex'> & {
  gaWeeks: number | '';
  gaDays: number | '';
  birthweight: number | '';
  sex: InfantInput['sex'] | '';
};

export const initialFormState: InfantFormState = {
  gaWeeks: '',
  gaDays: '',
  birthweight: '',
  sex: '',
  diabetes: 'none',
  maternalBetaBlocker: false,
  iugr: false,
  perinatalAsphyxia: false,
  antenatalSteroids: false,
  symptomatic: false,
  persistent: false,
  nicu: false,
  metabolic: false,
};

/**
 * Returns a fully-populated InfantInput when all required numeric fields
 * have been entered and are valid, otherwise null. This lets the app skip
 * percentile/risk calculations while the form is blank or incomplete.
 */
export function toInfantInput(form: InfantFormState): InfantInput | null {
  const { gaWeeks, gaDays, birthweight, sex } = form;
  if (
    typeof gaWeeks !== 'number' || !Number.isFinite(gaWeeks) ||
    typeof gaDays !== 'number' || !Number.isFinite(gaDays) ||
    typeof birthweight !== 'number' || !Number.isFinite(birthweight) ||
    birthweight <= 0 ||
    (sex !== 'male' && sex !== 'female')
  ) {
    return null;
  }
  return { ...form, gaWeeks, gaDays, birthweight, sex };
}
