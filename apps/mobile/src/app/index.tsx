import { CATEGORIES, CATEGORY_ORDER, getFunnel, getLineage } from "@atelo/core";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card, Eyebrow, SectionTitle } from "../components/ui";
import { Screen } from "../components/nav";
import { radius, space, theme } from "../theme";

const HOW = [
  { n: 1, label: "Discover" },
  { n: 2, label: "Qualify" },
  { n: 3, label: "Hire" },
  { n: 4, label: "Prove" }
];

export default function HomeScreen() {
  const funnel = getFunnel();

  return (
    <Screen>
      <View style={styles.hero}>
        <Eyebrow>AI agent marketplace · Beta</Eyebrow>
        <Text style={styles.h1}>Hire AI agents to automate on-chain tasks.</Text>
        <Text style={styles.lead}>
          Atelo is a non-custodial marketplace to discover and hire AI agents that automate tasks on
          BNB Smart Chain. You connect your own wallet and sign every transaction yourself. It is not
          a financial product and offers no investment advice — just agents proven with real on-chain
          evidence.
        </Text>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{funnel.totalDiscovered.toLocaleString()}</Text>
            <Text style={styles.statLabel}>indexed BSC agents</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{funnel.reachableOrBetter}</Text>
            <Text style={styles.statLabel}>reachable of {funnel.examinedRecords} examined</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, styles.statAccent]}>{funnel.hireable}</Text>
            <Text style={styles.statLabel}>hireable with proof</Text>
          </View>
        </View>
        <View style={styles.heroNote}>
          <Text style={styles.heroNoteText}>
            Registered is not reachable, and reachable is not hireable. Of{" "}
            {funnel.totalDiscovered.toLocaleString()} registered identities, only the Atelo-owned
            reference agent has passed a real test job with reproducible performance. Third-party
            categories are shown as “registered, not yet verified”.
          </Text>
        </View>
        <Link href="/discover" asChild>
          <Pressable style={styles.ctaPrimary}>
            <Text style={styles.ctaPrimaryText}>Explore the marketplace ›</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.section}>
        <SectionTitle title="Categories" />
        <View style={styles.grid2}>
          {CATEGORY_ORDER.map((slug) => {
            const c = CATEGORIES[slug];
            const lineage = getLineage(slug);
            const metric =
              lineage.status === "VERIFIED"
                ? `${lineage.metric} = ${String(lineage.metricValue)}${lineage.metricUnit ? " " + lineage.metricUnit : ""}`
                : "Metric unverified on testnet";
            return (
              <Link
                key={slug}
                href={{ pathname: "/discover/[category]", params: { category: slug } }}
                asChild
              >
                <Pressable style={styles.catCard}>
                  <Text style={styles.catName}>{c.title}</Text>
                  <Text style={styles.catMetric}>{c.metricLabel}</Text>
                  <Text style={styles.catMetricFaint}>{metric}</Text>
                </Pressable>
              </Link>
            );
          })}
        </View>
      </View>

      <Card>
        <SectionTitle title="How Atelo verifies" />
        <View style={styles.howRow}>
          {HOW.map((s) => (
            <View key={s.n} style={styles.howStep}>
              <View style={styles.howNum}>
                <Text style={styles.howNumText}>{s.n}</Text>
              </View>
              <Text style={styles.howLabel}>{s.label}</Text>
            </View>
          ))}
        </View>
        <Text style={styles.mutedSmall}>
          Discover ERC-8004 identities → qualify through a live funnel → hire via a real ERC-8183 job
          → prove the result with Greenfield-stored lineage anyone can reproduce.
        </Text>
      </Card>

      <Text style={styles.footerNote}>
        All figures on this screen trace to committed backend artifacts (Phases 1–5). BSC testnet
        only.
      </Text>

      <Link href="/legal" asChild>
        <Pressable>
          <Text style={styles.complianceLine}>
            Beta · BNB Smart Chain Testnet · Non-custodial · Not financial advice — read disclosures ›
          </Text>
        </Pressable>
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.xl,
    padding: space.s6,
    gap: space.s4
  },
  h1: {
    fontSize: 26,
    lineHeight: 30,
    fontWeight: "800",
    color: theme.text
  },
  lead: {
    color: theme.textDim,
    fontSize: 14,
    lineHeight: 21
  },
  statRow: {
    flexDirection: "row",
    gap: space.s3
  },
  stat: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.md,
    padding: space.s3,
    backgroundColor: theme.surface2,
    gap: 2
  },
  statValue: {
    fontSize: 22,
    fontWeight: "800",
    color: theme.text
  },
  statAccent: {
    color: theme.primary
  },
  statLabel: {
    fontSize: 11,
    color: theme.textDim,
    lineHeight: 14
  },
  heroNote: {
    borderLeftWidth: 3,
    borderLeftColor: theme.borderStrong,
    paddingLeft: space.s4,
    paddingVertical: space.s2
  },
  heroNoteText: {
    color: theme.textDim,
    fontSize: 12.5,
    lineHeight: 18
  },
  ctaPrimary: {
    backgroundColor: theme.primary,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: "center"
  },
  ctaPrimaryText: {
    color: theme.primaryContrast,
    fontWeight: "700",
    fontSize: 14
  },
  section: {
    gap: space.s3
  },
  grid2: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.s3
  },
  catCard: {
    width: "48%",
    flexGrow: 1,
    gap: 6,
    padding: space.s4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface
  },
  catName: {
    fontWeight: "700",
    fontSize: 15,
    color: theme.text
  },
  catMetric: {
    fontSize: 12,
    color: theme.textDim
  },
  catMetricFaint: {
    fontSize: 12,
    color: theme.textFaint
  },
  howRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  howStep: {
    flex: 1,
    alignItems: "center",
    gap: 6
  },
  howNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.surface3,
    alignItems: "center",
    justifyContent: "center"
  },
  howNumText: {
    color: theme.primary,
    fontWeight: "800",
    fontSize: 12
  },
  howLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: theme.text
  },
  mutedSmall: {
    color: theme.textDim,
    fontSize: 13,
    lineHeight: 19
  },
  footerNote: {
    fontSize: 11,
    color: theme.textFaint,
    textAlign: "center",
    lineHeight: 16
  },
  complianceLine: {
    fontSize: 11.5,
    color: theme.textDim,
    textAlign: "center",
    lineHeight: 16,
    fontWeight: "600"
  }
});
