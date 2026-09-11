import type { PropsWithChildren } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import { screenPadding, spacing, useTheme } from "@/theme";

export type ZoneProps = PropsWithChildren<{
  /** 1px rule at the bottom, separating this zone from the next. Zones have
   * no card, radius, or elevation of their own — see DESIGN.md § Screen anatomy. */
  hairline?: "bottom" | "none";
  padded?: boolean;
  style?: StyleProp<ViewStyle>;
}>;

export function Zone({ children, hairline = "bottom", padded = true, style }: ZoneProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        padded && styles.padded,
        hairline === "bottom" && { borderBottomWidth: 1, borderBottomColor: theme.hairline },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  padded: {
    paddingHorizontal: screenPadding,
    paddingVertical: spacing.xl,
  },
});
