import { Pressable, StyleSheet, Text, View } from "react-native";
import { radius, spacing, touch, type, useTheme } from "@/theme";

export type InputWellProps = {
  label: string;
  unit: string;
  /** Raw typed digits, not yet parsed — "" renders as an em dash, never a 0. */
  value: string;
  focused: boolean;
  onPress: () => void;
};

// DESIGN.md § Components — Input well.
export function InputWell({ label, unit, value, focused, onPress }: InputWellProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={styles.container}>
      <Text style={[styles.label, { color: focused ? theme.textPrimary : theme.textSecondary }]}>
        {label}
      </Text>
      <View
        style={[
          styles.well,
          {
            backgroundColor: theme.well,
            borderColor: focused ? theme.accentFocus : theme.hairline,
          },
        ]}
      >
        <Text
          style={[styles.value, { color: value ? theme.textPrimary : theme.textTertiary }]}
          numberOfLines={1}
        >
          {value || "—"}
        </Text>
        <Text style={[styles.unit, { color: theme.textSecondary }]}>{unit}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: spacing.xs,
  },
  label: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
  well: {
    height: touch.minHeight,
    borderRadius: radius.sm,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  value: {
    flex: 1,
    fontFamily: type.value.fontFamily,
    fontSize: type.value.fontSize,
    lineHeight: type.value.lineHeight,
  },
  unit: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
});
