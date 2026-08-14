import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { WalletProvider } from "@atelo/web3";

export default function RootLayout() {
  return (
    <WalletProvider>
      <SafeAreaProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </SafeAreaProvider>
    </WalletProvider>
  );
}
