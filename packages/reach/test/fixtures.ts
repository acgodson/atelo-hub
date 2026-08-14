import { createECDH, randomBytes } from "node:crypto";
import type { PushSubscription } from "../src/subscriptions.js";

export function makeClientSubscription(endpoint: string): PushSubscription {
  const ecdh = createECDH("prime256v1");
  ecdh.generateKeys();
  return {
    endpoint,
    keys: {
      p256dh: ecdh.getPublicKey().toString("base64url"),
      auth: randomBytes(16).toString("base64url")
    }
  };
}
