import { CATEGORY_ORDER } from "../categories";
import { bscScanTx } from "../constants";
import { lifecycles } from "../data/jobs";
import type { RawLifecycle } from "../raw";
import type { Category, JobTx, JobView } from "../types";

function settleBlock(txs: JobTx[]): number | undefined {
  return txs.find((t) => t.step === "settle")?.blockNumber;
}

function toView(raw: RawLifecycle, category: Category): JobView {
  const job = raw.erc8183Job;
  const transactions: JobTx[] = job.transactions.map((t) => ({
    step: t.step,
    hash: t.transactionHash,
    blockNumber: t.blockNumber,
    status: t.status,
    explorer: t.explorer
  }));
  const signedHash = raw.signedProtocolAction.swapTx?.hash ?? raw.signedProtocolAction.primaryTxHash;
  return {
    jobId: String(job.jobId),
    wallet: raw.canonicalTask.wallet,
    category,
    finalStatus: job.settle.final_status,
    settled: job.settled,
    counterpartyName: job.counterparty.name,
    firstParty: !job.counterparty.third_party,
    agentId: job.counterparty.erc8004_agent_id,
    transactions,
    signedActionTx: signedHash ? { hash: signedHash, explorer: bscScanTx(signedHash) } : undefined,
    stages: raw.activityLedger.stages,
    settledAtBlock: settleBlock(transactions)
  };
}

export function getJob(category: Category): JobView {
  return toView(lifecycles[category], category);
}

export function getAllJobs(): JobView[] {
  return CATEGORY_ORDER.map(getJob);
}

export function getJobsForWallet(wallet: string): JobView[] {
  const target = wallet.trim().toLowerCase();
  if (target.length === 0) return [];
  return getAllJobs().filter((job) => job.wallet.toLowerCase() === target);
}
