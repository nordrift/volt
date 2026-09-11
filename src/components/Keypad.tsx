import { Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { radius, spacing, touch, type, useTheme } from "@/theme";

export type KeypadProps = {
  onDigit: (digit: string) => void;
  onDecimal: () => void;
  onBackspace: () => void;
};

const ROWS: readonly (readonly ["digit" | "decimal" | "backspace", string])[][] = [
  [
    ["digit", "7"],
    ["digit", "8"],
    ["digit", "9"],
  ],
  [
    ["digit", "4"],
    ["digit", "5"],
    ["digit", "6"],
  ],
  [
    ["digit", "1"],
    ["digit", "2"],
    ["digit", "3"],
  ],
  [
    ["decimal", "."],
    ["digit", "0"],
    ["backspace", ""],
  ],
];

function BackspaceIcon({ color }: { color: string }) {
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none">
      <Path
        d="M8 5 L3 12 L8 19 H20 V5 Z"
        stroke={color}
        strokeWidth={1.7}
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M10.5 9.5 L15.5 14.5 M15.5 9.5 L10.5 14.5"
        stroke={color}
        strokeWidth={1.7}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// DESIGN.md § Components — Keypad. Replaces the system keyboard entirely —
// see CLAUDE.md's "keypad is hand-built and permanent" constraint.
export function Keypad({ onDigit, onDecimal, onBackspace }: KeypadProps) {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {ROWS.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map(([kind, glyph]) => (
            <Pressable
              key={kind === "backspace" ? "backspace" : glyph}
              onPress={() => {
                if (kind === "digit") {
                  onDigit(glyph);
                } else if (kind === "decimal") {
                  onDecimal();
                } else {
                  onBackspace();
                }
              }}
              style={({ pressed }) => [
                styles.key,
                { backgroundColor: pressed ? theme.wellPressed : theme.well },
              ]}
            >
              {kind === "backspace" ? (
                <BackspaceIcon color={theme.textPrimary} />
              ) : (
                <Text style={[styles.glyph, { color: theme.textPrimary }]}>{glyph}</Text>
              )}
            </Pressable>
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: spacing.sm,
    padding: spacing.sm,
  },
  row: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  key: {
    flex: 1,
    minHeight: touch.keyMinHeight,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
  },
  glyph: {
    fontFamily: type.key.fontFamily,
    fontSize: type.key.fontSize,
    lineHeight: type.key.lineHeight,
  },
});
