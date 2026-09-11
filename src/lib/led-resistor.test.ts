import { calculateLedSeriesResistor } from "@/lib/led-resistor";

describe("calculateLedSeriesResistor", () => {
  test("5V supply, 2V red LED, 20mA → 150Ω, 0.06W (both hand-verifiable)", () => {
    const result = calculateLedSeriesResistor(5, 2, 0.02);
    expect(result.resistanceOhms).toBeCloseTo(150, 10);
    expect(result.powerWatts).toBeCloseTo(0.06, 10);
    expect(result.nextStandardValueOhms).toBe(150); // 150 is itself a standard E24 value
    expect(result.exceedsQuarterWatt).toBe(false);
  });

  test("flags power exceeding 1/4W", () => {
    const result = calculateLedSeriesResistor(12, 2, 0.05);
    expect(result.resistanceOhms).toBeCloseTo(200, 10);
    expect(result.powerWatts).toBeCloseTo(0.5, 10);
    expect(result.nextStandardValueOhms).toBe(200); // also an exact E24 value
    expect(result.exceedsQuarterWatt).toBe(true);
  });

  test("rounds up to the nearest standard value when R isn't one exactly", () => {
    // headroom 7V / 10mA = 700Ω, which sits between the E24 values 680 and 750.
    const result = calculateLedSeriesResistor(9, 2, 0.01);
    expect(result.resistanceOhms).toBeCloseTo(700, 10);
    expect(result.nextStandardValueOhms).toBe(750);
  });

  test("power exactly at 1/4W does not count as exceeding it", () => {
    // headroom 2.5V / 0.1A = 25Ω, power = 2.5V × 0.1A = 0.25W exactly.
    const result = calculateLedSeriesResistor(4.5, 2, 0.1);
    expect(result.powerWatts).toBeCloseTo(0.25, 10);
    expect(result.exceedsQuarterWatt).toBe(false);
  });

  test("throws when forward current is zero or negative", () => {
    expect(() => calculateLedSeriesResistor(5, 2, 0)).toThrow();
    expect(() => calculateLedSeriesResistor(5, 2, -0.01)).toThrow();
  });

  test("throws when forward voltage is zero or negative", () => {
    expect(() => calculateLedSeriesResistor(5, 0, 0.02)).toThrow();
    expect(() => calculateLedSeriesResistor(5, -2, 0.02)).toThrow();
  });

  test("throws when supply voltage does not exceed forward voltage", () => {
    expect(() => calculateLedSeriesResistor(2, 2, 0.02)).toThrow(); // equal
    expect(() => calculateLedSeriesResistor(1.8, 2, 0.02)).toThrow(); // less than
  });

  test("throws for non-finite inputs", () => {
    expect(() => calculateLedSeriesResistor(NaN, 2, 0.02)).toThrow();
    expect(() => calculateLedSeriesResistor(5, 2, Infinity)).toThrow();
  });
});
