/**
 * Feature flags voor de strategische launch-fase.
 *
 * Werknemer-lock: nieuwe werknemers maken hun profiel aan, maar krijgen
 * pas na 14 dagen toegang tot vacatures/shifts. In die 14 dagen doen we
 * acquisitie naar werkgevers zodat er ook iets te zoeken is.
 *
 * Shifts-lock: shifts plaatsen + zoeken is uit tot SHIFTS_LIVE_AT.
 * Focus eerst op vacatures (vaste banen) + werknemer-acquisitie.
 */

/**
 * Officiële launch-datum — het anker voor alle launch-fasen hieronder.
 * Pas alleen deze aan als de launch verschuift; de fase-datums hieronder
 * zijn hiervan afgeleid (launch + N dagen).
 */
export const LAUNCH_AT = "2026-06-09T00:00:00Z";

/** Werknemers die zich vandaag registreren krijgen pas N dagen later toegang. */
export const WORKER_ACCESS_LOCK_DAYS = 14;

/** Datum waarop shifts beschikbaar worden (100 dagen vanaf launch). */
export const SHIFTS_LIVE_AT = "2026-09-17T00:00:00Z";

/**
 * De eerste 50 dagen innen we nog geen geld van opdrachtgevers — vacatures
 * plaatsen is dan gratis. Vanaf deze datum start de automatische incasso.
 */
export const CLIENT_BILLING_STARTS_AT = "2026-07-29T00:00:00Z";

/** Prijs per vacature per maand, exclusief btw, via automatische incasso. */
export const VACATURE_PRICE_EX_BTW = 195;

/** Is shifts-functionaliteit nu gelockt? */
export function isShiftsLocked(now: Date = new Date()): boolean {
  return now < new Date(SHIFTS_LIVE_AT);
}

/** Hoeveel dagen tot shifts live gaan? */
export function daysUntilShiftsLive(now: Date = new Date()): number {
  const ms = new Date(SHIFTS_LIVE_AT).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Innen we al geld van opdrachtgevers (automatische incasso actief)? */
export function isClientBillingActive(now: Date = new Date()): boolean {
  return now >= new Date(CLIENT_BILLING_STARTS_AT);
}

/** Hoeveel dagen tot de automatische incasso start? */
export function daysUntilClientBilling(now: Date = new Date()): number {
  const ms = new Date(CLIENT_BILLING_STARTS_AT).getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/**
 * Is deze werknemer nog in de toegang-lock periode?
 * @param createdAt ISO timestamp van wanneer het account is aangemaakt
 */
export function isWorkerLocked(createdAt: string | null | undefined, now: Date = new Date()): boolean {
  if (!createdAt) return false;
  const unlockAt = new Date(createdAt);
  unlockAt.setDate(unlockAt.getDate() + WORKER_ACCESS_LOCK_DAYS);
  return now < unlockAt;
}

/** Hoeveel dagen tot deze werknemer toegang krijgt? */
export function daysUntilWorkerUnlock(createdAt: string | null | undefined, now: Date = new Date()): number {
  if (!createdAt) return 0;
  const unlockAt = new Date(createdAt);
  unlockAt.setDate(unlockAt.getDate() + WORKER_ACCESS_LOCK_DAYS);
  const ms = unlockAt.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}

/** Datum waarop deze werknemer toegang krijgt (ISO). */
export function workerUnlockDate(createdAt: string | null | undefined): string | null {
  if (!createdAt) return null;
  const unlockAt = new Date(createdAt);
  unlockAt.setDate(unlockAt.getDate() + WORKER_ACCESS_LOCK_DAYS);
  return unlockAt.toISOString();
}

/**
 * Routes die werknemers nog mogen bezoeken tijdens de lock-periode.
 * Profiel + CV aanmaken moet kunnen — alleen toegang tot vacatures/shifts blokkeren.
 */
export const WORKER_LOCK_EXEMPT_PATHS = [
  "/werknemer/profiel",
  "/werknemer/cv",
  "/werknemer/wachtkamer",
];

export function isWerknemerPathExempt(pathname: string): boolean {
  return WORKER_LOCK_EXEMPT_PATHS.some((p) => pathname.startsWith(p));
}
