import { Link, useRouter, usePathname } from "expo-router";
import type { ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ConnectButton } from "@atelo/web3";
import { BetaBadge } from "./ui";
import { radius, space, theme } from "../theme";

export function TopBar({ back }: { back?: { label: string } }) {
  const router = useRouter();
  return (
    <View style={styles.topbar}>
      {back ? (
        <Pressable style={styles.backRow} onPress={() => router.push("/discover")}>
          <Text style={styles.backChevron}>‹</Text>
          <Text style={styles.backText}>{back.label}</Text>
        </Pressable>
      ) : (
        <Link href="/" asChild>
          <Pressable style={styles.brandRow}>
            <View style={styles.brandmark}>
              <Text style={styles.brandmarkText}>A</Text>
            </View>
            <Text style={styles.brandText}>Atelo Hub</Text>
          </Pressable>
        </Link>
      )}
      <View style={styles.topbarRight}>
        <BetaBadge />
        <View style={styles.netBadge}>
          <Text style={styles.netText}>BSC Testnet</Text>
        </View>
        <ConnectButton />
      </View>
    </View>
  );
}

const TABS = [
  { key: "home", label: "Home", href: "/" as const, active: (p: string) => p === "/" },
  {
    key: "discover",
    label: "Discover",
    href: "/discover" as const,
    active: (p: string) => p.startsWith("/discover")
  },
  {
    key: "agents",
    label: "My Agents",
    href: "/my-agents" as const,
    active: (p: string) => p.startsWith("/my-agents")
  },
  {
    key: "activity",
    label: "Activity",
    href: "/activity" as const,
    active: (p: string) => p.startsWith("/activity")
  }
];

export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <View style={styles.tabbar}>
      {TABS.map((t) => {
        const on = t.active(pathname);
        return (
          <Pressable key={t.key} style={styles.tabItem} onPress={() => router.push(t.href)}>
            <Text style={[styles.tabLabel, on && styles.tabLabelActive]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Screen({
  children,
  back
}: {
  children: ReactNode;
  back?: { label: string };
}) {
  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <TopBar back={back} />
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.bg,
    maxWidth: 480,
    width: "100%",
    alignSelf: "center"
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    padding: space.s5,
    gap: space.s5,
    paddingBottom: 96
  },
  topbar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: space.s5,
    paddingVertical: space.s4,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.bg
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s3
  },
  brandmark: {
    width: 30,
    height: 30,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.primary
  },
  brandmarkText: {
    color: theme.primaryContrast,
    fontWeight: "800",
    fontSize: 15
  },
  brandText: {
    color: theme.text,
    fontWeight: "700",
    fontSize: 17
  },
  backRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6
  },
  backChevron: {
    color: theme.textDim,
    fontSize: 22,
    marginTop: -2
  },
  backText: {
    color: theme.textDim,
    fontSize: 13,
    fontWeight: "600"
  },
  topbarRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s3
  },
  netBadge: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
    backgroundColor: theme.surface
  },
  netText: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.textDim
  },
  tabbar: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.surface
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    paddingVertical: 10
  },
  tabLabel: {
    color: theme.textFaint,
    fontSize: 11,
    fontWeight: "600"
  },
  tabLabelActive: {
    color: theme.primary
  }
});
