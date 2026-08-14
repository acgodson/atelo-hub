import { assertAllowedContract } from "./allowlist";

export interface AuditEntryInput {
  actionType: string;
  targetContract: string;
  params: Record<string, unknown>;
  txHash: string;
  actorAddress: string;
  intentKey?: string;
  timestamp?: number;
}

export interface AuditEntry {
  actionType: string;
  targetContract: `0x${string}`;
  paramsHash: string;
  txHash: string;
  actorAddress: string;
  intentKey: string;
  timestamp: number;
}

function fnv1a(input: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function canonical(value: unknown): unknown {
  if (typeof value === "bigint") return value.toString();
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      out[key] = canonical((value as Record<string, unknown>)[key]);
    }
    return out;
  }
  return value;
}

export function paramsHash(params: Record<string, unknown>): string {
  return `fnv1a:${fnv1a(JSON.stringify(canonical(params)))}`;
}

export function buildAuditEntry(input: AuditEntryInput): AuditEntry {
  const targetContract = assertAllowedContract(input.targetContract);
  const hash = paramsHash(input.params);
  const intentKey = input.intentKey ?? `${input.actionType}:${targetContract}:${hash}`;
  return {
    actionType: input.actionType,
    targetContract,
    paramsHash: hash,
    txHash: input.txHash,
    actorAddress: input.actorAddress.toLowerCase(),
    intentKey,
    timestamp: input.timestamp ?? Date.now()
  };
}

export interface AuditRecordResult {
  recorded: boolean;
  entry: AuditEntry;
}

export class InMemoryAuditTimeline {
  private readonly entries: AuditEntry[] = [];
  private readonly intents = new Set<string>();

  record(input: AuditEntryInput): AuditRecordResult {
    const entry = buildAuditEntry(input);
    if (this.intents.has(entry.intentKey)) {
      return { recorded: false, entry };
    }
    this.intents.add(entry.intentKey);
    this.entries.push(entry);
    return { recorded: true, entry };
  }

  has(intentKey: string): boolean {
    return this.intents.has(intentKey);
  }

  list(): readonly AuditEntry[] {
    return [...this.entries];
  }

  get size(): number {
    return this.entries.length;
  }
}
