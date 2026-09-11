import {
  E_SERIES_BASE_VALUES,
  findNearestStandardValues,
  standardValuesInRange,
} from "@/lib/e-series";

describe("E_SERIES_BASE_VALUES", () => {
  test("E12 has 12 values, E24 has 24", () => {
    expect(E_SERIES_BASE_VALUES.E12).toHaveLength(12);
    expect(E_SERIES_BASE_VALUES.E24).toHaveLength(24);
  });

  test("E12 is a subset of E24", () => {
    for (const value of E_SERIES_BASE_VALUES.E12) {
      expect(E_SERIES_BASE_VALUES.E24).toContain(value);
    }
  });

  test("E96 has 96 values, generated from the IEC formula", () => {
    expect(E_SERIES_BASE_VALUES.E96).toHaveLength(96);
    // Known first few values of the published E96 table.
    expect(E_SERIES_BASE_VALUES.E96.slice(0, 5)).toEqual([1.0, 1.02, 1.05, 1.07, 1.1]);
  });
});

describe("standardValuesInRange", () => {
  test("scales the base series across the requested decades", () => {
    const expected = E_SERIES_BASE_VALUES.E24.map((v) => Math.round(v * 100 * 1e6) / 1e6).sort(
      (a, b) => a - b,
    );
    expect(standardValuesInRange("E24", { minExponent: 2, maxExponent: 2 })).toEqual(expected);
  });

  test("returns values sorted ascending across multiple decades", () => {
    const values = standardValuesInRange("E12", { minExponent: 0, maxExponent: 1 });
    const sorted = [...values].sort((a, b) => a - b);
    expect(values).toEqual(sorted);
  });

  test("throws when minExponent exceeds maxExponent", () => {
    expect(() => standardValuesInRange("E24", { minExponent: 5, maxExponent: 1 })).toThrow();
  });
});

describe("findNearestStandardValues", () => {
  const range = { minExponent: 2, maxExponent: 2 }; // 100–910

  test("an exact standard value is its own nearest/below/above, at 0% error", () => {
    const result = findNearestStandardValues(1000, "E24");
    expect(result.nearest).toBe(1000);
    expect(result.below).toBe(1000);
    expect(result.above).toBe(1000);
    expect(result.nearestErrorPercent).toBe(0);
  });

  test("picks the closer neighbour when below is nearer", () => {
    const result = findNearestStandardValues(104, "E24", range);
    expect(result.below).toBe(100);
    expect(result.above).toBe(110);
    expect(result.nearest).toBe(100);
  });

  test("picks the closer neighbour when above is nearer", () => {
    const result = findNearestStandardValues(106, "E24", range);
    expect(result.below).toBe(100);
    expect(result.above).toBe(110);
    expect(result.nearest).toBe(110);
  });

  test("below wins an exact tie", () => {
    const result = findNearestStandardValues(105, "E24", range);
    expect(result.nearest).toBe(100);
  });

  test("target below the smallest value in range has no `below`", () => {
    const result = findNearestStandardValues(50, "E24", range);
    expect(result.below).toBeNull();
    expect(result.above).toBe(100);
    expect(result.nearest).toBe(100);
  });

  test("target above the largest value in range has no `above`", () => {
    const result = findNearestStandardValues(2000, "E24", range);
    expect(result.above).toBeNull();
    expect(result.below).toBe(910);
    expect(result.nearest).toBe(910);
  });

  test("throws for zero, negative, or non-finite targets", () => {
    expect(() => findNearestStandardValues(0, "E24")).toThrow();
    expect(() => findNearestStandardValues(-10, "E24")).toThrow();
    expect(() => findNearestStandardValues(NaN, "E24")).toThrow();
  });
});
