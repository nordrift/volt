import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { InputWell } from "@/components/InputWell";
import { Keypad } from "@/components/Keypad";
import { Readout } from "@/components/Readout";
import { SegmentedControl, type SegmentedControlOption } from "@/components/SegmentedControl";
import { WarningLine } from "@/components/WarningLine";
import { Zone } from "@/components/Zone";
import { standardValuesInRange, type ESeriesName } from "@/lib/e-series";
import {
  suggestVoltageDividerPairs,
  voltageDividerOutput,
  type DividerSuggestion,
} from "@/lib/voltage-divider";
import { spacing, type, useTheme } from "@/theme";

type Mode = "forward" | "reverse";

type ForwardField = "vin" | "r1" | "r2";
type ReverseField = "vin" | "targetVout";

type Suggestion = DividerSuggestion & { series: ESeriesName };

// Easiest to source first — an E12-achievable pair is preferred over an
// identical E24/E96 result for the same numbers (E12 ⊂ E24, so duplicates
// across series are the same r1/r2, not just similar).
const ALL_SERIES: ESeriesName[] = ["E12", "E24", "E96"];
const SUGGESTION_DISPLAY_COUNT = 10;
const SUGGESTION_SEARCH_COUNT = 15;

function suggestAcrossSeries(vin: number, targetVout: number): Suggestion[] {
  const seen = new Set<string>();
  const merged: Suggestion[] = [];
  for (const series of ALL_SERIES) {
    const suggestions = suggestVoltageDividerPairs(vin, targetVout, series, {
      count: SUGGESTION_SEARCH_COUNT,
    });
    for (const suggestion of suggestions) {
      const key = `${suggestion.r1}|${suggestion.r2}`;
      if (seen.has(key)) {
        continue;
      }
      seen.add(key);
      merged.push({ ...suggestion, series });
    }
  }
  merged.sort((a, b) => Math.abs(a.errorPercent) - Math.abs(b.errorPercent));
  return merged.slice(0, SUGGESTION_DISPLAY_COUNT);
}

/**
 * Target Vout = 0 means R2 = 0 — any R1 gives an exact 0V output, and 0
 * isn't a representable E-series value for suggestVoltageDividerPairs to
 * search around. Handled directly: the smallest standard R1 values in the
 * usual 100Ω–1MΩ range, each paired with R2 = 0, verified through
 * voltageDividerOutput rather than assumed.
 */
function zeroOutputSuggestions(vin: number): Suggestion[] {
  const seen = new Set<number>();
  const results: Suggestion[] = [];
  for (const series of ALL_SERIES) {
    for (const r1 of standardValuesInRange(series, { minExponent: 2, maxExponent: 6 })) {
      if (seen.has(r1)) {
        continue;
      }
      seen.add(r1);
      results.push({
        r1,
        r2: 0,
        vout: voltageDividerOutput(vin, r1, 0),
        errorPercent: 0,
        series,
      });
      if (results.length >= SUGGESTION_DISPLAY_COUNT) {
        return results;
      }
    }
  }
  return results;
}

function parseNumber(raw: string): number | undefined {
  if (raw === "") {
    return undefined;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/** Ω / kΩ / MΩ / GΩ — same tiering as the resistor screen's own formatter. */
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

function formatVoltage(value: number): string {
  if (value === 0) {
    return "0";
  }
  const abs = Math.abs(value);
  const decimals = abs >= 100 ? 1 : abs >= 1 ? 3 : 6;
  return value.toFixed(decimals).replace(/\.?0+$/, "");
}

function formatErrorPercent(percent: number): string {
  const rounded = Math.round(percent * 10) / 10;
  if (rounded === 0) {
    return "0%";
  }
  return `${rounded > 0 ? "+" : ""}${rounded}%`;
}

const MODE_OPTIONS: SegmentedControlOption<Mode>[] = [
  { value: "forward", label: "Forward" },
  { value: "reverse", label: "Reverse" },
];

const FORWARD_FIELD_META: Record<ForwardField, { label: string }> = {
  vin: { label: "Vin" },
  r1: { label: "R1" },
  r2: { label: "R2" },
};

const REVERSE_FIELD_META: Record<ReverseField, { label: string }> = {
  vin: { label: "Vin" },
  targetVout: { label: "Target Vout" },
};

export default function VoltageDivider() {
  const theme = useTheme();
  const [mode, setMode] = useState<Mode>("forward");

  const [forwardValues, setForwardValues] = useState<Record<ForwardField, string>>({
    vin: "",
    r1: "",
    r2: "",
  });
  const [forwardActive, setForwardActive] = useState<ForwardField>("vin");

  const [reverseValues, setReverseValues] = useState<Record<ReverseField, string>>({
    vin: "",
    targetVout: "",
  });
  const [reverseActive, setReverseActive] = useState<ReverseField>("vin");

  function handleReset() {
    setMode("forward");
    setForwardValues({ vin: "", r1: "", r2: "" });
    setForwardActive("vin");
    setReverseValues({ vin: "", targetVout: "" });
    setReverseActive("vin");
  }

  function handleDigit(digit: string) {
    if (mode === "forward") {
      setForwardValues((prev) => ({ ...prev, [forwardActive]: prev[forwardActive] + digit }));
    } else {
      setReverseValues((prev) => ({ ...prev, [reverseActive]: prev[reverseActive] + digit }));
    }
  }

  function handleDecimal() {
    if (mode === "forward") {
      setForwardValues((prev) =>
        prev[forwardActive].includes(".")
          ? prev
          : { ...prev, [forwardActive]: prev[forwardActive] + "." },
      );
    } else {
      setReverseValues((prev) =>
        prev[reverseActive].includes(".")
          ? prev
          : { ...prev, [reverseActive]: prev[reverseActive] + "." },
      );
    }
  }

  function handleBackspace() {
    if (mode === "forward") {
      setForwardValues((prev) => ({
        ...prev,
        [forwardActive]: prev[forwardActive].slice(0, -1),
      }));
    } else {
      setReverseValues((prev) => ({
        ...prev,
        [reverseActive]: prev[reverseActive].slice(0, -1),
      }));
    }
  }

  // Forward mode
  const vinF = parseNumber(forwardValues.vin);
  const r1F = parseNumber(forwardValues.r1);
  const r2F = parseNumber(forwardValues.r2);
  let forwardVout: number | undefined;
  let forwardError: string | undefined;
  if (vinF !== undefined && r1F !== undefined && r2F !== undefined) {
    if (r1F === 0 || r2F === 0) {
      // The lib treats these as valid degenerate cases (pass-through / pulled
      // to zero); this screen requires both resistors present to call it a
      // divider at all.
      forwardError = "R1 and R2 must both be greater than zero.";
    } else {
      try {
        forwardVout = voltageDividerOutput(vinF, r1F, r2F);
      } catch (error) {
        forwardError = error instanceof Error ? error.message : "That combination isn't valid.";
      }
    }
  }

  // Reverse mode
  const vinR = parseNumber(reverseValues.vin);
  const targetVoutR = parseNumber(reverseValues.targetVout);
  let suggestions: Suggestion[] | undefined;
  let reverseError: string | undefined;
  if (vinR !== undefined && targetVoutR !== undefined) {
    try {
      suggestions =
        targetVoutR === 0 ? zeroOutputSuggestions(vinR) : suggestAcrossSeries(vinR, targetVoutR);
    } catch (error) {
      reverseError = error instanceof Error ? error.message : "That combination isn't valid.";
    }
  }

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
      edges={["top", "bottom"]}
    >
      <Header title="Voltage divider" onReset={handleReset} />

      <Zone hairline="bottom">
        <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={setMode} />
      </Zone>

      <Zone hairline="bottom" style={styles.calculatedZone}>
        <Text style={[styles.heading, { color: theme.textSecondary }]}>Calculated</Text>

        {mode === "forward" ? (
          forwardVout !== undefined ? (
            <Readout value={formatVoltage(forwardVout)} unit="V" />
          ) : forwardError ? (
            <WarningLine message={forwardError} />
          ) : (
            <Text style={[styles.emptyState, { color: theme.textSecondary }]}>
              Enter Vin, R1, and R2
            </Text>
          )
        ) : suggestions ? (
          <View style={styles.suggestionBlock}>
            <View style={styles.suggestionHeaderRow}>
              <Text style={[styles.columnHeader, styles.colR1, { color: theme.textSecondary }]}>
                R1
              </Text>
              <Text style={[styles.columnHeader, styles.colR2, { color: theme.textSecondary }]}>
                R2
              </Text>
              <Text style={[styles.columnHeader, styles.colVout, { color: theme.textSecondary }]}>
                Vout
              </Text>
              <Text
                style={[styles.columnHeader, styles.colError, { color: theme.textSecondary }]}
              >
                Error
              </Text>
              <Text
                style={[styles.columnHeader, styles.colSeries, { color: theme.textSecondary }]}
              >
                Series
              </Text>
            </View>
            <ScrollView style={styles.suggestionScroll}>
              {suggestions.map((suggestion, index) => (
                <View
                  key={`${suggestion.r1}-${suggestion.r2}-${index}`}
                  style={[styles.suggestionRow, { borderBottomColor: theme.hairline }]}
                >
                  <Text style={[styles.suggestionValue, styles.colR1, { color: theme.textPrimary }]}>
                    {formatResistance(suggestion.r1)}
                  </Text>
                  <Text style={[styles.suggestionValue, styles.colR2, { color: theme.textPrimary }]}>
                    {formatResistance(suggestion.r2)}
                  </Text>
                  <Text
                    style={[
                      styles.suggestionValue,
                      styles.colVout,
                      { color: theme.accentCalculated },
                    ]}
                  >
                    {formatVoltage(suggestion.vout)} V
                  </Text>
                  <Text
                    style={[styles.suggestionValue, styles.colError, { color: theme.textSecondary }]}
                  >
                    {formatErrorPercent(suggestion.errorPercent)}
                  </Text>
                  <Text
                    style={[styles.seriesTag, styles.colSeries, { color: theme.textTertiary }]}
                  >
                    {suggestion.series}
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        ) : reverseError ? (
          <WarningLine message={reverseError} />
        ) : (
          <Text style={[styles.emptyState, { color: theme.textSecondary }]}>
            Enter Vin and a target output
          </Text>
        )}
      </Zone>

      <Zone hairline="bottom">
        {mode === "forward" ? (
          <View style={styles.enteredRow}>
            {(Object.keys(FORWARD_FIELD_META) as ForwardField[]).map((field) => (
              <InputWell
                key={field}
                style={styles.wellFlex}
                label={FORWARD_FIELD_META[field].label}
                unit={field === "vin" ? "V" : "Ω"}
                value={forwardValues[field]}
                focused={forwardActive === field}
                onPress={() => setForwardActive(field)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.enteredRow}>
            {(Object.keys(REVERSE_FIELD_META) as ReverseField[]).map((field) => (
              <InputWell
                key={field}
                style={styles.wellFlex}
                label={REVERSE_FIELD_META[field].label}
                unit="V"
                value={reverseValues[field]}
                focused={reverseActive === field}
                onPress={() => setReverseActive(field)}
              />
            ))}
          </View>
        )}
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
  },
  heading: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
    marginBottom: spacing.md,
  },
  emptyState: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
  enteredRow: {
    flexDirection: "row",
    gap: spacing.md,
  },
  wellFlex: {
    flex: 1,
  },
  suggestionBlock: {
    flex: 1,
  },
  suggestionHeaderRow: {
    flexDirection: "row",
    gap: spacing.xs,
    paddingBottom: spacing.sm,
  },
  suggestionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  suggestionScroll: {
    flex: 1,
  },
  columnHeader: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
    textAlign: "center",
  },
  suggestionValue: {
    fontFamily: type.value.fontFamily,
    fontSize: type.value.fontSize,
    lineHeight: type.value.lineHeight,
    textAlign: "center",
  },
  seriesTag: {
    fontFamily: type.caption.fontFamily,
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
    textAlign: "center",
  },
  colR1: {
    flex: 3,
  },
  colR2: {
    flex: 3,
  },
  colVout: {
    flex: 3,
  },
  colError: {
    flex: 2,
  },
  colSeries: {
    flex: 2,
  },
});
