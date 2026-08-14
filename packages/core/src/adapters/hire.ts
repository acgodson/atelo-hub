import { lifecycles } from "../data/jobs";
import type { RawLifecycle } from "../raw";
import type { Category } from "../types";

export interface HireProposalAction {
  protocol: string;
  method: string;
  contract: string;
  requiresSignature: boolean;
  simulatable: boolean;
  argsSummary: Record<string, string>;
  swap?: {
    tokenIn: string;
    tokenOut: string;
    fee: number;
    amountIn: string;
    quotedAmountOut: string;
  };
}

export interface HireTerms {
  category: Category;
  jobId: string;
  objective: string;
  protocol: string;
  agentName: string;
  agentOwner: string;
  agentId: number;
  thirdParty: boolean;
  priceRaw: string;
  currency: string;
  policy: string;
  disputeWindowSeconds: number;
  taskHash: string;
  maxSlippageBps: number;
  maxGasUsd: number;
  allowedContracts: string[];
  action: HireProposalAction;
}

function stringifyArgs(args: Record<string, unknown>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(args)) {
    out[k] = Array.isArray(v) ? v.join(", ") : typeof v === "object" && v !== null ? JSON.stringify(v) : String(v);
  }
  return out;
}

export function getHireTerms(category: Category): HireTerms {
  const raw: RawLifecycle = lifecycles[category];
  const job = raw.erc8183Job;
  const spineAction = raw.spinePlan.action;
  const resolvedContract =
    raw.realGridProposal?.recommendedAction?.target ??
    raw.spinePlan.liveActionContractResolved ??
    spineAction.contract;
  const rec = raw.realGridProposal?.recommendedAction;

  return {
    category,
    jobId: String(job.jobId),
    objective: raw.canonicalTask.objective,
    protocol: raw.canonicalTask.protocol,
    agentName: job.counterparty.name,
    agentOwner: job.counterparty.owner,
    agentId: job.counterparty.erc8004_agent_id,
    thirdParty: job.counterparty.third_party,
    priceRaw: job.negotiate.price_raw,
    currency: job.negotiate.currency,
    policy: job.policy.policy,
    disputeWindowSeconds: job.policy.dispute_window_seconds,
    taskHash: raw.taskHash,
    maxSlippageBps: raw.canonicalTask.constraints.maxSlippageBps,
    maxGasUsd: raw.canonicalTask.constraints.maxGasUsd,
    allowedContracts: raw.canonicalTask.constraints.allowedContracts,
    action: {
      protocol: spineAction.protocol,
      method: spineAction.method,
      contract: resolvedContract,
      requiresSignature: spineAction.requiresSignature,
      simulatable: spineAction.simulatable,
      argsSummary: stringifyArgs(spineAction.argsSummary),
      swap: rec
        ? {
            tokenIn: rec.tokenIn,
            tokenOut: rec.tokenOut,
            fee: rec.fee,
            amountIn: rec.amountIn,
            quotedAmountOut: rec.quotedAmountOut
          }
        : undefined
    }
  };
}
