import { REACH_VAPID_PUBLIC_KEY } from "@atelo/core";
import type { PushPermission, PushResult, PushState } from "./registerPush.types";

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const normalized = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(normalized);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) output[i] = raw.charCodeAt(i);
  return output;
}

export function pushSupported(): boolean {
  return (
    typeof navigator !== "undefined" &&
    "serviceWorker" in navigator &&
    typeof window !== "undefined" &&
    "PushManager" in window &&
    "Notification" in window
  );
}

async function registration(): Promise<ServiceWorkerRegistration> {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  return navigator.serviceWorker.register("/sw.js");
}

export async function getPushState(): Promise<PushState> {
  if (!pushSupported()) {
    return { supported: false, permission: "unsupported", subscribed: false };
  }
  const permission = Notification.permission as PushPermission;
  let subscribed = false;
  try {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) subscribed = (await reg.pushManager.getSubscription()) !== null;
  } catch {
    subscribed = false;
  }
  return { supported: true, permission, subscribed };
}

async function postSubscription(subscription: PushSubscription): Promise<void> {
  const base = process.env.EXPO_PUBLIC_REACH_URL?.trim();
  if (!base) return;
  try {
    await fetch(`${base.replace(/\/$/, "")}/subscribe`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(subscription.toJSON())
    });
  } catch {
    return;
  }
}

export async function enablePush(): Promise<PushResult> {
  if (!pushSupported()) {
    return { ok: false, permission: "unsupported", reason: "Web push is not supported in this browser" };
  }
  const permission = (await Notification.requestPermission()) as PushPermission;
  if (permission !== "granted") {
    return { ok: false, permission, reason: "Notification permission was not granted" };
  }
  try {
    const reg = await registration();
    await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    const subscription =
      existing ??
      (await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(REACH_VAPID_PUBLIC_KEY) as BufferSource
      }));
    await postSubscription(subscription);
    return { ok: true, permission, endpoint: subscription.endpoint };
  } catch (err) {
    const reason = err instanceof Error ? err.message : "Subscription failed";
    return { ok: false, permission, reason };
  }
}
