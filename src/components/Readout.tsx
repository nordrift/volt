import { StyleSheet, Text, View } from "react-native";
import { spacing, type, useTheme } from "@/theme";

export type ReadoutProps = {
  /** Pre-formatted display value — this component doesn't format numbers. */
  value: string;
  unit: string;
};

// DESIGN.md § Components — Readout. The screen's one loud element, one per
// screen. Ohm's law is the documented exception that doesn't use this.
export function Readout({ value, unit }: ReadoutProps) {
  const theme = useTheme();

  return (
    <View style={styles.row}>
      <Text style={[styles.value, { color: theme.textPrimary }]}>{value}</Text>
      <Text style={[styles.unit, { color: theme.textSecondary }]}>{unit}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: spacing.xs,
  },
  value: {
    fontFamily: type.readout.fontFamily,
    fontSize: type.readout.fontSize,
    lineHeight: type.readout.lineHeight,
  },
  unit: {
    fontFamily: type.readoutUnit.fontFamily,
    fontSize: type.readoutUnit.fontSize,
    lineHeight: type.readoutUnit.lineHeight,
  },
});
