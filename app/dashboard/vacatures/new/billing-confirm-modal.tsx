"use client";

import {
  TRIAL_DAYS,
  VACANCY_PRICING_TIERS,
  eur,
  feePerVacancyCents,
  monthlySavingsCents,
  monthlyTotalCents,
  trialEndsAt,
} from "@/lib/pricing";
import Link from "next/link";

export default function BillingConfirmModal({
  open,
  currentActiveCount,
  billingMethod,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  currentActiveCount: number;
  billingMethod: "incasso" | "factuur" | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: (agreed: boolean) => void;
}) {
  const newTotal = currentActiveCount + 1;
  const fee = feePerVacancyCents(newTotal);
  const trialEnd = trialEndsAt().toLocaleDateString("nl-NL", {
    day: "numeric",
    month: "long",
  });
  const savings = monthlySavingsCents(newTotal);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-paper rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="px-6 py-4 border-b border-stone-200">
          <span className="eyebrow">— KOSTEN &amp; PROEFPERIODE</span>
          <h2 className="font-serif text-2xl font-medium tracking-tight mt-1">
            Eerst {TRIAL_DAYS} dagen gratis.
          </h2>
        </div>

        <div className="p-6 space-y-4">
          {/* Proefperiode */}
          <div className="bg-lime/15 border border-lime rounded-lg p-4 text-sm">
            <div className="font-semibold text-ink mb-1">
              Nu: € 0 — proefperiode t/m {trialEnd}
            </div>
            <div className="text-xs text-stone-600">
              Deze vacature staat {TRIAL_DAYS} dagen gratis live. Haal je hem
              vóór die tijd offline, dan betaal je niets. Daarna gaat de
              maandelijkse fee automatisch in.
            </div>
          </div>

          {/* Kosten na proefperiode */}
          <div className="bg-cream rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">
                Jouw tarief ({newTotal} actieve vacature
                {newTotal === 1 ? "" : "s"})
              </span>
              <span className="font-semibold text-ink">
                {eur(fee)} / mnd ex btw
              </span>
            </div>
            {newTotal > 1 && (
              <div className="flex justify-between">
                <span className="text-stone-600">
                  Totaal voor al je vacatures
                </span>
                <span className="font-semibold text-ink">
                  {eur(monthlyTotalCents(newTotal))} / mnd ex btw
                </span>
              </div>
            )}
            {savings > 0 && (
              <div className="flex justify-between text-lime-dark">
                <span>Staffelvoordeel</span>
                <span className="font-semibold">
                  − {eur(savings)} / mnd
                </span>
              </div>
            )}
            <div className="border-t border-stone-200 pt-2 flex justify-between">
              <span className="text-stone-600">Betaalwijze</span>
              <span className="font-semibold text-ink">
                {billingMethod === "incasso"
                  ? "Automatische incasso"
                  : billingMethod === "factuur"
                    ? "Op factuur (14 dagen)"
                    : "Nog te kiezen"}
              </span>
            </div>
          </div>

          {/* Staffel */}
          <div className="text-sm">
            <div className="eyebrow mb-2">Staffelkorting</div>
            <div className="border border-stone-200 rounded-lg overflow-hidden">
              {VACANCY_PRICING_TIERS.map((t) => {
                const active =
                  newTotal >= t.minCount &&
                  (t.maxCount === null || newTotal <= t.maxCount);
                return (
                  <div
                    key={t.label}
                    className={`flex justify-between px-3 py-2 text-xs border-b border-stone-100 last:border-0 ${
                      active ? "bg-lime/20 font-semibold" : ""
                    }`}
                  >
                    <span>
                      {t.label}
                      {active && " · jouw tarief"}
                    </span>
                    <span>{eur(t.monthlyCents)} p/vacature</span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-stone-500 mt-1.5">
              Het staffeltarief geldt voor <strong>al</strong> je actieve
              vacatures — extra plaatsen maakt alles goedkoper.
            </p>
          </div>

          {billingMethod === null && (
            <div className="bg-amber-50 border border-amber-300 rounded-md p-3 text-xs text-amber-900">
              Je hebt nog geen betaalwijze gekozen. Doe dat vóór het einde van
              de proefperiode bij{" "}
              <Link
                href="/dashboard/betaalmethodes"
                className="underline font-semibold"
              >
                Betaalmethodes
              </Link>{" "}
              — automatische incasso of op factuur.
            </div>
          )}

          {/* Stoppen */}
          <div className="text-xs text-stone-600 bg-paper border border-stone-200 rounded-lg p-3">
            <strong>📌 Stoppen = offline halen.</strong> Zodra je de vacature
            offline haalt, stopt de {billingMethod === "factuur" ? "facturatie" : "incasso"}{" "}
            automatisch — er volgt geen nieuwe maand. Voor een al gestarte
            maand vindt geen restitutie plaats.
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-stone-200 bg-cream rounded-b-xl flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm text-stone-600 hover:text-ink disabled:opacity-50"
          >
            Annuleer
          </button>
          <button
            type="button"
            onClick={() => onConfirm(true)}
            disabled={loading}
            className="bg-lime text-ink px-5 py-2 rounded-md text-sm font-semibold hover:bg-lime-dark disabled:opacity-50 transition-colors"
          >
            {loading
              ? "Plaatsen..."
              : `✓ Plaats — eerst ${TRIAL_DAYS} dagen gratis`}
          </button>
        </div>
      </div>
    </div>
  );
}
