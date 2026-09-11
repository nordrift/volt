import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeHeader } from "@/components/HomeHeader";
import { HomeRow, type HomeRowProps } from "@/components/HomeRow";
import { useTheme } from "@/theme";

const TOOLS: HomeRowProps[] = [
  {
    toolKey: "resistorColourCode",
    title: "Resistor colour code",
    subtitle: "Bands to resistance value",
    href: "/resistor-colour-code",
  },
  {
    toolKey: "ohmsLaw",
    title: "Ohm's law",
    subtitle: "Voltage, current, resistance, power",
    href: "/ohms-law",
  },
  {
    toolKey: "voltageDivider",
    title: "Voltage divider",
    subtitle: "Output across two resistors",
    href: "/voltage-divider",
  },
  {
    toolKey: "ledResistor",
    title: "LED resistor",
    subtitle: "Series resistor for a single LED",
    href: "/led-resistor",
  },
  {
    toolKey: "eSeriesLookup",
    title: "E-series lookup",
    subtitle: "Snap to nearest standard part",
    href: "/e-series-lookup",
  },
];

export default function Home() {
  const theme = useTheme();

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: theme.background }]} edges={["top"]}>
      <HomeHeader />
      <View>
        {TOOLS.map((tool) => (
          <HomeRow key={tool.toolKey} {...tool} />
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
