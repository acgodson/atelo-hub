export type PushPermission = "default" | "granted" | "denied" | "unsupported";

export interface PushState {
  supported: boolean;
  permission: PushPermission;
  subscribed: boolean;
  reason?: string;
}

export interface PushResult {
  ok: boolean;
  permission: PushPermission;
  endpoint?: string;
  reason?: string;
}
