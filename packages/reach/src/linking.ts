import { randomBytes } from "node:crypto";
import { InMemoryPendingStore, type PendingLinkStore } from "./store.js";

export const DEFAULT_LINK_TTL_MS = 15 * 60 * 1000;

export interface LinkToken {
  code: string;
  accountId: string;
  expiresAt: number;
}

export interface LinkResult {
  ok: boolean;
  accountId?: string;
  reason?: string;
}

const TELEGRAM_START_MAX = 64;
const TELEGRAM_START_PATTERN = /^[A-Za-z0-9_-]+$/;

export interface LinkTokenServiceOptions {
  store?: PendingLinkStore;
  ttlMs?: number;
  now?: () => number;
}

export class LinkTokenService {
  private readonly ttlMs: number;
  private readonly now: () => number;
  private readonly store: PendingLinkStore;

  constructor(options: LinkTokenServiceOptions = {}) {
    this.store = options.store ?? new InMemoryPendingStore();
    this.ttlMs = options.ttlMs ?? DEFAULT_LINK_TTL_MS;
    this.now = options.now ?? Date.now;
  }

  async issue(accountId: string): Promise<LinkToken> {
    const code = randomBytes(24).toString("base64url");
    const expiresAt = this.now() + this.ttlMs;
    await this.store.putPending(code, accountId, expiresAt);
    return { code, accountId, expiresAt };
  }

  deepLink(botUsername: string, code: string): string {
    if (code.length > TELEGRAM_START_MAX || !TELEGRAM_START_PATTERN.test(code)) {
      throw new Error("link code is not a valid Telegram start payload");
    }
    return `https://t.me/${botUsername}?start=${code}`;
  }

  async consume(code: string): Promise<LinkResult> {
    const entry = await this.store.takePending(code);
    if (!entry) return { ok: false, reason: "invalid or already-used link code" };
    if (this.now() > entry.expiresAt) return { ok: false, reason: "link expired" };
    return { ok: true, accountId: entry.wallet };
  }
}
