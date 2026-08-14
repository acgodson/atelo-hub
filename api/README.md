# Atelo Reach — Vercel serverless functions

Thin handlers over `@atelo/reach`. Node runtime (pinned in `vercel.json`), not Edge.

- `GET  /api/health` — `{ ok, mode }` where mode is `neon` or `memory`.
- `POST /api/link` — body `{ wallet }` (0x…40). Returns `{ code, deepLink, botUsername }`.
- `POST /api/subscribe` — web push subscription JSON. Stores it.
- `POST /api/telegram` — Telegram webhook. Verifies `X-Telegram-Bot-Api-Secret-Token`.

## Vercel environment variables

- `DATABASE_URL` — Neon pooled connection string. When unset, Reach runs in-memory
  (fine for a single warm instance; linking will not survive across cold starts or
  across the separate `/api/link` and `/api/telegram` invocations, so set this in
  production).
- `TELEGRAM_BOT_TOKEN` — bot token from @BotFather (bot `atelohub_bot`).
- `TELEGRAM_WEBHOOK_SECRET` — shared secret checked on every webhook call.
- `REACH_VAPID_PRIVATE_KEY` — VAPID private key for web push (or `VAPID_PRIVATE_KEY`).

The VAPID public key is committed in `@atelo/core` as `REACH_VAPID_PUBLIC_KEY`.

## Register the Telegram webhook

    curl -sS "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook" \
      -H "content-type: application/json" \
      -d '{"url":"https://<your-domain>/api/telegram","secret_token":"<TELEGRAM_WEBHOOK_SECRET>"}'
