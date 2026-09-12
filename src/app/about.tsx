import Constants from "expo-constants";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { Zone } from "@/components/Zone";
import { spacing, type, useTheme } from "@/theme";

function openUrl(url: string) {
  Linking.openURL(url).catch(() => {});
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

      <Zone hairline="none" style={styles.content}>
        <Text style={[styles.appName, { color: theme.textPrimary }]}>Volt</Text>

        {version ? (
          <Text style={[styles.version, { color: theme.textSecondary }]}>Version {version}</Text>
        ) : null}

        <View style={[styles.divider, { backgroundColor: theme.hairline }]} />

        <Text style={[styles.eyebrow, { color: theme.textSecondary }]}>BY NORDRIFT</Text>

        <Pressable onPress={() => openUrl("https://nordrift.dev")} hitSlop={8}>
          <Text style={[styles.link, { color: theme.accentFocus }]}>nordrift.dev</Text>
        </Pressable>

        <Pressable onPress={() => openUrl("https://nordrift.dev/privacy")} hitSlop={8}>
          <Text style={[styles.privacyLink, { color: theme.textSecondary }]}>Privacy policy</Text>
        </Pressable>
      </Zone>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    gap: spacing.lg,
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
  divider: {
    height: 1,
  },
  eyebrow: {
    fontFamily: type.eyebrow.fontFamily,
    fontSize: type.eyebrow.fontSize,
    lineHeight: type.eyebrow.lineHeight,
    letterSpacing: type.eyebrow.letterSpacing,
  },
  link: {
    fontFamily: type.body.fontFamily,
    fontSize: type.body.fontSize,
    lineHeight: type.body.lineHeight,
  },
  privacyLink: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
});
