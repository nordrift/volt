import { solveOhmsLaw } from "@/lib/ohms-law";

describe("solveOhmsLaw", () => {
  test("voltage + current → resistance, power (12V, 2A → 6Ω, 24W)", () => {
    expect(solveOhmsLaw({ voltage: 12, current: 2 })).toEqual({
      voltage: 12,
      current: 2,
      resistance: 6,
      power: 24,
    });
  });

  test("voltage + resistance → current, power", () => {
    expect(solveOhmsLaw({ voltage: 12, resistance: 6 })).toEqual({
      voltage: 12,
      current: 2,
      resistance: 6,
      power: 24,
    });
  });

  test("voltage + power → current, resistance", () => {
    expect(solveOhmsLaw({ voltage: 12, power: 24 })).toEqual({
      voltage: 12,
      current: 2,
      resistance: 6,
      power: 24,
    });
  });

  test("current + resistance → voltage, power", () => {
    expect(solveOhmsLaw({ current: 2, resistance: 6 })).toEqual({
      voltage: 12,
      current: 2,
      resistance: 6,
      power: 24,
    });
  });

  test("current + power → voltage, resistance", () => {
    expect(solveOhmsLaw({ current: 2, power: 24 })).toEqual({
      voltage: 12,
      current: 2,
      resistance: 6,
      power: 24,
    });
  });

  test("resistance + power → voltage, current (non-negative root by convention)", () => {
    expect(solveOhmsLaw({ resistance: 6, power: 24 })).toEqual({
      voltage: 12,
      current: 2,
      resistance: 6,
      power: 24,
    });
  });

  describe("input count validation", () => {
    test("throws with zero, one, three, or four values provided", () => {
      expect(() => solveOhmsLaw({})).toThrow();
      expect(() => solveOhmsLaw({ voltage: 5 })).toThrow();
      expect(() => solveOhmsLaw({ voltage: 5, current: 1, resistance: 5 })).toThrow();
      expect(() =>
        solveOhmsLaw({ voltage: 5, current: 1, resistance: 5, power: 5 }),
      ).toThrow();
    });

    test("throws for non-finite inputs", () => {
      expect(() => solveOhmsLaw({ voltage: NaN, current: 2 })).toThrow();
      expect(() => solveOhmsLaw({ voltage: Infinity, current: 2 })).toThrow();
    });
  });

  describe("voltage + current edge cases", () => {
    test("throws when current is zero (division by zero)", () => {
      expect(() => solveOhmsLaw({ voltage: 5, current: 0 })).toThrow();
    });

    test("throws when the sign combination implies negative resistance", () => {
      expect(() => solveOhmsLaw({ voltage: 5, current: -2 })).toThrow();
    });

    test("zero voltage with nonzero current is a valid short circuit (R=0, P=0)", () => {
      expect(solveOhmsLaw({ voltage: 0, current: 5 })).toEqual({
        voltage: 0,
        current: 5,
        resistance: 0,
        power: 0,
      });
    });
  });

  describe("voltage + resistance edge cases", () => {
    test("throws for negative resistance", () => {
      expect(() => solveOhmsLaw({ voltage: 5, resistance: -1 })).toThrow();
    });

    test("throws when zero resistance is given with nonzero voltage", () => {
      expect(() => solveOhmsLaw({ voltage: 5, resistance: 0 })).toThrow();
    });

    test("throws when zero resistance and zero voltage leave current indeterminate", () => {
      expect(() => solveOhmsLaw({ voltage: 0, resistance: 0 })).toThrow();
    });
  });

  describe("voltage + power edge cases", () => {
    test("throws for negative power", () => {
      expect(() => solveOhmsLaw({ voltage: 5, power: -1 })).toThrow();
    });

    test("throws when zero voltage and nonzero power are inconsistent", () => {
      expect(() => solveOhmsLaw({ voltage: 0, power: 5 })).toThrow();
    });

    test("throws when zero voltage and zero power leave current indeterminate", () => {
      expect(() => solveOhmsLaw({ voltage: 0, power: 0 })).toThrow();
    });

    test("throws when zero power at nonzero voltage implies an open circuit", () => {
      expect(() => solveOhmsLaw({ voltage: 5, power: 0 })).toThrow();
    });
  });

  describe("current + resistance edge cases", () => {
    test("throws for negative resistance", () => {
      expect(() => solveOhmsLaw({ current: 2, resistance: -1 })).toThrow();
    });

    test("zero resistance is a valid short circuit (V=0, P=0)", () => {
      expect(solveOhmsLaw({ current: 5, resistance: 0 })).toEqual({
        voltage: 0,
        current: 5,
        resistance: 0,
        power: 0,
      });
    });
  });

  describe("current + power edge cases", () => {
    test("throws for negative power", () => {
      expect(() => solveOhmsLaw({ current: 2, power: -1 })).toThrow();
    });

    test("throws when zero current and nonzero power are inconsistent", () => {
      expect(() => solveOhmsLaw({ current: 0, power: 5 })).toThrow();
    });

    test("throws when zero current and zero power leave voltage indeterminate", () => {
      expect(() => solveOhmsLaw({ current: 0, power: 0 })).toThrow();
    });
  });

  describe("resistance + power edge cases", () => {
    test("throws for negative resistance", () => {
      expect(() => solveOhmsLaw({ resistance: -1, power: 5 })).toThrow();
    });

    test("throws for negative power", () => {
      expect(() => solveOhmsLaw({ resistance: 5, power: -1 })).toThrow();
    });

    test("throws when zero resistance and nonzero power are inconsistent", () => {
      expect(() => solveOhmsLaw({ resistance: 0, power: 5 })).toThrow();
    });

    test("throws when zero resistance and zero power leave current indeterminate", () => {
      expect(() => solveOhmsLaw({ resistance: 0, power: 0 })).toThrow();
    });
  });
});
