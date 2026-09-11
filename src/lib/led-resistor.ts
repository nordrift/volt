import { findNearestStandardValues, type ESeriesName } from "@/lib/e-series";

export type LedResistorResult = {
  resistanceOhms: number;
  powerWatts: number;
  nextStandardValueOhms: number;
  exceedsQuarterWatt: boolean;
};

const QUARTER_WATT = 0.25;

/**
 * R = (Vsupply − Vf) / If, P = (Vsupply − Vf) × If.
 *
 * Requires strictly Vsupply > Vf: at Vsupply === Vf there's no headroom for
 * a series resistor to do anything, so it's treated as invalid input rather
 * than a degenerate R = 0 answer.
 */
export function calculateLedSeriesResistor(
  supplyVoltage: number,
  forwardVoltage: number,
  forwardCurrent: number,
  series: ESeriesName = "E24",
): LedResistorResult {
  if (
    !Number.isFinite(supplyVoltage) ||
    !Number.isFinite(forwardVoltage) ||
    !Number.isFinite(forwardCurrent)
  ) {
    throw new Error("Supply voltage, forward voltage, and forward current must be finite numbers.");
  }
  if (forwardVoltage <= 0) {
    throw new Error("LED forward voltage must be positive.");
  }
  if (forwardCurrent <= 0) {
    throw new Error("Forward current must be positive.");
  }
  if (supplyVoltage <= forwardVoltage) {
    throw new Error("Supply voltage must exceed the LED's forward voltage.");
  }

  const headroom = supplyVoltage - forwardVoltage;
  const resistanceOhms = headroom / forwardCurrent;
  const powerWatts = headroom * forwardCurrent;
  const { above } = findNearestStandardValues(resistanceOhms, series);

  if (above === null) {
    throw new Error(`${resistanceOhms} Ω exceeds the largest standard ${series} value available.`);
  }

  return {
    resistanceOhms,
    powerWatts,
    nextStandardValueOhms: above,
    exceedsQuarterWatt: powerWatts > QUARTER_WATT,
  };
}
