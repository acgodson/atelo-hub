import type { HireTerms } from "@atelo/core";
import { useWallet, walletEnabled } from "@atelo/web3";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { radius, space, theme } from "../theme";
import { ActivationSheet } from "./ActivationSheet";

export function HireCta({ terms }: { terms: HireTerms }) {
  const [open, setOpen] = useState(false);
  const { isConnected } = useWallet();

  const status = !walletEnabled
    ? "Wallet disabled — set EXPO_PUBLIC_REOWN_PROJECT_ID to hire. You can still review the full job terms."
    : isConnected
      ? "Wallet connected — review terms, then simulate and sign each step yourself."
      : "Connect a wallet inside the sheet to simulate and sign. Browsing stays wallet-free.";

  return (
    <View style={styles.wrap}>
      <Pressable style={styles.cta} onPress={() => setOpen(true)}>
        <Text style={styles.ctaText}>
          {isConnected ? "Hire — open activation" : "Review hire terms"}
        </Text>
      </Pressable>
      <Text style={styles.status}>{status}</Text>
      <ActivationSheet terms={terms} visible={open} onClose={() => setOpen(false)} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: space.s2
  },
  cta: {
    backgroundColor: theme.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: "center",
    justifyContent: "center"
  },
  ctaText: {
    color: theme.primaryContrast,
    fontWeight: "800",
    fontSize: 14
  },
  status: {
    color: theme.textFaint,
    fontSize: 12,
    lineHeight: 17
  }
});
