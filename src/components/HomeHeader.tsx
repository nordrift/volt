import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle } from "react-native-reanimated";
import Svg, { Circle, Line, Path } from "react-native-svg";
import { screenPadding, setThemeName, spacing, touch, type, type ThemeTransition } from "@/theme";

const TOGGLE_ICON_SIZE = 18;

function SunIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Circle cx={12} cy={12} r={4.5} stroke={color} strokeWidth={1.8} />
      <Line x1={12} y1={1.5} x2={12} y2={4.5} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={12} y1={19.5} x2={12} y2={22.5} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={1.5} y1={12} x2={4.5} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={19.5} y1={12} x2={22.5} y2={12} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={4.4} y1={4.4} x2={6.5} y2={6.5} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={17.5} y1={17.5} x2={19.6} y2={19.6} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={4.4} y1={19.6} x2={6.5} y2={17.5} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      <Line x1={17.5} y1={6.5} x2={19.6} y2={4.4} stroke={color} strokeWidth={1.8} strokeLinecap="round" />
    </Svg>
  );
}

function MoonIcon({ color }: { color: string }) {
  return (
    <Svg width={18} height={18} viewBox="0 0 24 24" fill="none">
      <Path
        d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5Z"
        stroke={color}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </Svg>
  );
}

function ToggleGlyph({ name, color }: { name: "light" | "dark"; color: string }) {
  return name === "light" ? <MoonIcon color={color} /> : <SunIcon color={color} />;
}

/**
 * A sun and a moon aren't the same shape changing — they're two different
 * objects trading places — so this swaps them with a directional slide
 * rather than a crossfade: the outgoing glyph travels fully out one side
 * while the incoming one enters from the other, both moving the same way,
 * like a flip. Switching to light slides upward (sun rises in, moon sets
 * out the top); switching to dark slides downward. Driven by the same
 * `progress` value as the rest of the toggle's 200ms crossfade — a
 * separate duration would put the icon out of step with the header text
 * and hairline colour settling around it, and the icon only travels its
 * own 18dp box, so 200ms reads just as cleanly for the slide as it did
 * for the fade.
 */
function ToggleIconSlide({ transition }: { transition: ThemeTransition }) {
  const { progress, fromName, toName, from, to } = transition;
  const exitY = toName === "light" ? -TOGGLE_ICON_SIZE : TOGGLE_ICON_SIZE;

  const outgoingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: progress.value * exitY }],
  }));
  const incomingStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * -exitY }],
  }));

  return (
    <View style={styles.toggleIconClip}>
      <Animated.View style={[StyleSheet.absoluteFill, outgoingStyle]}>
        <ToggleGlyph name={fromName} color={from.textPrimary} />
      </Animated.View>
      <Animated.View style={[StyleSheet.absoluteFill, incomingStyle]}>
        <ToggleGlyph name={toName} color={to.textPrimary} />
      </Animated.View>
    </View>
  );
}

export type HomeHeaderProps = {
  transition: ThemeTransition;
};

// DESIGN.md § Home header. Not shown in the mockups as a distinct control —
// the two mockups are the toggle's before/after states, not a drawing of the
// switch itself — so this icon-only sun/moon button is a new but minimal
// choice, not a sampled one.
export function HomeHeader({ transition }: HomeHeaderProps) {
  const { progress, toName, from, to } = transition;

  const borderStyle = useAnimatedStyle(() => ({
    borderBottomColor: interpolateColor(progress.value, [0, 1], [from.hairline, to.hairline]),
  }));
  const textStyle = useAnimatedStyle(() => ({
    color: interpolateColor(progress.value, [0, 1], [from.textPrimary, to.textPrimary]),
  }));

  return (
    <Animated.View style={[styles.container, borderStyle]}>
      <Animated.Text style={[styles.title, textStyle]}>Volt</Animated.Text>
      <View style={styles.actions}>
        <Pressable
          onPress={() => setThemeName(toName === "light" ? "dark" : "light")}
          hitSlop={19}
          style={styles.toggle}
        >
          <ToggleIconSlide transition={transition} />
        </Pressable>
        <Pressable onPress={() => router.push("/about")} hitSlop={17}>
          <Animated.Text style={[styles.about, textStyle]}>About</Animated.Text>
        </Pressable>
      </View>
    </Animated.View>
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
  },
  title: {
    fontFamily: type.screenTitle.fontFamily,
    fontSize: type.screenTitle.fontSize,
    lineHeight: type.screenTitle.lineHeight,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  toggle: {
    alignItems: "center",
    justifyContent: "center",
  },
  toggleIconClip: {
    width: TOGGLE_ICON_SIZE,
    height: TOGGLE_ICON_SIZE,
    overflow: "hidden",
  },
  about: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    lineHeight: type.body.lineHeight,
  },
});
