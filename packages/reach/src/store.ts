import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { subscriptionId, type PushSubscription, type SubscriptionStore } from "./subscriptions.js";

function normalizeWallet(wallet: string): string {
  return wallet.trim().toLowerCase();
}

export interface PendingLinkEntry {
  wallet: string;
  expiresAt: number;
}

export interface PendingLinkStore {
  putPending(code: string, wallet: string, expiresAt: number): Promise<void>;
  takePending(code: string): Promise<PendingLinkEntry | null>;
}

export interface ReachStore extends SubscriptionStore, PendingLinkStore {
  ensureSchema(): Promise<void>;
  linkChat(chatId: string, wallet: string): Promise<void>;
  walletForChat(chatId: string): Promise<string | null>;
  setPaused(wallet: string, paused: boolean): Promise<void>;
  isPaused(wallet: string): Promise<boolean>;
}

export class InMemoryPendingStore implements PendingLinkStore {
  private readonly pending = new Map<string, PendingLinkEntry>();

  async putPending(code: string, wallet: string, expiresAt: number): Promise<void> {
    this.pending.set(code, { wallet, expiresAt });
  }

  async takePending(code: string): Promise<PendingLinkEntry | null> {
    const entry = this.pending.get(code) ?? null;
    if (entry) this.pending.delete(code);
    return entry;
  }
}

export class InMemoryStore implements ReachStore {
  private readonly links = new Map<string, string>();
  private readonly paused = new Set<string>();
  private readonly subs = new Map<string, PushSubscription>();
  private readonly pendingStore = new InMemoryPendingStore();

  async ensureSchema(): Promise<void> {}

  async linkChat(chatId: string, wallet: string): Promise<void> {
    this.links.set(chatId, wallet);
  }

  async walletForChat(chatId: string): Promise<string | null> {
    return this.links.get(chatId) ?? null;
  }

  async setPaused(wallet: string, paused: boolean): Promise<void> {
    const key = normalizeWallet(wallet);
    if (paused) this.paused.add(key);
    else this.paused.delete(key);
  }

  async isPaused(wallet: string): Promise<boolean> {
    return this.paused.has(normalizeWallet(wallet));
  }

  async subscribe(subscription: PushSubscription): Promise<{ id: string; created: boolean }> {
    const id = subscriptionId(subscription);
    const created = !this.subs.has(id);
    this.subs.set(id, subscription);
    return { id, created };
  }

  async unsubscribe(endpoint: string): Promise<boolean> {
    return this.subs.delete(subscriptionId({ endpoint, keys: { p256dh: "", auth: "" } }));
  }

  async list(): Promise<PushSubscription[]> {
    return [...this.subs.values()];
  }

  putPending(code: string, wallet: string, expiresAt: number): Promise<void> {
    return this.pendingStore.putPending(code, wallet, expiresAt);
  }

  takePending(code: string): Promise<PendingLinkEntry | null> {
    return this.pendingStore.takePending(code);
  }
}

export class NeonStore implements ReachStore {
  private readonly sql: NeonQueryFunction<false, false>;

  constructor(connectionString: string | undefined = process.env.DATABASE_URL) {
    if (!connectionString) throw new Error("DATABASE_URL_UNSET");
    this.sql = neon(connectionString);
  }

  async ensureSchema(): Promise<void> {
    await this.sql`CREATE TABLE IF NOT EXISTS reach_links (
      chat_id text PRIMARY KEY,
      wallet text NOT NULL,
      linked_at timestamptz NOT NULL DEFAULT now()
    )`;
    await this.sql`CREATE TABLE IF NOT EXISTS reach_pause (
      wallet text PRIMARY KEY,
      paused boolean NOT NULL,
      updated_at timestamptz NOT NULL DEFAULT now()
    )`;
    await this.sql`CREATE TABLE IF NOT EXISTS reach_subscriptions (
      id text PRIMARY KEY,
      endpoint text NOT NULL,
      p256dh text NOT NULL,
      auth text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
    await this.sql`CREATE TABLE IF NOT EXISTS reach_pending_links (
      code text PRIMARY KEY,
      wallet text NOT NULL,
      expires_at bigint NOT NULL
    )`;
  }

  async linkChat(chatId: string, wallet: string): Promise<void> {
    await this.sql`INSERT INTO reach_links (chat_id, wallet) VALUES (${chatId}, ${wallet})
      ON CONFLICT (chat_id) DO UPDATE SET wallet = EXCLUDED.wallet, linked_at = now()`;
  }

  async walletForChat(chatId: string): Promise<string | null> {
    const rows = await this.sql`SELECT wallet FROM reach_links WHERE chat_id = ${chatId}`;
    const first = rows[0];
    return first ? String(first.wallet) : null;
  }

  async setPaused(wallet: string, paused: boolean): Promise<void> {
    await this.sql`INSERT INTO reach_pause (wallet, paused, updated_at) VALUES (${normalizeWallet(wallet)}, ${paused}, now())
      ON CONFLICT (wallet) DO UPDATE SET paused = EXCLUDED.paused, updated_at = now()`;
  }

  async isPaused(wallet: string): Promise<boolean> {
    const rows = await this.sql`SELECT paused FROM reach_pause WHERE wallet = ${normalizeWallet(wallet)}`;
    const first = rows[0];
    return first ? Boolean(first.paused) : false;
  }

  async subscribe(subscription: PushSubscription): Promise<{ id: string; created: boolean }> {
    const id = subscriptionId(subscription);
    const existing = await this.sql`SELECT id FROM reach_subscriptions WHERE id = ${id}`;
    const created = existing.length === 0;
    await this.sql`INSERT INTO reach_subscriptions (id, endpoint, p256dh, auth)
      VALUES (${id}, ${subscription.endpoint}, ${subscription.keys.p256dh}, ${subscription.keys.auth})
      ON CONFLICT (id) DO UPDATE SET endpoint = EXCLUDED.endpoint, p256dh = EXCLUDED.p256dh, auth = EXCLUDED.auth`;
    return { id, created };
  }

  async unsubscribe(endpoint: string): Promise<boolean> {
    const id = subscriptionId({ endpoint, keys: { p256dh: "", auth: "" } });
    const rows = await this.sql`DELETE FROM reach_subscriptions WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  }

  async list(): Promise<PushSubscription[]> {
    const rows = await this.sql`SELECT endpoint, p256dh, auth FROM reach_subscriptions`;
    return rows.map((row) => ({
      endpoint: String(row.endpoint),
      keys: { p256dh: String(row.p256dh), auth: String(row.auth) }
    }));
  }

  async putPending(code: string, wallet: string, expiresAt: number): Promise<void> {
    await this.sql`INSERT INTO reach_pending_links (code, wallet, expires_at) VALUES (${code}, ${wallet}, ${expiresAt})
      ON CONFLICT (code) DO UPDATE SET wallet = EXCLUDED.wallet, expires_at = EXCLUDED.expires_at`;
  }

  async takePending(code: string): Promise<PendingLinkEntry | null> {
    const rows = await this.sql`DELETE FROM reach_pending_links WHERE code = ${code} RETURNING wallet, expires_at`;
    const first = rows[0];
    if (!first) return null;
    return { wallet: String(first.wallet), expiresAt: Number(first.expires_at) };
  }
}

export function createStore(connectionString: string | undefined = process.env.DATABASE_URL): ReachStore {
  return connectionString ? new NeonStore(connectionString) : new InMemoryStore();
}
