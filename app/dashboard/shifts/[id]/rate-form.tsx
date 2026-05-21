"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RateForm({
  shiftId,
  ratedUserId,
  employeeName,
}: {
  shiftId: string;
  ratedUserId: string;
  employeeName: string;
}) {
  const router = useRouter();
  const [stars, setStars] = useState(0);
  const [hoverStars, setHoverStars] = useState(0);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (stars < 1 || stars > 5) {
      setError("Kies een rating van 1 tot 5 sterren.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Niet ingelogd.");
      setLoading(false);
      return;
    }

    const { error: insErr } = await supabase.from("ratings").insert({
      shift_id: shiftId,
      rated_by_user_id: user.id,
      rated_user_id: ratedUserId,
      stars,
      review: review.trim() || null,
    });

    if (insErr) {
      setError(insErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    router.refresh();
  }

  const display = hoverStars || stars;

  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
      <h2 className="font-serif text-xl font-medium mb-1">
        Beoordeel {employeeName}
      </h2>
      <p className="text-sm text-stone-600 mb-4">
        Eerlijke feedback helpt andere werkgevers + helpt deze werknemer beter
        passende shifts vinden.
      </p>

      {/* Star picker */}
      <div className="mb-4">
        <div
          className="flex gap-1 text-3xl leading-none"
          onMouseLeave={() => setHoverStars(0)}
        >
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setStars(i)}
              onMouseEnter={() => setHoverStars(i)}
              className={`transition-colors cursor-pointer ${
                display >= i ? "text-lime-dark" : "text-stone-300 hover:text-stone-400"
              }`}
              aria-label={`${i} ${i === 1 ? "ster" : "sterren"}`}
            >
              {display >= i ? "★" : "☆"}
            </button>
          ))}
        </div>
        <div className="text-xs text-stone-500 mt-1 h-4">
          {display === 1 && "Zeer ontevreden"}
          {display === 2 && "Niet tevreden"}
          {display === 3 && "Oké"}
          {display === 4 && "Tevreden"}
          {display === 5 && "Uitstekend"}
        </div>
      </div>

      {/* Review */}
      <label className="eyebrow block mb-1.5">
        Toelichting (optioneel)
      </label>
      <textarea
        value={review}
        onChange={(e) => setReview(e.target.value)}
        rows={3}
        placeholder="Punctueel, vriendelijk, snelle aanpak..."
        className="w-full px-3 py-2 border border-stone-200 rounded-md bg-cream text-sm focus:outline-none focus:border-ink resize-none"
      />
      <p className="text-xs text-stone-500 mt-1">
        🔒 Alleen {employeeName} en hun referrer kunnen je toelichting lezen.
        Andere werkgevers zien alleen de sterren-rating.
      </p>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200 mt-3">
          {error}
        </div>
      )}

      <div className="flex justify-end mt-4">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || stars === 0}
          className="bg-lime text-ink px-5 py-2 rounded-md text-sm font-semibold hover:bg-lime-dark disabled:opacity-50 transition-colors"
        >
          {loading ? "Versturen..." : "Verstuur rating"}
        </button>
      </div>
    </div>
  );
}
