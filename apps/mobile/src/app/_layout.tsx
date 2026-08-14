import { Component, type ReactNode } from "react";
import { Text, View } from "react-native";
import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WalletProvider } from "@atelo/web3";

class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            Please refresh the page. If this keeps happening, the app may be misconfigured.
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <WalletProvider>
        <SafeAreaProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </SafeAreaProvider>
      </WalletProvider>
    </ErrorBoundary>
  );
}

const styles = {
  fallback: {
    flex: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#0b0f1a",
    padding: 24,
    gap: 8
  },
  title: { color: "#E8EEF5", fontSize: 18, fontWeight: "700" as const },
  body: { color: "#93A1B0", fontSize: 14, textAlign: "center" as const, maxWidth: 320 }
};
