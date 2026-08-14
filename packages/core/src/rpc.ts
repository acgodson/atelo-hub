import { CHAIN_ID, PINNED_RPC_URL } from "./contracts";

export const BSC_TESTNET_RPC_URLS: readonly string[] = [
  PINNED_RPC_URL,
  "https://data-seed-prebsc-1-s1.bnbchain.org:8545",
  "https://data-seed-prebsc-2-s1.bnbchain.org:8545",
  "https://bsc-testnet.public.blastapi.io",
  "https://endpoints.omniatech.io/v1/bsc/testnet/public"
];

function readEnv(key: string): string | undefined {
  if (typeof process === "undefined" || !process.env) return undefined;
  const value = process.env[key];
  return typeof value === "string" ? value.trim() : undefined;
}

function dedupePinnedFirst(urls: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const url of [PINNED_RPC_URL, ...urls]) {
    const trimmed = url.trim();
    if (trimmed.length === 0 || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

export function rpcUrls(): string[] {
  const raw =
    readEnv("EXPO_PUBLIC_BSC_RPC_URLS") ??
    readEnv("NEXT_PUBLIC_BSC_RPC_URLS") ??
    readEnv("BSC_TESTNET_RPC_URLS");
  if (raw && raw.length > 0) {
    const parsed = raw
      .split(",")
      .map((entry) => entry.trim())
      .filter((entry) => entry.length > 0);
    if (parsed.length > 0) return dedupePinnedFirst(parsed);
  }
  const single =
    readEnv("EXPO_PUBLIC_BSC_TESTNET_RPC_URL") ??
    readEnv("NEXT_PUBLIC_BSC_TESTNET_RPC_URL") ??
    readEnv("BSC_TESTNET_RPC_URL");
  if (single && single.length > 0) return dedupePinnedFirst([single, ...BSC_TESTNET_RPC_URLS]);
  return dedupePinnedFirst([...BSC_TESTNET_RPC_URLS]);
}

export const RPC_CHAIN_ID = CHAIN_ID;
