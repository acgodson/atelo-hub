export const REFERENCE_AGENT = {
  agentKey: "97-1809",
  tokenId: "1809",
  erc8004AgentId: 1809,
  chainId: 97,
  name: "Atelo Reference Agent",
  ownerLabel: "Atelo-owned (first-party)",
  firstPartyNote:
    "Atelo-owned first-party reference agent. Labeled first-party everywhere and never counted as third-party marketplace diversity."
} as const;

export const REACH_VAPID_PUBLIC_KEY =
  "BM2sOaTNAQVM2Ce8kJqE9mIrZXXigOidnDwSBqlS_cbbL-3pJgS7e2oJdM-PaVBGeed-YNoIfGSafK5I8u-Aprs";

export function bscScanTx(hash: string): string {
  return `https://testnet.bscscan.com/tx/${hash}`;
}

export function shortHash(hash: string, lead = 8, tail = 6): string {
  if (hash.length <= lead + tail + 2) return hash;
  return `${hash.slice(0, lead)}…${hash.slice(-tail)}`;
}
