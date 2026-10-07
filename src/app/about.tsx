import Constants from "expo-constants";
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Header } from "@/components/Header";
import { screenPadding, spacing, type, useTheme, type ThemeColors } from "@/theme";

// Footer parent-brand credit: the NORDRIFT wordmark on its own, sat beside
// the copyright line. Width drives the box and aspectRatio derives height —
// both source PNGs are 800×97 (measured), so they share one ratio. At 110dp
// wide that's ~13dp tall, deliberately no taller than the caption next to it.
const BRAND_LOCKUP_WIDTH = 110;
const BRAND_LOCKUP_ASPECT_RATIO = 800 / 97;
const BRAND_LOCKUP_SOURCE = {
  light: require("@/assets/images/nordrift-wordmark-black.png"),
  dark: require("@/assets/images/nordrift-wordmark-white.png"),
};

// The app's own lockup, replacing the plain "Volt" text in the identity
// block. 34dp tall against the 32dp lineHeight the text occupied keeps the
// vertical rhythm of identity's gap stack intact while giving the title a
// little more presence than the Home header's 28dp instance.
const APP_LOCKUP_HEIGHT = 34;
const APP_LOCKUP_ASPECT_RATIO = 918 / 305;
const APP_LOCKUP_SOURCE = {
  light: require("@/assets/images/volt-lockup-black.png"),
  dark: require("@/assets/images/volt-lockup-white.png"),
};

function openUrl(url: string) {
  Linking.openURL(url).catch(() => {});
}

// Same glyph as the Home row's chevron (src/components/HomeRow.tsx) — kept
// as a local copy rather than a shared import since it's a single trivial
// SVG path, but drawn identically so the row treatment actually matches.
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

type LinkItem = { label: string; url: string };
type LinkSection = { label: string; items: LinkItem[] };

const LINK_SECTIONS: LinkSection[] = [
  {
    label: "Support",
    items: [
      { label: "Volt support", url: "https://nordrift.dev/support/volt/" },
      { label: "hello@nordrift.dev", url: "mailto:hello@nordrift.dev" },
    ],
  },
  {
    label: "Nordrift",
    items: [
      { label: "nordrift.dev", url: "https://nordrift.dev" },
      { label: "GitHub", url: "https://github.com/nordrift" },
      { label: "LinkedIn", url: "https://www.linkedin.com/company/nordrifthq" },
      { label: "X", url: "https://x.com/nordrifthq" },
    ],
  },
  {
    label: "Legal",
    items: [
      { label: "Privacy policy", url: "https://nordrift.dev/privacy/" },
      { label: "Terms of use", url: "https://nordrift.dev/terms/" },
    ],
  },
];

// DESIGN.md § Components — Home row, minus the icon chip: full-bleed,
// hairline-bottom, title + chevron, well-pressed on press. Screen-local
// because InputWell-style "shared, reused everywhere" doesn't apply to a
// row shape only this screen needs — but the visual treatment is identical
// on purpose, so About feels like part of the same app.
function LinkRow({ label, url, theme }: { label: string; url: string; theme: ThemeColors }) {
  return (
    <Pressable onPress={() => openUrl(url)}>
      {({ pressed }) => (
        <View
          style={[
            styles.linkRow,
            { borderBottomColor: theme.hairline, backgroundColor: pressed ? theme.wellPressed : "transparent" },
          ]}
        >
          <Text style={[styles.linkRowTitle, { color: theme.textPrimary }]}>{label}</Text>
          <Chevron color={theme.textTertiary} />
        </View>
      )}
    </Pressable>
  );
}

export default function About() {
  const theme = useTheme();
  const version = Constants.expoConfig?.version;

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
      edges={["top", "bottom"]}
    >
      <Header title="About" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.identity}>
          <Image
            source={APP_LOCKUP_SOURCE[theme.name]}
            style={styles.appLockup}
            resizeMode="contain"
            accessible
            accessibilityRole="header"
            accessibilityLabel="Volt"
          />
          {version ? (
            <Text style={[styles.version, { color: theme.textSecondary }]}>Version {version}</Text>
          ) : null}
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            An offline reference toolkit for electronics bench work — resistor codes,
            Ohm&apos;s law, dividers, LED resistors, and standard values.
          </Text>
        </View>

        <Text style={[styles.description, styles.privacyParagraph, { color: theme.textSecondary }]}>
          Volt works entirely offline, stores nothing between sessions apart from
          your theme preference, has no accounts, no analytics, and no crash
          reporting.
        </Text>

        <View style={[styles.divider, { backgroundColor: theme.hairline }]} />

        {LINK_SECTIONS.map((section) => (
          <View key={section.label} style={styles.linkSection}>
            <Text style={[styles.sectionLabel, { color: theme.textSecondary }]}>
              {section.label}
            </Text>
            <View>
              {section.items.map((item) => (
                <LinkRow key={item.label} label={item.label} url={item.url} theme={theme} />
              ))}
            </View>
          </View>
        ))}

        <View style={styles.footer}>
          <Image
            source={BRAND_LOCKUP_SOURCE[theme.name]}
            style={styles.brandLockup}
            resizeMode="contain"
            accessible
            accessibilityLabel="Nordrift"
          />
          <Text style={[styles.copyright, { color: theme.textTertiary }]}>© 2026 Nordrift</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: spacing.xl,
    gap: spacing.xl,
  },
  identity: {
    paddingHorizontal: screenPadding,
    gap: spacing.sm,
  },
  appLockup: {
    height: APP_LOCKUP_HEIGHT,
    aspectRatio: APP_LOCKUP_ASPECT_RATIO,
  },
  version: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
  description: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    lineHeight: type.body.lineHeight,
  },
  privacyParagraph: {
    paddingHorizontal: screenPadding,
  },
  divider: {
    height: 1,
  },
  linkSection: {
    gap: spacing.sm,
  },
  sectionLabel: {
    paddingHorizontal: screenPadding,
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: screenPadding,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
  },
  linkRowTitle: {
    fontFamily: type.toolName.fontFamily,
    fontSize: type.toolName.fontSize,
    lineHeight: type.toolName.lineHeight,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: screenPadding,
  },
  brandLockup: {
    width: BRAND_LOCKUP_WIDTH,
    aspectRatio: BRAND_LOCKUP_ASPECT_RATIO,
  },
  copyright: {
    fontFamily: type.caption.fontFamily,
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
  },
});
