export type Sex = 'male' | 'female';
export type Diabetes = 'none' | 'gdm' | 'type1' | 'type2';

export interface InfantInput {
  gaWeeks: number;
  gaDays: number;
  sex: Sex;
  birthweight: number;
  diabetes: Diabetes;
  maternalBetaBlocker: boolean;
  iugr: boolean;
  perinatalAsphyxia: boolean;
  antenatalSteroids: boolean;
  symptomatic: boolean;
  persistent: boolean;
  nicu: boolean;
  metabolic: boolean;
}

export interface PercentileResult {
  pct: number;
  outOfRange: boolean;
}

export interface Factor {
  key: string;
  label: string;
  assumption: boolean;
}
