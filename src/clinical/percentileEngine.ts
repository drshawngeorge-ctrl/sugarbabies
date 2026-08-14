export const BANDS = [3, 5, 10, 50, 90, 95, 97];

export interface PercentileResult {
  percentile: number | null;
  classification: "SGA" | "AGA" | "LGA" | "OUTSIDE_RANGE";
  outsideRange: boolean;
  message?: string;
}

export function estimatePercentile(
  bw: number,
  referenceValues: number[]
): PercentileResult {

  if (bw < referenceValues[0]) {
    return {
      percentile: null,
      classification: "OUTSIDE_RANGE",
      outsideRange: true,
      message:
        "< 3rd centile, outside calculable range, verify manually"
    };
  }

  if (bw > referenceValues[referenceValues.length - 1]) {
    return {
      percentile: null,
      classification: "OUTSIDE_RANGE",
      outsideRange: true,
      message:
        "> 97th centile, outside calculable range, verify manually"
    };
  }

  for (let i = 0; i < referenceValues.length - 1; i++) {

    if (
      bw >= referenceValues[i] &&
      bw <= referenceValues[i + 1]
    ) {

      const frac =
        (bw - referenceValues[i]) /
        (referenceValues[i + 1] - referenceValues[i]);

      const percentile =
        BANDS[i] +
        frac * (BANDS[i + 1] - BANDS[i]);

      let classification: "SGA" | "AGA" | "LGA" = "AGA";

      if (percentile < 10) {
        classification = "SGA";
      } else if (percentile > 90) {
        classification = "LGA";
      }

      return {
        percentile,
        classification,
        outsideRange: false
      };
    }
  }

  return {
    percentile: null,
    classification: "OUTSIDE_RANGE",
    outsideRange: true,
    message: "Unable to calculate percentile"
  };
}
