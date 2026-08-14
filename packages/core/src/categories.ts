import type { Category, CategoryMeta } from "./types";

export const CATEGORY_ORDER: Category[] = ["rebalancing", "grid", "yield", "health"];

export const CATEGORIES: Record<Category, CategoryMeta> = {
  rebalancing: {
    slug: "rebalancing",
    title: "Rebalancing",
    short: "Rebalance",
    blurb: "Keep a concentrated liquidity position centered in range on PancakeSwap v3.",
    metricLabel: "Position in range"
  },
  grid: {
    slug: "grid",
    title: "Grid",
    short: "Grid",
    blurb: "Execute bounded grid swaps on PancakeSwap v3 within a slippage ceiling.",
    metricLabel: "Realized slippage (bps)"
  },
  yield: {
    slug: "yield",
    title: "Yield",
    short: "Yield",
    blurb: "Open and hold a live concentrated liquidity position to farm yield.",
    metricLabel: "Realized APR"
  },
  health: {
    slug: "health",
    title: "Health",
    short: "Health",
    blurb: "Improve a Venus lending position's health factor away from liquidation.",
    metricLabel: "Health-factor change"
  }
};

export const CATEGORY_TO_LINEAGE_ID: Record<Category, string> = {
  grid: "501",
  rebalancing: "503",
  yield: "504",
  health: "505"
};

export const CATEGORY_TO_LIFECYCLE_PREFIX: Record<Category, string> = {
  grid: "lifecycle-grid",
  rebalancing: "lifecycle-rebalancing",
  yield: "lifecycle-yield",
  health: "lifecycle-venus"
};

export const CATEGORY_TO_RANKING_FILE: Record<Category, string> = {
  grid: "ranking-grid.json",
  rebalancing: "ranking-rebalancing.json",
  yield: "ranking-yield.json",
  health: "ranking-health.json"
};

export function isCategory(value: string): value is Category {
  return value === "grid" || value === "rebalancing" || value === "yield" || value === "health";
}
