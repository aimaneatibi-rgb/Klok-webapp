"use client";

import {
  VACANCY_PRICING_TIERS,
  calculateProRata,
  eur,
  eurShort,
  getVacancyMonthlyFee,
} from "@/lib/pricing";

export default function BillingConfirmModal({
  open,
  currentActiveCount,
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  currentActiveCount: number;
  loading: boolean;
  onClose: () => void;
  onConfirm: (agreed: boolean) => void;
}) {
  const newTotal = currentActiveCount + 1;
  const { cents: monthlyCents, tier } = getVacancyMonthlyFee(newTotal);
  const { daysRemaining, totalDays, proRataCents } =
    calculateProRata(monthlyCents);

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
          <span className="eyebrow">— LET OP</span>
          <h2 className="font-serif text-2xl font-medium tracking-tight mt-1">
            Je 1e factuur volgt direct.
          </h2>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-stone-700">
            Plaatsing van een vacature is <strong>betaald</strong>. Hieronder de
            kosten waar je akkoord op geeft.
          </p>

          {/* Pricing breakdown */}
          <div className="bg-cream rounded-lg p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-stone-600">Actieve vacatures nu</span>
              <span className="font-mono font-semibold">
                {currentActiveCount}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-600">Inclusief deze nieuwe</span>
              <span className="font-mono font-semibold">{newTotal}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Staffel</span>
              <span className="font-semibold text-ink">{tier.label}</span>
            </div>
            <div className="border-t border-stone-200 pt-2 flex justify-between">
              <span className="text-stone-600">Maandelijkse fee</span>
              <span className="font-semibold text-ink">
                {eur(monthlyCents)} ex BTW
              </span>
            </div>
          </div>

          {/* Pro-rata */}
          <div className="bg-lime/15 border border-lime rounded-lg p-4 text-sm">
            <div className="font-semibold text-ink mb-1">
              Eerste factuur (pro-rata)
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-stone-700">
                {daysRemaining} van {totalDays} dagen deze maand
              </span>
              <span className="font-semibold text-ink">
                {eur(proRataCents)} ex BTW
              </span>
            </div>
            <div className="text-xs text-stone-600">
              Vanaf volgende maand:{" "}
              <strong>{eur(monthlyCents)} per maand</strong>, zolang de
              vacature in &lsquo;open&rsquo; of &lsquo;paused&rsquo; status
              staat.
            </div>
          </div>

          {/* Verantwoordelijkheid */}
          <div className="text-xs text-stone-600 bg-paper border border-stone-200 rounded-lg p-3">
            <strong>📌 Je bent zelf verantwoordelijk voor verwijderen.</strong>{" "}
            De maandelijkse fee loopt door zolang de vacature live staat. Bij
            tussentijdse verwijdering vindt geen restitutie plaats voor de
            lopende maand.
          </div>

          {/* Staffel uitleg */}
          <details className="text-xs">
            <summary className="cursor-pointer text-stone-600 hover:text-ink">
              Hoe werkt de staffelkorting?
            </summary>
            <ul className="mt-2 space-y-1 text-stone-600">
              {VACANCY_PRICING_TIERS.map((t) => (
                <li
                  key={t.label}
                  className={
                    newTotal >= t.minCount &&
                    (t.maxCount === null || newTotal <= t.maxCount)
                      ? "font-semibold text-ink"
                      : ""
                  }
                >
                  {t.minCount}
                  {t.maxCount ? `-${t.maxCount}` : "+"} vacatures:{" "}
                  {eurShort(t.monthlyCents)}/m per stuk
                  {newTotal >= t.minCount &&
                    (t.maxCount === null || newTotal <= t.maxCount) &&
                    " ← jij"}
                </li>
              ))}
            </ul>
          </details>
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
            {loading ? "Plaatsen..." : "✓ Ja, plaats vacature"}
          </button>
        </div>
      </div>
    </div>
  );
}
