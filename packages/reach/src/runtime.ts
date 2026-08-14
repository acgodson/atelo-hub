import { createStore, type ReachStore } from "./store.js";
import { LinkTokenService } from "./linking.js";

export const BOT_USERNAME = "atelohub_bot";

let sharedStore: ReachStore | null = null;
let schemaReady: Promise<void> | null = null;

export function reachMode(): "neon" | "memory" {
  return process.env.DATABASE_URL ? "neon" : "memory";
}

export function reachStore(): ReachStore {
  if (!sharedStore) sharedStore = createStore();
  return sharedStore;
}

export function ensureReady(): Promise<void> {
  if (!schemaReady) schemaReady = reachStore().ensureSchema();
  return schemaReady;
}

export function reachLinkService(): LinkTokenService {
  return new LinkTokenService({ store: reachStore() });
}
