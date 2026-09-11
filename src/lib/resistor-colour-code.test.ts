import { bandsToValue, valueToBands } from "@/lib/resistor-colour-code";

describe("bandsToValue", () => {
  test("brown-black-red-gold is 1kΩ ±5% (hand-verifiable 4-band)", () => {
    const result = bandsToValue({
      count: 4,
      digit1: "brown",
      digit2: "black",
      multiplier: "red",
      tolerance: "gold",
    });
    expect(result).toEqual({
      resistanceOhms: 1000,
      tolerancePercent: 5,
      temperatureCoefficientPpm: null,
    });
  });

  test("red-red-black-brown-brown is 2.2kΩ ±1% (hand-verifiable 5-band)", () => {
    const result = bandsToValue({
      count: 5,
      digit1: "red",
      digit2: "red",
      digit3: "black",
      multiplier: "brown",
      tolerance: "brown",
    });
    expect(result).toEqual({
      resistanceOhms: 2200,
      tolerancePercent: 1,
      temperatureCoefficientPpm: null,
    });
  });

  test("6-band adds the temperature coefficient", () => {
    const result = bandsToValue({
      count: 6,
      digit1: "red",
      digit2: "red",
      digit3: "black",
      multiplier: "brown",
      tolerance: "brown",
      temperatureCoefficient: "brown",
    });
    expect(result).toEqual({
      resistanceOhms: 2200,
      tolerancePercent: 1,
      temperatureCoefficientPpm: 100,
    });
  });

  test("silver multiplier (×0.01) for sub-ohm values", () => {
    const result = bandsToValue({
      count: 4,
      digit1: "yellow",
      digit2: "violet",
      multiplier: "silver",
      tolerance: "gold",
    });
    expect(result.resistanceOhms).toBeCloseTo(0.47, 10);
  });
});

describe("valueToBands", () => {
  test("round-trips the brown-black-red-gold example", () => {
    expect(valueToBands(1000, 4, "gold")).toEqual({
      count: 4,
      digit1: "brown",
      digit2: "black",
      multiplier: "red",
      tolerance: "gold",
    });
  });

  test("4.7kΩ is yellow-violet-red-gold", () => {
    expect(valueToBands(4700, 4, "gold")).toEqual({
      count: 4,
      digit1: "yellow",
      digit2: "violet",
      multiplier: "red",
      tolerance: "gold",
    });
  });

  test("5-band uses 3 significant digits", () => {
    expect(valueToBands(2200, 5, "brown")).toEqual({
      count: 5,
      digit1: "red",
      digit2: "red",
      digit3: "black",
      multiplier: "brown",
      tolerance: "brown",
    });
  });

  test("6-band requires and carries a temperature coefficient", () => {
    expect(valueToBands(2200, 6, "brown", "brown")).toEqual({
      count: 6,
      digit1: "red",
      digit2: "red",
      digit3: "black",
      multiplier: "brown",
      tolerance: "brown",
      temperatureCoefficient: "brown",
    });
  });

  test("throws when a 6-band request omits the temperature coefficient", () => {
    expect(() => valueToBands(2200, 6, "brown")).toThrow();
  });

  test("sub-ohm values use the silver multiplier", () => {
    expect(valueToBands(0.47, 4, "gold")).toEqual({
      count: 4,
      digit1: "yellow",
      digit2: "violet",
      multiplier: "silver",
      tolerance: "gold",
    });
  });

  test("rounding at a 2-sig-fig boundary carries into the next decade", () => {
    // 999.6 Ω can't be represented exactly with 2 significant digits; the
    // nearest is 1000 Ω (brown-black-red), not a bogus 3rd significant digit.
    expect(valueToBands(999.6, 4, "gold")).toEqual({
      count: 4,
      digit1: "brown",
      digit2: "black",
      multiplier: "red",
      tolerance: "gold",
    });
  });

  test("throws for zero, negative, or non-finite resistance", () => {
    expect(() => valueToBands(0, 4, "gold")).toThrow();
    expect(() => valueToBands(-100, 4, "gold")).toThrow();
    expect(() => valueToBands(NaN, 4, "gold")).toThrow();
  });

  test("throws when the value is outside the representable range", () => {
    expect(() => valueToBands(1e12, 4, "gold")).toThrow();
    expect(() => valueToBands(0.0001, 4, "gold")).toThrow();
  });

  test("round-trips through bandsToValue within rounding tolerance", () => {
    const samples: [number, 4 | 5 | 6][] = [
      [47, 4],
      [330, 4],
      [10_000, 4],
      [1_234, 5],
      [56_780, 5],
      [999, 6],
    ];
    for (const [ohms, count] of samples) {
      const bands =
        count === 6 ? valueToBands(ohms, count, "brown", "brown") : valueToBands(ohms, count, "brown");
      const { resistanceOhms } = bandsToValue(bands);
      const relativeError = Math.abs(resistanceOhms - ohms) / ohms;
      // 2 sig figs (4-band) can be off by up to ~5%; 3 sig figs (5/6-band) by ~0.5%.
      expect(relativeError).toBeLessThan(count === 4 ? 0.05 : 0.005);
    }
  });
});
