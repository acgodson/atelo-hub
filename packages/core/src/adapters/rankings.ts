import { rankings } from "../data/rankings";
import type { RawRanking } from "../raw";
import type { Category, RankingEntry, RankingView } from "../types";

const FACTOR_ORDER = ["verifiedPerformance", "suitability", "reliability", "availability", "price"];

function provenance(value: string): "first-party" | "third-party" | "none" {
  if (value === "first-party") return "first-party";
  if (value === "third-party") return "third-party";
  return "none";
}

function toEntry(r: RawRanking["ranked"][number]): RankingEntry {
  const factors = FACTOR_ORDER.filter((k) => k in r.factors).map((k) => ({
    key: k,
    value: r.factors[k] ?? 0
  }));
  return {
    agentKey: r.agentKey,
    agentId: r.agentId,
    label: r.label,
    score: r.score,
    thirdParty: r.thirdParty,
    firstPartyFallback: r.firstPartyFallback,
    insufficientHistory: r.insufficientHistory,
    provenance: provenance(r.verifiedPerformanceProvenance),
    factors,
    materialFactors: r.materialFactors,
    sampleCount: r.sampleCount,
    cutoffBlock: r.window.cutoffBlock
  };
}

export function getRanking(category: Category): RankingView {
  const raw = rankings[category];
  return {
    category,
    network: raw.task.network,
    scoreVersion: raw.scoreVersion,
    rankedAtBlock: raw.rankedAtBlock,
    sampleCountTotal: raw.sampleCountTotal,
    window: raw.window,
    insufficientHistoryWarning: raw.insufficientHistoryWarning,
    ranked: raw.ranked.map(toEntry)
  };
}
