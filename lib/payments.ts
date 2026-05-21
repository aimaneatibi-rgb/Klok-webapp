// Payment helpers — provider-agnostisch
// Wanneer Mollie/Stripe API keys gewired worden, vervang de "demo" functies
// hier door echte API calls. UI hoeft dan niet aangepast.

export type PaymentMethodType = "sepa_dd" | "ideal" | "card" | "bank_transfer";
export type PaymentMethodStatus =
  | "pending"
  | "active"
  | "expired"
  | "failed"
  | "revoked";

export const METHOD_LABELS: Record<PaymentMethodType, string> = {
  sepa_dd: "SEPA Automatische Incasso",
  ideal: "iDEAL",
  card: "Creditcard",
  bank_transfer: "Bankoverschrijving",
};

export const METHOD_EMOJI: Record<PaymentMethodType, string> = {
  sepa_dd: "🔁",
  ideal: "🇳🇱",
  card: "💳",
  bank_transfer: "🏦",
};

export const METHOD_DESCRIPTIONS: Record<PaymentMethodType, string> = {
  sepa_dd:
    "Eenmalig machtigen, daarna automatisch incasseren elke maand. Geen handmatig werk meer.",
  ideal:
    "Per factuur betalen via iDEAL. Geen mandaat nodig, betaling direct verwerkt.",
  card: "Mastercard of Visa. Eenmalig opslaan, daarna automatisch belasten of voor losse betalingen.",
  bank_transfer:
    "Klassieke bankoverschrijving op basis van factuur. 14 dagen betalingstermijn.",
};

export function isDemoMode() {
  // Wanneer MOLLIE_API_KEY in env staat, demo mode uit
  return !process.env.MOLLIE_API_KEY;
}

// Mocked IBAN validation — voor demo
export function maskIban(iban: string): string {
  const cleaned = iban.replace(/\s/g, "").toUpperCase();
  if (cleaned.length < 4) return cleaned;
  return cleaned.slice(-4);
}

export function eur(cents: number): string {
  return `€ ${(cents / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
