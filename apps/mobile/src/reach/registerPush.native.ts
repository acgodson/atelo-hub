import type { PushResult, PushState } from "./registerPush.types";

const NATIVE_REASON =
  "Native push arrives in the custom dev build (expo-notifications + APNs/FCM). Enable notifications on the web app for now.";

export function pushSupported(): boolean {
  return false;
}

export async function getPushState(): Promise<PushState> {
  return { supported: false, permission: "unsupported", subscribed: false, reason: NATIVE_REASON };
}

export async function enablePush(): Promise<PushResult> {
  return { ok: false, permission: "unsupported", reason: NATIVE_REASON };
}
