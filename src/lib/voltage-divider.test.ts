import { suggestVoltageDividerPairs, voltageDividerOutput } from "@/lib/voltage-divider";

describe("voltageDividerOutput", () => {
  test("equal resistors halve the input (10V, 1kΩ/1kΩ → 5V)", () => {
    expect(voltageDividerOutput(10, 1000, 1000)).toBe(5);
  });

  test("Vout = Vin × R2 / (R1 + R2)", () => {
    expect(voltageDividerOutput(9, 2000, 1000)).toBe(3);
  });

  test("R1 = 0 passes the input straight through", () => {
    expect(voltageDividerOutput(5, 0, 1000)).toBe(5);
  });

  test("R2 = 0 pulls the output to zero", () => {
    expect(voltageDividerOutput(5, 1000, 0)).toBe(0);
  });

  test("throws for negative resistance", () => {
    expect(() => voltageDividerOutput(5, -100, 1000)).toThrow();
    expect(() => voltageDividerOutput(5, 1000, -100)).toThrow();
  });

  test("throws when R1 and R2 are both zero", () => {
    expect(() => voltageDividerOutput(5, 0, 0)).toThrow();
  });

  test("throws for non-finite inputs", () => {
    expect(() => voltageDividerOutput(NaN, 1000, 1000)).toThrow();
  });
});

describe("suggestVoltageDividerPairs", () => {
  test("a 0.5 ratio is exactly achievable on E24 (equal standard resistors)", () => {
    const suggestions = suggestVoltageDividerPairs(10, 5, "E24");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.some((s) => s.errorPercent === 0 && s.r1 === s.r2)).toBe(true);
  });

  test("suggestions are ranked by ascending absolute error", () => {
    const suggestions = suggestVoltageDividerPairs(5, 3.3, "E24");
    for (let i = 1; i < suggestions.length; i += 1) {
      expect(Math.abs(suggestions[i - 1].errorPercent)).toBeLessThanOrEqual(
        Math.abs(suggestions[i].errorPercent),
      );
    }
  });

  test("each suggestion's vout is internally consistent with voltageDividerOutput", () => {
    const suggestions = suggestVoltageDividerPairs(5, 3.3, "E24");
    for (const s of suggestions) {
      expect(voltageDividerOutput(5, s.r1, s.r2)).toBeCloseTo(s.vout, 10);
    }
  });

  test("returns the requested number of candidates", () => {
    const suggestions = suggestVoltageDividerPairs(5, 3.3, "E24", { count: 3 });
    expect(suggestions).toHaveLength(3);
  });

  test("throws when target output is not strictly between 0 and Vin", () => {
    expect(() => suggestVoltageDividerPairs(5, 0, "E24")).toThrow();
    expect(() => suggestVoltageDividerPairs(5, 5, "E24")).toThrow();
    expect(() => suggestVoltageDividerPairs(5, 6, "E24")).toThrow();
    expect(() => suggestVoltageDividerPairs(5, -1, "E24")).toThrow();
  });

  test("throws for a non-positive input voltage", () => {
    expect(() => suggestVoltageDividerPairs(0, 1, "E24")).toThrow();
    expect(() => suggestVoltageDividerPairs(-5, 1, "E24")).toThrow();
  });
});
