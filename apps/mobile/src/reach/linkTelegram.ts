export interface TelegramLink {
  wallet: string;
  code: string;
  deepLink: string;
  botUsername: string;
}

export function reachBaseUrl(): string {
  const base = process.env.EXPO_PUBLIC_REACH_URL?.trim() || "http://localhost:8787";
  return base.replace(/\/$/, "");
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
