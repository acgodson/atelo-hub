import { evaluateTelegramCommand, getJobsForWallet, type JobView, type TelegramVerdict } from "@atelo/core";
import { LinkTokenService } from "./linking.js";
import { InMemoryStore, type ReachStore } from "./store.js";

export interface TelegramReply {
  chatId: string;
  text: string;
  command: string;
  verdict: TelegramVerdict | null;
  handled: boolean;
}

export interface TelegramContext {
  links: LinkTokenService;
  store: ReachStore;
}

export function createTelegramContext(links?: LinkTokenService, store?: ReachStore): TelegramContext {
  const resolvedStore = store ?? new InMemoryStore();
  return {
    links: links ?? new LinkTokenService({ store: resolvedStore }),
    store: resolvedStore
  };
}

function commandOf(raw: string): { command: string; args: string[] } {
  const parts = raw.trim().replace(/^\//, "").split(/\s+/);
  return { command: (parts[0] ?? "").toLowerCase(), args: parts.slice(1) };
}

function shortWallet(wallet: string): string {
  return wallet.length > 12 ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : wallet;
}

function statusText(jobs: JobView[], wallet: string, paused: boolean): string {
  if (jobs.length === 0) {
    return `Atelo status — wallet ${shortWallet(wallet)}\nNo jobs yet — hire an agent in the Atelo app.`;
  }
  const settled = jobs.filter((j) => j.settled);
  const lines = settled.map(
    (j) => `• #${j.jobId} ${j.category} — ${j.finalStatus} (${j.counterpartyName})`
  );
  const pausedLine = paused ? "Agents: PAUSED" : "Agents: ACTIVE";
  return [
    `Atelo status — ${settled.length}/${jobs.length} jobs settled (wallet ${shortWallet(wallet)})`,
    pausedLine,
    ...lines
  ].join("\n");
}

function activityText(jobs: JobView[]): string {
  const lines = jobs
    .filter((j) => j.settled)
    .map((j) => `• Job #${j.jobId} settled — ${j.finalStatus}`);
  if (lines.length === 0) return "No jobs yet — hire an agent in the Atelo app.";
  return ["Recent activity", ...lines].join("\n");
}

export async function handleTelegramCommand(
  raw: string,
  chatId: string,
  ctx: TelegramContext
): Promise<TelegramReply> {
  const { command, args } = commandOf(raw);

  if (command === "start" || command === "link") {
    const code = args[0];
    if (!code) {
      return {
        chatId,
        text: "Open the secure link from the Atelo app to connect this chat.",
        command,
        verdict: null,
        handled: true
      };
    }
    const result = await ctx.links.consume(code);
    if (!result.ok) {
      return { chatId, text: `Link failed: ${result.reason}`, command, verdict: null, handled: true };
    }
    await ctx.store.linkChat(chatId, result.accountId!);
    return {
      chatId,
      text: `Connected to wallet ${shortWallet(result.accountId!)}. Try /status or /pause.`,
      command,
      verdict: null,
      handled: true
    };
  }

  const verdict = evaluateTelegramCommand(raw);
  if (!verdict.allowed) {
    return { chatId, text: `Denied: ${verdict.reason}`, command, verdict, handled: true };
  }

  if (command === "help" || command === "ping") {
    const text =
      command === "ping"
        ? "pong"
        : "Commands: /status, /activity, /pause. Destination, permission, and transfer changes are never authorized over Telegram.";
    return { chatId, text, command, verdict, handled: true };
  }

  const wallet = await ctx.store.walletForChat(chatId);
  if (!wallet) {
    return {
      chatId,
      text: "This chat is not linked yet. Open the secure link from the Atelo app first.",
      command,
      verdict,
      handled: true
    };
  }

  if (command === "status") {
    const jobs = getJobsForWallet(wallet);
    const paused = await ctx.store.isPaused(wallet);
    return { chatId, text: statusText(jobs, wallet, paused), command, verdict, handled: true };
  }
  if (command === "activity") {
    const jobs = getJobsForWallet(wallet);
    return { chatId, text: activityText(jobs), command, verdict, handled: true };
  }
  if (command === "pause") {
    await ctx.store.setPaused(wallet, true);
    return {
      chatId,
      text: `Paused agents for wallet ${shortWallet(wallet)}. Resuming is a wallet action in the Atelo app, not over Telegram.`,
      command,
      verdict,
      handled: true
    };
  }

  return { chatId, text: `Unhandled command '${command}'.`, command, verdict, handled: false };
}
