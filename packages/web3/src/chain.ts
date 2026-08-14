import { defineChain, type Chain } from "viem";
import { CHAIN_ID, PINNED_RPC_URL, rpcUrls } from "@atelo/core";

const httpUrls = rpcUrls();

export const bscTestnet: Chain = defineChain({
  id: CHAIN_ID,
  name: "BSC Testnet",
  nativeCurrency: { name: "tBNB", symbol: "tBNB", decimals: 18 },
  rpcUrls: { default: { http: httpUrls.length > 0 ? httpUrls : [PINNED_RPC_URL] } },
  blockExplorers: { default: { name: "BscScan Testnet", url: "https://testnet.bscscan.com" } },
  testnet: true
});
