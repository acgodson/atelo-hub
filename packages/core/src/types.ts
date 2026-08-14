export type Category = "grid" | "rebalancing" | "yield" | "health";

export type QualStage =
  | "REGISTERED"
  | "REACHABLE"
  | "PROTOCOL_COMPATIBLE"
  | "HIREABLE";

export interface CategoryMeta {
  slug: Category;
  title: string;
  short: string;
  blurb: string;
  metricLabel: string;
}

export interface FunnelView {
  totalDiscovered: number;
  examinedRecords: number;
  byHighestStage: Record<string, number>;
  byRejectionReason: Record<string, number>;
  reachableOrBetter: number;
  hireable: number;
  firstPartyExamined: number;
  firstPartyTestJobPassed: number;
  thirdPartyExamined: number;
  thirdPartyTestJobPassed: number;
  perCategory: Record<
    string,
    { examined: number; reachableOrBetter: number; testJobPassed: number }
  >;
  note: string;
}

export interface AgentListItem {
  agentKey: string;
  tokenId: string;
  displayName: string;
  category: Category | "none";
  categories: string[];
  stage: QualStage;
  rejected: boolean;
  rejectionReason?: string;
  highestStageReached: string;
  firstParty: boolean;
  verifiedMetric?: string;
  verifiedProvenance?: "first-party" | "third-party" | "none";
}

export interface LineageView {
  jobId: string;
  category: Category;
  status: "VERIFIED" | "UNVERIFIED";
  agentId: string;
  metric: string;
  metricUnit: string;
  metricValue: number | string | boolean;
  metricFormula: string;
  scoreVersion: string;
  schemaVersion: string;
  startBlock: number;
  endBlock: number;
  dataCutoffBlock: number;
  evidenceUri: string;
  evidenceContentHash: string;
  recordHash: string;
  mandateHash: string;
  taskHash: string;
  transactions: string[];
  selfClaims: Record<string, unknown>;
}

export interface JobTx {
  step: string;
  hash: string;
  blockNumber: number;
  status: number;
  explorer: string;
}

export interface JobView {
  jobId: string;
  wallet: string;
  category: Category;
  finalStatus: string;
  settled: boolean;
  counterpartyName: string;
  firstParty: boolean;
  agentId: number;
  transactions: JobTx[];
  signedActionTx?: { hash: string; explorer: string };
  stages: string[];
  settledAtBlock?: number;
}

export interface RankingFactor {
  key: string;
  value: number;
}

export interface RankingEntry {
  agentKey: string;
  agentId: string;
  label: string;
  score: number;
  thirdParty: boolean;
  firstPartyFallback: boolean;
  insufficientHistory: boolean;
  provenance: "first-party" | "third-party" | "none";
  factors: RankingFactor[];
  materialFactors: string[];
  sampleCount: number;
  cutoffBlock: number | null;
}

export interface RankingView {
  category: Category;
  network: string;
  scoreVersion: string;
  rankedAtBlock: number;
  sampleCountTotal: number;
  window: { label: string; cutoffBlock: number };
  insufficientHistoryWarning: string;
  ranked: RankingEntry[];
}
