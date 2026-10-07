import { Image, StyleSheet, View } from "react-native";
import { splash, type ThemeName } from "@/theme";

// The 288×288 native splash image size from app.json's expo-splash-screen
// plugin config, mirrored here so the icon doesn't resize the instant this
// JS layer takes over from the native splash. splash-icon.png is a square
// canvas holding the Volt lockup at 63% of its width, so 288 renders the
// lockup itself at ~182dp — the largest a 3:1 shape can be and still clear
// Android 12's circular icon mask.
const ICON_WIDTH = 288;

// Android 12+ paints the branding image as the background of a fixed
// 200×80dp view, horizontally centred and pinned 60dp above the bottom edge
// (measured on device). splash-branding.png is 800×320 — the same 2.5:1 —
// with the wordmark padded into its centre, so drawing it at 200×80dp in the
// same spot here puts the wordmark exactly where the native splash had it.
// Laid out as a full-width band of that height and offset with the image
// centred in it: the same final position, without relying on how Yoga aligns
// an absolutely positioned child.
const BRANDING_WIDTH = 200;
const BRANDING_HEIGHT = 80;
const BRANDING_BOTTOM_MARGIN = 60;

/**
 * Stands in for the native splash screen after it hides. The centred image is
 * the Volt lockup (bolt + name); the NORDRIFT wordmark pinned near the bottom
 * is the parent-brand credit, the way Claude's splash puts ANTHROP\C under its
 * own lockup. The native splash shows both too (icon slot + API 31 branding
 * image), which is what withSplashBranding.js wires up — this layer exists so
 * the two are pixel-identical across the handoff. See _layout.tsx for timing.
 *
 * Deliberately a plain View, not a SafeAreaView: the native splash window is
 * full-screen and measures its icon centre and branding margin from the
 * physical screen edges, so insets here would shift both off their native
 * positions.
 */
export function SplashOverlay({ scheme }: { scheme: ThemeName }) {
  const s = splash[scheme];

  return (
    <View style={[styles.container, { backgroundColor: s.background }]}>
      <View style={styles.iconWrap}>
        <Image source={s.icon} style={styles.icon} resizeMode="contain" />
      </View>
      <View style={styles.brandingBand}>
        <Image source={s.wordmark} style={styles.branding} resizeMode="contain" />
      </View>
    </View>
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
  brandingBand: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: BRANDING_BOTTOM_MARGIN,
    height: BRANDING_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  branding: {
    width: BRANDING_WIDTH,
    height: BRANDING_HEIGHT,
  },
});
