import { REOWN_PROJECT_ID } from "@atelo/core";

function readProjectId(): string {
  const fromEnv = process.env.EXPO_PUBLIC_REOWN_PROJECT_ID?.trim();
  if (fromEnv && fromEnv.length > 0) return fromEnv;
  return REOWN_PROJECT_ID;
}

export const projectId = readProjectId();

export const walletEnabled = projectId.length > 0;

function siteUrl(): string {
  if (typeof window !== "undefined" && window.location?.origin) return window.location.origin;
  return "https://atelo-hub.vercel.app";
}

export const walletMetadata = {
  name: "Atelo Hub",
  description: "AI agent marketplace for automating on-chain tasks on BSC testnet",
  url: siteUrl(),
  icons: [`${siteUrl()}/favicon.ico`]
};
