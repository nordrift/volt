import { Pressable, StyleSheet, Text, View } from "react-native";
import { radius, touch, type, useTheme } from "@/theme";

export type SegmentedControlOption<T extends string | number> = {
  value: T;
  label: string;
};

export type SegmentedControlProps<T extends string | number> = {
  options: SegmentedControlOption<T>[];
  value: T;
  onChange: (value: T) => void;
};

// DESIGN.md § Components — Segmented control. Band count, series selector,
// forward/reverse mode all share this.
export function SegmentedControl<T extends string | number>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const theme = useTheme();

  return (
    <View style={[styles.track, { backgroundColor: theme.well }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.segment,
              selected && {
                backgroundColor: theme.wellPressed,
                borderTopColor: theme.accentFocus,
              },
            ]}
          >
            <Text style={[styles.label, { color: theme.textPrimary }]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: "row",
    height: touch.minHeight,
    borderRadius: radius.sm,
    overflow: "hidden",
  },
  segment: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "transparent",
  },
  label: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    lineHeight: type.body.lineHeight,
  },
});
