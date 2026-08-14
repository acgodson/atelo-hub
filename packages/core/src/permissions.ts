export type UserAction =
  | "browse"
  | "discover"
  | "compare"
  | "inspect"
  | "lineage"
  | "ranking"
  | "hire"
  | "fund"
  | "sign";

const WALLET_REQUIRED: ReadonlySet<UserAction> = new Set<UserAction>(["hire", "fund", "sign"]);

const WALLET_FREE: ReadonlySet<UserAction> = new Set<UserAction>([
  "browse",
  "discover",
  "compare",
  "inspect",
  "lineage",
  "ranking"
]);

export function requiresWallet(action: UserAction): boolean {
  return WALLET_REQUIRED.has(action);
}

export function isWalletFree(action: UserAction): boolean {
  return WALLET_FREE.has(action);
}

export type TelegramVerdict = { allowed: boolean; reason: string };

const TELEGRAM_ALLOWED = new Set(["status", "activity", "pause", "help", "ping"]);

const TELEGRAM_REJECTED = new Set([
  "destination",
  "setdestination",
  "permission",
  "setpermission",
  "grant",
  "revoke",
  "transfer",
  "send",
  "withdraw",
  "approve",
  "sign",
  "hire",
  "fund",
  "resume",
  "unpause"
]);

export function evaluateTelegramCommand(raw: string): TelegramVerdict {
  const command = raw.trim().replace(/^\//, "").split(/\s+/)[0]?.toLowerCase() ?? "";
  if (command.length === 0) {
    return { allowed: false, reason: "empty command" };
  }
  if (TELEGRAM_REJECTED.has(command)) {
    return {
      allowed: false,
      reason: `'${command}' changes a destination, permission, or transfer and is never authorized over Telegram`
    };
  }
  if (TELEGRAM_ALLOWED.has(command)) {
    return { allowed: true, reason: `'${command}' is a read-only or low-risk pause command` };
  }
  return { allowed: false, reason: `'${command}' is not in the Telegram allowlist (status/pause only)` };
}
