import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { InputWell } from "@/components/InputWell";
import { Keypad } from "@/components/Keypad";
import { WarningLine } from "@/components/WarningLine";
import { Zone } from "@/components/Zone";
import { solveOhmsLaw, type OhmsLawResult } from "@/lib/ohms-law";
import { spacing, type, useTheme } from "@/theme";

type Field = "voltage" | "current" | "resistance" | "power";

const FIELD_META: Record<Field, { label: string; unit: string }> = {
  voltage: { label: "Voltage", unit: "V" },
  current: { label: "Current", unit: "A" },
  resistance: { label: "Resistance", unit: "Ω" },
  power: { label: "Power", unit: "W" },
};

const ALL_FIELDS: Field[] = ["voltage", "current", "resistance", "power"];
const DEFAULT_ENTERED: [Field, Field] = ["voltage", "current"];

function emptyRawValues(): Record<Field, string> {
  return { voltage: "", current: "", resistance: "", power: "" };
}

function parseField(raw: string): number | undefined {
  if (raw === "") {
    return undefined;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** A clean, reasonably-precise display string — never scientific notation,
 * never a wall of floating-point decimals. */
function formatNumber(value: number): string {
  if (value === 0) {
    return "0";
  }
  const abs = Math.abs(value);
  const decimals = abs >= 100 ? 1 : abs >= 1 ? 3 : 6;
  return value.toFixed(decimals).replace(/\.?0+$/, "");
}

export default function OhmsLaw() {
  const theme = useTheme();
  const [enteredOrder, setEnteredOrder] = useState<[Field, Field]>(DEFAULT_ENTERED);
  const [rawValues, setRawValues] = useState<Record<Field, string>>(emptyRawValues());
  const [activeField, setActiveField] = useState<Field>(DEFAULT_ENTERED[0]);

  const calculatedFields = ALL_FIELDS.filter((field) => !enteredOrder.includes(field)) as [
    Field,
    Field,
  ];

  const enteredA = parseField(rawValues[enteredOrder[0]]);
  const enteredB = parseField(rawValues[enteredOrder[1]]);

  let result: OhmsLawResult | undefined;
  let errorMessage: string | undefined;

  if (enteredA !== undefined && enteredB !== undefined) {
    try {
      result = solveOhmsLaw({ [enteredOrder[0]]: enteredA, [enteredOrder[1]]: enteredB });
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "That combination isn't valid.";
    }
  }

  function handleReset() {
    setEnteredOrder(DEFAULT_ENTERED);
    setRawValues(emptyRawValues());
    setActiveField(DEFAULT_ENTERED[0]);
  }

  function handleTapCalculated(field: Field) {
    const [older] = enteredOrder;
    setEnteredOrder([enteredOrder[1], field]);
    setRawValues((prev) => ({
      ...prev,
      [older]: "",
      [field]: result ? formatNumber(result[field]) : "",
    }));
    setActiveField(field);
  }

  function handleDigit(digit: string) {
    setRawValues((prev) => ({ ...prev, [activeField]: prev[activeField] + digit }));
  }

  function handleDecimal() {
    setRawValues((prev) => {
      if (prev[activeField].includes(".")) {
        return prev;
      }
      return { ...prev, [activeField]: prev[activeField] + "." };
    });
  }

  function handleBackspace() {
    setRawValues((prev) => ({ ...prev, [activeField]: prev[activeField].slice(0, -1) }));
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={["top", "bottom"]}>
      <Header title="Ohm's law" onReset={handleReset} />

      <Zone hairline="bottom" style={styles.calculatedZone}>
        <Text style={[styles.calculatedHeading, { color: theme.textSecondary }]}>Calculated</Text>

        <View style={styles.calculatedRow}>
          {calculatedFields.map((field) => (
            <Pressable
              key={field}
              onPress={() => handleTapCalculated(field)}
              style={styles.calculatedValue}
            >
              <Text style={[styles.calculatedLabel, { color: theme.textSecondary }]}>
                {FIELD_META[field].label}
              </Text>
              <View style={styles.calculatedNumberRow}>
                <Text
                  style={[
                    styles.calculatedNumber,
                    { color: result ? theme.accentCalculated : theme.textTertiary },
                  ]}
                >
                  {result ? formatNumber(result[field]) : "—"}
                </Text>
                <Text style={[styles.calculatedUnit, { color: theme.textSecondary }]}>
                  {FIELD_META[field].unit}
                </Text>
              </View>
            </Pressable>
          ))}
        </View>

        {errorMessage ? (
          <View style={styles.calculatedFooter}>
            <WarningLine message={errorMessage} />
          </View>
        ) : !result ? (
          <Text style={[styles.emptyState, styles.calculatedFooter, { color: theme.textSecondary }]}>
            Enter any two values
          </Text>
        ) : null}
      </Zone>

      <Zone hairline="bottom">
        <View style={styles.enteredRow}>
          {enteredOrder.map((field) => (
            <InputWell
              key={field}
              style={styles.well}
              label={FIELD_META[field].label}
              unit={FIELD_META[field].unit}
              value={rawValues[field]}
              focused={activeField === field}
              onPress={() => setActiveField(field)}
            />
          ))}
        </View>
      </Zone>

      <Keypad onDigit={handleDigit} onDecimal={handleDecimal} onBackspace={handleBackspace} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  calculatedZone: {
    flex: 1,
    justifyContent: "center",
  },
  calculatedHeading: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
    marginBottom: spacing.md,
  },
  calculatedRow: {
    flexDirection: "row",
    gap: spacing.xl,
  },
  calculatedValue: {
    flex: 1,
    gap: spacing.xs,
  },
  calculatedLabel: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
  calculatedNumberRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  calculatedNumber: {
    fontFamily: type.value.fontFamily,
    fontSize: type.value.fontSize,
    lineHeight: type.value.lineHeight,
  },
  calculatedUnit: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
  emptyState: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
  calculatedFooter: {
    marginTop: spacing.md,
  },
  enteredRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  well: {
    flex: 1,
  },
});
