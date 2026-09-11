/** IEC 60062 resistor colour code, bidirectional, 4/5/6-band. */

export type DigitColor =
  | "black"
  | "brown"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "violet"
  | "gray"
  | "white";

export type MultiplierColor = DigitColor | "gold" | "silver";

export type ToleranceColor =
  | "brown"
  | "red"
  | "green"
  | "blue"
  | "violet"
  | "gray"
  | "gold"
  | "silver"
  | "none";

export type TempCoefficientColor =
  | "black"
  | "brown"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "violet"
  | "gray";

export type BandCount = 4 | 5 | 6;

export type FourBandResistor = {
  count: 4;
  digit1: DigitColor;
  digit2: DigitColor;
  multiplier: MultiplierColor;
  tolerance: ToleranceColor;
};

export type FiveBandResistor = {
  count: 5;
  digit1: DigitColor;
  digit2: DigitColor;
  digit3: DigitColor;
  multiplier: MultiplierColor;
  tolerance: ToleranceColor;
};

export type SixBandResistor = {
  count: 6;
  digit1: DigitColor;
  digit2: DigitColor;
  digit3: DigitColor;
  multiplier: MultiplierColor;
  tolerance: ToleranceColor;
  temperatureCoefficient: TempCoefficientColor;
};

export type ResistorBands = FourBandResistor | FiveBandResistor | SixBandResistor;

export type ResistorValue = {
  resistanceOhms: number;
  tolerancePercent: number;
  temperatureCoefficientPpm: number | null;
};

const DIGIT_VALUES: Record<DigitColor, number> = {
  black: 0,
  brown: 1,
  red: 2,
  orange: 3,
  yellow: 4,
  green: 5,
  blue: 6,
  violet: 7,
  gray: 8,
  white: 9,
};

const DIGIT_BY_VALUE: DigitColor[] = [
  "black",
  "brown",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "violet",
  "gray",
  "white",
];

const MULTIPLIER_VALUES: Record<MultiplierColor, number> = {
  silver: 0.01,
  gold: 0.1,
  black: 1,
  brown: 10,
  red: 100,
  orange: 1_000,
  yellow: 10_000,
  green: 100_000,
  blue: 1_000_000,
  violet: 10_000_000,
  gray: 100_000_000,
  white: 1_000_000_000,
};

const MULTIPLIER_BY_EXPONENT: readonly { color: MultiplierColor; exponent: number }[] = [
  { color: "silver", exponent: -2 },
  { color: "gold", exponent: -1 },
  { color: "black", exponent: 0 },
  { color: "brown", exponent: 1 },
  { color: "red", exponent: 2 },
  { color: "orange", exponent: 3 },
  { color: "yellow", exponent: 4 },
  { color: "green", exponent: 5 },
  { color: "blue", exponent: 6 },
  { color: "violet", exponent: 7 },
  { color: "gray", exponent: 8 },
  { color: "white", exponent: 9 },
];

const TOLERANCE_VALUES: Record<ToleranceColor, number> = {
  brown: 1,
  red: 2,
  green: 0.5,
  blue: 0.25,
  violet: 0.1,
  gray: 0.05,
  gold: 5,
  silver: 10,
  none: 20,
};

const TEMP_COEFFICIENT_VALUES: Record<TempCoefficientColor, number> = {
  black: 250,
  brown: 100,
  red: 50,
  orange: 15,
  yellow: 25,
  green: 20,
  blue: 10,
  violet: 5,
  gray: 1,
};

function digitsOf(bands: ResistorBands): DigitColor[] {
  return bands.count === 4
    ? [bands.digit1, bands.digit2]
    : [bands.digit1, bands.digit2, bands.digit3];
}

export function bandsToValue(bands: ResistorBands): ResistorValue {
  const significant = digitsOf(bands).reduce((acc, digit) => acc * 10 + DIGIT_VALUES[digit], 0);

  return {
    resistanceOhms: significant * MULTIPLIER_VALUES[bands.multiplier],
    tolerancePercent: TOLERANCE_VALUES[bands.tolerance],
    temperatureCoefficientPpm:
      bands.count === 6 ? TEMP_COEFFICIENT_VALUES[bands.temperatureCoefficient] : null,
  };
}

/**
 * Reverse mode: resistance → band colours. Tolerance (and, for 6-band, the
 * temperature coefficient) must be supplied explicitly — resistance alone
 * doesn't determine them.
 */
export function valueToBands(
  resistanceOhms: number,
  count: BandCount,
  tolerance: ToleranceColor,
  temperatureCoefficient?: TempCoefficientColor,
): ResistorBands {
  if (!Number.isFinite(resistanceOhms) || resistanceOhms <= 0) {
    throw new Error("Resistance must be a positive, finite number.");
  }
  if (count === 6 && temperatureCoefficient === undefined) {
    throw new Error("A 6-band resistor needs a temperature coefficient colour.");
  }

  const significantDigitCount = count === 4 ? 2 : 3;
  const maxSignificant = 10 ** significantDigitCount - 1;
  const minSignificant = 10 ** (significantDigitCount - 1);

  let exponent = Math.floor(Math.log10(resistanceOhms)) - (significantDigitCount - 1);
  let significant = Math.round(resistanceOhms / 10 ** exponent);

  if (significant > maxSignificant) {
    significant = Math.round(significant / 10);
    exponent += 1;
  } else if (significant < minSignificant) {
    significant *= 10;
    exponent -= 1;
  }

  const exponentEntry = MULTIPLIER_BY_EXPONENT.find((entry) => entry.exponent === exponent);
  if (!exponentEntry) {
    throw new Error(
      `${resistanceOhms} Ω is outside the range a ${count}-band colour code can represent.`,
    );
  }

  const digits = String(significant)
    .padStart(significantDigitCount, "0")
    .split("")
    .map((digitChar) => DIGIT_BY_VALUE[Number(digitChar)]);

  if (count === 4) {
    return { count: 4, digit1: digits[0], digit2: digits[1], multiplier: exponentEntry.color, tolerance };
  }
  if (count === 5) {
    return {
      count: 5,
      digit1: digits[0],
      digit2: digits[1],
      digit3: digits[2],
      multiplier: exponentEntry.color,
      tolerance,
    };
  }
  return {
    count: 6,
    digit1: digits[0],
    digit2: digits[1],
    digit3: digits[2],
    multiplier: exponentEntry.color,
    tolerance,
    temperatureCoefficient: temperatureCoefficient as TempCoefficientColor,
  };
}
