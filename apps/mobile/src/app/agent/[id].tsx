import {
  CATEGORIES,
  CATEGORY_ORDER,
  REFERENCE_AGENT,
  getGreenfieldByUri,
  getHireTerms,
  getJob,
  getLineage,
  getReferenceAgentSummary,
  shortHash,
  type Category
} from "@atelo/core";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { HireCta } from "../../components/HireCta";
import { Screen } from "../../components/nav";
import { Card, Divider, FirstPartyBadge, KV, SectionTitle, TxLink, VerifiedBadge } from "../../components/ui";
import { radius, space, theme } from "../../theme";

function ProofCard({ category }: { category: Category }) {
  const meta = CATEGORIES[category];
  const lineage = getLineage(category);
  const job = getJob(category);
  const gnfd = getGreenfieldByUri(lineage.evidenceUri);
  const selfClaimKeys = Object.keys(lineage.selfClaims);
  const settleTx = job.transactions.find((t) => t.step === "settle");

  return (
    <Card>
      <View style={styles.head}>
        <Text style={styles.h3}>{meta.title}</Text>
        <VerifiedBadge status={lineage.status} />
      </View>

      <View style={styles.metricLine}>
        <Text style={styles.muted}>{lineage.metric}</Text>
        <Text style={styles.metricStrong}>
          {String(lineage.metricValue)}
          {lineage.metricUnit ? ` ${lineage.metricUnit}` : ""}
        </Text>
      </View>
      <Text style={styles.monoFaint}>{lineage.metricFormula}</Text>

      <Divider />

      <View style={styles.kv}>
        <KV k="ERC-8183 job">{`#${job.jobId} · ${job.finalStatus}`}</KV>
        <KV k="Settle tx">
          {job.settledAtBlock && settleTx ? <TxLink hash={settleTx.hash} label="settle" /> : "—"}
        </KV>
        <KV k="Signed action">
          {job.signedActionTx ? <TxLink hash={job.signedActionTx.hash} /> : "—"}
        </KV>
        <KV k="Block window">{`${lineage.startBlock} → ${lineage.endBlock}`}</KV>
        <KV k="Score version">
          <Text style={styles.mono}>{lineage.scoreVersion}</Text>
        </KV>
      </View>

      <Divider />

      <View style={styles.list}>
        <Text style={styles.eyebrowDim}>Greenfield evidence</Text>
        <Text style={styles.monoFaintBreak}>{lineage.evidenceUri}</Text>
        <View style={styles.kv}>
          <KV k="Content hash">
            <Text style={styles.mono}>{shortHash(lineage.evidenceContentHash, 14, 8)}</Text>
          </KV>
          <KV k="Record hash">
            <Text style={styles.mono}>{shortHash(lineage.recordHash, 14, 8)}</Text>
          </KV>
          {gnfd ? (
            <KV k="Download verified">
              {gnfd.downloadVerified ? "Yes — byte hash matches" : "No"}
            </KV>
          ) : null}
        </View>
      </View>

      {selfClaimKeys.length ? (
        <View style={styles.selfClaim}>
          <Text style={styles.selfClaimTitle}>Agent self-claims (not verified)</Text>
          <View style={[styles.kv, { marginTop: space.s2 }]}>
            {selfClaimKeys.map((k) => (
              <KV key={k} k={k}>
                {String(lineage.selfClaims[k])}
              </KV>
            ))}
          </View>
        </View>
      ) : null}
    </Card>
  );
}

export default function AgentDetailScreen() {
  const params = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  if (params.id !== REFERENCE_AGENT.tokenId) {
    return (
      <Screen back={{ label: "Discover" }}>
        <Text style={styles.h1}>Agent not found</Text>
        <Text style={styles.muted}>
          Only the Atelo reference agent (#{REFERENCE_AGENT.tokenId}) has a proof-of-performance record.
        </Text>
      </Screen>
    );
  }

  const agent = getReferenceAgentSummary();
  const hireTerms = getHireTerms("grid");

  return (
    <Screen back={{ label: "Discover" }}>
      <Card>
        <View style={styles.head}>
          <View style={styles.nameWrap}>
            <Text style={styles.h1}>{REFERENCE_AGENT.name}</Text>
            <Text style={styles.agentId}>
              ERC-8004 · agentId {REFERENCE_AGENT.erc8004AgentId}
            </Text>
          </View>
        </View>
        <View style={styles.chips}>
          <FirstPartyBadge />
          <View style={styles.hireableBadge}>
            <Text style={styles.hireableText}>HIREABLE</Text>
          </View>
        </View>
        <View style={styles.kv}>
          <KV k="Identity">
            <Text style={styles.mono}>{agent.agentKey}</Text>
          </KV>
          <KV k="Chain">{`BSC testnet (chainId ${REFERENCE_AGENT.chainId})`}</KV>
          <KV k="Owner">Atelo Hub</KV>
          <KV k="Categories">
            {CATEGORY_ORDER.map((c) => CATEGORIES[c].title).join(" · ")}
          </KV>
        </View>
        <View style={styles.noteWarn}>
          <Text style={styles.noteText}>{REFERENCE_AGENT.firstPartyNote}</Text>
        </View>
        <HireCta terms={hireTerms} />
      </Card>

      <SectionTitle title="Proof of performance" />
      <Text style={styles.lead}>
        Each metric below is computed by Atelo from a settled on-chain job and stored as reproducible
        lineage. Agent self-claims are shown separately and never counted as verified.
      </Text>

      {CATEGORY_ORDER.map((c) => (
        <ProofCard key={c} category={c} />
      ))}

      <View style={styles.callout}>
        <Text style={styles.calloutTitle}>Reproduce this metric</Text>
        <Text style={styles.muted}>
          Every record pins the on-chain inputs (amounts, ticks, blocks), the metric formula, and a
          content-addressed Greenfield object. Re-run the formula against the recorded inputs and the
          downloaded evidence bytes — the SHA-256 must match the content hash above. Nothing here is
          self-reported.
        </Text>
      </View>

      <Pressable style={styles.ctaGhost} onPress={() => router.push("/my-agents")}>
        <Text style={styles.ctaGhostText}>See this agent in My Agents</Text>
      </Pressable>

      <Text style={styles.footerNote}>
        Source: artifacts/phase-03 (jobs), phase-04 (lineage + Greenfield). BSC testnet.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.s3
  },
  nameWrap: {
    flexShrink: 1,
    gap: 2
  },
  h1: {
    fontSize: 24,
    lineHeight: 28,
    fontWeight: "800",
    color: theme.text
  },
  h3: {
    fontSize: 17,
    fontWeight: "700",
    color: theme.text
  },
  agentId: {
    fontSize: 12,
    color: theme.textFaint,
    fontFamily: "monospace"
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.s2
  },
  hireableBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.primarySoft
  },
  hireableText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.primary
  },
  kv: {
    gap: space.s2
  },
  list: {
    gap: space.s2
  },
  metricLine: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
    gap: space.s3
  },
  muted: {
    color: theme.textDim,
    fontSize: 13,
    lineHeight: 19
  },
  lead: {
    color: theme.textDim,
    fontSize: 13,
    lineHeight: 19,
    marginTop: -space.s2
  },
  metricStrong: {
    color: theme.primary,
    fontWeight: "800",
    fontSize: 16
  },
  mono: {
    color: theme.text,
    fontSize: 12.5,
    fontWeight: "600",
    fontFamily: "monospace",
    textAlign: "right"
  },
  monoFaint: {
    color: theme.textFaint,
    fontSize: 12,
    fontFamily: "monospace",
    lineHeight: 17
  },
  monoFaintBreak: {
    color: theme.textFaint,
    fontSize: 11.5,
    fontFamily: "monospace",
    lineHeight: 16
  },
  eyebrowDim: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: theme.textDim,
    textTransform: "uppercase"
  },
  selfClaim: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.md,
    padding: space.s3,
    backgroundColor: theme.surface2
  },
  selfClaimTitle: {
    color: theme.warn,
    fontWeight: "700",
    fontSize: 13
  },
  noteWarn: {
    borderLeftWidth: 3,
    borderLeftColor: theme.warn,
    backgroundColor: theme.warnSoft,
    borderTopRightRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
    padding: space.s3,
    paddingLeft: space.s4
  },
  noteText: {
    color: theme.textDim,
    fontSize: 12.5,
    lineHeight: 18
  },
  callout: {
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.lg,
    padding: space.s4,
    backgroundColor: theme.surface2,
    gap: space.s2
  },
  calloutTitle: {
    color: theme.text,
    fontWeight: "700",
    fontSize: 15
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
