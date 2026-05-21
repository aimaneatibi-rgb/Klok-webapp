"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const REASONS = [
  { value: "filled_externally", label: "Vervuld via ander kanaal" },
  { value: "filled_internally", label: "Intern ingevuld" },
  { value: "no_response", label: "Te weinig / geen reacties" },
  { value: "too_expensive", label: "Kosten te hoog" },
  { value: "position_cancelled", label: "Positie komt te vervallen" },
  { value: "wrong_candidates", label: "Verkeerd type sollicitanten" },
  { value: "other", label: "Anders" },
];

export default function DeleteVacancyModal({
  vacancyId,
  employerId,
  vacancyTitle,
  createdAt,
}: {
  vacancyId: string;
  employerId: string;
  vacancyTitle: string;
  createdAt: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleDelete() {
    if (!reason) {
      setError("Kies een reden.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();

    const activeDays = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // 1) Log de deletion + feedback (audit + verbetering platform)
    const { error: logErr } = await supabase
      .from("vacancy_deletions")
      .insert({
        vacancy_id: vacancyId,
        employer_id: employerId,
        vacancy_title: vacancyTitle,
        reason,
        feedback: feedback.trim() || null,
        active_days: activeDays,
      });
    if (logErr) {
      setError(logErr.message);
      setLoading(false);
      return;
    }

    // 2) Archiveer vacature (niet hard-deleten i.v.m. data integriteit / facturen)
    const { error: updErr } = await supabase
      .from("vacancies")
      .update({ status: "archived" })
      .eq("id", vacancyId);
    if (updErr) {
      setError(updErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setOpen(false);
    router.push("/dashboard/vacatures");
    router.refresh();
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-stone-100 text-stone-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-50 hover:text-red-700 transition-colors"
      >
        🗑 Vacature verwijderen
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget && !loading) setOpen(false);
          }}
        >
          <div className="bg-paper rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="px-6 py-4 border-b border-stone-200 flex items-start justify-between">
              <div>
                <span className="eyebrow">— VERWIJDEREN</span>
                <h2 className="font-serif text-2xl font-medium tracking-tight mt-1">
                  Vertel ons waarom.
                </h2>
              </div>
              <button
                type="button"
                onClick={() => !loading && setOpen(false)}
                className="text-stone-500 hover:text-ink text-2xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-sm text-stone-600">
                Je gaat <strong>&ldquo;{vacancyTitle}&rdquo;</strong>{" "}
                verwijderen. Vanaf nu stopt de maandelijkse fee voor deze
                vacature.
              </p>

              <div>
                <label className="eyebrow block mb-2">Reden *</label>
                <div className="space-y-1.5">
                  {REASONS.map((r) => (
                    <label
                      key={r.value}
                      className="flex items-center gap-2 p-2 border border-stone-200 rounded-md hover:border-ink cursor-pointer text-sm"
                    >
                      <input
                        type="radio"
                        name="reason"
                        value={r.value}
                        checked={reason === r.value}
                        onChange={(e) => {
                          setReason(e.target.value);
                          setError(null);
                        }}
                      />
                      <span>{r.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="eyebrow block mb-1.5">
                  Toelichting (optioneel — helpt ons het platform te verbeteren)
                </label>
                <textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  rows={3}
                  placeholder="Wat had beter gekund? Wat ontbreekt op KLOK?"
                  className="w-full px-3 py-2 border border-stone-200 rounded-md bg-paper text-sm focus:outline-none focus:border-ink resize-none"
                />
              </div>

              <div className="bg-amber-50 border border-amber-300 rounded-md p-3 text-xs text-amber-900">
                <strong>Geen restitutie:</strong> voor de lopende maand vindt
                geen restitutie plaats. De factuur is al verstuurd of wordt
                pro-rata afgerond.
              </div>

              {error && (
                <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200">
                  {error}
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-stone-200 bg-cream rounded-b-xl flex justify-end gap-2">
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
                onClick={handleDelete}
                disabled={loading || !reason}
                className="bg-red-700 text-paper px-5 py-2 rounded-md text-sm font-semibold hover:bg-red-800 disabled:opacity-50 transition-colors"
              >
                {loading ? "Verwijderen..." : "🗑 Bevestig verwijderen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
