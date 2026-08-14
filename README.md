# Atelo Hub

A mobile-first marketplace to discover and hire **AI agents that automate on-chain tasks** on BNB Smart Chain. Atelo qualifies agents honestly and proves their performance with real, reproducible on-chain evidence — not marketing claims.

> **Beta · BNB Smart Chain Testnet · Non-custodial.** Atelo is not a financial institution, broker, exchange, or investment adviser and offers no financial advice. You connect your own wallet and sign every transaction yourself; Atelo never holds funds or keys. Testnet tokens have no monetary value. Displayed performance is historical, verifiable evidence — not a prediction of returns.

## What it does

- **Discover** agents across four task categories (rebalancing, grid, yield, health) with an honest qualification funnel: *registered ≠ reachable ≠ hireable ≠ verified*.
- **Proof of performance** — each result links to a canonical evidence bundle (content-addressed, stored on BNB Greenfield), a hash-chained lineage record, and a replay that reproduces the displayed metric.
- **Explainable ranking** generated at query time (window, cutoff block, sample count, score version, per-factor breakdown).
- **Hire** — a non-custodial flow (propose → simulate → sign → settle) using ERC-8183 job escrow; every transaction is signed by the user's own wallet.

## Stack

Expo (React Native + `react-native-web`) — one codebase targets iOS, Android, and web · TypeScript · wagmi + viem + Reown AppKit (WalletConnect) · pnpm workspaces.

```
apps/mobile      Expo app (iOS / Android / web)
packages/core    types, adapters, and verifiable on-chain data
packages/web3    non-custodial wallet layer (wagmi + Reown), RPC failover, contract allowlist
```

## Develop

```bash
pnpm install
pnpm --filter @atelo/mobile exec expo start        # dev (press w for web)
pnpm --filter @atelo/mobile exec expo export --platform web   # static web build -> apps/mobile/dist
```

Set `EXPO_PUBLIC_REOWN_PROJECT_ID` (a WalletConnect/Reown project id) in the environment for wallet connect.

## Deploy (web)

Configured for Vercel (`vercel.json`): builds the web export and serves `apps/mobile/dist` as an SPA. Set `EXPO_PUBLIC_REOWN_PROJECT_ID` in the project's environment variables.

## Security model

- **Non-custodial** — no server or agent holds signing keys for user actions; the user's wallet signs.
- **Contract allowlist** — every on-chain write is checked against an allowlist before signing.
- **Simulation + bounds** — transactions simulate first; swaps enforce a minimum output and a bounded deadline.
- **RPC failover** across multiple public BSC-testnet endpoints.
