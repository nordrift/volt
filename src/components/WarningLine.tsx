import { StyleSheet, Text, View } from "react-native";
import { spacing, type, useTheme } from "@/theme";

export type WarningLineProps = {
  /** States what's wrong and what to do — never an apology, no icon. */
  message: string;
};

// DESIGN.md § Components — Warning line.
export function WarningLine({ message }: WarningLineProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderLeftColor: theme.warning }]}>
      <Text style={[styles.text, { color: theme.warning }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderLeftWidth: 1,
    paddingLeft: spacing.sm,
  },
  text: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
});
