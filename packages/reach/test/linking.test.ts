import { describe, expect, it } from "vitest";
import { LinkTokenService } from "../src/linking.js";

describe("I2 secure deep-link tokens are one-time and expiring", () => {
  it("issues a code that consumes exactly once", async () => {
    const svc = new LinkTokenService();
    const token = await svc.issue("acct_1");
    const first = await svc.consume(token.code);
    const second = await svc.consume(token.code);
    expect(first.ok).toBe(true);
    expect(first.accountId).toBe("acct_1");
    expect(second.ok).toBe(false);
    expect(second.reason).toBe("invalid or already-used link code");
  });

  it("rejects an expired code", async () => {
    let now = 1_000;
    const svc = new LinkTokenService({ ttlMs: 100, now: () => now });
    const token = await svc.issue("acct_2");
    now = 2_000;
    const result = await svc.consume(token.code);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe("link expired");
  });

  it("rejects an unknown or tampered code", async () => {
    const svc = new LinkTokenService();
    const token = await svc.issue("acct_3");
    const tampered = token.code.replace(/.$/, (c) => (c === "A" ? "B" : "A"));
    const result = await svc.consume(tampered);
    expect(result.ok).toBe(false);
  });

  it("issues a code that is a valid Telegram start payload", async () => {
    const svc = new LinkTokenService();
    const token = await svc.issue("0xe8fb1F3329F1c9DD4d88aa666701f018CA5956ea");
    expect(token.code.length).toBeLessThanOrEqual(64);
    expect(token.code).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it("builds a telegram deep link", async () => {
    const svc = new LinkTokenService();
    const token = await svc.issue("acct_4");
    const link = svc.deepLink("atelohub_bot", token.code);
    expect(link.startsWith("https://t.me/atelohub_bot?start=")).toBe(true);
    expect(link.length - "https://t.me/atelohub_bot?start=".length).toBeLessThanOrEqual(64);
  });
});
