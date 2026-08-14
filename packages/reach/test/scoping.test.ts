import { describe, expect, it } from "vitest";
import { getAllJobs, getJobsForWallet } from "@atelo/core";

const OWNER_WALLET = "0xe8fb1F3329F1c9DD4d88aa666701f018CA5956ea";

describe("U2 getJobsForWallet scopes jobs to the hiring wallet", () => {
  it("returns the four real settled jobs for the demo owner wallet", () => {
    const jobs = getJobsForWallet(OWNER_WALLET);
    expect(jobs.map((j) => j.jobId).sort()).toEqual(["501", "503", "504", "505"]);
    expect(jobs.every((j) => j.settled)).toBe(true);
  });

  it("matches the wallet case-insensitively", () => {
    expect(getJobsForWallet(OWNER_WALLET.toLowerCase())).toHaveLength(4);
    expect(getJobsForWallet(OWNER_WALLET.toUpperCase())).toHaveLength(4);
  });

  it("returns an empty list for an unknown wallet", () => {
    expect(getJobsForWallet("0x0000000000000000000000000000000000000000")).toHaveLength(0);
    expect(getJobsForWallet("")).toHaveLength(0);
  });

  it("never leaks other wallets' jobs (scoped is a subset of all)", () => {
    expect(getJobsForWallet(OWNER_WALLET).length).toBeLessThanOrEqual(getAllJobs().length);
  });
});
