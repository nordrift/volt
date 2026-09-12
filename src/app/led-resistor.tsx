import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { InputWell } from "@/components/InputWell";
import { Keypad } from "@/components/Keypad";
import { WarningLine } from "@/components/WarningLine";
import { Zone } from "@/components/Zone";
import { calculateLedSeriesResistor, type LedResistorResult } from "@/lib/led-resistor";
import { spacing, type, useTheme, type ThemeColors } from "@/theme";

// The label above shows Ω per the spec; a plain Ω figure would be
// unreadable past a few hundred, so this still tiers to kΩ/MΩ/GΩ like every
// other screen's resistance display — most real LED-resistor results just
// never leave the Ω range in practice.
function formatResistance(ohms: number): string {
  if (ohms >= 1_000_000_000) {
    return `${trimNumber(ohms / 1_000_000_000)} GΩ`;
  }
  if (ohms >= 1_000_000) {
    return `${trimNumber(ohms / 1_000_000)} MΩ`;
  }
  if (ohms >= 1_000) {
    return `${trimNumber(ohms / 1_000)} kΩ`;
  }
  return `${trimNumber(ohms)} Ω`;
}

function trimNumber(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

function formatWatts(watts: number): string {
  if (watts === 0) {
    return "0";
  }
  const abs = Math.abs(watts);
  const decimals = abs >= 100 ? 1 : abs >= 1 ? 3 : 6;
  return watts.toFixed(decimals).replace(/\.?0+$/, "");
}

function parseNumber(raw: string): number | undefined {
  if (raw === "") {
    return undefined;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

type Field = "vsupply" | "vf" | "ifMilliamps";

const FIELD_META: Record<Field, { label: string; unit: string; placeholder: string }> = {
  vsupply: { label: "Vsupply", unit: "V", placeholder: "5" },
  vf: { label: "Vf", unit: "V", placeholder: "2.1" },
  ifMilliamps: { label: "If", unit: "mA", placeholder: "20" },
};

const FIELDS: Field[] = ["vsupply", "vf", "ifMilliamps"];

function OutputField({
  label,
  value,
  valid,
  secondary,
  theme,
}: {
  label: string;
  value: string;
  valid: boolean;
  /** Omit entirely for outputs with no secondary line (e.g. P). When R
   * passes this, it's always a defined string — "—" when empty, never
   * omitted — so the line's position never shifts between states. */
  secondary?: string;
  theme: ThemeColors;
}) {
  return (
    <View style={styles.resultField}>
      <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.resultValue, { color: valid ? theme.accentCalculated : theme.textTertiary }]}>
        {value}
      </Text>
      {secondary !== undefined ? (
        <Text style={[styles.secondaryLabel, { color: theme.textTertiary }]}>{secondary}</Text>
      ) : null}
    </View>
  );
}

export default function LedResistor() {
  const theme = useTheme();
  const [values, setValues] = useState<Record<Field, string>>({
    vsupply: "",
    vf: "",
    ifMilliamps: "",
  });
  const [active, setActive] = useState<Field>("vsupply");

  function handleReset() {
    setValues({ vsupply: "", vf: "", ifMilliamps: "" });
    setActive("vsupply");
  }

  function handleDigit(digit: string) {
    setValues((prev) => ({ ...prev, [active]: prev[active] + digit }));
  }

  function handleDecimal() {
    setValues((prev) => (prev[active].includes(".") ? prev : { ...prev, [active]: prev[active] + "." }));
  }

  function handleBackspace() {
    setValues((prev) => ({ ...prev, [active]: prev[active].slice(0, -1) }));
  }

  const vsupply = parseNumber(values.vsupply);
  const vf = parseNumber(values.vf);
  const ifMa = parseNumber(values.ifMilliamps);

  let result: LedResistorResult | undefined;
  let errorMessage: string | undefined;

  if (vsupply !== undefined && vf !== undefined && ifMa !== undefined && ifMa !== 0) {
    // If = 0 is deliberately excluded here: the spec calls for no output and
    // no warning in that case, the same as an empty field — not the lib's
    // own "forward current must be positive" error.
    try {
      result = calculateLedSeriesResistor(vsupply, vf, ifMa / 1000, "E12");
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "That combination isn't valid.";
    }
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
      edges={["top", "bottom"]}
    >
      <Header title="LED resistor" onReset={handleReset} />

      <Zone hairline="bottom">
        <Text style={[styles.heading, { color: theme.textSecondary }]}>Calculated</Text>

        {errorMessage ? (
          <WarningLine message={errorMessage} />
        ) : (
          <View style={styles.resultRow}>
            <OutputField
              label="Resistance (R)"
              value={result ? formatResistance(result.resistanceOhms) : "—"}
              valid={!!result}
              secondary={`nearest standard: ${result ? formatResistance(result.nextStandardValueOhms) : "—"}`}
              theme={theme}
            />
            <OutputField
              label="Power (P)"
              value={result ? formatWatts(result.powerWatts) : "—"}
              valid={!!result}
              theme={theme}
            />
          </View>
        )}
      </Zone>

      {result?.exceedsQuarterWatt ? (
        <Zone hairline="bottom">
          <WarningLine message="Exceeds ¼W — use a higher-rated resistor" />
        </Zone>
      ) : null}

      {/* Absorbs the leftover space so Entered + Keypad still sit low, in
          thumb reach, without the Calculated zone's own bordered box
          stretching into a mostly-empty frame around short content. */}
      <View style={styles.spacer} />

      <Zone hairline="bottom">
        <View style={styles.enteredRow}>
          {FIELDS.map((field) => (
            <InputWell
              key={field}
              style={styles.wellFlex}
              label={FIELD_META[field].label}
              unit={FIELD_META[field].unit}
              placeholder={FIELD_META[field].placeholder}
              value={values[field]}
              focused={active === field}
              onPress={() => setActive(field)}
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
  spacer: {
    flex: 1,
  },
  heading: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
    marginBottom: spacing.md,
  },
  resultRow: {
    flexDirection: "row",
    gap: spacing.xl,
  },
  resultField: {
    gap: spacing.xs,
  },
  resultLabel: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
  resultValue: {
    fontFamily: type.value.fontFamily,
    fontSize: type.value.fontSize,
    lineHeight: type.value.lineHeight,
  },
  secondaryLabel: {
    fontFamily: type.caption.fontFamily,
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
  },
  enteredRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  wellFlex: {
    flex: 1,
  },
});
