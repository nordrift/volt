import { Image, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing, splash, type ThemeName } from "@/theme";

// The 200×200 native splash image size from app.json's expo-splash-screen
// plugin config, mirrored here so the icon doesn't resize the instant this
// JS layer takes over from the native splash.
const ICON_WIDTH = 200;

// Matches the width the same wordmark lockup renders at on the About screen
// footer — one size for this asset family across the app.
const WORDMARK_WIDTH = 110;
const WORDMARK_ASPECT_RATIO = 218 / 82;

/**
 * Stands in for the native splash screen after it hides, adding the
 * "Volt / BY NORDRIFT" wordmark the native config can't show (it only
 * supports one centered image). Pinned near the bottom, the way Instagram
 * shows a small "from Meta" mark under its own logo — see _layout.tsx for
 * the handoff timing.
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
