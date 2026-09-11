import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { radius, spacing, touch, type, useTheme } from "@/theme";

export type InputWellProps = {
  label: string;
  unit: string;
  /** Raw typed digits, not yet parsed — "" renders `placeholder`, never a 0. */
  value: string;
  focused: boolean;
  onPress: () => void;
  /** Shown in place of the value when empty. Defaults to an em dash — see
   * DESIGN.md § Input well. A screen may override it (e.g. "Enter resistance"). */
  placeholder?: string;
  /**
   * Layout only — e.g. `flex: 1` when placed in a row of equal-width wells.
   * Not set by the component itself: a lone well in a column shouldn't be
   * forced to flex-grow against an undefined-height parent.
   */
  style?: StyleProp<ViewStyle>;
};

// DESIGN.md § Components — Input well.
export function InputWell({
  label,
  unit,
  value,
  focused,
  onPress,
  placeholder = "—",
  style,
}: InputWellProps) {
  const theme = useTheme();

  return (
    <Pressable onPress={onPress} style={[styles.container, style]}>
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
          {value || placeholder}
        </Text>
        <Text style={[styles.unit, { color: theme.textSecondary }]}>{unit}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
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
