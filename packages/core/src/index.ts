export const APP_NAME = "Atelo Hub";

export type {
  Category,
  QualStage,
  CategoryMeta,
  FunnelView,
  AgentListItem,
  LineageView,
  JobTx,
  JobView,
  RankingFactor,
  RankingEntry,
  RankingView
} from "./types";

export {
  CATEGORIES,
  CATEGORY_ORDER,
  CATEGORY_TO_LINEAGE_ID,
  CATEGORY_TO_LIFECYCLE_PREFIX,
  CATEGORY_TO_RANKING_FILE,
  isCategory
} from "./categories";

export { REFERENCE_AGENT, REACH_VAPID_PUBLIC_KEY, bscScanTx, shortHash } from "./constants";

export {
  CHAIN_ID,
  PINNED_RPC_URL,
  rpcUrl,
  bscTestnet,
  ADDRESSES,
  U_TOKEN,
  erc20Abi,
  swapRouterAbi,
  REOWN_PROJECT_ID,
  WALLET_ENABLED,
  bscScanAddress
} from "./contracts";

export { BSC_TESTNET_RPC_URLS, rpcUrls, RPC_CHAIN_ID } from "./rpc";

export {
  ALLOWED_CONTRACTS,
  ContractNotAllowedError,
  isAllowedContract,
  assertAllowedContract
} from "./allowlist";
export type { AllowedContractKey } from "./allowlist";

export {
  BPS_DENOMINATOR,
  MAX_SLIPPAGE_BPS,
  DEFAULT_DEADLINE_WINDOW_SEC,
  MAX_DEADLINE_WINDOW_SEC,
  computeMinOut,
  computeDeadline
} from "./swap";

export { withRetry, RetryExhaustedError } from "./retry";
export type { RetryOptions } from "./retry";

export {
  paramsHash,
  buildAuditEntry,
  InMemoryAuditTimeline
} from "./audit";
export type { AuditEntry, AuditEntryInput, AuditRecordResult } from "./audit";

export {
  requiresWallet,
  isWalletFree,
  evaluateTelegramCommand
} from "./permissions";
export type { UserAction, TelegramVerdict } from "./permissions";

export {
  getFunnel,
  getAgentsByCategory,
  getReferenceAgentSummary
} from "./adapters/qualification";

export { getRanking } from "./adapters/rankings";

export { getJob, getAllJobs, getJobsForWallet } from "./adapters/jobs";

export {
  getLineage,
  getAllLineage,
  getGreenfieldByUri
} from "./adapters/lineage";
export type { GreenfieldObjectView } from "./adapters/lineage";

export { getHireTerms } from "./adapters/hire";
export type { HireTerms, HireProposalAction } from "./adapters/hire";
