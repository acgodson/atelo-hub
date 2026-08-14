import { createHash } from "node:crypto";
import { getAllJobs, type JobView } from "@atelo/core";

export type ReachEventKind = "job.settled" | "job.submitted" | "agent.paused" | "system.test";

export interface ReachEvent {
  eventId: string;
  kind: ReachEventKind;
  title: string;
  body: string;
  createdAt: string;
  data?: Record<string, string | number | boolean>;
}

export interface ReachEventInput {
  kind: ReachEventKind;
  title: string;
  body: string;
  eventId?: string;
  createdAt?: string;
  data?: Record<string, string | number | boolean>;
}

export function makeEventId(kind: ReachEventKind, dedupeKey: string): string {
  const digest = createHash("sha256").update(`${kind}:${dedupeKey}`).digest("hex").slice(0, 24);
  return `evt_${digest}`;
}

export function buildEvent(input: ReachEventInput): ReachEvent {
  const createdAt = input.createdAt ?? new Date().toISOString();
  const eventId = input.eventId ?? makeEventId(input.kind, `${input.title}|${createdAt}`);
  return {
    eventId,
    kind: input.kind,
    title: input.title,
    body: input.body,
    createdAt,
    data: input.data
  };
}

function settledEvent(job: JobView): ReachEvent {
  return buildEvent({
    kind: "job.settled",
    eventId: makeEventId("job.settled", `job:${job.jobId}`),
    title: `Job #${job.jobId} settled`,
    body: `${job.counterpartyName} · ${job.category} · ${job.finalStatus}`,
    createdAt: new Date(0).toISOString(),
    data: {
      jobId: job.jobId,
      category: job.category,
      finalStatus: job.finalStatus,
      agentId: job.agentId,
      firstParty: job.firstParty
    }
  });
}

export function reachEventsFromBackend(): ReachEvent[] {
  return getAllJobs()
    .filter((job) => job.settled)
    .map(settledEvent);
}
