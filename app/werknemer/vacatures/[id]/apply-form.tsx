"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ApplyForm({
  vacancyId,
  employeeId,
}: {
  vacancyId: string;
  employeeId: string;
}) {
  const router = useRouter();
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("vacancy_applications")
      .insert({
        vacancy_id: vacancyId,
        employee_id: employeeId,
        cover_letter: coverLetter || null,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="eyebrow block mb-1.5">
          Motivatie (optioneel maar aanbevolen)
        </label>
        <textarea
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          rows={5}
          placeholder="Waarom past deze vacature bij jou? Wat is je ervaring?"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink resize-none"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-lime text-ink px-6 py-2.5 rounded-md font-semibold hover:bg-lime-dark transition-colors disabled:opacity-50"
      >
        {loading ? "Versturen..." : "Solliciteer"}
      </button>
    </form>
  );
}
