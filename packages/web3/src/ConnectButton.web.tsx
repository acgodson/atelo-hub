import { Pressable, StyleSheet, Text, View } from "react-native";
import { useAppKit } from "@reown/appkit/react";
import { useDisconnect, useSwitchChain } from "wagmi";
import { CHAIN_ID, shortHash } from "@atelo/core";
import { walletEnabled } from "./env";
import { useWallet } from "./useWallet";

function WalletConnectButton() {
  const { open } = useAppKit();
  const { address, isConnected, chainId } = useWallet();
  const { disconnect } = useDisconnect();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected || !address) {
    return (
      <Pressable style={[styles.btn, styles.connect]} onPress={() => open()}>
        <Text style={styles.connectText}>Connect</Text>
      </Pressable>
    );
  }

  if (chainId !== CHAIN_ID) {
    return (
      <Pressable
        style={[styles.btn, styles.wrong]}
        onPress={() => switchChain({ chainId: CHAIN_ID })}
        disabled={isPending}
      >
        <Text style={styles.wrongText}>{isPending ? "Switching…" : "Switch network"}</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.row}>
      <Pressable style={[styles.btn, styles.account]} onPress={() => open()}>
        <View style={styles.dot} />
        <Text style={styles.accountText}>{shortHash(address, 6, 4)}</Text>
      </Pressable>
      <Pressable style={[styles.btn, styles.ghost]} onPress={() => disconnect()}>
        <Text style={styles.ghostText}>Disconnect</Text>
      </Pressable>
    </View>
  );
}

function WalletOffButton() {
  return (
    <View style={[styles.btn, styles.off]}>
      <Text style={styles.offText}>Wallet off</Text>
    </View>
  );
}

export const ConnectButton = walletEnabled ? WalletConnectButton : WalletOffButton;

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  connect: { backgroundColor: "#208AEF" },
  connectText: { color: "#FFFFFF", fontWeight: "700", fontSize: 13 },
  account: { backgroundColor: "#11161D", borderWidth: 1, borderColor: "#26303C" },
  accountText: { color: "#E8EEF5", fontWeight: "700", fontSize: 13 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#3FD07A" },
  wrong: { backgroundColor: "#3A1D1D", borderWidth: 1, borderColor: "#7A3B3B" },
  wrongText: { color: "#F1B4B4", fontWeight: "700", fontSize: 13 },
  ghost: { borderWidth: 1, borderColor: "#26303C" },
  ghostText: { color: "#93A1B0", fontWeight: "600", fontSize: 13 },
  off: { borderWidth: 1, borderColor: "#26303C", opacity: 0.6 },
  offText: { color: "#93A1B0", fontWeight: "600", fontSize: 13 }
});
