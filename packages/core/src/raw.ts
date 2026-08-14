export interface RawSummary {
  funnel: {
    totalDiscovered: number;
    examinedRecords: number;
    byHighestStage: Record<string, number>;
    byRejectionReason: Record<string, number>;
    thirdParty: { examined: number; testJobPassed: number; hireable: number };
    firstParty: { examined: number; testJobPassed: number };
    perCategory: Record<
      string,
      { examined: number; reachableOrBetter: number; testJobPassed: number }
    >;
  };
  note: string;
}

export interface RawReport {
  key: string;
  tokenId: string;
  name: string;
  thirdParty: boolean;
  categories: string[];
  declaredProtocols: string[];
  finalState: string;
  highestStageReached: string;
  rejectionReasonCode?: string | null;
  rejectionReason?: string | null;
}

export interface RawRanking {
  ranked: Array<{
    agentId: string;
    agentKey: string;
    label: string;
    score: number;
    thirdParty: boolean;
    firstPartyFallback: boolean;
    insufficientHistory: boolean;
    verifiedPerformanceProvenance: string;
    sampleCount: number;
    factors: Record<string, number>;
    materialFactors: string[];
    window: { cutoffBlock: number | null };
  }>;
  scoreVersion: string;
  rankedAtBlock: number;
  sampleCountTotal: number;
  window: { label: string; cutoffBlock: number };
  insufficientHistoryWarning: string;
  task: { category: string; network: string };
}

export interface RawLineage {
  agentId: string;
  category: string;
  jobId: string;
  status: string;
  startBlock: number;
  endBlock: number;
  dataCutoffBlock: number;
  evidenceUri: string;
  evidenceContentHash: string;
  recordHash: string;
  mandateHash: string;
  taskHash: string;
  transactions: string[];
  metrics: Record<string, unknown>;
  metricDetail: {
    metric: string;
    unit: string;
    value: number | string | boolean;
    formula: string;
  };
  scoreVersion: string;
  schemaVersion: string;
  selfClaims: Record<string, unknown>;
}

export interface RawGreenfield {
  bucket: string;
  chain: string;
  createBucketTx: string;
  objects: Array<{
    category: string;
    gnfdUri: string;
    objectName: string;
    downloadedByteSha256: string;
    createObjectTx: string;
    downloadVerified: boolean;
  }>;
}

export interface RawLifecycle {
  canonicalTask: {
    wallet: string;
    objective: string;
    protocol: string;
    agentBudget: string;
    constraints: {
      maxSlippageBps: number;
      maxGasUsd: number;
      allowedContracts: string[];
      deadline: number;
    };
  };
  taskHash: string;
  realGridProposal?: {
    recommendedAction?: {
      target: string;
      functionName: string;
      tokenIn: string;
      tokenOut: string;
      fee: number;
      amountIn: string;
      quotedAmountOut: string;
    };
  };
  spinePlan: {
    action: {
      category: string;
      protocol: string;
      contract: string;
      method: string;
      argsSummary: Record<string, unknown>;
      requiresSignature: boolean;
      simulatable: boolean;
    };
    liveActionContractResolved?: string;
  };
  erc8183Job: {
    jobId: number;
    settled: boolean;
    counterparty: {
      name: string;
      owner: string;
      third_party: boolean;
      erc8004_agent_id: number;
    };
    negotiate: { price_raw: string; currency: string; chain_id: number };
    policy: { policy: string; dispute_window_seconds: number };
    settle: { final_status: string };
    transactions: Array<{
      step: string;
      transactionHash: string;
      blockNumber: number;
      status: number;
      explorer: string;
    }>;
  };
  signedProtocolAction: {
    swapTx?: { hash: string };
    primaryTxHash?: string;
  };
  activityLedger: { stages: string[] };
}
