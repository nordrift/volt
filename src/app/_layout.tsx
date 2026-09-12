import { useFonts } from "expo-font";
import { Stack, ThemeProvider, type Theme } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import * as SystemUI from "expo-system-ui";
import { useEffect, useMemo, useState } from "react";
import { useColorScheme } from "react-native";
import { loadInitialTheme, motion, useTheme, type ThemeColors } from "@/theme";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const systemScheme = useColorScheme();
  const [fontsLoaded] = useFonts({
    "Inter-Regular": require("@/assets/fonts/Inter-Regular.ttf"),
    "Inter-SemiBold": require("@/assets/fonts/Inter-SemiBold.ttf"),
    "JetBrainsMono-Regular": require("@/assets/fonts/JetBrainsMono-Regular.ttf"),
    "JetBrainsMono-Medium": require("@/assets/fonts/JetBrainsMono-Medium.ttf"),
  });
  const [themeReady, setThemeReady] = useState(false);

  useEffect(() => {
    loadInitialTheme(systemScheme === "dark" ? "dark" : "light").then(() =>
      setThemeReady(true),
    );
    // Only the very first resolved system scheme should seed the default —
    // after that, the explicit toggle (see theme.ts) always wins.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const ready = fontsLoaded && themeReady;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [ready]);

  if (!ready) {
    return null;
  }

  return <RootLayoutNav />;
}

/**
 * Expo Router mounts its own NavigationContainer with no theme of its own —
 * left unset, it defaults to React Navigation's built-in light theme
 * (colors.background: white) regardless of Volt's own dark/light state.
 * That default is what react-native-screens paints behind/between screens
 * during a native transition, showing through as a white flash in dark
 * mode even though every screen's own contentStyle is correctly dark. This
 * makes the navigator's background genuinely theme-driven, at the source,
 * instead of only fixing each screen's own content.
 */
function buildNavigationTheme(t: ThemeColors): Theme {
  return {
    dark: t.name === "dark",
    colors: {
      primary: t.accentFocus,
      background: t.background,
      card: t.background,
      text: t.textPrimary,
      border: t.hairline,
      notification: t.warning,
    },
    fonts: {
      regular: { fontFamily: "Inter-Regular", fontWeight: "400" },
      medium: { fontFamily: "Inter-Regular", fontWeight: "500" },
      bold: { fontFamily: "Inter-SemiBold", fontWeight: "600" },
      heavy: { fontFamily: "Inter-SemiBold", fontWeight: "700" },
    },
  };
}

function RootLayoutNav() {
  const theme = useTheme();
  const navigationTheme = useMemo(() => buildNavigationTheme(theme), [theme]);

  useEffect(() => {
    // The previous fix (contentStyle + a navigation theme) only reaches an
    // inner content wrapper on Android — react-native-screens' own source
    // (ScreenStackItem.tsx, extractScreenStyles) only transfers a
    // background onto the native Screen surface itself on iOS formSheet
    // presentations. On Android that surface is left with no background of
    // its own, so during a native Fragment transition the gap falls back to
    // the app's native root view background — controlled by app.json's
    // android.backgroundColor, which was never set (Android's stock
    // default there is white). That key is build-time only and can't vary
    // by theme, so this keeps the same underlying native surface correct
    // at runtime instead, live with the toggle rather than fixed to one
    // theme.
    SystemUI.setBackgroundColorAsync(theme.background).catch(() => {});
  }, [theme.background]);

  return (
    <ThemeProvider value={navigationTheme}>
      {/* No <StatusBar> anywhere in the app meant the system status bar
          followed the device's own colour scheme, not Volt's in-app
          toggle — a fixed, un-animated mismatch sitting on top of an
          otherwise-correct crossfade whenever the two disagree. */}
      <StatusBar style={theme.name === "dark" ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.background },
          // DESIGN.md § Motion — 120ms ease-out, the same token used for
          // focus and value changes, reused here rather than the native
          // stack's default (slower, and on iOS a horizontal slide DESIGN.md
          // doesn't specify). "fade" is a pure crossfade, no slide/scale.
          animation: "fade",
          animationDuration: motion.duration,
        }}
      />
    </ThemeProvider>
  );
}
