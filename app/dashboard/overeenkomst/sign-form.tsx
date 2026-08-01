"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignAgreementForm({
  employerId,
  version,
}: {
  employerId: string;
  version: string;
}) {
  const router = useRouter();
  const [agreed, setAgreed] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSign() {
    if (!agreed || !authorized) {
      setError("Beide bevestigingen zijn verplicht.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updErr } = await supabase
      .from("employers")
      .update({
        coop_agreement_signed_at: new Date().toISOString(),
        coop_agreement_version: version,
      })
      .eq("id", employerId);

    if (updErr) {
      setError(updErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <div className="bg-paper border-2 border-ink rounded-lg p-6">
      <h2 className="font-serif text-xl font-medium mb-3">
        Onderteken de overeenkomst
      </h2>

      <div className="space-y-3 mb-4">
        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => {
              setAgreed(e.target.checked);
              setError(null);
            }}
            className="mt-1"
          />
          <span>
            Ik heb de samenwerkingsovereenkomst volledig gelezen en ga akkoord
            met alle bepalingen, waaronder de platformfee van{" "}
            <strong>11,5% op shifts</strong> en de fee per vacature van{" "}
            <strong>€ 195 per maand ex BTW</strong> — eerste 14 dagen gratis
            per vacature, staffelkorting bij meerdere vacatures, via
            automatische incasso of op factuur.
          </span>
        </label>

        <label className="flex items-start gap-2 text-sm cursor-pointer">
          <input
            type="checkbox"
            checked={authorized}
            onChange={(e) => {
              setAuthorized(e.target.checked);
              setError(null);
            }}
            className="mt-1"
          />
          <span>
            Ik verklaar tekenbevoegd te zijn voor mijn onderneming en
            bevoegd om deze overeenkomst namens haar aan te gaan.
          </span>
        </label>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200 mb-3">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleSign}
        disabled={loading || !agreed || !authorized}
        className="bg-lime text-ink px-6 py-2.5 rounded-md font-semibold hover:bg-lime-dark disabled:opacity-50 transition-colors"
      >
        {loading ? "Ondertekenen..." : "✍ Onderteken & ga akkoord"}
      </button>

      <p className="text-xs text-stone-500 mt-3">
        Door te ondertekenen ga je akkoord met digitale handtekening volgens
        Art. 3:15a BW.
      </p>
    </div>
  );
}
