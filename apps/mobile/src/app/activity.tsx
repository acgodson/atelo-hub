import { CATEGORIES, getAllJobs, type Category, type JobView } from "@atelo/core";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/nav";
import { Card, Eyebrow, TxLink } from "../components/ui";
import { radius, space, theme } from "../theme";

const STEP_LABEL: Record<string, string> = {
  create_job: "Job created",
  register_job: "Job registered",
  set_budget: "Budget set",
  fund: "Job funded",
  submit: "Deliverable submitted",
  settle: "Settled"
};

function ledgerEntries(job: JobView) {
  const entries = job.transactions.map((t) => ({
    label: STEP_LABEL[t.step] ?? t.step,
    hash: t.hash,
    block: t.blockNumber,
    ok: t.status === 1
  }));
  if (job.signedActionTx) {
    entries.push({
      label: "Protocol action signed",
      hash: job.signedActionTx.hash,
      block: Number.MAX_SAFE_INTEGER,
      ok: true
    });
  }
  return entries.sort((a, b) => a.block - b.block);
}

export default function ActivityScreen() {
  const jobs = getAllJobs();

  return (
    <Screen>
      <View style={styles.header}>
        <Eyebrow>Activity</Eyebrow>
        <Text style={styles.h1}>On-chain ledger</Text>
        <Text style={styles.lead}>
          Every step of each job is a real BSC testnet transaction. Tap any hash to verify it on BscScan.
        </Text>
        <Link href="/notifications" asChild>
          <Pressable style={styles.reachLink} accessibilityRole="button">
            <Text style={styles.reachLinkText}>Notifications & Reach ›</Text>
          </Pressable>
        </Link>
      </View>

      {jobs.map((job) => {
        const meta = CATEGORIES[job.category as Category];
        const entries = ledgerEntries(job);
        return (
          <Card key={job.jobId}>
            <View style={styles.head}>
              <Text style={styles.title}>
                {meta.title} · job #{job.jobId}
              </Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{job.finalStatus}</Text>
              </View>
            </View>
            <View style={styles.steps}>
              {entries.map((e, i) => (
                <View style={styles.step} key={e.hash}>
                  <View style={styles.rail}>
                    <View style={[styles.node, !e.ok && styles.nodeFail]}>
                      <Text style={styles.nodeText}>{e.ok ? "✓" : "!"}</Text>
                    </View>
                    {i < entries.length - 1 ? <View style={styles.line} /> : null}
                  </View>
                  <View style={styles.stepBody}>
                    <Text style={styles.stepName}>{e.label}</Text>
                    <TxLink hash={e.hash} />
                  </View>
                </View>
              ))}
            </View>
          </Card>
        );
      })}

      <Text style={styles.footerNote}>
        Source: artifacts/phase-03 activity ledgers. Lifecycle stages: task → ranked → negotiated → funded
        → result → validated → signed → settled → recorded.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: space.s2
  },
  reachLink: {
    alignSelf: "flex-start",
    marginTop: space.s2,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: theme.surface
  },
  reachLinkText: {
    color: theme.primary,
    fontWeight: "700",
    fontSize: 13
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
  head: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.s3
  },
  title: {
    fontWeight: "700",
    fontSize: 15,
    color: theme.text,
    flexShrink: 1
  },
  statusBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: theme.primarySoft
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    color: theme.primary
  },
  steps: {
    gap: 0
  },
  step: {
    flexDirection: "row",
    gap: space.s3
  },
  rail: {
    alignItems: "center",
    width: 24
  },
  node: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  nodeFail: {
    backgroundColor: theme.dangerSoft
  },
  nodeText: {
    color: theme.primary,
    fontWeight: "800",
    fontSize: 12
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: theme.border,
    minHeight: 14
  },
  stepBody: {
    flex: 1,
    paddingBottom: space.s4,
    gap: 2
  },
  stepName: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "600"
  },
  footerNote: {
    color: theme.textFaint,
    fontSize: 11,
    lineHeight: 16
  }
});
