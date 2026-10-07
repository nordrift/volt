import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, splash, type ThemeName } from "@/theme";

// The 288×288 native splash image size from app.json's expo-splash-screen
// plugin config, mirrored here so the icon doesn't resize the instant this
// JS layer takes over from the native splash. splash-icon.png is a square
// canvas holding the Volt lockup at 63% of its width, so 288 renders the
// lockup itself at ~182dp — the largest a 3:1 shape can be and still clear
// Android 12's circular icon mask.
const ICON_WIDTH = 288;

// Mirrors withSplashBranding.js's MAX_HEIGHT_DP of 14 at the wordmark's
// 8.25:1 ratio, so the mark is the same size before and after the handoff.
const WORDMARK_WIDTH = 115;
const WORDMARK_ASPECT_RATIO = 800 / 97;

/**
 * Stands in for the native splash screen after it hides. The centred image is
 * the Volt lockup (bolt + name); the NORDRIFT wordmark pinned near the bottom
 * is the parent-brand credit, the way Claude's splash puts ANTHROP\C under its
 * own lockup. The native splash can show both too (icon slot + API 31 branding
 * image), which is what withSplashBranding.js wires up — this layer exists so
 * the two are pixel-identical across the handoff. See _layout.tsx for timing.
 */
export function SplashOverlay({ scheme }: { scheme: ThemeName }) {
  const s = splash[scheme];

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: s.background }]}
      edges={["bottom"]}
    >
      <View style={styles.iconWrap}>
        <Image source={s.icon} style={styles.icon} resizeMode="contain" />
      </View>
      <View style={styles.wordmarkWrap}>
        <Image
          source={s.wordmark}
          style={[styles.wordmark, { aspectRatio: WORDMARK_ASPECT_RATIO }]}
          resizeMode="contain"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  iconWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  icon: {
    width: ICON_WIDTH,
    aspectRatio: 1,
  },
  wordmarkWrap: {
    alignItems: "center",
    paddingBottom: spacing["2xl"],
  },
  wordmark: {
    width: WORDMARK_WIDTH,
  },
});
