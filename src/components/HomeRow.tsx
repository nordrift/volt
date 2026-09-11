import type { Href } from "expo-router";
import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle } from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";
import { CrossfadeIcon } from "@/components/CrossfadeIcon";
import {
  ESeriesIcon,
  LedResistorIcon,
  OhmsLawIcon,
  ResistorIcon,
  VoltageDividerIcon,
  type ToolIconProps,
} from "@/components/icons";
import { radius, screenPadding, spacing, type, type ThemeTransition, type ToolKey } from "@/theme";

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

export type HomeRowComponentProps = HomeRowProps & {
  transition: ThemeTransition;
};

// DESIGN.md § Components — Home row.
export function HomeRow({ toolKey, title, subtitle, href, transition }: HomeRowComponentProps) {
  const { progress, from, to } = transition;
  const Icon = ICONS[toolKey];
  const fromChip = from.chips[toolKey];
  const toChip = to.chips[toolKey];

  const borderStyle = useAnimatedStyle(() => ({
    borderBottomColor: interpolateColor(progress.value, [0, 1], [from.hairline, to.hairline]),
  }));
  const titleStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [from.textPrimary, to.textPrimary]),
  }));
  const subtitleStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [from.textSecondary, to.textSecondary]),
  }));
  const chipStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [fromChip.bg, toChip.bg]),
  }));

  return (
    <Pressable onPress={() => router.push(href)}>
      {({ pressed }) => (
        <Animated.View
          style={[styles.row, borderStyle, pressed && { backgroundColor: to.wellPressed }]}
        >
          <Animated.View style={[styles.chip, chipStyle]}>
            <CrossfadeIcon
              progress={progress}
              size={22}
              renderFrom={() => <Icon color={fromChip.glyph} />}
              renderTo={() => <Icon color={toChip.glyph} />}
            />
          </Animated.View>
          <View style={styles.text}>
            <Animated.Text style={[styles.title, titleStyle]}>{title}</Animated.Text>
            <Animated.Text style={[styles.subtitle, subtitleStyle]}>{subtitle}</Animated.Text>
          </View>
          <CrossfadeIcon
            progress={progress}
            size={16}
            renderFrom={() => <Chevron color={from.textTertiary} />}
            renderTo={() => <Chevron color={to.textTertiary} />}
          />
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: screenPadding,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    gap: spacing.md,
  },
  chip: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radius.sm,
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
