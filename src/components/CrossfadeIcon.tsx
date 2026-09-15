import type { ReactNode } from "react";
import { StyleSheet } from "react-native";
import Animated, { useAnimatedStyle, type SharedValue } from "react-native-reanimated";

export type CrossfadeIconProps = {
  progress: SharedValue<number>;
  size: number;
  renderFrom: () => ReactNode;
  renderTo: () => ReactNode;
};

/**
 * Crossfades between two renders of the same glyph (e.g. a tool icon in two
 * theme colours) by fading one opaque vector out under the other fading in —
 * simpler and more consistent than animating `stroke`/`fill` on every
 * underlying SVG primitive individually. For two different glyphs trading
 * places, see HomeHeader's ToggleIconSlide instead.
 */
export function CrossfadeIcon({ progress, size, renderFrom, renderTo }: CrossfadeIconProps) {
  const fromStyle = useAnimatedStyle(() => ({
    opacity: 1 - progress.value,
  }));
  const toStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
  }));

  return (
    <Animated.View style={{ width: size, height: size }}>
      <Animated.View style={[StyleSheet.absoluteFill, fromStyle]}>{renderFrom()}</Animated.View>
      <Animated.View style={toStyle}>{renderTo()}</Animated.View>
    </Animated.View>
  );
}
