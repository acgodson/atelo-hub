import { ADDRESSES } from "./contracts";

export type AllowedContractKey = keyof typeof ADDRESSES;

export const ALLOWED_CONTRACTS: Record<AllowedContractKey, `0x${string}`> = {
  agenticCommerce: ADDRESSES.agenticCommerce,
  uToken: ADDRESSES.uToken,
  policy: ADDRESSES.policy,
  swapRouter: ADDRESSES.swapRouter,
  wbnb: ADDRESSES.wbnb,
  usdt: ADDRESSES.usdt
};

const ALLOWED_SET: ReadonlySet<string> = new Set(
  Object.values(ALLOWED_CONTRACTS).map((address) => address.toLowerCase())
);

export class ContractNotAllowedError extends Error {
  readonly address: string;

  constructor(address: string) {
    super(`CONTRACT_NOT_ALLOWED: ${address} is not in the Atelo contract allowlist`);
    this.name = "ContractNotAllowedError";
    this.address = address;
  }
}

export function isAllowedContract(address: string | undefined | null): boolean {
  if (!address) return false;
  return ALLOWED_SET.has(address.trim().toLowerCase());
}

export function assertAllowedContract(address: string | undefined | null): `0x${string}` {
  if (!address || !isAllowedContract(address)) {
    throw new ContractNotAllowedError(String(address));
  }
  return address.trim().toLowerCase() as `0x${string}`;
}
