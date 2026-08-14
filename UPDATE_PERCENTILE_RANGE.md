# Percentile Range Update

## Change Request

Update the application so that percentile estimates are only calculated within the published Canadian reference range (3rd to 97th centile).

### Below 3rd Centile

If birthweight is below the interpolated 3rd centile:

Display:

< 3rd centile, outside calculable range, verify manually

Do not calculate a numeric percentile.

Do not assign SGA/AGA/LGA classification.

Set:

outsideRange = true

### Above 97th Centile

If birthweight is above the interpolated 97th centile:

Display:

> 97th centile, outside calculable range, verify manually

Do not calculate a numeric percentile.

Do not assign SGA/AGA/LGA classification.

Set:

outsideRange = true

---

## Files to Update

### src/clinical/percentileEngine.ts

Update estimatePercentile() to return:

```ts
interface PercentileResult {
  percentile: number | null;
  classification:
    | "SGA"
    | "AGA"
    | "LGA"
    | "OUTSIDE_RANGE";
  outsideRange: boolean;
  message?: string;
}
