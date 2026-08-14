import { createHash } from "node:crypto";

export interface PushSubscriptionKeys {
  p256dh: string;
  auth: string;
}

export interface PushSubscription {
  endpoint: string;
  keys: PushSubscriptionKeys;
}

export function subscriptionId(subscription: PushSubscription): string {
  return "sub_" + createHash("sha256").update(subscription.endpoint).digest("hex").slice(0, 24);
}

export interface SubscriptionStore {
  subscribe(subscription: PushSubscription): Promise<{ id: string; created: boolean }>;
  unsubscribe(endpoint: string): Promise<boolean>;
  list(): Promise<PushSubscription[]>;
}
