"use client";

import { createClient } from "@/lib/supabase/client";
import {
  generateContract,
  type ContractInput,
} from "@/lib/contract-templates";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignContractModal({
  shiftId,
  contractInput,
}: {
  shiftId: string;
  contractInput: ContractInput;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contract = generateContract(contractInput);

  async function handleSign() {
    if (!agreed) {
      setError("Je moet akkoord gaan met de voorwaarden.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: updErr } = await supabase
      .from("shifts")
      .update({ contract_signed_at: new Date().toISOString() })
      .eq("id", shiftId);

    if (updErr) {
      setError(updErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-lime text-ink px-4 py-2 rounded-md text-sm font-semibold hover:bg-lime-dark transition-colors"
      >
        ✍ Teken contract
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) setOpen(false);
          }}
        >
          <div className="bg-paper rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-stone-200 flex items-start justify-between gap-4">
              <div>
                <span className="eyebrow lime">
                  — {contract.partnerLabel}
                </span>
                <h2 className="font-serif text-2xl font-medium tracking-tight mt-1">
                  {contract.title}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => !loading && setOpen(false)}
                className="text-stone-500 hover:text-ink text-2xl leading-none"
                aria-label="Sluiten"
              >
                ×
              </button>
            </div>

            {/* Contract body — scrollable */}
            <div className="px-6 py-4 overflow-y-auto flex-1 bg-cream">
              <pre className="whitespace-pre-wrap font-mono text-xs text-stone-700 leading-relaxed">
                {contract.body}
              </pre>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-stone-200 bg-paper rounded-b-xl">
              <label className="flex items-start gap-2 text-sm mb-3 cursor-pointer">
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
                  Ik heb het contract gelezen en ga akkoord met alle
                  voorwaarden. Ik verklaar bevoegd te zijn dit te ondertekenen
                  en dat alle verstrekte persoonsgegevens correct zijn.
                </span>
              </label>

              {error && (
                <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200 mb-3">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => !loading && setOpen(false)}
                  disabled={loading}
                  className="px-4 py-2 text-sm text-stone-600 hover:text-ink disabled:opacity-50"
                >
                  Annuleer
                </button>
                <button
                  type="button"
                  onClick={handleSign}
                  disabled={loading || !agreed}
                  className="bg-lime text-ink px-5 py-2 rounded-md text-sm font-semibold hover:bg-lime-dark disabled:opacity-50 transition-colors"
                >
                  {loading
                    ? "Ondertekenen..."
                    : "✍ Onderteken & ga akkoord"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
