import type { Href } from "expo-router";
import { router } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import {
  ESeriesIcon,
  LedResistorIcon,
  OhmsLawIcon,
  ResistorIcon,
  VoltageDividerIcon,
  type ToolIconProps,
} from "@/components/icons";
import { radius, spacing, type, useTheme, type ToolKey } from "@/theme";

const ICONS: Record<ToolKey, (props: ToolIconProps) => React.JSX.Element> = {
  resistorColourCode: ResistorIcon,
  ohmsLaw: OhmsLawIcon,
  voltageDivider: VoltageDividerIcon,
  ledResistor: LedResistorIcon,
  eSeriesLookup: ESeriesIcon,
};

function Chevron({ color }: { color: string }) {
  return (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none">
      <Path
        d="M9 5 L16 12 L9 19"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export type HomeRowProps = {
  toolKey: ToolKey;
  title: string;
  subtitle: string;
  href: Href;
};

// DESIGN.md § Components — Home row.
export function HomeRow({ toolKey, title, subtitle, href }: HomeRowProps) {
  const theme = useTheme();
  const Icon = ICONS[toolKey];
  const chip = theme.chips[toolKey];

  return (
    <Pressable
      onPress={() => router.push(href)}
      style={({ pressed }) => [
        styles.row,
        {
          borderBottomColor: theme.hairline,
          backgroundColor: pressed ? theme.wellPressed : "transparent",
        },
      ]}
    >
      <View style={[styles.chip, { backgroundColor: chip.bg, borderRadius: radius.sm }]}>
        <Icon color={chip.glyph} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>{subtitle}</Text>
      </View>
      <Chevron color={theme.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  chip: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: type.toolName.fontFamily,
    fontSize: type.toolName.fontSize,
    lineHeight: type.toolName.lineHeight,
  },
  subtitle: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
});
