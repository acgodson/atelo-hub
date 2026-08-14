import { bscScanTx, shortHash, type AgentListItem, type QualStage } from "@atelo/core";
import type { ReactNode } from "react";
import { Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { radius, space, theme } from "../theme";

export function KV({ k, children }: { k: string; children: ReactNode }) {
  return (
    <View style={styles.kvRow}>
      <Text style={styles.kvK}>{k}</Text>
      <View style={styles.kvVWrap}>
        {typeof children === "string" || typeof children === "number" ? (
          <Text style={styles.kvV}>{children}</Text>
        ) : (
          children
        )}
      </View>
    </View>
  );
}

export function TxLink({ hash, label }: { hash: string; label?: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(bscScanTx(hash)).catch(() => undefined)}>
      <Text style={styles.txlink}>{label ?? shortHash(hash)} ↗</Text>
    </Pressable>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const STAGE_STYLE: Record<QualStage, { bg: string; color: string }> = {
  REGISTERED: { bg: theme.surface3, color: theme.textDim },
  REACHABLE: { bg: theme.accentSoft, color: theme.accent },
  PROTOCOL_COMPATIBLE: { bg: theme.violetSoft, color: theme.violet },
  HIREABLE: { bg: theme.primarySoft, color: theme.primary }
};

const STAGE_LABEL: Record<QualStage, string> = {
  REGISTERED: "REGISTERED",
  REACHABLE: "REACHABLE",
  PROTOCOL_COMPATIBLE: "PROTOCOL COMPATIBLE",
  HIREABLE: "HIREABLE"
};

export function StageBadge({ stage }: { stage: QualStage }) {
  const s = STAGE_STYLE[stage];
  return (
    <View style={[styles.badge, { backgroundColor: s.bg }]}>
      <View style={[styles.dot, { backgroundColor: s.color }]} />
      <Text style={[styles.badgeText, { color: s.color }]}>{STAGE_LABEL[stage]}</Text>
    </View>
  );
}

export function BetaBadge() {
  return (
    <View style={styles.betaBadge}>
      <Text style={styles.betaText}>Beta</Text>
    </View>
  );
}

export function FirstPartyBadge() {
  return (
    <View style={[styles.badge, styles.badgeFirst]}>
      <Text style={[styles.badgeText, { color: theme.accent }]}>Atelo-owned (first-party)</Text>
    </View>
  );
}

export function VerifiedBadge({ status }: { status: "VERIFIED" | "UNVERIFIED" }) {
  const verified = status === "VERIFIED";
  return (
    <View style={[styles.badge, { backgroundColor: verified ? theme.primarySoft : theme.warnSoft }]}>
      <Text style={[styles.badgeText, { color: verified ? theme.primary : theme.warn }]}>
        {verified ? "Atelo-verified" : "Unverified"}
      </Text>
    </View>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <Text style={styles.eyebrow}>{children}</Text>;
}

export function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

export function Card({ children, style }: { children: ReactNode; style?: object }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Note({
  children,
  variant
}: {
  children: ReactNode;
  variant?: "warn";
}) {
  return (
    <View style={[styles.note, variant === "warn" && styles.noteWarn]}>
      <Text style={styles.noteText}>{children}</Text>
    </View>
  );
}

export function Bar({
  label,
  value,
  fraction
}: {
  label: string;
  value: string;
  fraction: number;
}) {
  const pct = `${Math.max(3, Math.min(100, fraction * 100))}%` as const;
  return (
    <View style={styles.barRow}>
      <Text style={styles.barLabel} numberOfLines={2}>
        {label}
      </Text>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: pct }]} />
      </View>
      <Text style={styles.barVal}>{value}</Text>
    </View>
  );
}

export function AgentCard({ agent }: { agent: AgentListItem }) {
  const first = agent.firstParty;
  return (
    <View style={[styles.agentCard, first && styles.agentCardFirst]}>
      <View style={styles.agentHead}>
        <View style={styles.agentNameWrap}>
          <Text style={styles.agentName}>{agent.displayName}</Text>
          {first ? null : <Text style={styles.agentId}>#{agent.tokenId}</Text>}
        </View>
        <StageBadge stage={agent.stage} />
      </View>

      {first ? (
        <View style={styles.chips}>
          <FirstPartyBadge />
          <Text style={styles.agentId}>ERC-8004 · agentId {agent.tokenId}</Text>
        </View>
      ) : null}

      {first && agent.verifiedMetric ? (
        <View style={styles.metricLine}>
          {agent.verifiedProvenance === "first-party" ? (
            <>
              <Text style={styles.muted}>Verified metric</Text>
              <Text style={styles.metricStrong}>{agent.verifiedMetric}</Text>
            </>
          ) : (
            <Text style={styles.muted}>{agent.verifiedMetric}</Text>
          )}
        </View>
      ) : (
        <Text style={styles.mutedSmall}>
          {agent.rejected
            ? "Registered, not yet verified — did not pass qualification"
            : "Registered, not yet verified"}
        </Text>
      )}

      {first ? (
        <Text style={styles.faintSmall}>Proof of performance — detailed lineage view coming soon</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  kvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: space.s4,
    alignItems: "flex-start"
  },
  kvK: {
    color: theme.textDim,
    fontSize: 13,
    flexShrink: 0
  },
  kvVWrap: {
    flexShrink: 1,
    alignItems: "flex-end"
  },
  kvV: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "600",
    textAlign: "right"
  },
  txlink: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: "600",
    fontFamily: "monospace"
  },
  divider: {
    height: 1,
    backgroundColor: theme.border,
    marginVertical: space.s1
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignSelf: "flex-start"
  },
  badgeFirst: {
    backgroundColor: theme.accentSoft,
    borderWidth: 1,
    borderColor: "rgba(91, 156, 255, 0.4)"
  },
  betaBadge: {
    backgroundColor: theme.violetSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 8,
    paddingVertical: 3
  },
  betaText: {
    color: theme.violet,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.3
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700"
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
    color: theme.primary,
    textTransform: "uppercase"
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "700",
    color: theme.text
  },
  card: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.lg,
    padding: space.s5,
    gap: space.s3
  },
  note: {
    borderLeftWidth: 3,
    borderLeftColor: theme.borderStrong,
    paddingVertical: space.s2,
    paddingLeft: space.s4
  },
  noteWarn: {
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
  barRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s3
  },
  barLabel: {
    width: 108,
    color: theme.textDim,
    fontSize: 12
  },
  barTrack: {
    flex: 1,
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: theme.surface3,
    overflow: "hidden"
  },
  barFill: {
    height: "100%",
    borderRadius: radius.pill,
    backgroundColor: theme.primary
  },
  barVal: {
    width: 44,
    textAlign: "right",
    color: theme.text,
    fontWeight: "600",
    fontSize: 12
  },
  agentCard: {
    gap: space.s3,
    padding: space.s4,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.surface
  },
  agentCardFirst: {
    borderColor: "rgba(47, 214, 166, 0.45)",
    backgroundColor: "rgba(47, 214, 166, 0.06)"
  },
  agentHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: space.s3
  },
  agentNameWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s2,
    flexShrink: 1,
    flexWrap: "wrap"
  },
  agentName: {
    fontWeight: "700",
    fontSize: 15,
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
  metricLine: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: space.s2
  },
  metricStrong: {
    color: theme.primary,
    fontWeight: "700",
    fontSize: 15
  },
  muted: {
    color: theme.textDim,
    fontSize: 13
  },
  mutedSmall: {
    color: theme.textDim,
    fontSize: 13
  },
  faintSmall: {
    color: theme.textFaint,
    fontSize: 12
  }
});
