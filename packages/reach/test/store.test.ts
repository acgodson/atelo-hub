import { describe, expect, it } from "vitest";
import { InMemoryStore, NeonStore } from "../src/store.js";

describe("I2 ReachStore persists chat↔wallet links and pause state", () => {
  it("InMemoryStore round-trips a link and per-wallet pause", async () => {
    const store = new InMemoryStore();
    await store.ensureSchema();
    await store.linkChat("chat_a", "0xAbC0000000000000000000000000000000000001");
    expect(await store.walletForChat("chat_a")).toBe("0xAbC0000000000000000000000000000000000001");
    expect(await store.walletForChat("chat_missing")).toBeNull();

    expect(await store.isPaused("0xABC0000000000000000000000000000000000001")).toBe(false);
    await store.setPaused("0xabc0000000000000000000000000000000000001", true);
    expect(await store.isPaused("0xABC0000000000000000000000000000000000001")).toBe(true);
    await store.setPaused("0xABC0000000000000000000000000000000000001", false);
    expect(await store.isPaused("0xabc0000000000000000000000000000000000001")).toBe(false);
  });

  it("InMemoryStore consumes a pending link exactly once", async () => {
    const store = new InMemoryStore();
    await store.putPending("code_1", "0xDdD0000000000000000000000000000000000002", Date.now() + 10_000);
    const first = await store.takePending("code_1");
    const second = await store.takePending("code_1");
    expect(first?.wallet).toBe("0xDdD0000000000000000000000000000000000002");
    expect(second).toBeNull();
  });

  const HAS_DB = Boolean(process.env.DATABASE_URL);
  (HAS_DB ? it : it.skip)("NeonStore round-trips when DATABASE_URL is set", async () => {
    const store = new NeonStore();
    await store.ensureSchema();
    await store.linkChat("chat_pg", "0xDdD0000000000000000000000000000000000002");
    expect(await store.walletForChat("chat_pg")).toBe("0xDdD0000000000000000000000000000000000002");
    await store.setPaused("0xDdD0000000000000000000000000000000000002", true);
    expect(await store.isPaused("0xddd0000000000000000000000000000000000002")).toBe(true);
  });

  it("NeonStore throws without a connection string", () => {
    expect(() => new NeonStore(undefined)).toThrow("DATABASE_URL_UNSET");
  });
});
