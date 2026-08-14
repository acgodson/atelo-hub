import webpush from "web-push";
import { REACH_VAPID_PUBLIC_KEY } from "@atelo/core";
import type { ReachEvent } from "./events.js";
import type { PushSubscription, SubscriptionStore } from "./subscriptions.js";

export const VAPID_SUBJECT = "mailto:reach@atelo.hub";

export interface VapidConfig {
  publicKey: string;
  privateKey: string;
  subject: string;
}

export function loadVapidConfig(): VapidConfig | null {
  const privateKey = (process.env.REACH_VAPID_PRIVATE_KEY ?? process.env.VAPID_PRIVATE_KEY)?.trim();
  if (!privateKey) return null;
  const publicKey = process.env.VAPID_PUBLIC_KEY?.trim() || REACH_VAPID_PUBLIC_KEY;
  return { publicKey, privateKey, subject: VAPID_SUBJECT };
}

export interface PushTransportResult {
  statusCode: number;
}

export type PushTransport = (
  subscription: PushSubscription,
  payload: string
) => Promise<PushTransportResult>;

export function webPushTransport(vapid: VapidConfig): PushTransport {
  webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);
  return async (subscription, payload) => {
    const result = await webpush.sendNotification(subscription, payload);
    return { statusCode: result.statusCode };
  };
}

export interface DispatchReport {
  eventId: string;
  deduped: boolean;
  delivered: number;
  failed: number;
}

export class ReachDispatcher {
  private readonly store: SubscriptionStore;
  private readonly transport: PushTransport;
  private readonly dispatched = new Set<string>();

  constructor(store: SubscriptionStore, transport: PushTransport) {
    this.store = store;
    this.transport = transport;
  }

  hasDispatched(eventId: string): boolean {
    return this.dispatched.has(eventId);
  }

  async dispatch(event: ReachEvent): Promise<DispatchReport> {
    if (this.dispatched.has(event.eventId)) {
      return { eventId: event.eventId, deduped: true, delivered: 0, failed: 0 };
    }
    this.dispatched.add(event.eventId);

    const payload = JSON.stringify({
      eventId: event.eventId,
      kind: event.kind,
      title: event.title,
      body: event.body,
      createdAt: event.createdAt,
      data: event.data ?? {}
    });

    const subscriptions = await this.store.list();
    let delivered = 0;
    let failed = 0;
    for (const subscription of subscriptions) {
      try {
        const result = await this.transport(subscription, payload);
        if (result.statusCode >= 200 && result.statusCode < 300) delivered += 1;
        else failed += 1;
      } catch {
        failed += 1;
      }
    }
    return { eventId: event.eventId, deduped: false, delivered, failed };
  }
}
