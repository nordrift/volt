import { Pressable, StyleSheet, Text, View } from "react-native";
import { radius, spacing, type, useTheme } from "@/theme";

export type BandColorName =
  | "black"
  | "brown"
  | "red"
  | "orange"
  | "yellow"
  | "green"
  | "blue"
  | "violet"
  | "gray"
  | "white"
  | "gold"
  | "silver";

/**
 * Fixed, real-world resistor paint colours. DESIGN.md: the resistor
 * illustration is "the one place colour isn't theme-driven state" — these
 * never change with light/dark mode or the accent palette.
 */
export const BAND_COLOR_HEX: Record<BandColorName, string> = {
  black: "#0a0a0a",
  brown: "#8b4a1f",
  red: "#d31f1f",
  orange: "#e8791a",
  yellow: "#f0d020",
  green: "#1f8b3c",
  blue: "#2255c4",
  violet: "#7c3fc0",
  gray: "#8a8a8a",
  white: "#f5f5f0",
  gold: "#c9a227",
  silver: "#b8b8b8",
};

export type IllustrationBand = {
  color: BandColorName;
  caption: string;
};

export type ResistorIllustrationProps = {
  bands: IllustrationBand[];
  /** Omit for a read-only illustration (e.g. reverse mode's derived result). */
  activeIndex?: number;
  onSelectBand?: (index: number) => void;
};

const BODY_HEIGHT = 64;
const LEAD_WIDTH = 28;
const LEAD_HEIGHT = 4;

// DESIGN.md § Components — Resistor illustration.
export function ResistorIllustration({ bands, activeIndex, onSelectBand }: ResistorIllustrationProps) {
  const theme = useTheme();

  return (
    <View>
      <View style={styles.row}>
        <View style={[styles.lead, { backgroundColor: theme.textTertiary }]} />
        <View style={[styles.body, { backgroundColor: theme.surfaceTan }]}>
          {bands.map((band, index) => (
            <Pressable
              key={index}
              disabled={!onSelectBand}
              onPress={() => onSelectBand?.(index)}
              style={styles.band}
            >
              <View style={[styles.bandFill, { backgroundColor: BAND_COLOR_HEX[band.color] }]} />
            </Pressable>
          ))}
        </View>
        <View style={[styles.lead, { backgroundColor: theme.textTertiary }]} />
      </View>

      <View style={styles.captionRow}>
        <View style={styles.leadSpacer} />
        {bands.map((band, index) => (
          <View key={index} style={styles.captionCell}>
            <Text style={[styles.caption, { color: theme.textSecondary }]}>{band.caption}</Text>
            <View
              style={[
                styles.underline,
                { backgroundColor: index === activeIndex ? theme.accentFocus : "transparent" },
              ]}
            />
          </View>
        ))}
        <View style={styles.leadSpacer} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  lead: {
    width: LEAD_WIDTH,
    height: LEAD_HEIGHT,
  },
  body: {
    flex: 1,
    height: BODY_HEIGHT,
    borderRadius: radius.sm,
    flexDirection: "row",
    overflow: "hidden",
  },
  band: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.sm,
  },
  bandFill: {
    width: "60%",
    height: "100%",
    borderRadius: 2,
  },
  captionRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.xs,
  },
  leadSpacer: {
    width: LEAD_WIDTH,
  },
  captionCell: {
    flex: 1,
    alignItems: "center",
    gap: spacing.xs,
  },
  caption: {
    fontFamily: type.caption.fontFamily,
    fontSize: type.caption.fontSize,
    lineHeight: type.caption.lineHeight,
  },
  underline: {
    height: 2,
    width: "60%",
    borderRadius: 1,
  },
});
