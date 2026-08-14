import { StyleSheet, Text, View } from "react-native";

export function ConnectButton() {
  return (
    <View style={styles.btn}>
      <Text style={styles.text}>Native wallet arrives in the dev build</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "#26303C",
    opacity: 0.7
  },
  text: { color: "#93A1B0", fontWeight: "600", fontSize: 11 }
});
