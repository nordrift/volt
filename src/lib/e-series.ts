/**
 * IEC 60063 standard resistor values (E-series). Also the shared base for
 * voltage-divider's reverse mode, which needs the same "nearest standard
 * value" search — see voltage-divider.ts.
 */

export type ESeriesName = "E12" | "E24" | "E96";

// E12/E24 are the historical published tables — not pure log-rounding, so
// they're transcribed here rather than generated.
const E12_VALUES: readonly number[] = [1.0, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];

const E24_VALUES: readonly number[] = [
  1.0, 1.1, 1.2, 1.3, 1.5, 1.6, 1.8, 2.0, 2.2, 2.4, 2.7, 3.0, 3.3, 3.6, 3.9, 4.3, 4.7, 5.1, 5.6,
  6.2, 6.8, 7.5, 8.2, 9.1,
];

function roundToSignificantFigures(value: number, figures: number): number {
  const magnitude = Math.ceil(Math.log10(value));
  const factor = 10 ** (figures - magnitude);
  return Math.round(value * factor) / factor;
}

// E96 (and every series beyond E24) is *defined* as 10^(n/96) rounded to 3
// significant figures — computing it is more reliable than transcribing 96
// numbers by hand.
function generateE96Values(): readonly number[] {
  const values: number[] = [];
  for (let n = 0; n < 96; n += 1) {
    values.push(roundToSignificantFigures(10 ** (n / 96), 3));
  }
  return values;
}

export const E_SERIES_BASE_VALUES: Record<ESeriesName, readonly number[]> = {
  E12: E12_VALUES,
  E24: E24_VALUES,
  E96: generateE96Values(),
};

export type ExponentRange = { minExponent: number; maxExponent: number };

export const DEFAULT_EXPONENT_RANGE: ExponentRange = { minExponent: -2, maxExponent: 9 };

/** Every standard value across the given decades, ascending. */
export function standardValuesInRange(
  series: ESeriesName,
  range: ExponentRange = DEFAULT_EXPONENT_RANGE,
): number[] {
  if (range.minExponent > range.maxExponent) {
    throw new Error("minExponent cannot be greater than maxExponent.");
  }
  const base = E_SERIES_BASE_VALUES[series];
  const values: number[] = [];
  for (let exponent = range.minExponent; exponent <= range.maxExponent; exponent += 1) {
    for (const b of base) {
      // Base values have at most 3 significant figures, so scaling by a
      // power of ten adds no real precision — round off the floating-point
      // noise (e.g. 1.1 * 100 = 110.00000000000001) rather than surface it.
      values.push(roundToSignificantFigures(b * 10 ** exponent, 12));
    }
  }
  return values.sort((a, b) => a - b);
}

export type NearestStandardValue = {
  target: number;
  series: ESeriesName;
  nearest: number;
  nearestErrorPercent: number;
  below: number | null;
  belowErrorPercent: number | null;
  above: number | null;
  aboveErrorPercent: number | null;
};

/**
 * Nearest standard value to `target`, plus the nearest-below and
 * nearest-above candidates. If `target` itself is a standard value, below,
 * above, and nearest all equal it, at 0% error.
 */
export function findNearestStandardValues(
  target: number,
  series: ESeriesName,
  range: ExponentRange = DEFAULT_EXPONENT_RANGE,
): NearestStandardValue {
  if (!Number.isFinite(target) || target <= 0) {
    throw new Error("Target value must be a positive, finite number.");
  }

  const values = standardValuesInRange(series, range);

  let below: number | null = null;
  let above: number | null = null;
  for (const value of values) {
    if (value <= target) {
      below = value;
    }
    if (value >= target && above === null) {
      above = value;
      break;
    }
  }

  if (below === null && above === null) {
    throw new Error("No standard value found in the given exponent range.");
  }

  const belowErrorPercent = below !== null ? ((below - target) / target) * 100 : null;
  const aboveErrorPercent = above !== null ? ((above - target) / target) * 100 : null;

  let nearest: number;
  if (below === null) {
    nearest = above as number;
  } else if (above === null) {
    nearest = below;
  } else {
    nearest = Math.abs(target - below) <= Math.abs(above - target) ? below : above;
  }
  const nearestErrorPercent = ((nearest - target) / target) * 100;

  return { target, series, nearest, nearestErrorPercent, below, belowErrorPercent, above, aboveErrorPercent };
}
