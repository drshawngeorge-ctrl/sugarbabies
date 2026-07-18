# Clinical References

## Purpose

This application provides clinical decision support to identify newborns who may require asymptomatic blood glucose surveillance during the first 72 hours of life and to estimate birthweight percentile using Canadian reference data.

This tool is intended to support, not replace, clinician judgment, institutional policies, or specialist consultation.

---

# Primary References

## 1. Canadian Paediatric Society (CPS)

### The Screening and Management of Newborns at Risk for Low Blood Glucose

Canadian Paediatric Society, Fetus and Newborn Committee.

Current application logic is based primarily on:

- Identification of newborns at risk for hypoglycemia
- Recommendations for asymptomatic glucose screening
- Surveillance intervals
- Screening discontinuation criteria
- Management thresholds during the transitional period (0 to 72 hours)

Reference:

https://cps.ca/en/documents/position/newborns-at-risk-for-low-blood-glucose

Key risk groups identified by CPS include:

- Small for gestational age (SGA)
- Large for gestational age (LGA)
- Infants of diabetic mothers (IDM)
- Preterm infants (<37 weeks gestation)
- Intrauterine growth restriction (IUGR)
- Maternal labetalol exposure
- Perinatal asphyxia
- Exposure to antenatal corticosteroids
- Selected metabolic and endocrine disorders

The application excludes:
- Symptomatic hypoglycemia
- Persistent hypoglycemia beyond 72 hours
- Suspected endocrine or metabolic disease
- NICU patients requiring individualized management

These conditions require clinical assessment outside the scope of this tool.

---

## 2. Canadian Birth Weight for Gestational Age (BWGA)

### Canadian Perinatal Surveillance System (CPSS) / Kramer et al. reference

Birthweight percentile estimation in this tool is based on the Canadian sex-specific BWGA centile reference (completed weeks 22 to 43).

Reference landing page:

https://www.canada.ca/en/public-health/services/injury-prevention/health-surveillance-epidemiology-division/maternal-infant-health/birth-weight-gestational.html

Reference PDF:

https://www.phac-aspc.gc.ca/rhs-ssg/bwga-pnag/pdf/bwga-pnag_e.pdf

The app uses published centiles at each completed week:

- 3rd
- 5th
- 10th
- 50th
- 90th
- 95th
- 97th

Because LMS parameters are not provided in the public table, percentile values are estimated by interpolation between adjacent completed weeks and adjacent centiles.

---

## 3. Interpretation and Display Notes

- Percentile values shown in the tool are estimates derived from interpolation of the published Canadian BWGA centiles.
- If estimated values are outside table bounds, the display is reported as:
  - `< 3rd centile`
  - `> 90th centile`
- Growth classification used by the tool:
  - SGA: <10th percentile
  - AGA: 10th to 90th percentile
  - LGA: >90th percentile

---

## 4. Local Policy and Assumption Handling

Where CPS identifies a risk factor but does not provide an explicit surveillance duration, this application applies conservative local assumptions (documented separately) for consistency in bedside workflow.

See:

`CLINICAL_ASSUMPTIONS.md`

---

## 5. Scope Reminder

This tool is for **asymptomatic transitional hypoglycemia** screening support only and is not a substitute for clinician judgment or institutional protocol.
