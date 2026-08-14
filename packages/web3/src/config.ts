import { createConfig, type Config } from "wagmi";
import { CHAIN_ID } from "@atelo/core";
import { bscTestnet } from "./chain";
import { bscFallbackTransport } from "./transport";

export const wagmiConfig: Config = createConfig({
  chains: [bscTestnet],
  transports: { [CHAIN_ID]: bscFallbackTransport() }
});
