import { useAppKit } from "@reown/appkit-react-native";
import { walletEnabled } from "./env";

function useAppKitConnectModal(): { open: () => void } {
  const { open } = useAppKit();
  return { open: () => open() };
}

function useNoopConnectModal(): { open: () => void } {
  return { open: () => {} };
}

export const useConnectModal = walletEnabled ? useAppKitConnectModal : useNoopConnectModal;
