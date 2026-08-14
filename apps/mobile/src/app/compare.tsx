import {
  CATEGORIES,
  CATEGORY_ORDER,
  getRanking,
  isCategory,
  type Category,
  type RankingEntry
} from "@atelo/core";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/nav";
import { Eyebrow, Note } from "../components/ui";
import { radius, space, theme } from "../theme";

function factor(entry: RankingEntry, key: string): string {
  const f = entry.factors.find((x) => x.key === key);
  return f ? f.value.toFixed(2) : "—";
}

function provenanceLabel(entry: RankingEntry): string {
  if (entry.provenance === "first-party") return "First-party (Atelo)";
  if (entry.provenance === "third-party") return "Third-party (verified)";
  return "None (unverified)";
}

export default function CompareScreen() {
  const params = useLocalSearchParams<{ category?: string }>();
  const router = useRouter();
  const category: Category =
    params.category && isCategory(params.category) ? params.category : "grid";
  const meta = CATEGORIES[category];
  const ranking = getRanking(category);
  const [a, b] = ranking.ranked.slice(0, 2);

  const rows: Array<[string, (e: RankingEntry) => string]> = [
    ["Provenance", provenanceLabel],
    ["Score", (e) => e.score.toFixed(2)],
    ["Verified perf.", (e) => factor(e, "verifiedPerformance")],
    ["Suitability", (e) => factor(e, "suitability")],
    ["Reliability", (e) => factor(e, "reliability")],
    ["Availability", (e) => factor(e, "availability")],
    ["Price factor", (e) => factor(e, "price")],
    ["Samples", (e) => String(e.sampleCount)],
    ["History", (e) => (e.insufficientHistory ? "Insufficient" : "Full window")]
  ];

  const headA = a ? (a.provenance === "first-party" ? "Atelo Reference" : `#${a.agentKey.split("-")[1]}`) : "";
  const headB = b ? (b.provenance === "first-party" ? "Atelo Reference" : `#${b.agentKey.split("-")[1]}`) : "";

  return (
    <Screen back={{ label: meta.title }}>
      <View style={styles.header}>
        <Eyebrow>Compare</Eyebrow>
        <Text style={styles.h1}>{meta.title}: side by side</Text>
        <Text style={styles.lead}>
          The two highest-ranked agents in this category, on the same explainable factors.
        </Text>
      </View>

      <View style={styles.pillRow}>
        {CATEGORY_ORDER.map((slug) => {
          const on = slug === category;
          return (
            <Pressable
              key={slug}
              onPress={() => router.setParams({ category: slug })}
              style={on ? styles.pillActive : styles.pill}
            >
              <Text style={[styles.pillText, on && styles.pillTextOn]}>{CATEGORIES[slug].title}</Text>
            </Pressable>
          );
        })}
      </View>

      {a && b ? (
        <View style={styles.table}>
          <View style={styles.tableHeadRow}>
            <View style={styles.colK} />
            <Text style={styles.colHead}>{headA}</Text>
            <Text style={styles.colHead}>{headB}</Text>
          </View>
          {rows.map(([label, fn], i) => (
            <View key={label} style={[styles.tableRow, i % 2 === 1 && styles.tableRowShade]}>
              <Text style={styles.colK}>{label}</Text>
              <Text style={styles.colVal}>{fn(a)}</Text>
              <Text style={styles.colVal}>{fn(b)}</Text>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.lead}>Not enough ranked agents to compare in this category.</Text>
      )}

      <Note variant="warn">
        Price, availability, reliability and suitability are normalized 0–1 ranking factors from
        artifacts/phase-05 — not live quotes. Only the first-party agent carries a verified on-chain
        metric; third-party entries are labeled by their real provenance.
      </Note>

      <Pressable
        style={styles.ctaGhost}
        onPress={() => router.push({ pathname: "/ranking/[category]", params: { category } })}
      >
        <Text style={styles.ctaGhostText}>How this ranking is computed</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: space.s2
  },
  h1: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: theme.text
  },
  lead: {
    color: theme.textDim,
    fontSize: 14,
    lineHeight: 21
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.s2
  },
  pill: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  pillActive: {
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: "rgba(47, 214, 166, 0.4)",
    backgroundColor: theme.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  pillText: {
    fontSize: 13,
    fontWeight: "600",
    color: theme.textDim
  },
  pillTextOn: {
    color: theme.primary
  },
  table: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.lg,
    overflow: "hidden"
  },
  tableHeadRow: {
    flexDirection: "row",
    backgroundColor: theme.surface2,
    paddingVertical: space.s3,
    paddingHorizontal: space.s3,
    gap: space.s3
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: space.s3,
    paddingHorizontal: space.s3,
    gap: space.s3,
    alignItems: "center"
  },
  tableRowShade: {
    backgroundColor: theme.surface
  },
  colK: {
    flex: 1.3,
    color: theme.textDim,
    fontSize: 13
  },
  colHead: {
    flex: 1,
    color: theme.text,
    fontSize: 13,
    fontWeight: "700"
  },
  colVal: {
    flex: 1,
    color: theme.text,
    fontSize: 13,
    fontWeight: "600"
  },
  ctaGhost: {
    borderWidth: 1,
    borderColor: theme.borderStrong,
    borderRadius: radius.md,
    paddingVertical: 13,
    alignItems: "center"
  },
  ctaGhostText: {
    color: theme.text,
    fontWeight: "700",
    fontSize: 14
  }
});
