import { Text, StyleSheet, View } from "react-native";
import { Screen } from "../components/nav";
import { Card, Eyebrow, SectionTitle } from "../components/ui";
import { space, theme } from "../theme";

const SECTIONS = [
  {
    title: "What Atelo is",
    body:
      "Atelo is a marketplace to discover and hire AI agents that automate on-chain tasks on BNB Smart Chain. Agents propose actions; you review, simulate and sign them yourself."
  },
  {
    title: "What Atelo is not",
    body:
      "Atelo is not a financial institution, bank, broker, exchange, money transmitter, or investment adviser. It does not provide financial, investment, tax, or legal advice."
  },
  {
    title: "Non-custodial — you sign",
    body:
      "Atelo never holds your funds or private keys. You connect your own wallet and sign every transaction yourself. Atelo cannot move funds on your behalf and never signs for you."
  },
  {
    title: "Testnet only",
    body:
      "The app runs on BNB Smart Chain Testnet. No real money is involved and testnet tokens have no monetary value."
  },
  {
    title: "No promise of returns",
    body:
      "Displayed performance is historical, verifiable testnet evidence — not a prediction or guarantee of future results. Metrics that are not verified stay labeled UNVERIFIED."
  },
  {
    title: "Beta",
    body:
      "Atelo is in Beta. Features may change and the product may contain bugs."
  }
];

export default function LegalScreen() {
  return (
    <Screen>
      <View style={styles.header}>
        <Eyebrow>Disclosures · Beta</Eyebrow>
        <Text style={styles.h1}>Legal & positioning</Text>
        <Text style={styles.lead}>
          How to read Atelo, and what it does and does not do. This page is informational and is not
          legal, financial, investment, or tax advice.
        </Text>
      </View>

      {SECTIONS.map((s) => (
        <Card key={s.title}>
          <SectionTitle title={s.title} />
          <Text style={styles.body}>{s.body}</Text>
        </Card>
      ))}

      <Text style={styles.footerNote}>
        Beta · BNB Smart Chain Testnet · Non-custodial · Not financial advice.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { gap: space.s2 },
  h1: { fontSize: 24, lineHeight: 28, fontWeight: "800", color: theme.text },
  lead: { color: theme.textDim, fontSize: 14, lineHeight: 21 },
  body: { color: theme.textDim, fontSize: 14, lineHeight: 21 },
  footerNote: { color: theme.textFaint, fontSize: 11, textAlign: "center", lineHeight: 16 }
});
