import { findNearestStandardValues, standardValuesInRange, type ESeriesName } from "@/lib/e-series";

/** Vout = Vin × R2 / (R1 + R2). */
export function voltageDividerOutput(vin: number, r1: number, r2: number): number {
  if (!Number.isFinite(vin) || !Number.isFinite(r1) || !Number.isFinite(r2)) {
    throw new Error("Input voltage and both resistances must be finite numbers.");
  }
  if (r1 < 0 || r2 < 0) {
    throw new Error("Resistance cannot be negative.");
  }
  if (r1 + r2 === 0) {
    throw new Error("R1 and R2 cannot both be zero.");
  }
  return (vin * r2) / (r1 + r2);
}

export type DividerSuggestion = {
  r1: number;
  r2: number;
  vout: number;
  errorPercent: number;
};

export type DividerSuggestionOptions = {
  count?: number;
  minExponent?: number;
  maxExponent?: number;
};

/**
 * Reverse mode: given Vin and a target Vout, suggest standard-value R1/R2
 * pairs. For each candidate R1 from the series, there's exactly one ideal
 * R2 (R2 = R1 × ratio / (1 − ratio)); this snaps that to the nearest
 * standard value and ranks candidates by resulting error, rather than
 * searching the full R1×R2 combination space.
 */
export function suggestVoltageDividerPairs(
  vin: number,
  targetVout: number,
  series: ESeriesName = "E24",
  options: DividerSuggestionOptions = {},
): DividerSuggestion[] {
  if (!Number.isFinite(vin) || vin <= 0) {
    throw new Error("Input voltage must be a positive, finite number.");
  }
  if (!Number.isFinite(targetVout)) {
    throw new Error("Target output voltage must be a finite number.");
  }
  if (targetVout <= 0 || targetVout >= vin) {
    throw new Error("Target output voltage must be strictly between 0 and the input voltage.");
  }

  const { count = 5, minExponent = 2, maxExponent = 6 } = options;
  const ratio = targetVout / vin;
  const range = { minExponent, maxExponent };

  const suggestions = standardValuesInRange(series, range).map((r1): DividerSuggestion => {
    const idealR2 = (r1 * ratio) / (1 - ratio);
    const r2 = findNearestStandardValues(idealR2, series, range).nearest;
    const vout = voltageDividerOutput(vin, r1, r2);
    return { r1, r2, vout, errorPercent: ((vout - targetVout) / targetVout) * 100 };
  });

  suggestions.sort((a, b) => Math.abs(a.errorPercent) - Math.abs(b.errorPercent));
  return suggestions.slice(0, count);
}
