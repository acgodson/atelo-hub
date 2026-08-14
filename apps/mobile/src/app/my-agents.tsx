import { CATEGORIES, getAllJobs, type Category } from "@atelo/core";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/nav";
import { Eyebrow, FirstPartyBadge, KV, Note, TxLink } from "../components/ui";
import { radius, space, theme } from "../theme";

export default function MyAgentsScreen() {
  const router = useRouter();
  const jobs = getAllJobs();

  return (
    <Screen>
      <View style={styles.header}>
        <Eyebrow>My Agents</Eyebrow>
        <Text style={styles.h1}>Hired relationships</Text>
        <Text style={styles.lead}>
          Four settled ERC-8183 jobs with the Atelo reference agent — one per category. Each is a real
          on-chain lifecycle you can inspect.
        </Text>
      </View>

      {jobs.map((job) => {
        const meta = CATEGORIES[job.category as Category];
        return (
          <View key={job.jobId} style={styles.card}>
            <View style={styles.head}>
              <View style={styles.nameWrap}>
                <Text style={styles.title}>{meta.title}</Text>
                <Text style={styles.jobId}>job #{job.jobId}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{job.finalStatus}</Text>
              </View>
            </View>
            <View style={styles.chips}>
              <FirstPartyBadge />
              <Text style={styles.jobId}>agentId {job.agentId}</Text>
            </View>
            <View style={styles.kv}>
              <KV k="Counterparty">Atelo Reference Agent</KV>
              <KV k="Settled">{job.settled ? "Yes" : "No"}</KV>
              {job.signedActionTx ? (
                <KV k="Signed action">
                  <TxLink hash={job.signedActionTx.hash} />
                </KV>
              ) : null}
            </View>
            <View style={styles.actions}>
              <Pressable
                style={styles.ctaGhostHalf}
                onPress={() => router.push({ pathname: "/agent/[id]", params: { id: String(job.agentId) } })}
              >
                <Text style={styles.ctaGhostText}>Proof</Text>
              </Pressable>
              <Pressable style={styles.ctaGhostHalf} onPress={() => router.push("/activity")}>
                <Text style={styles.ctaGhostText}>Activity</Text>
              </Pressable>
            </View>
          </View>
        );
      })}

      <Note variant="warn">
        These jobs were settled by Atelo against its own first-party reference agent to prove the full
        lifecycle end-to-end. Wallet-connected hiring of any agent arrives in the next pass.
      </Note>

      <Text style={styles.footerNote}>Source: artifacts/phase-03 settled lifecycles. BSC testnet.</Text>
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
  card: {
    gap: space.s3,
    padding: space.s4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: "rgba(47, 214, 166, 0.45)",
    backgroundColor: "rgba(47, 214, 166, 0.06)"
  },
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.s3
  },
  nameWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s2,
    flexShrink: 1,
    flexWrap: "wrap"
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    color: theme.text
  },
  jobId: {
    fontSize: 12,
    color: theme.textFaint,
    fontFamily: "monospace"
  },
  statusBadge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.primarySoft
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.primary
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: space.s2
  },
  kv: {
    gap: space.s2
  },
  actions: {
    flexDirection: "row",
    gap: space.s3
  },
  ctaGhostHalf: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    borderRadius: radius.md,
    paddingVertical: 11,
    alignItems: "center"
  },
  ctaGhostText: {
    color: theme.text,
    fontWeight: "700",
    fontSize: 13
  },
  footerNote: {
    color: theme.textFaint,
    fontSize: 11,
    lineHeight: 16
  }
});
