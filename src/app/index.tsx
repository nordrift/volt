import { StyleSheet, View } from "react-native";
import Animated, { interpolateColor, useAnimatedStyle } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { HomeHeader } from "@/components/HomeHeader";
import { HomeRow, type HomeRowProps } from "@/components/HomeRow";
import { useThemeTransition } from "@/theme";

const AnimatedSafeAreaView = Animated.createAnimatedComponent(SafeAreaView);

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
  // Created once here and passed down so every animated colour on screen —
  // header, rows, chips, chevrons — moves off the exact same driver in
  // lockstep. See theme.ts § Theme transition.
  const transition = useThemeTransition();
  const { progress, from, to } = transition;

  const backgroundStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(progress.value, [0, 1], [from.background, to.background]),
  }));

  return (
    <AnimatedSafeAreaView style={[styles.screen, backgroundStyle]} edges={["top"]}>
      <HomeHeader transition={transition} />
      <View>
        {TOOLS.map((tool) => (
          <HomeRow key={tool.toolKey} {...tool} transition={transition} />
        ))}
      </View>
    </AnimatedSafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
