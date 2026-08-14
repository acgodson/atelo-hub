import { useState, type ReactNode } from "react";
import { WagmiProvider, type Config } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { bscTestnet as reownBscTestnet } from "@reown/appkit/networks";
import { CHAIN_ID } from "@atelo/core";
import { projectId, walletEnabled, walletMetadata } from "./env";
import { wagmiConfig } from "./config";
import { bscFallbackTransport } from "./transport";

function buildConfig(): Config {
  if (!walletEnabled) return wagmiConfig;
  const adapter = new WagmiAdapter({
    networks: [reownBscTestnet],
    projectId,
    transports: { [CHAIN_ID]: bscFallbackTransport() }
  });
  createAppKit({
    adapters: [adapter],
    networks: [reownBscTestnet],
    defaultNetwork: reownBscTestnet,
    projectId,
    metadata: walletMetadata,
    features: { analytics: false, email: false, socials: [] }
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
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
