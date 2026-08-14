import {
  CATEGORIES,
  getRanking,
  isCategory,
  type Category,
  type RankingEntry
} from "@atelo/core";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../../components/nav";
import { Bar, Card, Eyebrow, Note, SectionTitle } from "../../components/ui";
import { radius, space, theme } from "../../theme";

function ProvChip({ entry }: { entry: RankingEntry }) {
  if (entry.firstPartyFallback) {
    return (
      <View style={[styles.chip, { backgroundColor: theme.accentSoft }]}>
        <Text style={[styles.chipText, { color: theme.accent }]}>first-party</Text>
      </View>
    );
  }
  if (entry.provenance === "third-party") {
    return (
      <View style={[styles.chip, { backgroundColor: theme.primarySoft }]}>
        <Text style={[styles.chipText, { color: theme.primary }]}>third-party verified</Text>
      </View>
    );
  }
  return (
    <View style={[styles.chip, { backgroundColor: theme.warnSoft }]}>
      <Text style={[styles.chipText, { color: theme.warn }]}>unverified</Text>
    </View>
  );
}

export default function RankingScreen() {
  const params = useLocalSearchParams<{ category: string }>();
  const router = useRouter();

  if (!params.category || !isCategory(params.category)) {
    return (
      <Screen back={{ label: "Discover" }}>
        <Text style={styles.h1}>Unknown category</Text>
      </Screen>
    );
  }

  const category: Category = params.category;
  const meta = CATEGORIES[category];
  const ranking = getRanking(category);

  return (
    <Screen back={{ label: meta.title }}>
      <View style={styles.header}>
        <Eyebrow>Ranking</Eyebrow>
        <Text style={styles.h1}>{meta.title} ranking</Text>
        <Text style={styles.lead}>
          Explainable, query-time ranking. Every score shows its factors and window.
        </Text>
      </View>

      <Card>
        <View style={styles.statRow}>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{ranking.window.label}</Text>
            <Text style={styles.statLabel}>window</Text>
          </View>
          <View style={styles.stat}>
            <Text style={styles.statValue}>{ranking.sampleCountTotal}</Text>
            <Text style={styles.statLabel}>verified samples</Text>
          </View>
          <View style={styles.stat}>
            <Text style={[styles.statValue, { fontSize: 14 }]}>{ranking.scoreVersion}</Text>
            <Text style={styles.statLabel}>score version</Text>
          </View>
        </View>
        <View style={styles.kv}>
          <View style={styles.kvRow}>
            <Text style={styles.kvK}>Ranked at block</Text>
            <Text style={styles.kvVMono}>{ranking.rankedAtBlock}</Text>
          </View>
          <View style={styles.kvRow}>
            <Text style={styles.kvK}>Cutoff block</Text>
            <Text style={styles.kvVMono}>{ranking.window.cutoffBlock}</Text>
          </View>
        </View>
      </Card>

      <SectionTitle title="Ranked agents" />
      {ranking.ranked.map((entry, i) => (
        <Card key={entry.agentKey}>
          <View style={styles.rankHead}>
            <View style={styles.rankNameWrap}>
              <View style={styles.rankNum}>
                <Text style={styles.rankNumText}>{i + 1}</Text>
              </View>
              <Text style={styles.rankName}>
                {entry.firstPartyFallback ? "Atelo Reference Agent" : entry.label}
              </Text>
            </View>
            <Text style={styles.rankScore}>{entry.score.toFixed(2)}</Text>
          </View>
          <View style={styles.chips}>
            <ProvChip entry={entry} />
            {entry.insufficientHistory ? (
              <View style={[styles.chip, { backgroundColor: theme.warnSoft }]}>
                <Text style={[styles.chipText, { color: theme.warn }]}>insufficient history</Text>
              </View>
            ) : null}
            <Text style={styles.sampleText}>{entry.sampleCount} verified sample(s)</Text>
          </View>
          <View style={styles.bars}>
            {entry.factors.map((f) => (
              <Bar
                key={f.key}
                label={f.key.replace(/([A-Z])/g, " $1")}
                value={f.value.toFixed(2)}
                fraction={f.value}
              />
            ))}
          </View>
          <View style={styles.factorList}>
            {entry.materialFactors.map((m) => (
              <Text key={m} style={styles.factor}>
                • {m}
              </Text>
            ))}
          </View>
        </Card>
      ))}

      {ranking.ranked.some((e) => e.insufficientHistory) ? (
        <Note variant="warn">{ranking.insufficientHistoryWarning}</Note>
      ) : null}

      <Pressable
        style={styles.ctaGhost}
        onPress={() => router.push({ pathname: "/compare", params: { category } })}
      >
        <Text style={styles.ctaGhostText}>Compare top agents</Text>
      </Pressable>

      <Text style={styles.footerNote}>Source: artifacts/phase-05 rankings. BSC testnet.</Text>
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
  statRow: {
    flexDirection: "row",
    gap: space.s3
  },
  stat: {
    flex: 1,
    gap: 2
  },
  statValue: {
    color: theme.text,
    fontWeight: "800",
    fontSize: 17
  },
  statLabel: {
    color: theme.textFaint,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4
  },
  kv: {
    gap: space.s2,
    marginTop: space.s3
  },
  kvRow: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  kvK: {
    color: theme.textDim,
    fontSize: 13
  },
  kvVMono: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "monospace"
  },
  rankHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.s3
  },
  rankNameWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s2,
    flexShrink: 1
  },
  rankNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  rankNumText: {
    color: theme.primary,
    fontWeight: "800",
    fontSize: 12
  },
  rankName: {
    color: theme.text,
    fontWeight: "700",
    fontSize: 14,
    flexShrink: 1
  },
  rankScore: {
    color: theme.primary,
    fontWeight: "800",
    fontSize: 16
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.s2
  },
  chip: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  chipText: {
    fontSize: 11,
    fontWeight: "700"
  },
  sampleText: {
    color: theme.textFaint,
    fontSize: 12,
    fontFamily: "monospace"
  },
  bars: {
    gap: space.s2
  },
  factorList: {
    gap: 3
  },
  factor: {
    color: theme.textDim,
    fontSize: 12.5,
    lineHeight: 17
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
  },
  footerNote: {
    color: theme.textFaint,
    fontSize: 11,
    lineHeight: 16
  }
});
