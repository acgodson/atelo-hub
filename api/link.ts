import type { VercelRequest, VercelResponse } from "@vercel/node";
import { BOT_USERNAME, ensureReady, reachLinkService } from "@atelo/reach";

const WALLET_PATTERN = /^0x[0-9a-fA-F]{40}$/;

function applyCors(res: VercelResponse): void {
  res.setHeader("access-control-allow-origin", "*");
  res.setHeader("access-control-allow-methods", "POST, OPTIONS");
  res.setHeader("access-control-allow-headers", "content-type");
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

  const body = (typeof req.body === "string" ? safeParse(req.body) : req.body) as { wallet?: unknown };
  const wallet = typeof body?.wallet === "string" ? body.wallet.trim() : "";
  if (!WALLET_PATTERN.test(wallet)) {
    res.status(400).json({ error: "a valid 0x wallet address is required" });
    return;
  }

  try {
    await ensureReady();
    const links = reachLinkService();
    const token = await links.issue(wallet);
    const deepLink = links.deepLink(BOT_USERNAME, token.code);
    res.status(200).json({ code: token.code, deepLink, botUsername: BOT_USERNAME });
  } catch {
    res.status(500).json({ error: "link service unavailable" });
  }
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}
