/**
 * V = I × R, P = V × I, P = I² × R, P = V² / R.
 *
 * Sign convention: V and I may be negative (reverse polarity), but a
 * physical resistor never has negative resistance or negative power, so any
 * input combination that would imply one throws rather than returning it.
 * When only R and P are known, the sign of V and I is genuinely
 * undetermined by magnitude alone — this returns the non-negative root by
 * convention.
 */

export type OhmsLawKnowns = {
  voltage?: number;
  current?: number;
  resistance?: number;
  power?: number;
};

export type OhmsLawResult = {
  voltage: number;
  current: number;
  resistance: number;
  power: number;
};

const KEYS = ["voltage", "current", "resistance", "power"] as const;

export function solveOhmsLaw(knowns: OhmsLawKnowns): OhmsLawResult {
  const provided = KEYS.filter((key) => knowns[key] !== undefined);

  if (provided.length !== 2) {
    throw new Error("Provide exactly two of voltage, current, resistance, power.");
  }

  for (const key of provided) {
    if (!Number.isFinite(knowns[key])) {
      throw new Error(`${key} must be a finite number.`);
    }
  }

  const has = (key: (typeof KEYS)[number]) => provided.includes(key);

  if (has("voltage") && has("current")) {
    const voltage = knowns.voltage as number;
    const current = knowns.current as number;
    if (current === 0) {
      throw new Error("Current cannot be zero when solving from voltage and current.");
    }
    const resistance = voltage / current;
    if (resistance < 0) {
      throw new Error("Voltage and current imply a negative resistance, which isn't physical.");
    }
    return { voltage, current, resistance, power: voltage * current };
  }

  if (has("voltage") && has("resistance")) {
    const voltage = knowns.voltage as number;
    const resistance = knowns.resistance as number;
    if (resistance < 0) {
      throw new Error("Resistance cannot be negative.");
    }
    if (resistance === 0) {
      if (voltage !== 0) {
        throw new Error("Zero resistance forces zero voltage; the given voltage is inconsistent.");
      }
      throw new Error(
        "Current is indeterminate: any current keeps voltage at zero when resistance is zero.",
      );
    }
    const current = voltage / resistance;
    return { voltage, current, resistance, power: voltage * current };
  }

  if (has("voltage") && has("power")) {
    const voltage = knowns.voltage as number;
    const power = knowns.power as number;
    if (power < 0) {
      throw new Error("Power cannot be negative.");
    }
    if (voltage === 0) {
      if (power !== 0) {
        throw new Error("Zero voltage forces zero power; the given power is inconsistent.");
      }
      throw new Error(
        "Current is indeterminate: any current keeps power at zero when voltage is zero.",
      );
    }
    if (power === 0) {
      throw new Error(
        "Resistance is undefined: zero power at nonzero voltage means an open circuit.",
      );
    }
    const current = power / voltage;
    const resistance = (voltage * voltage) / power;
    return { voltage, current, resistance, power };
  }

  if (has("current") && has("resistance")) {
    const current = knowns.current as number;
    const resistance = knowns.resistance as number;
    if (resistance < 0) {
      throw new Error("Resistance cannot be negative.");
    }
    const voltage = current * resistance;
    const power = current * current * resistance;
    return { voltage, current, resistance, power };
  }

  if (has("current") && has("power")) {
    const current = knowns.current as number;
    const power = knowns.power as number;
    if (power < 0) {
      throw new Error("Power cannot be negative.");
    }
    if (current === 0) {
      if (power !== 0) {
        throw new Error("Zero current forces zero power; the given power is inconsistent.");
      }
      throw new Error(
        "Voltage is indeterminate: any voltage keeps power at zero when current is zero.",
      );
    }
    const voltage = power / current;
    const resistance = power / (current * current);
    return { voltage, current, resistance, power };
  }

  // resistance && power
  const resistance = knowns.resistance as number;
  const power = knowns.power as number;
  if (resistance < 0) {
    throw new Error("Resistance cannot be negative.");
  }
  if (power < 0) {
    throw new Error("Power cannot be negative.");
  }
  if (resistance === 0) {
    if (power !== 0) {
      throw new Error("Zero resistance forces zero power; the given power is inconsistent.");
    }
    throw new Error(
      "Current is indeterminate: any current keeps power at zero when resistance is zero.",
    );
  }
  const voltage = Math.sqrt(power * resistance);
  const current = Math.sqrt(power / resistance);
  return { voltage, current, resistance, power };
}
