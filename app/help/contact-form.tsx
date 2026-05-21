"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";

type Priority = "low" | "medium" | "high";

export default function ContactForm({
  userId,
  displayName,
  userEmail,
}: {
  userId: string;
  displayName: string | null;
  userEmail: string | null;
}) {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      setError("Vul een onderwerp en bericht in.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase
      .from("support_tickets")
      .insert({
        user_id: userId,
        subject: subject.trim(),
        body: body.trim(),
        priority,
        status: "open",
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setSubmitted(true);
    setSubject("");
    setBody("");
    setPriority("medium");
  }

  if (submitted) {
    return (
      <div className="bg-lime/20 border border-lime rounded-lg p-6">
        <div className="font-serif text-xl font-medium mb-2">
          ✓ Bericht ontvangen.
        </div>
        <p className="text-sm text-stone-700">
          Bedankt{displayName ? `, ${displayName}` : ""}. We reageren meestal
          binnen één werkdag op{" "}
          {userEmail ? (
            <span className="font-mono">{userEmail}</span>
          ) : (
            "het bij ons bekende emailadres"
          )}
          .
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-4 text-sm underline hover:text-ink"
        >
          Nog een vraag stellen
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="bg-paper border border-stone-200 rounded-lg p-6 space-y-4"
    >
      {(displayName || userEmail) && (
        <div className="text-xs text-stone-500">
          Je stuurt dit bericht als{" "}
          <span className="font-semibold text-ink">
            {displayName ?? userEmail}
          </span>
          {userEmail && displayName ? ` (${userEmail})` : ""}.
        </div>
      )}

      <div>
        <label className="eyebrow block mb-1.5">Onderwerp</label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Bijv. 'Vraag over factuur 2026-0123'"
          className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-cream focus:outline-none focus:border-ink"
          maxLength={120}
        />
      </div>

      <div>
        <label className="eyebrow block mb-1.5">Bericht</label>
        <textarea
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={6}
          placeholder="Beschrijf zo concreet mogelijk wat er aan de hand is. Verwijs naar shifts, vacatures of facturen als dat helpt."
          className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-cream focus:outline-none focus:border-ink resize-y"
          maxLength={4000}
        />
        <div className="text-xs text-stone-400 mt-1">{body.length} / 4000</div>
      </div>

      <div>
        <label className="eyebrow block mb-1.5">Urgentie</label>
        <div className="flex gap-2 flex-wrap">
          {(["low", "medium", "high"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPriority(p)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                priority === p
                  ? "bg-ink text-paper"
                  : "bg-cream border border-stone-200 hover:border-ink"
              }`}
            >
              {p === "low" ? "Laag" : p === "medium" ? "Normaal" : "Hoog"}
            </button>
          ))}
        </div>
        <p className="text-xs text-stone-500 mt-1.5">
          Gebruik &lsquo;Hoog&rsquo; alleen voor problemen die werk-uitvoering
          blokkeren (geen toegang, betalingsproblemen).
        </p>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-lime text-ink px-5 py-2.5 rounded-md font-semibold hover:bg-lime-dark transition-colors disabled:opacity-50"
      >
        {loading ? "Versturen..." : "Bericht versturen"}
      </button>
    </form>
  );
}
