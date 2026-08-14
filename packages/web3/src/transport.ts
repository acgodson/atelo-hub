import { fallback, http, type FallbackTransport, type HttpTransport } from "viem";
import { rpcUrls } from "@atelo/core";

export function bscFallbackTransport(urls: string[] = rpcUrls()): FallbackTransport {
  const transports: HttpTransport[] = (urls.length > 0 ? urls : rpcUrls()).map((url) => http(url));
  return fallback(transports, { rank: false, retryCount: 2 });
}
