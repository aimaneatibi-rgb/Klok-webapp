// Vacature-prijs: vlak tarief van €195 ex btw per vacature per maand,
// via automatische incasso. De eerste 50 dagen na launch is plaatsen gratis
// (zie CLIENT_BILLING_STARTS_AT in lib/feature-flags.ts).
//
// NB: de oude staffel (€235→€150 met volumekorting) is bewust vervangen door
// één vlak tarief. Wil je weer volumekorting? Zet meerdere tiers terug.

import { VACATURE_PRICE_EX_BTW } from "./feature-flags";

export type PricingTier = {
  minCount: number;
  maxCount: number | null; // null = onbeperkt
  monthlyCents: number;
  label: string;
};

/** Vlak tarief: elke vacature kost hetzelfde per maand. */
export const VACANCY_PRICING_TIERS: PricingTier[] = [
  {
    minCount: 1,
    maxCount: null,
    monthlyCents: VACATURE_PRICE_EX_BTW * 100,
    label: "Vast tarief",
  },
];

export const SHIFT_PLATFORM_FEE_RATE = 0.115;

/**
 * Bereken de prijs per maand voor de N-de vacature
 * (N = aantal actieve vacatures INCLUSIEF de nieuwe)
 */
export function getVacancyMonthlyFee(totalActiveAfterAdding: number): {
  cents: number;
  tier: PricingTier;
} {
  const tier =
    VACANCY_PRICING_TIERS.find(
      (t) =>
        totalActiveAfterAdding >= t.minCount &&
        (t.maxCount === null || totalActiveAfterAdding <= t.maxCount)
    ) ?? VACANCY_PRICING_TIERS[VACANCY_PRICING_TIERS.length - 1];

  return { cents: tier.monthlyCents, tier };
}

export function eur(cents: number): string {
  return `€ ${(cents / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function eurShort(cents: number): string {
  return `€${Math.round(cents / 100)}`;
}

/**
 * Pro-rata berekening voor de eerste factuur deze maand
 */
export function calculateProRata(monthlyCents: number): {
  daysRemaining: number;
  totalDays: number;
  proRataCents: number;
} {
  const now = new Date();
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const today = now.getDate();
  const daysRemaining = lastDay - today + 1; // incl. vandaag
  const proRataCents = Math.round(
    (monthlyCents * daysRemaining) / lastDay
  );
  return { daysRemaining, totalDays: lastDay, proRataCents };
}

export const COOP_AGREEMENT_VERSION = "1.0";
