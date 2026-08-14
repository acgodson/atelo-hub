import {
  ADDRESSES,
  U_TOKEN,
  assertAllowedContract,
  bscScanAddress,
  computeDeadline,
  computeMinOut,
  erc20Abi,
  shortHash,
  swapRouterAbi,
  type HireTerms
} from "@atelo/core";
import {
  useConnectModal,
  useSimulateContract,
  useSwitchChain,
  useWallet,
  useWriteContract,
  walletEnabled
} from "@atelo/web3";
import { useState, type ReactNode } from "react";
import { Linking, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { formatUnits } from "viem";
import { radius, space, theme } from "../theme";

const CHAIN_ID = 97;
type Hex = `0x${string}`;

function fmtU(raw: string): string {
  try {
    return `${formatUnits(BigInt(raw), U_TOKEN.decimals)} ${U_TOKEN.symbol}`;
  } catch {
    return `${raw} (raw)`;
  }
}

function openExplorer(url: string) {
  Linking.openURL(url).catch(() => undefined);
}

function submitGuardedWrite(
  request: { address?: string } | undefined,
  writeContract: (request: never) => void
) {
  if (!request?.address) return;
  assertAllowedContract(request.address);
  writeContract(request as never);
}

function StepHead({ n, name, phase }: { n: number; name: string; phase: string }) {
  return (
    <View style={styles.stepHead}>
      <View style={styles.stepNum}>
        <Text style={styles.stepNumText}>{n}</Text>
      </View>
      <View style={styles.stepHeadBody}>
        <Text style={styles.stepName}>{name}</Text>
        <Text style={styles.stepPhase}>{phase}</Text>
      </View>
    </View>
  );
}

function KvRow({ k, children }: { k: string; children: ReactNode }) {
  return (
    <View style={styles.kvRow}>
      <Text style={styles.kvK}>{k}</Text>
      <View style={styles.kvVWrap}>
        {typeof children === "string" ? <Text style={styles.kvV}>{children}</Text> : children}
      </View>
    </View>
  );
}

function TxLinkText({ label, url }: { label: string; url: string }) {
  return (
    <Pressable onPress={() => openExplorer(url)}>
      <Text style={styles.txlink}>{label}</Text>
    </Pressable>
  );
}

function SimResult({ ok, error }: { ok: boolean; error?: string }) {
  if (ok) {
    return (
      <View style={[styles.sim, styles.simOk]}>
        <Text style={styles.simOkText}>Simulation succeeded — safe to sign.</Text>
      </View>
    );
  }
  if (error) {
    return (
      <View style={[styles.sim, styles.simErr]}>
        <Text style={styles.simErrText}>
          Simulation reverted, not broadcasting: {error.split("\n")[0]}
        </Text>
      </View>
    );
  }
  return (
    <View style={[styles.sim, styles.simPending]}>
      <Text style={styles.simPendingText}>Simulating against the pinned contract…</Text>
    </View>
  );
}

function ConnectGate({ children }: { children: ReactNode }) {
  const { open } = useConnectModal();
  const { isConnected, chainId } = useWallet();
  const { switchChain, isPending } = useSwitchChain();

  if (!walletEnabled) {
    return (
      <View style={styles.gate}>
        <View style={[styles.cta, styles.ctaGhost, styles.ctaDisabled]}>
          <Text style={styles.ctaGhostText}>Wallet disabled</Text>
        </View>
        <Text style={styles.faint}>
          Set EXPO_PUBLIC_REOWN_PROJECT_ID to enable simulation and signing.
        </Text>
      </View>
    );
  }
  if (!isConnected) {
    return (
      <View style={styles.gate}>
        <Pressable style={[styles.cta, styles.ctaPrimary]} onPress={() => open()}>
          <Text style={styles.ctaPrimaryText}>Connect wallet</Text>
        </Pressable>
        <Text style={styles.faint}>Simulation and signing require a connected wallet.</Text>
      </View>
    );
  }
  if (chainId !== CHAIN_ID) {
    return (
      <View style={styles.gate}>
        <Pressable
          style={[styles.cta, styles.ctaPrimary]}
          onPress={() => switchChain({ chainId: CHAIN_ID })}
          disabled={isPending}
        >
          <Text style={styles.ctaPrimaryText}>
            {isPending ? "Switching…" : "Switch to BSC testnet"}
          </Text>
        </Pressable>
        <Text style={styles.faint}>Wrong network — this job runs on BSC testnet (chainId 97).</Text>
      </View>
    );
  }
  return <>{children}</>;
}

function Confirm({ checked, onToggle, label }: { checked: boolean; onToggle: () => void; label: string }) {
  return (
    <Pressable style={styles.confirm} onPress={onToggle}>
      <View style={[styles.checkbox, checked && styles.checkboxOn]}>
        {checked ? <Text style={styles.checkboxMark}>✓</Text> : null}
      </View>
      <Text style={styles.confirmText}>{label}</Text>
    </Pressable>
  );
}

function FundStep({ terms }: { terms: HireTerms }) {
  const { address } = useWallet();
  const [requested, setRequested] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const sim = useSimulateContract({
    address: ADDRESSES.uToken,
    abi: erc20Abi,
    functionName: "approve",
    args: [ADDRESSES.agenticCommerce, BigInt(terms.priceRaw)],
    account: address,
    query: { enabled: requested && Boolean(address) }
  });
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  return (
    <ConnectGate>
      <View style={styles.actions}>
        {!requested ? (
          <Pressable style={[styles.cta, styles.ctaGhost]} onPress={() => setRequested(true)}>
            <Text style={styles.ctaGhostText}>Simulate fund (approve {fmtU(terms.priceRaw)})</Text>
          </Pressable>
        ) : (
          <SimResult ok={sim.isSuccess} error={sim.error?.message} />
        )}
        {sim.isSuccess ? (
          <>
            <Confirm
              checked={confirmed}
              onToggle={() => setConfirmed((v) => !v)}
              label={`I authorize escrowing ${fmtU(terms.priceRaw)} for job #${terms.jobId}.`}
            />
            <Pressable
              style={[styles.cta, styles.ctaPrimary, (!confirmed || isPending) && styles.ctaDisabled]}
              disabled={!confirmed || isPending}
              onPress={() => sim.data && submitGuardedWrite(sim.data.request, writeContract)}
            >
              <Text style={styles.ctaPrimaryText}>
                {isPending ? "Confirm in wallet…" : "Fund & hire (sign approve)"}
              </Text>
            </Pressable>
          </>
        ) : null}
        {hash ? (
          <View style={[styles.sim, styles.simOk]}>
            <Text style={styles.simOkText}>Approve broadcast: {shortHash(hash)}</Text>
          </View>
        ) : null}
        {writeError ? (
          <View style={[styles.sim, styles.simErr]}>
            <Text style={styles.simErrText}>{writeError.message.split("\n")[0]}</Text>
          </View>
        ) : null}
      </View>
    </ConnectGate>
  );
}

function ExecuteStep({ terms }: { terms: HireTerms }) {
  const { address } = useWallet();
  const [requested, setRequested] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const swap = terms.action.swap;

  const minOut = swap ? computeMinOut(BigInt(swap.quotedAmountOut), terms.maxSlippageBps) : 0n;
  const params = swap
    ? {
        tokenIn: swap.tokenIn as Hex,
        tokenOut: swap.tokenOut as Hex,
        fee: swap.fee,
        recipient: (address ?? "0x0000000000000000000000000000000000000000") as Hex,
        deadline: computeDeadline(Math.floor(Date.now() / 1000)),
        amountIn: BigInt(swap.amountIn),
        amountOutMinimum: minOut,
        sqrtPriceLimitX96: 0n
      }
    : undefined;

  const sim = useSimulateContract({
    address: ADDRESSES.swapRouter,
    abi: swapRouterAbi,
    functionName: "exactInputSingle",
    args: params ? [params] : undefined,
    account: address,
    query: { enabled: requested && Boolean(address) && Boolean(params) }
  });
  const { writeContract, data: hash, isPending, error: writeError } = useWriteContract();

  if (!swap) {
    return (
      <View style={styles.actions}>
        <View style={[styles.note, styles.noteWarn]}>
          <Text style={styles.noteText}>
            Signed browser execution is wired end-to-end for the grid reference leg in this build. This
            category&apos;s proposed call ({terms.action.method} on {shortHash(terms.action.contract, 8, 6)})
            is simulate-ready in labs (labs/atelo-core). The same propose → simulate → sign model applies;
            signing here is enabled for the grid reference action.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <ConnectGate>
      <View style={styles.actions}>
        {!requested ? (
          <Pressable style={[styles.cta, styles.ctaGhost]} onPress={() => setRequested(true)}>
            <Text style={styles.ctaGhostText}>Simulate execution ({terms.action.method})</Text>
          </Pressable>
        ) : (
          <SimResult ok={sim.isSuccess} error={sim.error?.message} />
        )}
        {sim.isSuccess ? (
          <>
            <Confirm
              checked={confirmed}
              onToggle={() => setConfirmed((v) => !v)}
              label="I am signing this execution myself — Atelo never signs on my behalf."
            />
            <Pressable
              style={[styles.cta, styles.ctaPrimary, (!confirmed || isPending) && styles.ctaDisabled]}
              disabled={!confirmed || isPending}
              onPress={() => sim.data && submitGuardedWrite(sim.data.request, writeContract)}
            >
              <Text style={styles.ctaPrimaryText}>
                {isPending ? "Confirm in wallet…" : "Execute proposed action (sign)"}
              </Text>
            </Pressable>
          </>
        ) : null}
        {hash ? (
          <View style={[styles.sim, styles.simOk]}>
            <Text style={styles.simOkText}>Execution broadcast: {shortHash(hash)}</Text>
          </View>
        ) : null}
        {writeError ? (
          <View style={[styles.sim, styles.simErr]}>
            <Text style={styles.simErrText}>{writeError.message.split("\n")[0]}</Text>
          </View>
        ) : null}
      </View>
    </ConnectGate>
  );
}

export function ActivationSheet({
  terms,
  visible,
  onClose
}: {
  terms: HireTerms;
  visible: boolean;
  onClose: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.scrim} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={() => undefined}>
          <View style={styles.grab} />
          <View style={styles.sheetHead}>
            <View style={styles.sheetHeadBody}>
              <Text style={styles.eyebrow}>Activation · propose → simulate → sign → settle</Text>
              <Text style={styles.sheetTitle}>Hire the Atelo reference agent</Text>
            </View>
            <Pressable style={styles.close} onPress={onClose} accessibilityLabel="Close">
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={[styles.note, styles.noteWarn]}>
              <Text style={styles.noteText}>
                First-party only: this hires the Atelo-owned reference agent (ERC-8004 agentId{" "}
                {terms.agentId}), labeled first-party. No qualified third-party agent is available to hire
                yet, so a real third-party hire is not offered here.
              </Text>
            </View>

            <View style={styles.card}>
              <StepHead n={1} name="Task & agent proposal" phase="propose" />
              <View style={styles.kv}>
                <KvRow k="Task">{terms.objective}</KvRow>
                <KvRow k="Agent">{terms.agentName}</KvRow>
                <KvRow k="Protocol">{terms.protocol}</KvRow>
                <KvRow k="Proposed call">
                  <Text style={styles.mono}>{terms.action.method}</Text>
                </KvRow>
                {terms.action.swap ? (
                  <KvRow k="Quote">
                    {`${terms.action.swap.amountIn} in → ${terms.action.swap.quotedAmountOut} out (fee ${terms.action.swap.fee})`}
                  </KvRow>
                ) : null}
              </View>
            </View>

            <View style={styles.card}>
              <StepHead n={2} name="ERC-8183 job terms" phase="terms" />
              <View style={styles.kv}>
                <KvRow k="Job">{`#${terms.jobId}`}</KvRow>
                <KvRow k="Price">{fmtU(terms.priceRaw)}</KvRow>
                <KvRow k="Pay token (U)">
                  <TxLinkText label={shortHash(terms.currency)} url={bscScanAddress(terms.currency)} />
                </KvRow>
                <KvRow k="Escrow (AgenticCommerce)">
                  <TxLinkText
                    label={shortHash(ADDRESSES.agenticCommerce)}
                    url={bscScanAddress(ADDRESSES.agenticCommerce)}
                  />
                </KvRow>
                <KvRow k="Policy">
                  <TxLinkText label={shortHash(terms.policy)} url={bscScanAddress(terms.policy)} />
                </KvRow>
                <KvRow k="Dispute window">{`${terms.disputeWindowSeconds}s policy`}</KvRow>
                <KvRow k="Action to sign">
                  <Text style={styles.mono}>
                    {terms.action.method} @ {shortHash(terms.action.contract, 6, 4)}
                  </Text>
                </KvRow>
              </View>
            </View>

            <View style={styles.card}>
              <StepHead n={3} name="Fund & hire" phase="simulate → sign" />
              <Text style={styles.faint}>
                Escrows {fmtU(terms.priceRaw)} by approving the AgenticCommerce contract. Simulated first,
                then signed by you.
              </Text>
              <FundStep terms={terms} />
            </View>

            <View style={styles.card}>
              <StepHead n={4} name="Execute proposed action" phase="simulate → sign → settle" />
              <Text style={styles.faint}>
                The agent proposes; Atelo simulates; you sign the execution. Atelo never signs for you.
                Payment settles after the {terms.disputeWindowSeconds}s policy window.
              </Text>
              <Text style={styles.compliance}>
                Testnet only. You sign this transaction yourself; Atelo is non-custodial and provides no
                financial advice.
              </Text>
              <ExecuteStep terms={terms} />
            </View>

            <Text style={styles.footerNote}>
              Terms sourced from artifacts/phase-03 job #{terms.jobId}. Contracts pinned in @atelo/core. BSC
              testnet.
            </Text>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 12, 0.72)",
    justifyContent: "flex-end"
  },
  sheet: {
    backgroundColor: theme.bg,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: theme.border,
    maxHeight: "92%",
    maxWidth: 480,
    width: "100%",
    alignSelf: "center",
    paddingBottom: space.s4
  },
  grab: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.borderStrong,
    alignSelf: "center",
    marginTop: space.s3
  },
  sheetHead: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: space.s5,
    paddingTop: space.s3,
    paddingBottom: space.s2,
    gap: space.s3
  },
  sheetHeadBody: {
    flexShrink: 1,
    gap: space.s1
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.text
  },
  close: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: theme.border
  },
  closeText: {
    color: theme.textDim,
    fontSize: 14,
    fontWeight: "700"
  },
  body: {
    flexGrow: 0
  },
  bodyContent: {
    paddingHorizontal: space.s5,
    paddingBottom: space.s5,
    gap: space.s4
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: theme.primary,
    textTransform: "uppercase"
  },
  card: {
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: radius.lg,
    padding: space.s4,
    gap: space.s3
  },
  stepHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: space.s3
  },
  stepNum: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: theme.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  stepNumText: {
    color: theme.primary,
    fontWeight: "800",
    fontSize: 13
  },
  stepHeadBody: {
    gap: 1
  },
  stepName: {
    color: theme.text,
    fontWeight: "700",
    fontSize: 14
  },
  stepPhase: {
    color: theme.textFaint,
    fontSize: 11,
    fontWeight: "600"
  },
  kv: {
    gap: space.s2
  },
  kvRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: space.s4,
    alignItems: "flex-start"
  },
  kvK: {
    color: theme.textDim,
    fontSize: 12.5,
    flexShrink: 0
  },
  kvVWrap: {
    flexShrink: 1,
    alignItems: "flex-end"
  },
  kvV: {
    color: theme.text,
    fontSize: 12.5,
    fontWeight: "600",
    textAlign: "right"
  },
  mono: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "600",
    fontFamily: "monospace",
    textAlign: "right"
  },
  txlink: {
    color: theme.accent,
    fontSize: 12.5,
    fontWeight: "600",
    fontFamily: "monospace"
  },
  faint: {
    color: theme.textFaint,
    fontSize: 12,
    lineHeight: 17
  },
  compliance: {
    color: theme.textDim,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "600"
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
  gate: {
    gap: space.s2
  },
  actions: {
    gap: space.s3
  },
  cta: {
    borderRadius: radius.md,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center"
  },
  ctaPrimary: {
    backgroundColor: theme.primary
  },
  ctaPrimaryText: {
    color: theme.primaryContrast,
    fontWeight: "800",
    fontSize: 13
  },
  ctaGhost: {
    borderWidth: 1,
    borderColor: theme.borderStrong
  },
  ctaGhostText: {
    color: theme.text,
    fontWeight: "700",
    fontSize: 13
  },
  ctaDisabled: {
    opacity: 0.5
  },
  confirm: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: space.s3
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: theme.borderStrong,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1
  },
  checkboxOn: {
    backgroundColor: theme.primary,
    borderColor: theme.primary
  },
  checkboxMark: {
    color: theme.primaryContrast,
    fontSize: 12,
    fontWeight: "900"
  },
  confirmText: {
    color: theme.textDim,
    fontSize: 12.5,
    lineHeight: 18,
    flexShrink: 1
  },
  sim: {
    borderRadius: radius.sm,
    padding: space.s3
  },
  simOk: {
    backgroundColor: theme.primarySoft
  },
  simOkText: {
    color: theme.primary,
    fontSize: 12.5,
    fontWeight: "600"
  },
  simErr: {
    backgroundColor: theme.dangerSoft
  },
  simErrText: {
    color: theme.danger,
    fontSize: 12.5,
    fontWeight: "600"
  },
  simPending: {
    backgroundColor: theme.surface3
  },
  simPendingText: {
    color: theme.textDim,
    fontSize: 12.5,
    fontWeight: "600"
  },
  footerNote: {
    color: theme.textFaint,
    fontSize: 11,
    lineHeight: 16
  }
});
