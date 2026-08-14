import { CATEGORIES, type Category } from "@atelo/core";
import { useWallet, useConnectModal } from "@atelo/web3";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { Screen } from "../components/nav";
import { Card, Eyebrow, Note } from "../components/ui";
import { radius, space, theme } from "../theme";
import { enablePush, getPushState } from "../reach/registerPush";
import type { PushState } from "../reach/registerPush.types";
import { reachInboxEvents } from "../reach/events";
import { requestTelegramLink, type TelegramLink } from "../reach/linkTelegram";

function ConnectTelegram() {
  const { address, isConnected } = useWallet();
  const { open } = useConnectModal();
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState<TelegramLink | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onLink = useCallback(async () => {
    if (!address) return;
    setBusy(true);
    setError(null);
    try {
      setLink(await requestTelegramLink(address));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not reach the Atelo Reach service.");
    } finally {
      setBusy(false);
    }
  }, [address]);

  return (
    <Card>
      <Text style={styles.sectionTitle}>Connect Telegram</Text>
      <Text style={styles.tgLead}>
        Link this wallet to a Telegram chat to check /status and /activity and to /pause your agents. Linking is
        read/notify scope only — it never authorizes a transfer, destination, or signature.
      </Text>

      {!isConnected ? (
        <>
          <View style={styles.tgHint}>
            <Text style={styles.tgHintText}>Connect your wallet first — a link is scoped to one wallet.</Text>
          </View>
          <Pressable style={styles.cta} onPress={open} accessibilityRole="button">
            <Text style={styles.ctaText}>Connect wallet</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Pressable
            style={[styles.cta, busy && styles.ctaBusy]}
            onPress={onLink}
            disabled={busy}
            accessibilityRole="button"
          >
            {busy ? (
              <ActivityIndicator color={theme.primaryContrast} />
            ) : (
              <Text style={styles.ctaText}>{link ? "Refresh link code" : "Link Telegram to this wallet"}</Text>
            )}
          </Pressable>

          {link ? (
            <View style={styles.tgResult}>
              <Pressable
                style={styles.tgOpen}
                onPress={() => Linking.openURL(link.deepLink).catch(() => undefined)}
                accessibilityRole="button"
              >
                <Text style={styles.tgOpenText}>Open @{link.botUsername}</Text>
              </Pressable>
              <Text style={styles.tgCodeLabel}>Or send this to the bot:</Text>
              <Text selectable style={styles.tgCode}>{`/start ${link.code}`}</Text>
              <Note>The code is one-time and expires in 15 minutes.</Note>
            </View>
          ) : null}
          {error ? <Text style={styles.msg}>{error}</Text> : null}
        </>
      )}
    </Card>
  );
}

function stateLabel(state: PushState | null): { label: string; tone: "on" | "off" | "wait" } {
  if (!state) return { label: "Checking…", tone: "wait" };
  if (!state.supported) return { label: "Not available on this device", tone: "off" };
  if (state.subscribed && state.permission === "granted")
    return { label: "Notifications enabled", tone: "on" };
  if (state.permission === "denied") return { label: "Blocked in browser settings", tone: "off" };
  return { label: "Not enabled", tone: "off" };
}

export default function NotificationsScreen() {
  const [state, setState] = useState<PushState | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const events = reachInboxEvents();

  const refresh = useCallback(() => {
    getPushState()
      .then(setState)
      .catch(() => setState({ supported: false, permission: "unsupported", subscribed: false }));
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const onEnable = useCallback(async () => {
    setBusy(true);
    setMessage(null);
    const result = await enablePush();
    setBusy(false);
    setMessage(result.ok ? "Web push subscription active on this browser." : result.reason ?? "Could not enable.");
    refresh();
  }, [refresh]);

  const status = stateLabel(state);
  const enabled = status.tone === "on";
  const canEnable = (state?.supported ?? false) && !enabled && state?.permission !== "denied";

  return (
    <Screen>
      <View style={styles.header}>
        <Eyebrow>Atelo Reach</Eyebrow>
        <Text style={styles.h1}>Notifications</Text>
        <Text style={styles.lead}>
          Get a web push when a job settles or a deliverable is ready. Notifications are read-only — no wallet
          or signature is involved.
        </Text>
      </View>

      <Card>
        <View style={styles.statusRow}>
          <View style={[styles.dot, enabled ? styles.dotOn : styles.dotOff]} />
          <Text style={styles.statusText}>{status.label}</Text>
        </View>
        {canEnable ? (
          <Pressable
            style={[styles.cta, busy && styles.ctaBusy]}
            onPress={onEnable}
            disabled={busy}
            accessibilityRole="button"
          >
            {busy ? (
              <ActivityIndicator color={theme.primaryContrast} />
            ) : (
              <Text style={styles.ctaText}>Enable notifications</Text>
            )}
          </Pressable>
        ) : null}
        {enabled ? (
          <View style={styles.enabledPill}>
            <Text style={styles.enabledPillText}>✓ Subscribed to Atelo Reach push</Text>
          </View>
        ) : null}
        {message ? <Text style={styles.msg}>{message}</Text> : null}
        {state && !state.supported ? (
          <Note>
            Native push arrives with the custom dev build (expo-notifications + APNs/FCM). Open the web app to
            enable notifications today.
          </Note>
        ) : null}
      </Card>

      <ConnectTelegram />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Reach activity</Text>
        {events.length === 0 ? (
          <Card>
            <Text style={styles.empty}>No notifications yet. Settled jobs and deliverables will appear here.</Text>
          </Card>
        ) : (
          events.map((e) => {
            const meta = CATEGORIES[e.category as Category];
            return (
              <Card key={e.eventId}>
                <View style={styles.eventHead}>
                  <Text style={styles.eventTitle}>{e.title}</Text>
                  <View style={styles.kindBadge}>
                    <Text style={styles.kindText}>{meta?.short ?? e.category}</Text>
                  </View>
                </View>
                <Text style={styles.eventBody}>{e.body}</Text>
              </Card>
            );
          })
        )}
      </View>

      <Text style={styles.footerNote}>
        Source: real settled jobs from the Atelo backend (artifacts/phase-03). Delivery is idempotent per event
        id — the same event is never shown or pushed twice.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.s2 },
  h1: { fontSize: 24, lineHeight: 28, fontWeight: "800", color: theme.text },
  lead: { color: theme.textDim, fontSize: 14, lineHeight: 21 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: space.s3 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  dotOn: { backgroundColor: theme.primary },
  dotOff: { backgroundColor: theme.textFaint },
  statusText: { color: theme.text, fontSize: 15, fontWeight: "600" },
  cta: {
    backgroundColor: theme.primary,
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  ctaBusy: { opacity: 0.7 },
  ctaText: { color: theme.primaryContrast, fontWeight: "800", fontSize: 15 },
  enabledPill: {
    alignSelf: "flex-start",
    backgroundColor: theme.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  enabledPillText: { color: theme.primary, fontWeight: "700", fontSize: 12 },
  msg: { color: theme.textDim, fontSize: 13, lineHeight: 19 },
  tgLead: { color: theme.textDim, fontSize: 13, lineHeight: 20 },
  tgHint: {
    backgroundColor: theme.accentSoft,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  tgHintText: { color: theme.accent, fontSize: 12, fontWeight: "600" },
  tgResult: { gap: space.s2 },
  tgOpen: {
    alignSelf: "flex-start",
    backgroundColor: theme.primarySoft,
    borderRadius: radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  tgOpenText: { color: theme.primary, fontWeight: "700", fontSize: 13 },
  tgCodeLabel: { color: theme.textDim, fontSize: 12 },
  tgCode: {
    color: theme.text,
    fontSize: 12,
    fontFamily: "monospace",
    backgroundColor: theme.primarySoft,
    borderRadius: radius.sm,
    padding: 8
  },
  section: { gap: space.s3 },
  sectionTitle: { fontSize: 19, fontWeight: "700", color: theme.text },
  empty: { color: theme.textDim, fontSize: 14 },
  eventHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: space.s3
  },
  eventTitle: { color: theme.text, fontSize: 15, fontWeight: "700", flexShrink: 1 },
  kindBadge: {
    backgroundColor: theme.accentSoft,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 3
  },
  kindText: { color: theme.accent, fontSize: 11, fontWeight: "700" },
  eventBody: { color: theme.textDim, fontSize: 13 },
  footerNote: { color: theme.textFaint, fontSize: 11, lineHeight: 16 }
});
