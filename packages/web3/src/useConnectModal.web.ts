import { useAppKit } from "@reown/appkit/react";

export function useConnectModal(): { open: () => void } {
  const { open } = useAppKit();
  return { open: () => open() };
}
