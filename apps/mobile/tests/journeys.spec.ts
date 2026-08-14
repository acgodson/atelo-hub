import { test, expect, type Page } from "@playwright/test";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const SHOTS = resolve(process.cwd(), "../../artifacts/phase-06/e2e-screenshots");
mkdirSync(SHOTS, { recursive: true });

function trackPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(String(err)));
  return errors;
}

async function open(page: Page, path: string, ready: RegExp | string) {
  await page.goto(path, { waitUntil: "domcontentloaded" });
  await expect(page.getByText(ready).first()).toBeVisible();
}

test("Journey 1 — browse the honest funnel without a wallet", async ({ page }) => {
  const errors = trackPageErrors(page);
  await open(page, "/", "Hire AI agents to automate on-chain tasks.");

  await expect(page.getByText("1,772").first()).toBeVisible();
  await expect(page.getByText("indexed BSC agents")).toBeVisible();
  await expect(page.getByText("reachable of 70 examined")).toBeVisible();
  await expect(page.getByText("hireable with proof")).toBeVisible();

  await expect(
    page.getByText(/Registered is not reachable, and reachable is not hireable/i)
  ).toBeVisible();
  await expect(
    page.getByText(/only the Atelo-owned reference agent has passed a real test job/i)
  ).toBeVisible();
  await expect(page.getByText(/registered, not yet verified/i).first()).toBeVisible();

  await expect(page.getByText("Connect", { exact: true }).first()).toBeVisible();

  await expect(page.getByText("Beta", { exact: true }).first()).toBeVisible();
  await expect(
    page.getByText(/Non-custodial · Not financial advice/i).first()
  ).toBeVisible();

  await page.screenshot({ path: `${SHOTS}/journey-1-home.png`, fullPage: true });

  await page.getByText(/Explore the marketplace/).first().click();
  await expect(page).toHaveURL(/\/discover$/);
  await expect(page.getByText("Four first-class categories")).toBeVisible();

  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("Journey 2 — discover and qualify across four categories", async ({ page }) => {
  const errors = trackPageErrors(page);
  await open(page, "/discover", "Four first-class categories");

  await expect(page.getByText("Qualification funnel", { exact: true })).toBeVisible();
  for (const name of ["Rebalancing", "Grid", "Yield", "Health"]) {
    await expect(page.getByText(name, { exact: true }).first()).toBeVisible();
  }
  await expect(page.getByText(/examined/).first()).toBeVisible();
  await expect(page.getByText(/reachable\+/).first()).toBeVisible();
  await expect(page.getByText(/hireable/).first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/journey-2-discover.png`, fullPage: true });

  await open(page, "/discover/grid", "Grid agents");
  await expect(page.getByText("Atelo-owned (first-party)").first()).toBeVisible();
  await expect(page.getByText(/Registered, not yet verified \(15\)/)).toBeVisible();
  await expect(page.getByText(/Registered, not yet verified/).first()).toBeVisible();
  await expect(page.getByText("HIREABLE").first()).toBeVisible();
  await expect(page.getByText(/REACHABLE|REGISTERED/).first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/journey-2-category-grid.png`, fullPage: true });

  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("Journey 3 — explainable ranking and agent lineage", async ({ page }) => {
  const errors = trackPageErrors(page);
  await open(page, "/ranking/grid", "Grid ranking");

  await expect(page.getByText("30d").first()).toBeVisible();
  await expect(page.getByText(/verified sample/i).first()).toBeVisible();
  await expect(page.getByText("atelo-rank/1").first()).toBeVisible();
  await expect(page.getByText("Cutoff block")).toBeVisible();
  await expect(page.getByText("Ranked at block")).toBeVisible();
  await expect(page.getByText(/insufficient history/i).first()).toBeVisible();
  await expect(
    page.getByText(/history capped at|short histories are never reported/i)
  ).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/journey-3-ranking.png`, fullPage: true });

  await open(page, "/agent/1809", "Atelo Reference Agent");
  await expect(page.getByText("ERC-8004 · agentId 1809")).toBeVisible();
  await expect(page.getByText("Proof of performance")).toBeVisible();
  await expect(page.getByText("Atelo-verified").first()).toBeVisible();
  await expect(page.getByText("Unverified").first()).toBeVisible();
  await expect(page.getByText(/gnfd:\/\/atelo-lineage/).first()).toBeVisible();
  await expect(page.getByText("Content hash").first()).toBeVisible();
  await expect(page.getByText(/byte hash matches/).first()).toBeVisible();
  await expect(page.getByText("Reproduce this metric")).toBeVisible();
  await expect(page.getByText("settle").first()).toBeVisible();
  await expect(page.getByText("↗").first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/journey-3-agent-proof.png`, fullPage: true });

  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("Journey 4 — wallet-gated hire and manage", async ({ page }) => {
  const errors = trackPageErrors(page);
  await open(page, "/discover/grid", "Grid agents");

  const hire = page.getByText(/Review hire terms|Hire — open activation/).first();
  await expect(hire).toBeVisible();
  await hire.click();

  await expect(page.getByText("Hire the Atelo reference agent")).toBeVisible();
  await expect(page.getByText("ERC-8183 job terms")).toBeVisible();
  await expect(page.getByText("#501").first()).toBeVisible();
  await expect(page.getByText(/1 U/).first()).toBeVisible();
  await expect(page.getByText(/900s policy/).first()).toBeVisible();
  await expect(page.getByText(/Escrow \(AgenticCommerce\)/)).toBeVisible();
  await expect(page.getByText(/First-party only/)).toBeVisible();
  await expect(page.getByText(/No qualified third-party agent is available to hire/)).toBeVisible();
  await expect(
    page.getByText(/You sign this transaction yourself; Atelo is non-custodial/i)
  ).toBeVisible();

  const connect = page.getByText("Connect wallet").first();
  await expect(connect).toBeVisible();
  await expect(page.getByText(/Simulation and signing require a connected wallet/).first()).toBeVisible();
  expect(await page.getByText("Wallet disabled").count()).toBe(0);
  await page.screenshot({ path: `${SHOTS}/journey-4-activation-sheet.png`, fullPage: true });

  await open(page, "/my-agents", "Hired relationships");
  await expect(page.getByText("job #501")).toBeVisible();
  await expect(page.getByText("job #503")).toBeVisible();
  await expect(page.getByText("job #504")).toBeVisible();
  await expect(page.getByText("job #505")).toBeVisible();
  await expect(page.getByText("Atelo-owned (first-party)").first()).toBeVisible();
  await expect(page.getByText("COMPLETED").first()).toBeVisible();
  await expect(page.getByText("Counterparty").first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/journey-4-my-agents.png`, fullPage: true });

  await open(page, "/activity", "On-chain ledger");
  await expect(page.getByText(/job #501/).first()).toBeVisible();
  await expect(page.getByText(/Settled/).first()).toBeVisible();
  await expect(page.getByText("↗").first()).toBeVisible();
  await page.screenshot({ path: `${SHOTS}/journey-4-activity.png`, fullPage: true });

  expect(errors, errors.join("\n")).toHaveLength(0);
});

test("Global — no dead primary CTAs and honest provenance labels", async ({ page }) => {
  const errors = trackPageErrors(page);

  await open(page, "/", "Hire AI agents to automate on-chain tasks.");
  await page.getByText("Grid", { exact: true }).first().click();
  await expect(page).toHaveURL(/\/discover\/grid$/);

  await open(page, "/agent/1809", "Atelo Reference Agent");
  await expect(page.getByText("Atelo-owned (first-party)").first()).toBeVisible();
  await page.getByText(/See this agent in My Agents/).first().click();
  await expect(page).toHaveURL(/\/my-agents$/);

  await open(page, "/ranking/grid", "Grid ranking");
  await page.getByText(/Compare top agents/).first().click();
  await expect(page).toHaveURL(/\/compare/);
  await expect(page.getByText(/side by side/)).toBeVisible();
  await expect(page.getByText(/First-party \(Atelo\)/).first()).toBeVisible();

  await open(page, "/discover/yield", "Yield agents");
  await expect(page.getByText(/UNVERIFIED/).first()).toBeVisible();

  expect(errors, errors.join("\n")).toHaveLength(0);
});
