// ============================================================
// Prijsmodel vacatures
//
//  - Elke vacature start met 14 dagen gratis proefperiode.
//  - Daarna per maand, ex btw, via automatische incasso (Mollie)
//    of op factuur (14 dagen betaaltermijn).
//  - Staffelkorting over het TOTAAL aantal actieve vacatures:
//    het tarief van de staffel geldt voor ál je actieve vacatures.
//  - Facturatie stopt zodra een vacature offline (gearchiveerd) is;
//    een extra vacature krijgt haar eigen proefperiode en wordt na
//    afloop daarvan direct geïncasseerd of gefactureerd.
// ============================================================

/** Gratis proefperiode per vacature, in dagen. */
export const TRIAL_DAYS = 14;

/** Betaaltermijn voor facturen, in dagen. */
export const INVOICE_TERM_DAYS = 14;

/** Btw-tarief. */
export const VAT_RATE = 0.21;

export type PricingTier = {
  minCount: number;
  maxCount: number | null; // null = onbeperkt
  monthlyCents: number; // per vacature per maand, ex btw
  label: string;
};

/**
 * Staffel: hoe meer actieve vacatures, hoe lager het tarief
 * per vacature — en dat tarief geldt voor ALLE actieve vacatures.
 */
export const VACANCY_PRICING_TIERS: PricingTier[] = [
  { minCount: 1, maxCount: 1, monthlyCents: 19500, label: "1 vacature" },
  { minCount: 2, maxCount: 3, monthlyCents: 17500, label: "2–3 vacatures" },
  { minCount: 4, maxCount: null, monthlyCents: 14900, label: "4+ vacatures" },
];

export const SHIFT_PLATFORM_FEE_RATE = 0.115;

/** Staffel-tier op basis van het totaal aantal actieve vacatures. */
export function getTierForCount(totalActive: number): PricingTier {
  return (
    VACANCY_PRICING_TIERS.find(
      (t) =>
        totalActive >= t.minCount &&
        (t.maxCount === null || totalActive <= t.maxCount)
    ) ?? VACANCY_PRICING_TIERS[VACANCY_PRICING_TIERS.length - 1]
  );
}

/** Tarief per vacature per maand (ex btw) bij N actieve vacatures. */
export function feePerVacancyCents(totalActive: number): number {
  return getTierForCount(Math.max(1, totalActive)).monthlyCents;
}

/** Maandtotaal (ex btw) bij N actieve vacatures — staffel over alles. */
export function monthlyTotalCents(totalActive: number): number {
  if (totalActive <= 0) return 0;
  return feePerVacancyCents(totalActive) * totalActive;
}

/** Besparing per maand t.o.v. het basistarief, door de staffel. */
export function monthlySavingsCents(totalActive: number): number {
  if (totalActive <= 0) return 0;
  const base = VACANCY_PRICING_TIERS[0].monthlyCents * totalActive;
  return base - monthlyTotalCents(totalActive);
}

/** Compat: prijs per maand voor de N-de vacature (staffel-tarief). */
export function getVacancyMonthlyFee(totalActiveAfterAdding: number): {
  cents: number;
  tier: PricingTier;
} {
  const tier = getTierForCount(Math.max(1, totalActiveAfterAdding));
  return { cents: tier.monthlyCents, tier };
}

/** Einde proefperiode voor een vacature die nu (of op `from`) live gaat. */
export function trialEndsAt(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + TRIAL_DAYS);
  return d;
}

/** Btw over een bedrag ex btw. */
export function vatCents(subtotalCents: number): number {
  return Math.round(subtotalCents * VAT_RATE);
}

/** Totaal incl. btw. */
export function totalInclVatCents(subtotalCents: number): number {
  return subtotalCents + vatCents(subtotalCents);
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
 * Pro-rata berekening voor de eerste factuur deze maand.
 * (Niet meer gebruikt in de standaard-flow — elke vacature heeft een
 * eigen maandcyclus vanaf einde proefperiode — maar handig voor admin.)
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
  const proRataCents = Math.round((monthlyCents * daysRemaining) / lastDay);
  return { daysRemaining, totalDays: lastDay, proRataCents };
}

export const COOP_AGREEMENT_VERSION = "1.1";
