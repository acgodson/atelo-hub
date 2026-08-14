import { describe, expect, it } from "vitest";
import { getJobsForWallet } from "@atelo/core";
import { createTelegramContext, handleTelegramCommand } from "../src/telegram.js";
import { InMemoryStore } from "../src/store.js";
import { LinkTokenService } from "../src/linking.js";

const OWNER_WALLET = "0xe8fb1F3329F1c9DD4d88aa666701f018CA5956ea";
const OTHER_WALLET = "0x1111111111111111111111111111111111111111";

async function linkedContext(chatId: string, wallet: string) {
  const store = new InMemoryStore();
  const links = new LinkTokenService({ store });
  const ctx = createTelegramContext(links, store);
  const token = await links.issue(wallet);
  await handleTelegramCommand(`/start ${token.code}`, chatId, ctx);
  return ctx;
}

describe("U2/I2 Telegram commands enforce evaluateTelegramCommand", () => {
  it("scopes status to the linked wallet's jobs", async () => {
    const ctx = await linkedContext("chat_1", OWNER_WALLET);
    const reply = await handleTelegramCommand("/status", "chat_1", ctx);
    expect(reply.verdict?.allowed).toBe(true);
    const settled = getJobsForWallet(OWNER_WALLET).filter((j) => j.settled);
    expect(settled.length).toBe(4);
    for (const job of settled) {
      expect(reply.text).toContain(`#${job.jobId}`);
    }
    expect(reply.text).toContain("ACTIVE");
  });

  it("shows an honest empty state for a linked wallet with no jobs", async () => {
    const ctx = await linkedContext("chat_empty", OTHER_WALLET);
    const reply = await handleTelegramCommand("/status", "chat_empty", ctx);
    expect(getJobsForWallet(OTHER_WALLET)).toHaveLength(0);
    expect(reply.text).toContain("No jobs yet");
  });

  it("allows low-risk pause and records the paused wallet", async () => {
    const ctx = await linkedContext("chat_2", OWNER_WALLET);
    const reply = await handleTelegramCommand("/pause", "chat_2", ctx);
    expect(reply.verdict?.allowed).toBe(true);
    expect(reply.text.toLowerCase()).toContain("paused");
    const status = await handleTelegramCommand("/status", "chat_2", ctx);
    expect(status.text).toContain("PAUSED");
  });

  it("rejects destination, permission, and transfer changes with the allowlist reason", async () => {
    const ctx = await linkedContext("chat_3", OWNER_WALLET);
    for (const cmd of ["/setdestination 0xabc", "/grant admin", "/transfer 5", "/resume"]) {
      const reply = await handleTelegramCommand(cmd, "chat_3", ctx);
      expect(reply.verdict?.allowed).toBe(false);
      expect(reply.text.startsWith("Denied:")).toBe(true);
    }
  });

  it("requires a linked wallet before status or pause", async () => {
    const store = new InMemoryStore();
    const ctx = createTelegramContext(new LinkTokenService({ store }), store);
    const reply = await handleTelegramCommand("/status", "chat_unlinked", ctx);
    expect(reply.verdict?.allowed).toBe(true);
    expect(reply.text.toLowerCase()).toContain("not linked");
  });

  it("links a chat to a wallet via a one-time start token", async () => {
    const store = new InMemoryStore();
    const links = new LinkTokenService({ store });
    const ctx = createTelegramContext(links, store);
    const token = await links.issue(OWNER_WALLET);
    const reply = await handleTelegramCommand(`/start ${token.code}`, "chat_9", ctx);
    expect(reply.handled).toBe(true);
    expect(await store.walletForChat("chat_9")).toBe(OWNER_WALLET);
  });
});
