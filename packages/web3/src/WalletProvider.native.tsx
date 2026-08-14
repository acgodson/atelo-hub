import "@walletconnect/react-native-compat";
import { useState, type ReactNode } from "react";
import { WagmiProvider, type Config } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppKit, createAppKit } from "@reown/appkit-react-native";
import { WagmiAdapter } from "@reown/appkit-wagmi-react-native";
import { CHAIN_ID } from "@atelo/core";
import { bscTestnet } from "./chain";
import { projectId, walletEnabled, walletMetadata } from "./env";
import { wagmiConfig } from "./config";
import { bscFallbackTransport } from "./transport";
import { appKitStorage } from "./storage.native";

const nativeMetadata = {
  ...walletMetadata,
  redirect: { native: "atelohub://" }
};

function buildConfig(): Config {
  if (!walletEnabled) return wagmiConfig;
  const adapter = new WagmiAdapter({
    networks: [bscTestnet],
    projectId,
    transports: { [CHAIN_ID]: bscFallbackTransport() }
  });
  createAppKit({
    projectId,
    metadata: nativeMetadata,
    adapters: [adapter],
    networks: [bscTestnet],
    storage: appKitStorage,
    enableAnalytics: false
  });
  return adapter.wagmiConfig;
}

let cachedConfig: Config | null = null;
function walletConfig(): Config {
  if (!cachedConfig) cachedConfig = buildConfig();
  return cachedConfig;
}

export function WalletProvider({ children }: { children: ReactNode }) {
  const [config] = useState<Config>(walletConfig);
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {walletEnabled ? <AppKit /> : null}
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}
