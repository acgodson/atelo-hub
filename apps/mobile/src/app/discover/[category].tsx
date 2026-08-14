import {
  CATEGORIES,
  CATEGORY_ORDER,
  getAgentsByCategory,
  getHireTerms,
  getLineage,
  getRanking,
  isCategory,
  type Category,
  type RankingEntry
} from "@atelo/core";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { AgentCard, Card, Eyebrow, Note, SectionTitle } from "../../components/ui";
import { HireCta } from "../../components/HireCta";
import { Screen } from "../../components/nav";
import { radius, space, theme } from "../../theme";

function ProvenanceBadge({ entry }: { entry: RankingEntry }) {
  const map = {
    "first-party": { label: "First-party reference", bg: theme.accentSoft, color: theme.accent },
    "third-party": { label: "Third-party verified", bg: theme.primarySoft, color: theme.primary },
    none: { label: "UNVERIFIED metric", bg: theme.warnSoft, color: theme.warn }
  } as const;
  const s = map[entry.provenance];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <Text style={[styles.badgeText, { color: s.color }]}>{s.label}</Text>
    </View>
  );
}

export default function CategoryScreen() {
  const params = useLocalSearchParams<{ category: string }>();
  const router = useRouter();
  const category = params.category;

  if (!category || !isCategory(category)) {
    return (
      <Screen back={{ label: "Discover" }}>
        <Text style={styles.h1}>Unknown category</Text>
        <Text style={styles.lead}>“{String(category)}” is not one of the four categories.</Text>
      </Screen>
    );
  }

  const cat: Category = category;
  const meta = CATEGORIES[cat];
  const agents = getAgentsByCategory(cat);
  const lineage = getLineage(cat);
  const hire = getHireTerms(cat);
  const ranking = getRanking(cat);
  const firstParty = agents.filter((a) => a.firstParty);
  const thirdParty = agents.filter((a) => !a.firstParty);

  return (
    <Screen back={{ label: "Discover" }}>
      <View style={styles.header}>
        <Eyebrow>{meta.title}</Eyebrow>
        <Text style={styles.h1}>{meta.title} agents</Text>
        <Text style={styles.lead}>{meta.blurb}</Text>
      </View>

      <View style={styles.pillRow}>
        {CATEGORY_ORDER.map((slug) => {
          const on = slug === cat;
          return (
            <Pressable
              key={slug}
              onPress={() =>
                router.push({ pathname: "/discover/[category]", params: { category: slug } })
              }
              style={on ? styles.pillActive : styles.pill}
            >
              <Text style={[styles.pillText, on && styles.pillTextOn]}>
                {CATEGORIES[slug].title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Card>
        <SectionTitle title="Hire the reference agent" />
        <Text style={styles.mutedSmall}>
          Activate the Atelo-owned reference agent for a real ERC-8183 job (#{hire.jobId}): propose →
          simulate → sign → settle. A wallet is requested only for fund/sign — everything above stays
          wallet-free.
        </Text>
        <View style={styles.kv}>
          <Text style={styles.kvK}>Objective</Text>
          <Text style={styles.kvV}>{hire.objective}</Text>
        </View>
        <View style={styles.kv}>
          <Text style={styles.kvK}>Protocol</Text>
          <Text style={styles.kvV}>{hire.protocol}</Text>
        </View>
        <View style={styles.kv}>
          <Text style={styles.kvK}>Price</Text>
          <Text style={styles.kvV}>
            {hire.priceRaw} {hire.currency}
          </Text>
        </View>
        <HireCta terms={hire} />
      </Card>

      <View style={styles.section}>
        <SectionTitle title="Hireable" />
        {firstParty.length ? (
          firstParty.map((a) => <AgentCard key={a.agentKey} agent={a} />)
        ) : (
          <Text style={styles.mutedSmall}>No hireable agents in this category yet.</Text>
        )}
        <Note>
          Verified metric ({meta.metricLabel}):{" "}
          {lineage.status === "VERIFIED"
            ? `${String(lineage.metricValue)}${lineage.metricUnit ? " " + lineage.metricUnit : ""} — Atelo-verified from job ${lineage.jobId}.`
            : `UNVERIFIED — ${meta.metricLabel} is not measurable on testnet for this job; shown honestly, not as a passing figure.`}
        </Note>
      </View>

      <View style={styles.section}>
        <SectionTitle title={`Registered, not yet verified (${thirdParty.length})`} />
        <Text style={styles.mutedSmall}>
          Third-party {meta.title.toLowerCase()} identities discovered on-chain. None has passed a
          real test job, so none is hireable.
        </Text>
        {thirdParty.map((a) => (
          <AgentCard key={a.agentKey} agent={a} />
        ))}
      </View>

      <Card>
        <SectionTitle title="Explainable ranking" />
        <Text style={styles.mutedSmall}>
          Score version {ranking.scoreVersion} · window {ranking.window.label} · {ranking.sampleCountTotal}{" "}
          verified sample(s) total.
        </Text>
        {ranking.ranked.map((entry, i) => (
          <View key={entry.agentKey} style={styles.rankRow}>
            <View style={styles.rankHead}>
              <View style={styles.rankNameWrap}>
                <Text style={styles.rankIndex}>{i + 1}.</Text>
                <Text style={styles.rankLabel}>{entry.label}</Text>
              </View>
              <Text style={styles.rankScore}>{entry.score.toFixed(2)}</Text>
            </View>
            <View style={styles.chips}>
              <ProvenanceBadge entry={entry} />
              {entry.firstPartyFallback ? (
                <View style={[styles.badge, { backgroundColor: theme.accentSoft }]}>
                  <Text style={[styles.badgeText, { color: theme.accent }]}>first-party fallback</Text>
                </View>
              ) : null}
              {entry.insufficientHistory ? (
                <View style={[styles.badge, { backgroundColor: theme.warnSoft }]}>
                  <Text style={[styles.badgeText, { color: theme.warn }]}>insufficient history</Text>
                </View>
              ) : null}
            </View>
            {entry.materialFactors.map((factor) => (
              <Text key={factor} style={styles.factor}>
                • {factor}
              </Text>
            ))}
          </View>
        ))}
        <Note variant="warn">{ranking.insufficientHistoryWarning}</Note>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: space.s2
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
  section: {
    gap: space.s3
  },
  kv: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: space.s4
  },
  kvK: {
    color: theme.textDim,
    fontSize: 13,
    flexShrink: 0
  },
  kvV: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right",
    flexShrink: 1
  },
  mutedSmall: {
    color: theme.textDim,
    fontSize: 13,
    lineHeight: 19
  },
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start"
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: space.s2
  },
  rankRow: {
    gap: space.s2,
    paddingTop: space.s3,
    borderTopWidth: 1,
    borderTopColor: theme.border
  },
  rankHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.s3
  },
  rankNameWrap: {
    flexDirection: "row",
    gap: space.s2,
    flexShrink: 1
  },
  rankIndex: {
    color: theme.textFaint,
    fontWeight: "700",
    fontSize: 14
  },
  rankLabel: {
    color: theme.text,
    fontWeight: "700",
    fontSize: 14,
    flexShrink: 1
  },
  rankScore: {
    color: theme.primary,
    fontWeight: "800",
    fontSize: 15
  },
  factor: {
    color: theme.textDim,
    fontSize: 12,
    lineHeight: 17
  }
});
