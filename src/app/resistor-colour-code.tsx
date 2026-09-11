import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/Header";
import { InputWell } from "@/components/InputWell";
import { Keypad } from "@/components/Keypad";
import {
  BAND_COLOR_HEX,
  ResistorIllustration,
  type BandColorName,
  type IllustrationBand,
} from "@/components/ResistorIllustration";
import { SegmentedControl, type SegmentedControlOption } from "@/components/SegmentedControl";
import { ValuePicker, type ValuePickerOption } from "@/components/ValuePicker";
import { WarningLine } from "@/components/WarningLine";
import { Zone } from "@/components/Zone";
import {
  bandsToValue,
  valueToBands,
  type BandCount,
  type DigitColor,
  type MultiplierColor,
  type ResistorBands,
  type TempCoefficientColor,
  type ToleranceColor,
} from "@/lib/resistor-colour-code";
import { screenPadding, spacing, type, useTheme, type ThemeColors } from "@/theme";

// "Decode" (bands → value) / "Encode" (value → bands) — named for what the
// user is doing, not the data flow direction.
type Mode = "decode" | "encode";

type BandFields = {
  digit1: DigitColor;
  digit2: DigitColor;
  digit3: DigitColor;
  multiplier: MultiplierColor;
  tolerance: ToleranceColor;
  temperatureCoefficient: TempCoefficientColor;
};

const DEFAULT_BAND_FIELDS: Record<BandCount, BandFields> = {
  4: {
    digit1: "brown",
    digit2: "black",
    digit3: "black",
    multiplier: "red",
    tolerance: "gold",
    temperatureCoefficient: "brown",
  },
  5: {
    digit1: "red",
    digit2: "red",
    digit3: "black",
    multiplier: "brown",
    tolerance: "brown",
    temperatureCoefficient: "brown",
  },
  6: {
    digit1: "red",
    digit2: "red",
    digit3: "black",
    multiplier: "brown",
    tolerance: "brown",
    temperatureCoefficient: "brown",
  },
};

function bandFieldKeys(count: BandCount): (keyof BandFields)[] {
  if (count === 4) {
    return ["digit1", "digit2", "multiplier", "tolerance"];
  }
  if (count === 5) {
    return ["digit1", "digit2", "digit3", "multiplier", "tolerance"];
  }
  return ["digit1", "digit2", "digit3", "multiplier", "tolerance", "temperatureCoefficient"];
}

const DIGIT_PALETTE: DigitColor[] = [
  "black",
  "brown",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "violet",
  "gray",
  "white",
];
const MULTIPLIER_PALETTE: MultiplierColor[] = [
  "silver",
  "gold",
  "black",
  "brown",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "violet",
  "gray",
  "white",
];
// "none" (no band, ±20%) is excluded — this screen only offers 4/5/6 fully
// banded resistors, and an invisible band doesn't fit that.
const TOLERANCE_PALETTE: ToleranceColor[] = ["brown", "red", "green", "blue", "violet", "gray", "gold", "silver"];
const TEMP_PALETTE: TempCoefficientColor[] = [
  "black",
  "brown",
  "red",
  "orange",
  "yellow",
  "green",
  "blue",
  "violet",
  "gray",
];

function paletteFor(key: keyof BandFields): readonly BandColorName[] {
  if (key === "multiplier") {
    return MULTIPLIER_PALETTE;
  }
  if (key === "tolerance") {
    // TOLERANCE_PALETTE never includes "none" — the one ToleranceColor value
    // BandColorName doesn't have — so this narrowing is safe.
    return TOLERANCE_PALETTE as readonly BandColorName[];
  }
  if (key === "temperatureCoefficient") {
    return TEMP_PALETTE;
  }
  return DIGIT_PALETTE;
}

const DIGIT_LABEL: Record<DigitColor, string> = {
  black: "0",
  brown: "1",
  red: "2",
  orange: "3",
  yellow: "4",
  green: "5",
  blue: "6",
  violet: "7",
  gray: "8",
  white: "9",
};
const MULTIPLIER_LABEL: Record<MultiplierColor, string> = {
  silver: "×0.01",
  gold: "×0.1",
  black: "×1",
  brown: "×10",
  red: "×100",
  orange: "×1k",
  yellow: "×10k",
  green: "×100k",
  blue: "×1M",
  violet: "×10M",
  gray: "×100M",
  white: "×1G",
};
const TOLERANCE_LABEL: Record<ToleranceColor, string> = {
  brown: "±1%",
  red: "±2%",
  green: "±0.5%",
  blue: "±0.25%",
  violet: "±0.1%",
  gray: "±0.05%",
  gold: "±5%",
  silver: "±10%",
  none: "±20%",
};
const TEMP_LABEL: Record<TempCoefficientColor, string> = {
  black: "250ppm",
  brown: "100ppm",
  red: "50ppm",
  orange: "15ppm",
  yellow: "25ppm",
  green: "20ppm",
  blue: "10ppm",
  violet: "5ppm",
  gray: "1ppm",
};

function captionFor(key: keyof BandFields, fields: BandFields): string {
  switch (key) {
    case "digit1":
      return DIGIT_LABEL[fields.digit1];
    case "digit2":
      return DIGIT_LABEL[fields.digit2];
    case "digit3":
      return DIGIT_LABEL[fields.digit3];
    case "multiplier":
      return MULTIPLIER_LABEL[fields.multiplier];
    case "tolerance":
      return TOLERANCE_LABEL[fields.tolerance];
    case "temperatureCoefficient":
      return TEMP_LABEL[fields.temperatureCoefficient];
  }
}

function toResistorBands(count: BandCount, fields: BandFields): ResistorBands {
  if (count === 4) {
    return {
      count: 4,
      digit1: fields.digit1,
      digit2: fields.digit2,
      multiplier: fields.multiplier,
      tolerance: fields.tolerance,
    };
  }
  if (count === 5) {
    return {
      count: 5,
      digit1: fields.digit1,
      digit2: fields.digit2,
      digit3: fields.digit3,
      multiplier: fields.multiplier,
      tolerance: fields.tolerance,
    };
  }
  return {
    count: 6,
    digit1: fields.digit1,
    digit2: fields.digit2,
    digit3: fields.digit3,
    multiplier: fields.multiplier,
    tolerance: fields.tolerance,
    temperatureCoefficient: fields.temperatureCoefficient,
  };
}

/** Reads any ResistorBands variant back into the full BandFields shape.
 * Slots the current band count doesn't use are filled with an unused
 * placeholder — bandFieldKeys(count) never asks for them. */
function bandsToFields(bands: ResistorBands): BandFields {
  return {
    digit1: bands.digit1,
    digit2: bands.digit2,
    digit3: bands.count === 4 ? "black" : bands.digit3,
    multiplier: bands.multiplier,
    tolerance: bands.tolerance,
    temperatureCoefficient: bands.count === 6 ? bands.temperatureCoefficient : "brown",
  };
}

function illustrationFor(count: BandCount, fields: BandFields): IllustrationBand[] {
  return bandFieldKeys(count).map((key) => ({
    // fields[key] is only ever "none" for an unused, unrequested slot (see
    // bandsToFields) — bandFieldKeys never asks for tolerance="none" here.
    color: fields[key] as BandColorName,
    caption: captionFor(key, fields),
  }));
}

function parseResistance(raw: string): number | undefined {
  if (raw === "") {
    return undefined;
  }
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

function trimNumber(value: number): string {
  return (Math.round(value * 100) / 100).toString();
}

/** Ω / kΩ / MΩ / GΩ — a raw ohm count reads badly for anything past a few
 * hundred, and multiplier colours reach as high as ×1G (white), so GΩ is a
 * real, reachable case, not a hypothetical one. */
function formatResistance(ohms: number): string {
  if (ohms >= 1_000_000_000) {
    return `${trimNumber(ohms / 1_000_000_000)} GΩ`;
  }
  if (ohms >= 1_000_000) {
    return `${trimNumber(ohms / 1_000_000)} MΩ`;
  }
  if (ohms >= 1_000) {
    return `${trimNumber(ohms / 1_000)} kΩ`;
  }
  return `${trimNumber(ohms)} Ω`;
}

// Encode mode picks these by the value they mean, not the colour — ordered
// by that value (tightest tolerance / lowest drift first), not by the
// colour table's order. Labels stay short (≤7 chars) since the Temp.
// coefficient picker sits in a 40%-width column at 412dp — "100 ppm/°C"
// would be tight there, "100 ppm" isn't.
const TOLERANCE_OPTIONS: readonly ValuePickerOption<ToleranceColor>[] = [
  { value: "gray", label: "±0.05%" },
  { value: "violet", label: "±0.1%" },
  { value: "blue", label: "±0.25%" },
  { value: "green", label: "±0.5%" },
  { value: "brown", label: "±1%" },
  { value: "red", label: "±2%" },
  { value: "gold", label: "±5%" },
  { value: "silver", label: "±10%" },
];

const TEMP_OPTIONS: readonly ValuePickerOption<TempCoefficientColor>[] = [
  { value: "gray", label: "1 ppm" },
  { value: "violet", label: "5 ppm" },
  { value: "blue", label: "10 ppm" },
  { value: "orange", label: "15 ppm" },
  { value: "green", label: "20 ppm" },
  { value: "yellow", label: "25 ppm" },
  { value: "red", label: "50 ppm" },
  { value: "brown", label: "100 ppm" },
  { value: "black", label: "250 ppm" },
];

const BAND_COUNT_OPTIONS: SegmentedControlOption<BandCount>[] = [
  { value: 4, label: "4-band" },
  { value: 5, label: "5-band" },
  { value: 6, label: "6-band" },
];

const MODE_OPTIONS: SegmentedControlOption<Mode>[] = [
  { value: "decode", label: "Decode" },
  { value: "encode", label: "Encode" },
];

function ResultField({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ThemeColors;
}) {
  return (
    <View style={styles.resultField}>
      <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>{label}</Text>
      <Text style={[styles.resultValue, { color: theme.accentCalculated }]}>{value}</Text>
    </View>
  );
}

function SwatchRow({
  palette,
  selected,
  onSelect,
}: {
  palette: readonly BandColorName[];
  selected: BandColorName;
  onSelect: (color: BandColorName) => void;
}) {
  const theme = useTheme();
  return (
    <View style={styles.swatchRow}>
      {palette.map((color) => {
        const isSelected = color === selected;
        return (
          <Pressable
            key={color}
            onPress={() => onSelect(color)}
            style={[
              styles.swatch,
              {
                backgroundColor: BAND_COLOR_HEX[color],
                borderColor: isSelected ? theme.accentFocus : theme.hairline,
                borderWidth: isSelected ? 2 : 1,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export default function ResistorColourCode() {
  const theme = useTheme();
  const [mode, setMode] = useState<Mode>("decode");
  const [bandCount, setBandCount] = useState<BandCount>(4);
  const [fields, setFields] = useState<BandFields>(DEFAULT_BAND_FIELDS[4]);
  const [activeBandIndex, setActiveBandIndex] = useState(0);
  const [resistanceRaw, setResistanceRaw] = useState("");

  const keys = bandFieldKeys(bandCount);

  function handleBandCountChange(count: BandCount) {
    setBandCount(count);
    setFields(DEFAULT_BAND_FIELDS[count]);
    setActiveBandIndex(0);
  }

  function handleReset() {
    setMode("decode");
    setBandCount(4);
    setFields(DEFAULT_BAND_FIELDS[4]);
    setActiveBandIndex(0);
    setResistanceRaw("");
  }

  function handleSelectSwatch(color: BandColorName) {
    const key = keys[activeBandIndex];
    setFields((prev) => ({ ...prev, [key]: color }));
    if (activeBandIndex < keys.length - 1) {
      setActiveBandIndex(activeBandIndex + 1);
    }
  }

  function handleSelectTolerance(value: ToleranceColor) {
    setFields((prev) => ({ ...prev, tolerance: value }));
  }

  function handleSelectTempCoefficient(value: TempCoefficientColor) {
    setFields((prev) => ({ ...prev, temperatureCoefficient: value }));
  }

  function handleDigit(digit: string) {
    setResistanceRaw((prev) => prev + digit);
  }

  function handleDecimal() {
    setResistanceRaw((prev) => (prev.includes(".") ? prev : prev + "."));
  }

  function handleBackspace() {
    setResistanceRaw((prev) => prev.slice(0, -1));
  }

  // Decode mode is always valid — bandsToValue is a lookup + multiply over
  // enum inputs, it never throws.
  const decodeResult = bandsToValue(toResistorBands(bandCount, fields));
  const decodeIllustration = illustrationFor(bandCount, fields);

  // Encode mode: valueToBands throws only when the value is out of range or
  // non-positive — everything in range snaps to the nearest representable
  // value rather than failing, which is exactly what should render here.
  const resistanceValue = parseResistance(resistanceRaw);
  let encodeBands: ResistorBands | undefined;
  let encodeError: string | undefined;
  if (resistanceValue !== undefined) {
    try {
      encodeBands = valueToBands(
        resistanceValue,
        bandCount,
        fields.tolerance,
        bandCount === 6 ? fields.temperatureCoefficient : undefined,
      );
    } catch (error) {
      encodeError = error instanceof Error ? error.message : "That value isn't representable.";
    }
  }
  const encodeFields = encodeBands ? bandsToFields(encodeBands) : undefined;
  const encodeIllustration = encodeFields ? illustrationFor(bandCount, encodeFields) : undefined;
  const encodeValue = encodeBands ? bandsToValue(encodeBands) : undefined;

  return (
    <SafeAreaView
      style={[styles.screen, { backgroundColor: theme.background }]}
      edges={["top", "bottom"]}
    >
      <Header title="Resistor colour code" onReset={handleReset} />

      <Zone hairline="bottom" padded={false} style={styles.controlsZone}>
        <View style={styles.controlsColumn}>
          <SegmentedControl options={BAND_COUNT_OPTIONS} value={bandCount} onChange={handleBandCountChange} />
          <SegmentedControl options={MODE_OPTIONS} value={mode} onChange={setMode} />
        </View>
      </Zone>

      <Zone hairline="bottom" style={styles.calculatedZone}>
        <Text style={[styles.heading, { color: theme.textSecondary }]}>Calculated</Text>

        {mode === "decode" ? (
          <View style={styles.resultRow}>
            <ResultField label="Resistance" value={formatResistance(decodeResult.resistanceOhms)} theme={theme} />
            <ResultField label="Tolerance" value={TOLERANCE_LABEL[fields.tolerance]} theme={theme} />
            {bandCount === 6 && (
              <ResultField
                label="Temp. coefficient"
                value={`${decodeResult.temperatureCoefficientPpm} ppm/°C`}
                theme={theme}
              />
            )}
          </View>
        ) : (
          <View style={styles.encodeCalculated}>
            {encodeIllustration ? (
              <ResistorIllustration bands={encodeIllustration} />
            ) : encodeError ? (
              <WarningLine message={encodeError} />
            ) : (
              <Text style={[styles.emptyState, { color: theme.textSecondary }]}>
                Enter a resistance value
              </Text>
            )}

            <Text
              style={[
                styles.restated,
                { color: encodeValue ? theme.textSecondary : theme.textTertiary },
              ]}
            >
              {encodeValue
                ? `${formatResistance(encodeValue.resistanceOhms)} ±${trimNumber(encodeValue.tolerancePercent)}%`
                : "—"}
            </Text>
          </View>
        )}
      </Zone>

      <Zone hairline="bottom">
        {mode === "decode" ? (
          <View style={styles.decodeEntered}>
            <ResistorIllustration
              bands={decodeIllustration}
              activeIndex={activeBandIndex}
              onSelectBand={setActiveBandIndex}
            />
            <SwatchRow
              palette={paletteFor(keys[activeBandIndex])}
              selected={fields[keys[activeBandIndex]] as BandColorName}
              onSelect={handleSelectSwatch}
            />
          </View>
        ) : (
          <View style={[styles.encodeInputRow, styles.boxGroupPadding]}>
            <InputWell
              label="Resistance"
              unit="Ω"
              value={resistanceRaw}
              placeholder="1000"
              focused
              onPress={() => {}}
              style={bandCount === 6 ? styles.encodeResistanceFlex50 : styles.encodeResistanceFlex60}
            />
            <ValuePicker
              label="Tolerance"
              options={TOLERANCE_OPTIONS}
              value={fields.tolerance}
              onChange={handleSelectTolerance}
              style={bandCount === 6 ? styles.encodeSecondaryFlex25 : styles.encodeSecondaryFlex40}
            />
            {bandCount === 6 && (
              <ValuePicker
                label="Temp. co."
                options={TEMP_OPTIONS}
                value={fields.temperatureCoefficient}
                onChange={handleSelectTempCoefficient}
                style={styles.encodeSecondaryFlex25}
              />
            )}
          </View>
        )}
      </Zone>

      {mode === "encode" && (
        <Keypad onDigit={handleDigit} onDecimal={handleDecimal} onBackspace={handleBackspace} />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  controlsZone: {
    paddingHorizontal: screenPadding,
    paddingVertical: spacing.md,
  },
  controlsColumn: {
    gap: spacing.sm,
  },
  calculatedZone: {
    flex: 1,
  },
  heading: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
    marginBottom: spacing.md,
  },
  resultRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xl,
  },
  resultField: {
    gap: spacing.xs,
  },
  resultLabel: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
  resultValue: {
    fontFamily: type.value.fontFamily,
    fontSize: type.value.fontSize,
    lineHeight: type.value.lineHeight,
  },
  restated: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
  emptyState: {
    fontFamily: type.label.fontFamily,
    fontSize: type.label.fontSize,
    lineHeight: type.label.lineHeight,
  },
  decodeEntered: {
    gap: spacing.lg,
  },
  encodeCalculated: {
    gap: spacing.lg,
  },
  encodeInputRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  // 4-band / 5-band: Resistance/Tolerance at 60/40 (flex 3:2).
  encodeResistanceFlex60: {
    flex: 3,
  },
  encodeSecondaryFlex40: {
    flex: 2,
  },
  // 6-band: Resistance/Tolerance/Temp. co. at 50/25/25 (flex 2:1:1).
  encodeResistanceFlex50: {
    flex: 2,
  },
  encodeSecondaryFlex25: {
    flex: 1,
  },
  // DESIGN.md § Settled — Encode's box group aligns to the keypad's own
  // inset (spacing.sm) rather than the screen's usual padding, so the
  // Resistance/Tolerance/Temp.-coefficient box edges line up with the keys
  // beneath them. Pulls back out of the zone's default screenPadding rather
  // than changing it, so Decode (sharing the same Zone) is unaffected.
  boxGroupPadding: {
    marginHorizontal: -(screenPadding - spacing.sm),
  },
  swatchRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm,
  },
  swatch: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
});
