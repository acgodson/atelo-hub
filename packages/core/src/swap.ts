export const BPS_DENOMINATOR = 10000n;

export const MAX_SLIPPAGE_BPS = 5000;

export const DEFAULT_DEADLINE_WINDOW_SEC = 600;

export const MAX_DEADLINE_WINDOW_SEC = 3600;

export function computeMinOut(quotedAmountOut: bigint, maxSlippageBps: number): bigint {
  if (quotedAmountOut < 0n) throw new Error("MIN_OUT_INVALID: quotedAmountOut must be non-negative");
  if (!Number.isInteger(maxSlippageBps) || maxSlippageBps < 0 || maxSlippageBps > MAX_SLIPPAGE_BPS) {
    throw new Error(`MIN_OUT_INVALID: maxSlippageBps must be an integer within 0..${MAX_SLIPPAGE_BPS}`);
  }
  return (quotedAmountOut * (BPS_DENOMINATOR - BigInt(maxSlippageBps))) / BPS_DENOMINATOR;
}

export function computeDeadline(
  nowSec: number,
  windowSec: number = DEFAULT_DEADLINE_WINDOW_SEC
): bigint {
  if (!Number.isFinite(nowSec) || nowSec <= 0) throw new Error("DEADLINE_INVALID: nowSec must be positive");
  if (!Number.isFinite(windowSec) || windowSec <= 0) throw new Error("DEADLINE_INVALID: windowSec must be positive");
  const bounded = Math.min(Math.floor(windowSec), MAX_DEADLINE_WINDOW_SEC);
  return BigInt(Math.floor(nowSec) + bounded);
}
