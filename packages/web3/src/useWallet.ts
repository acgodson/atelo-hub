import { useAccount, useChainId } from "wagmi";

export interface WalletState {
  address: `0x${string}` | undefined;
  isConnected: boolean;
  chainId: number;
}

export function useWallet(): WalletState {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  return { address, isConnected, chainId };
}
