import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from "react-native";
import { radius, screenPadding, spacing, touch, type, useTheme } from "@/theme";

export type ValuePickerOption<T extends string> = {
  value: T;
  label: string;
};

export type ValuePickerProps<T extends string> = {
  label: string;
  options: readonly ValuePickerOption<T>[];
  value: T;
  onChange: (value: T) => void;
  style?: StyleProp<ViewStyle>;
};

/**
 * DESIGN.md § Components — Value picker. For a property the user knows by
 * its real value (a percentage, a ppm figure), not by the colour on a band —
 * SegmentedControl doesn't fit once there are eight or nine options, and a
 * colour swatch is the wrong input model when the value, not the paint,
 * is what the user has in mind. Tapping the closed box opens a flat list
 * of the actual values; one tap selects and closes it.
 */
export function ValuePicker<T extends string>({
  label,
  options,
  value,
  onChange,
  style,
}: ValuePickerProps<T>) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  return (
    <View style={style}>
      <Pressable onPress={() => setOpen(true)} style={styles.container}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
        <View style={[styles.box, { backgroundColor: theme.well, borderColor: theme.hairline }]}>
          <Text
            style={[styles.value, { color: theme.textPrimary }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {selected?.label ?? "—"}
          </Text>
        </View>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: theme.background }]}>
            <Text style={[styles.sheetTitle, { color: theme.textSecondary }]}>{label}</Text>
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <Pressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  style={[styles.row, { borderBottomColor: theme.hairline }]}
                >
                  <Text
                    style={[
                      styles.rowLabel,
                      { color: isSelected ? theme.accentFocus : theme.textPrimary },
                    ]}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Pressable>
      </Modal>
    </View>
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
  box: {
    height: touch.minHeight,
    borderRadius: radius.sm,
    borderWidth: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.md,
  },
  value: {
    fontFamily: type.value.fontFamily,
    fontSize: type.value.fontSize,
    lineHeight: type.value.lineHeight,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    paddingHorizontal: screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: spacing["2xl"],
  },
  sheetTitle: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
    marginBottom: spacing.md,
  },
  row: {
    height: touch.minHeight,
    justifyContent: "center",
    borderBottomWidth: 1,
  },
  rowLabel: {
    fontFamily: type.value.fontFamily,
    fontSize: type.value.fontSize,
    lineHeight: type.value.lineHeight,
  },
});
