import Constants from "expo-constants";
import { Linking, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Path } from "react-native-svg";
import { Header } from "@/components/Header";
import { screenPadding, spacing, type, useTheme, type ThemeColors } from "@/theme";

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
          <Text style={[styles.appName, { color: theme.textPrimary }]}>Volt</Text>
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
          <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>BY NORDRIFT</Text>
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
  appName: {
    fontFamily: type.screenTitle.fontFamily,
    fontSize: type.screenTitle.fontSize,
    lineHeight: type.screenTitle.lineHeight,
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
    paddingHorizontal: screenPadding,
    gap: spacing.xs,
  },
  eyebrow: {
    fontFamily: type.eyebrow.fontFamily,
    fontSize: type.eyebrow.fontSize,
    lineHeight: type.eyebrow.lineHeight,
    letterSpacing: type.eyebrow.letterSpacing,
  },
  copyright: {
    fontFamily: type.caption.fontFamily,
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
  },
});
