import { REOWN_PROJECT_ID } from "@atelo/core";

function readProjectId(): string {
  const fromEnv = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID?.trim();
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return REOWN_PROJECT_ID;
}

export const projectId = readProjectId();

export const walletEnabled = projectId.length > 0;

export const walletMetadata = {
  name: "Atelo Hub",
  description: "Verifiable DeFi agent marketplace on BSC testnet",
  url: "https://atelo.hub",
  icons: ["https://atelo.hub/icons/icon-192.png"]
};
