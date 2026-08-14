import { CATEGORIES, CATEGORY_ORDER, getFunnel } from "@atelo/core";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Bar, Card, Eyebrow, Note, SectionTitle } from "../../components/ui";
import { Screen } from "../../components/nav";
import { radius, space, theme } from "../../theme";

const REJECTION_LABEL: Record<string, string> = {
  DEAD_DOMAIN: "Dead domain",
  NO_PROTOCOL_DETECTED: "No protocol detected",
  NO_ENDPOINT: "No endpoint",
  PRIVATE_OR_LOCAL_ENDPOINT: "Private / local endpoint",
  TEMPLATE_ENDPOINT: "Template endpoint"
};

export default function DiscoverScreen() {
  const funnel = getFunnel();

  const funnelBars: Array<[string, number, number]> = [
    ["Registered (indexed)", funnel.totalDiscovered, funnel.totalDiscovered],
    ["Examined", funnel.examinedRecords, funnel.totalDiscovered],
    ["Reachable or better", funnel.reachableOrBetter, funnel.examinedRecords],
    ["Test job passed (hireable)", funnel.hireable, funnel.examinedRecords]
  ];

  return (
    <Screen>
      <View style={styles.header}>
        <Eyebrow>Discover</Eyebrow>
        <Text style={styles.h1}>Four first-class categories</Text>
        <Text style={styles.lead}>
          Every agent carries an honest qualification stage. Only agents that pass a real test job
          become hireable.
        </Text>
      </View>

      <View style={styles.section}>
        {CATEGORY_ORDER.map((slug) => {
          const c = CATEGORIES[slug];
          const per = funnel.perCategory[slug];
          return (
            <Link
              key={slug}
              href={{ pathname: "/discover/[category]", params: { category: slug } }}
              asChild
            >
              <Pressable style={styles.catCard}>
                <View style={styles.catHead}>
                  <Text style={styles.catName}>{c.title}</Text>
                  <Text style={styles.chevron}>›</Text>
                </View>
                <Text style={styles.blurb}>{c.blurb}</Text>
                <View style={styles.chips}>
                  <View style={[styles.chip, { backgroundColor: theme.surface3 }]}>
                    <Text style={[styles.chipText, { color: theme.textDim }]}>
                      {per ? per.examined : 0} examined
                    </Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: theme.accentSoft }]}>
                    <Text style={[styles.chipText, { color: theme.accent }]}>
                      {per ? per.reachableOrBetter : 0} reachable+
                    </Text>
                  </View>
                  <View style={[styles.chip, { backgroundColor: theme.primarySoft }]}>
                    <Text style={[styles.chipText, { color: theme.primary }]}>
                      {per ? per.testJobPassed : 0} hireable
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          );
        })}
      </View>

      <Card>
        <SectionTitle title="Qualification funnel" />
        <Text style={styles.mutedSmall}>
          {funnel.totalDiscovered.toLocaleString()} identities discovered on-chain. A registry
          identity is not a callable agent — {funnel.examinedRecords} records were examined in depth.
        </Text>
        <View style={styles.bars}>
          {funnelBars.map(([label, value, denom]) => (
            <Bar
              key={label}
              label={label}
              value={value.toLocaleString()}
              fraction={value / denom}
            />
          ))}
        </View>
        <Note variant="warn">
          The single hireable agent is the Atelo-owned reference agent (first-party). It is never
          counted as third-party marketplace diversity. Third-party agents that were reachable still
          failed later qualification checks.
        </Note>
      </Card>

      <Card>
        <SectionTitle title="Why third-party agents were rejected" />
        <View style={styles.bars}>
          {Object.entries(funnel.byRejectionReason).map(([reason, count]) => (
            <Bar
              key={reason}
              label={REJECTION_LABEL[reason] ?? reason}
              value={String(count)}
              fraction={count / funnel.examinedRecords}
            />
          ))}
        </View>
      </Card>

      <Text style={styles.footerNote}>
        Source: artifacts/phase-01 qualification funnel. BSC testnet.
      </Text>
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
  section: {
    gap: space.s3
  },
  catCard: {
    gap: space.s3,
    padding: space.s4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface
  },
  catHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  catName: {
    fontWeight: "700",
    fontSize: 15,
    color: theme.text
  },
  chevron: {
    color: theme.textFaint,
    fontSize: 20
  },
  blurb: {
    fontSize: 12,
    color: theme.textDim,
    lineHeight: 17
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  bars: {
    gap: space.s3
  },
  mutedSmall: {
    color: theme.textDim,
    fontSize: 13,
    lineHeight: 19
  },
  footerNote: {
    fontSize: 11,
    color: theme.textFaint,
    textAlign: "center"
  }
});
