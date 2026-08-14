import type { VercelRequest, VercelResponse } from "@vercel/node";
import { ensureReady, reachStore, type PushSubscription } from "@atelo/reach";

function applyCors(res: VercelResponse): void {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
}

function isSubscription(value: unknown): value is PushSubscription {
  const sub = value as PushSubscription | undefined;
  return Boolean(sub && typeof sub.endpoint === "string" && sub.keys && typeof sub.keys.p256dh === "string");
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  applyCors(res);
  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const parsed = typeof req.body === "string" ? safeParse(req.body) : req.body;
  const candidate = (parsed as { subscription?: unknown })?.subscription ?? parsed;
  if (!isSubscription(candidate)) {
    res.status(400).json({ error: "a valid push subscription is required" });
    return;
  }

  try {
    await ensureReady();
    const result = await reachStore().subscribe(candidate);
    res.status(200).json(result);
  } catch {
    res.status(500).json({ error: "subscription store unavailable" });
  }
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}
