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
 * Crossfades between two renders of an icon (e.g. the same glyph in two
 * theme colours, or the toggle's sun/moon swap) by fading one opaque vector
 * out under the other fading in — simpler and more consistent than animating
 * `stroke`/`fill` on every underlying SVG primitive individually.
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
