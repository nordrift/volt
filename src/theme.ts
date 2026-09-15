import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Easing, useSharedValue, withTiming, type SharedValue } from "react-native-reanimated";

export type ThemeName = "light" | "dark";

export type ToolKey =
  | "resistorColourCode"
  | "ohmsLaw"
  | "voltageDivider"
  | "ledResistor"
  | "eSeriesLookup";

type ToolChip = { bg: string; glyph: string };

export type ThemeColors = {
  name: ThemeName;
  background: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  /** Calculated values — `accent-frost` (dark) / `accent-indigo` (light). */
  accentCalculated: string;
  /** Focus ring, active selection — `accent-fjord` (dark) / `accent-indigo` (light). */
  accentFocus: string;
  warning: string;
  well: string;
  wellPressed: string;
  hairline: string;
  /** The resistor illustration's body — the one place the fill itself isn't
   * a fixed IEC colour, since only the bands are. */
  surfaceTan: string;
  chips: Record<ToolKey, ToolChip>;
};

// DESIGN.md § Colour — Dark theme. Values unchanged from the parent-inherited
// tokens plus Volt's own well/well-pressed/hairline-dark additions.
const dark: ThemeColors = {
  name: "dark",
  background: "#000000", // inverse
  textPrimary: "#faf9f5", // canvas
  textSecondary: "#b0aea5", // text-secondary
  textTertiary: "#87867f", // text-tertiary
  accentCalculated: "#cbcadb", // accent-frost
  accentFocus: "#7289c0", // accent-fjord
  warning: "#ebdbbc", // surface-sand
  well: "#12161c",
  wellPressed: "#1a1f27",
  hairline: "#1e2530", // hairline-dark
  surfaceTan: "#d4a27f", // surface-tan
  chips: {
    resistorColourCode: { bg: "#2a2116", glyph: "#d4a27f" }, // glyph = surface-tan
    ohmsLaw: { bg: "#21203a", glyph: "#cbcadb" }, // glyph = accent-frost
    voltageDivider: { bg: "#182034", glyph: "#8fa3d4" },
    ledResistor: { bg: "#2b1d27", glyph: "#c98fb2" },
    eSeriesLookup: { bg: "#16241c", glyph: "#8ab29c" },
  },
};

// DESIGN.md § Colour — Light theme. Volt-local: the parent system has no
// light palette to inherit. Every value here (except well/well-pressed/
// warning, marked in DESIGN.md as "designed, not sampled") was read directly
// off design/Volt Home-selection-light.png with a colour picker.
const light: ThemeColors = {
  name: "light",
  background: "#ffffff", // canvas-light
  textPrimary: "#141413", // text-primary-light
  textSecondary: "#5e5d59", // text-secondary-light
  textTertiary: "#b0aea5", // text-tertiary-light
  accentCalculated: "#3c3a63", // accent-indigo
  accentFocus: "#3c3a63", // accent-indigo
  warning: "#9c6b2c", // surface-sand-light
  well: "#f4f2ed", // well-light
  wellPressed: "#ece9e1", // well-pressed-light
  hairline: "#e8e6de", // hairline-light
  surfaceTan: "#c9976a", // surface-tan-light — designed, not sampled: no mockup shows this yet
  chips: {
    resistorColourCode: { bg: "#f4e7d0", glyph: "#8a6534" },
    ohmsLaw: { bg: "#e4e3ed", glyph: "#3c3a63" }, // glyph = accent-indigo
    voltageDivider: { bg: "#e1e6f2", glyph: "#47598a" },
    ledResistor: { bg: "#efe0ea", glyph: "#854c70" },
    eSeriesLookup: { bg: "#dfe9e3", glyph: "#3f6450" },
  },
};

export const themes: Record<ThemeName, ThemeColors> = { light, dark };

// The launch-moment hero surface — indigo/black regardless of the light/dark
// app theme, so it's kept separate from ThemeColors rather than reused from
// it. Must mirror the "expo-splash-screen" plugin config in app.json exactly
// (background + image): SplashOverlay hands off from the native splash the
// instant it mounts, and any mismatch there shows as a flash.
// icon and wordmark are the same file for both themes — only the
// background flips, same as app.json's plugin config.
const SPLASH_ICON = require("@/assets/images/splash-icon.png");
const SPLASH_WORDMARK = require("@/assets/images/splash_branding.png");

export const splash: Record<ThemeName, { background: string; icon: number; wordmark: number }> = {
  light: {
    background: "#3c3a63", // accent-indigo — app.json plugin.image background
    icon: SPLASH_ICON,
    wordmark: SPLASH_WORDMARK,
  },
  dark: {
    background: "#000000", // app.json plugin.dark.backgroundColor
    icon: SPLASH_ICON,
    wordmark: SPLASH_WORDMARK,
  },
};

// DESIGN.md § Spacing
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;

// DESIGN.md § Radius
export const radius = {
  sm: 8,
  none: 0,
} as const;

// DESIGN.md § Spacing — "Screen horizontal padding is 20", called out
// separately from the 4·8·12·16·24·32·48 scale above.
export const screenPadding = 20;

// DESIGN.md § Touch
export const touch = {
  minHeight: 56,
  keyMinHeight: 64,
} as const;

// DESIGN.md § Motion
export const motion = {
  duration: 120,
  /** DESIGN.md § Theme persistence — the toggle's crossfade, its own named exception.
   * TEMP: slowed 200 → 800 for on-device motion diagnosis. Revert before shipping. */
  themeTransitionDuration: 800,
} as const;

export const fontFamilies = {
  interRegular: "Inter-Regular",
  interSemiBold: "Inter-SemiBold",
  monoRegular: "JetBrainsMono-Regular",
  monoMedium: "JetBrainsMono-Medium",
} as const;

// DESIGN.md § Type
export const type = {
  readout: { fontFamily: fontFamilies.monoMedium, fontSize: 44, lineHeight: 52 },
  readoutUnit: { fontFamily: fontFamilies.monoRegular, fontSize: 18, lineHeight: 26 },
  value: { fontFamily: fontFamilies.monoRegular, fontSize: 20, lineHeight: 26 },
  key: { fontFamily: fontFamilies.monoRegular, fontSize: 22, lineHeight: 28 },
  screenTitle: { fontFamily: fontFamilies.interSemiBold, fontSize: 26, lineHeight: 32 },
  toolName: { fontFamily: fontFamilies.interSemiBold, fontSize: 19, lineHeight: 24 },
  body: { fontFamily: fontFamilies.interRegular, fontSize: 16, lineHeight: 22 },
  label: { fontFamily: fontFamilies.interRegular, fontSize: 14, lineHeight: 18 },
  caption: { fontFamily: fontFamilies.interRegular, fontSize: 12, lineHeight: 16 },
  // Referenced in DESIGN.md's Type section but never pinned to a value —
  // this is its one real use (BY NORDRIFT on the About screen), so the
  // concrete numbers are set here for the first time.
  eyebrow: { fontFamily: fontFamilies.monoMedium, fontSize: 12, lineHeight: 16, letterSpacing: 1.5 },
} as const;

// --- Theme store -----------------------------------------------------------
// DESIGN.md § Theme persistence. A module-level store, not Context/Redux/
// Zustand (see CLAUDE.md § State) — theme is the one piece of state every
// screen needs without prop-drilling through the stack.

const STORAGE_KEY = "volt.theme";

type Listener = () => void;
const listeners = new Set<Listener>();
let activeThemeName: ThemeName = "light";

function notify() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot(): ThemeName {
  return activeThemeName;
}

/** Switches theme immediately and persists the choice. Fire-and-forget. */
export function setThemeName(name: ThemeName) {
  activeThemeName = name;
  notify();
  AsyncStorage.setItem(STORAGE_KEY, name).catch(() => {
    // Theme still applies for this session even if the write fails.
  });
}

/**
 * Resolves the starting theme: the user's saved choice if one exists,
 * otherwise the system colour scheme. Call once, from the root layout,
 * before the first screen renders.
 */
export async function loadInitialTheme(systemScheme: ThemeName): Promise<void> {
  let stored: string | null = null;
  try {
    stored = await AsyncStorage.getItem(STORAGE_KEY);
  } catch {
    stored = null;
  }
  activeThemeName = stored === "light" || stored === "dark" ? stored : systemScheme;
  notify();
}

export function useThemeName(): ThemeName {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function useTheme(): ThemeColors {
  return themes[useThemeName()];
}

/**
 * Same value as useThemeName(), but a change lags by the toggle's own
 * 200ms crossfade duration instead of applying instantly. For consumers
 * that can't animate a background themselves — the Stack's own screen
 * surface, the native root view via expo-system-ui — and would otherwise
 * flip to the new colour the moment the toggle is pressed, a full 200ms
 * before Home's animated foreground has moved at all. On Android, setting
 * those native background props triggers a repaint of a surface nothing
 * is yet painted over, which can show as a one-frame white flash. Holding
 * the backing layer on the old colour for the whole crossfade, then
 * swapping only once the visible animation has caught up, means it's
 * never exposed mid-transition.
 */
export function useSettledThemeName(): ThemeName {
  const live = useThemeName();
  const [settled, setSettled] = useState<ThemeName>(live);

  useEffect(() => {
    if (live === settled) {
      return;
    }
    const timeout = setTimeout(() => setSettled(live), motion.themeTransitionDuration);
    return () => clearTimeout(timeout);
  }, [live, settled]);

  return settled;
}

// --- Theme transition --------------------------------------------------
// Drives the ~200ms crossfade on the Home screen when the toggle is tapped.
// One driver, created once by the Home screen and passed down, so every
// animated colour on screen moves in exact lockstep — see HomeHeader/HomeRow.

export type ThemeTransition = {
  progress: SharedValue<number>;
  fromName: ThemeName;
  toName: ThemeName;
  from: ThemeColors;
  to: ThemeColors;
};

export function useThemeTransition(): ThemeTransition {
  const name = useThemeName();
  const progress = useSharedValue(1);
  const prevName = useRef<ThemeName>(name);
  const [pair, setPair] = useState<{ fromName: ThemeName; toName: ThemeName }>({
    fromName: name,
    toName: name,
  });

  useEffect(() => {
    if (prevName.current === name) {
      return;
    }
    setPair({ fromName: prevName.current, toName: name });
    prevName.current = name;
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: motion.themeTransitionDuration,
      easing: Easing.out(Easing.cubic),
    });
  }, [name, progress]);

  return {
    progress,
    fromName: pair.fromName,
    toName: pair.toName,
    from: themes[pair.fromName],
    to: themes[pair.toName],
  };
}
