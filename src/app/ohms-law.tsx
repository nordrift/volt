import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/theme";

export default function OhmsLaw() {
  const theme = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <Text style={{ color: theme.textPrimary }}>Ohm&apos;s law</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
