import type { VercelRequest, VercelResponse } from "@vercel/node";
import {
  createTelegramContext,
  ensureReady,
  handleTelegramCommand,
  reachLinkService,
  reachStore
} from "@atelo/reach";

interface TelegramUpdate {
  message?: { chat?: { id?: number | string }; text?: string };
}

async function sendMessage(token: string, chatId: string, text: string): Promise<void> {
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  } catch {
    return;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  if (req.method !== "POST") {
    res.status(405).json({ error: "method not allowed" });
    return;
  }

  const secret = process.env.TELEGRAM_WEBHOOK_SECRET?.trim();
  const provided = req.headers["x-telegram-bot-api-secret-token"];
  if (!secret || provided !== secret) {
    res.status(401).json({ error: "unauthorized" });
    return;
  }

  const update = (typeof req.body === "string" ? safeParse(req.body) : req.body) as TelegramUpdate;
  const text = update?.message?.text;
  const chatId = update?.message?.chat?.id;
  if (!text || chatId === undefined) {
    res.status(200).json({ ok: true });
    return;
  }

  try {
    await ensureReady();
    const ctx = createTelegramContext(reachLinkService(), reachStore());
    const reply = await handleTelegramCommand(text, String(chatId), ctx);
    const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
    if (token) await sendMessage(token, reply.chatId, reply.text);
  } catch {
    res.status(200).json({ ok: true });
    return;
  }

  res.status(200).json({ ok: true });
}

function safeParse(raw: string): unknown {
  try {
    return JSON.parse(raw || "{}");
  } catch {
    return {};
  }
}
