export interface RetryOptions {
  retries?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  shouldRetry?: (error: unknown, attempt: number) => boolean;
  onRetry?: (error: unknown, attempt: number, delayMs: number) => void;
  sleep?: (ms: number) => Promise<void>;
}

const defaultSleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export class RetryExhaustedError extends Error {
  readonly attempts: number;
  readonly lastError: unknown;

  constructor(attempts: number, lastError: unknown) {
    super(`RETRY_EXHAUSTED: gave up after ${attempts} attempt(s)`);
    this.name = "RetryExhaustedError";
    this.attempts = attempts;
    this.lastError = lastError;
  }
}

export async function withRetry<T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const retries = Math.max(0, options.retries ?? 3);
  const baseDelayMs = Math.max(0, options.baseDelayMs ?? 100);
  const maxDelayMs = Math.max(baseDelayMs, options.maxDelayMs ?? 2000);
  const shouldRetry = options.shouldRetry ?? (() => true);
  const sleep = options.sleep ?? defaultSleep;

  let lastError: unknown;
  const maxAttempts = retries + 1;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts || !shouldRetry(error, attempt)) break;
      const delayMs = Math.min(maxDelayMs, baseDelayMs * 2 ** (attempt - 1));
      options.onRetry?.(error, attempt, delayMs);
      await sleep(delayMs);
    }
  }
  throw new RetryExhaustedError(maxAttempts, lastError);
}
