import { getAllJobs, type JobView } from "@atelo/core";

export interface ReachEvent {
  eventId: string;
  kind: "job.settled";
  title: string;
  body: string;
  category: string;
}

function toEvent(job: JobView): ReachEvent {
  return {
    eventId: `evt_job_${job.jobId}`,
    kind: "job.settled",
    title: `Job #${job.jobId} settled`,
    body: `${job.counterpartyName} · ${job.finalStatus}`,
    category: job.category
  };
}

export function reachInboxEvents(): ReachEvent[] {
  return getAllJobs()
    .filter((job) => job.settled)
    .map(toEvent);
}
