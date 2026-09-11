import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { screenPadding, spacing, touch, type, useTheme } from "@/theme";

function BackArrow({ color }: { color: string }) {
  return (
    <Svg width={20} height={20} viewBox="0 0 24 24" fill="none">
      <Path
        d="M15 5 L8 12 L15 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export type HeaderProps = {
  title: string;
  onReset: () => void;
  /** Defaults to `router.back()`. */
  onBack?: () => void;
};

// DESIGN.md § Components — Header (the tool-screen header, distinct from
// HomeHeader: back arrow + reset control instead of the theme toggle + About).
export function Header({ title, onReset, onBack }: HeaderProps) {
  const theme = useTheme();

  return (
    <View style={[styles.container, { borderBottomColor: theme.hairline }]}>
      <Pressable onPress={onBack ?? (() => router.back())} hitSlop={12} style={styles.side}>
        <BackArrow color={theme.textPrimary} />
      </Pressable>
      <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
        {title}
      </Text>
      <Pressable onPress={onReset} hitSlop={12} style={styles.side}>
        <Text style={[styles.reset, { color: theme.textSecondary }]}>Reset</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: touch.minHeight,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: screenPadding,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  side: {
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontFamily: type.screenTitle.fontFamily,
    fontSize: type.screenTitle.fontSize,
    lineHeight: type.screenTitle.lineHeight,
  },
  reset: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    lineHeight: type.body.lineHeight,
  },
});
