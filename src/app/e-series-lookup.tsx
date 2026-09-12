import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { InputWell } from "@/components/InputWell";
import { Keypad } from "@/components/Keypad";
import { SegmentedControl, type SegmentedControlOption } from "@/components/SegmentedControl";
import { WarningLine } from "@/components/WarningLine";
import { Zone } from "@/components/Zone";
import { findNearestStandardValues, standardValuesInRange, type ESeriesName } from "@/lib/e-series";
import { spacing, type, useTheme } from "@/theme";

type RowResult = { value: number; errorPercent: number } | null;

type LookupResult = {
  nearest: RowResult;
  below: RowResult;
  above: RowResult;
};

/**
 * findNearestStandardValues collapses below/above/nearest to the same value
 * at an exact hit (correct — that value genuinely is nearest on both
 * sides). This screen wants the real neighbours either side of an exact
 * hit instead, so it doesn't show the same value three times.
 */
function lookupWithDistinctNeighbors(target: number, series: ESeriesName): LookupResult {
  const result = findNearestStandardValues(target, series);
  const nearest: RowResult = { value: result.nearest, errorPercent: result.nearestErrorPercent };

  const isExactHit = result.below !== null && result.below === result.nearest && result.above === result.nearest;

  if (!isExactHit) {
    return {
      nearest,
      below: result.below !== null ? { value: result.below, errorPercent: result.belowErrorPercent as number } : null,
      above: result.above !== null ? { value: result.above, errorPercent: result.aboveErrorPercent as number } : null,
    };
  }

  const values = standardValuesInRange(series);
  const index = values.indexOf(result.nearest);
  const belowValue = index > 0 ? values[index - 1] : null;
  const aboveValue = index >= 0 && index < values.length - 1 ? values[index + 1] : null;

  return {
    nearest,
    below: belowValue !== null ? { value: belowValue, errorPercent: ((belowValue - target) / target) * 100 } : null,
    above: aboveValue !== null ? { value: aboveValue, errorPercent: ((aboveValue - target) / target) * 100 } : null,
  };
}

function parseNumber(raw: string): number | undefined {
  if (raw === "") {
    return undefined;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** Ω / kΩ / MΩ / GΩ — same tiering as every other screen's resistance display. */
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

function formatErrorPercent(percent: number): string {
  const rounded = Math.round(percent * 10) / 10;
  if (rounded === 0) {
    return "0%";
  }
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

const SERIES_OPTIONS: SegmentedControlOption<ESeriesName>[] = [
  { value: "E12", label: "E12" },
  { value: "E24", label: "E24" },
  { value: "E96", label: "E96" },
];

export default function ESeriesLookup() {
  const theme = useTheme();
  const [series, setSeries] = useState<ESeriesName>("E24");
  const [raw, setRaw] = useState("");

  function handleReset() {
    setSeries("E24");
    setRaw("");
  }

  function handleDigit(digit: string) {
    setRaw((prev) => prev + digit);
  }

  function handleDecimal() {
    setRaw((prev) => (prev.includes(".") ? prev : prev + "."));
  }

  function handleBackspace() {
    setRaw((prev) => prev.slice(0, -1));
  }

  const target = parseNumber(raw);
  let lookup: LookupResult | undefined;
  let errorMessage: string | undefined;

  if (target !== undefined) {
    try {
      lookup = lookupWithDistinctNeighbors(target, series);
    } catch (error) {
      errorMessage = error instanceof Error ? error.message : "That value isn't valid.";
    }
  }

  const rows: { key: string; label: string; result: RowResult }[] = [
    { key: "nearest", label: `Nearest (${series})`, result: lookup?.nearest ?? null },
    { key: "below", label: `Below (${series})`, result: lookup?.below ?? null },
    { key: "above", label: `Above (${series})`, result: lookup?.above ?? null },
  ];

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
      edges={["top", "bottom"]}
    >
      <Header title="E-series lookup" onReset={handleReset} />

      <Zone hairline="bottom">
        <Text style={[styles.heading, { color: theme.textSecondary }]}>Calculated</Text>

        {errorMessage ? (
          <WarningLine message={errorMessage} />
        ) : (
          <View style={styles.resultColumn}>
            {rows.map((row) => (
              <View key={row.key} style={styles.resultRowLine}>
                <Text style={[styles.rowLabel, { color: theme.textSecondary }]}>{row.label}</Text>
                <Text
                  style={[
                    styles.rowValue,
                    { color: row.result ? theme.accentCalculated : theme.textTertiary },
                  ]}
                >
                  {row.result ? formatResistance(row.result.value) : "—"}
                </Text>
                <Text style={[styles.rowError, { color: theme.textSecondary }]}>
                  {row.result ? formatErrorPercent(row.result.errorPercent) : "—"}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Zone>

      {/* Absorbs the leftover space so the series control, Entered zone, and
          Keypad still sit low, in thumb reach, without the Calculated
          zone's own bordered box stretching into a mostly-empty frame —
          same fix as the LED resistor and resistor screens. */}
      <View style={styles.spacer} />

      <Zone hairline="bottom">
        <SegmentedControl options={SERIES_OPTIONS} value={series} onChange={setSeries} />
      </Zone>

      <Zone hairline="bottom">
        <InputWell
          label="Target resistance"
          unit="Ω"
          value={raw}
          placeholder="1000"
          focused
          onPress={() => {}}
        />
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
  resultColumn: {
    gap: spacing.md,
  },
  resultRowLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  rowLabel: {
    flex: 2,
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
  rowValue: {
    flex: 2,
    textAlign: "center",
    fontFamily: type.value.fontFamily,
    fontSize: type.value.fontSize,
    lineHeight: type.value.lineHeight,
  },
  rowError: {
    flex: 1,
    textAlign: "right",
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
});
