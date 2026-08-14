import { Platform } from "react-native";

export interface TelegramLink {
  wallet: string;
  code: string;
  deepLink: string;
  botUsername: string;
}

export function reachBaseUrl(): string {
  const configured = process.env.EXPO_PUBLIC_REACH_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return Platform.OS === "web" ? "/api" : "https://atelo-hub.vercel.app/api";
}

export async function requestTelegramLink(wallet: string): Promise<TelegramLink> {
  const res = await fetch(`${reachBaseUrl()}/link`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ wallet })
  });
  if (!res.ok) {
    const detail = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(detail.error ?? `Link request failed (${res.status})`);
  }
  return (await res.json()) as TelegramLink;
}
