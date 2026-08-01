"use client";

import { INVOICE_TERM_DAYS } from "@/lib/pricing";
import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Betaalwijze-keuze: automatische incasso (Mollie-mandaat) of op factuur.
 * Incasso met echte Mollie-key → redirect naar de hosted checkout voor de
 * € 0,01-verificatiebetaling; in demo-mode wordt het mandaat direct actief.
 */
export default function BillingMethodSelector({
  current,
  mandateStatus,
  demoMode,
}: {
  current: "incasso" | "factuur" | null;
  mandateStatus: string;
  demoMode: boolean;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(action: "incasso" | "factuur") {
    setBusy(action);
    setError(null);
    try {
      const res = await fetch("/api/billing/method", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = (await res.json()) as {
        error?: string;
        checkoutUrl?: string | null;
      };
      if (!res.ok) throw new Error(data.error ?? "Er ging iets mis");
      if (data.checkoutUrl) {
        // Echte Mollie-flow: verificatiebetaling afronden op de checkout
        window.location.href = data.checkoutUrl;
        return;
      }
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Er ging iets mis");
    } finally {
      setBusy(null);
    }
  }

  const incassoActive = current === "incasso";
  const factuurActive = current === "factuur";

  return (
    <div className="mb-8">
      <h2 className="font-serif text-xl font-medium mb-1">
        Hoe wil je betalen?
      </h2>
      <p className="text-sm text-stone-500 mb-4">
        Geldt voor al je vacature-fees. Je kunt altijd wisselen.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Incasso */}
        <button
          type="button"
          onClick={() => choose("incasso")}
          disabled={busy !== null}
          className={`text-left border rounded-lg p-5 transition-colors disabled:opacity-60 ${
            incassoActive
              ? "bg-lime/10 border-lime"
              : "bg-paper border-stone-200 hover:border-ink"
          }`}
        >
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="font-semibold">🔁 Automatische incasso</div>
            <div className="flex gap-1.5">
              <span className="text-xs bg-lime/30 text-lime-dark px-1.5 py-0.5 rounded font-semibold">
                Aanbevolen
              </span>
              {incassoActive && <MandateBadge status={mandateStatus} />}
            </div>
          </div>
          <p className="text-xs text-stone-600 mt-1.5">
            Eenmalig machtigen via Mollie (verificatie van € 0,01). Daarna
            wordt elke maand automatisch geïncasseerd — geen omkijken naar.
            Stopt vanzelf zodra je je vacature offline haalt.
          </p>
          {busy === "incasso" && (
            <p className="text-xs text-stone-500 mt-2">Bezig…</p>
          )}
        </button>

        {/* Factuur */}
        <button
          type="button"
          onClick={() => choose("factuur")}
          disabled={busy !== null}
          className={`text-left border rounded-lg p-5 transition-colors disabled:opacity-60 ${
            factuurActive
              ? "bg-lime/10 border-lime"
              : "bg-paper border-stone-200 hover:border-ink"
          }`}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="font-semibold">🧾 Op factuur</div>
            {factuurActive && (
              <span className="text-xs bg-lime/30 text-lime-dark px-1.5 py-0.5 rounded font-semibold">
                ✓ Actief
              </span>
            )}
          </div>
          <p className="text-xs text-stone-600 mt-1.5">
            Je ontvangt maandelijks een factuur met {INVOICE_TERM_DAYS} dagen
            betaaltermijn. Betalen kan via iDEAL-link of bankoverschrijving.
          </p>
          {busy === "factuur" && (
            <p className="text-xs text-stone-500 mt-2">Bezig…</p>
          )}
        </button>
      </div>

      {current === null && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-3">
          Nog geen betaalwijze gekozen — kies er één vóór het einde van de
          proefperiode van je eerste vacature. Zonder keuze factureren we op
          factuur.
        </p>
      )}
      {incassoActive && mandateStatus === "pending" && !demoMode && (
        <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-2 mt-3">
          Machtiging nog niet afgerond — rond de € 0,01-verificatiebetaling af
          via Mollie. Klik nogmaals op &lsquo;Automatische incasso&rsquo; om een
          nieuwe betaallink te krijgen.
        </p>
      )}
      {error && (
        <p className="text-xs text-red-800 bg-red-50 border border-red-200 rounded-md px-3 py-2 mt-3">
          {error}
        </p>
      )}
    </div>
  );
}

function MandateBadge({ status }: { status: string }) {
  if (status === "valid") {
    return (
      <span className="text-xs bg-lime/30 text-lime-dark px-1.5 py-0.5 rounded font-semibold">
        ✓ Mandaat actief
      </span>
    );
  }
  if (status === "pending") {
    return (
      <span className="text-xs bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">
        Machtiging afronden
      </span>
    );
  }
  if (status === "failed" || status === "revoked") {
    return (
      <span className="text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-semibold">
        Mandaat mislukt
      </span>
    );
  }
  return null;
}
