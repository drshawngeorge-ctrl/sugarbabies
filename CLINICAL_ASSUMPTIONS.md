# Clinical Assumptions

## Purpose

This document records assumptions, interpretations, and local policy decisions incorporated into the Neonatal Glucose Surveillance application.

The goal is to distinguish:

- Published evidence
- Clinical reference data
- Local policy decisions
- Software implementation decisions

from one another.

---

# Assumption 1: Percentile Estimation Method

## Background

The Canadian Birth Weight for Gestational Age reference publishes sex-specific centile values by completed gestational week.

Published centiles include:

- 3rd
- 5th
- 10th
- 50th
- 90th
- 95th
- 97th

The original LMS (Lambda-Mu-Sigma) parameters are not publicly available.

## Decision

Percentiles are estimated using interpolation between:

1. Adjacent gestational weeks
2. Published reference centiles

## Consequence

The application produces:

> Estimated birthweight percentiles

rather than exact LMS-derived percentiles.

## Display Requirement

The application should clearly state:

> "Estimated birthweight percentile derived from interpolation of Canadian Birth Weight for Gestational Age reference centiles."

---

# Assumption 2: Gestational Age Interpolation

## Background

The Canadian reference provides values by completed week only.

The application accepts:

- Completed gestational weeks
- Additional gestational days (0-6)

## Decision

Linear interpolation is performed between adjacent gestational weeks.

Example:

39+3 weeks is estimated as a value between:

- 39+0 weeks
- 40+0 weeks

## Rationale

This provides a more clinically useful estimate than rounding to the nearest completed week.

---

# Assumption 3: Growth Classification

## Definitions

### Small for Gestational Age (SGA)

Estimated percentile <10th percentile.

### Appropriate for Gestational Age (AGA)

Estimated percentile ≥10th percentile and ≤90th percentile.

### Large for Gestational Age (LGA)

Estimated percentile >90th percentile.

## Rationale

These definitions align with CPS guidance and standard neonatal practice.

---

# Assumption 4: Maternal Beta-Blocker Exposure

## Background

The CPS position statement identifies maternal labetalol exposure as a risk factor for neonatal hypoglycemia.

However, no specific surveillance duration is provided.

## Decision

For isolated maternal beta-blocker exposure:

Recommended surveillance duration = 12 hours.

## Rationale

The application adopts a conservative approach aligned with the duration used for:

- Infants of diabetic mothers (IDM)
- Large for gestational age (LGA) infants

This decision reflects local PSBC practice rather than explicit CPS 
