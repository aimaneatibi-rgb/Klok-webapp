"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ReactButton({ shiftId }: { shiftId: string }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
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

    // Get employee.id (NOT user.id) for the FK
    const { data: emp } = await supabase
      .from("employees")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (!emp) {
      setError("Geen werknemer-profiel gevonden.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("shift_responses")
      .insert({
        shift_id: shiftId,
        employee_id: emp.id,
        message: message || null,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    setExpanded(false);
    setMessage("");
    router.refresh();
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="bg-lime text-ink px-4 py-2 rounded-md text-sm font-semibold hover:bg-lime-dark transition-colors"
      >
        Reageer
      </button>
    );
  }

  return (
    <div className="bg-cream border border-stone-200 rounded-md p-3 w-72">
      <label className="eyebrow block mb-1.5">Bericht (optioneel)</label>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Hi! Ik heb 3 jaar ervaring..."
        rows={3}
        className="w-full px-2 py-1.5 border border-stone-200 rounded-md bg-paper text-sm focus:outline-none focus:border-ink resize-none"
      />
      {error && (
        <div className="bg-red-50 text-red-800 text-xs px-2 py-1 rounded mt-2">
          {error}
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <button
          onClick={submit}
          disabled={loading}
          className="flex-1 bg-lime text-ink px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-lime-dark disabled:opacity-50 transition-colors"
        >
          {loading ? "Versturen..." : "Verstuur"}
        </button>
        <button
          onClick={() => {
            setExpanded(false);
            setError(null);
          }}
          className="px-3 py-1.5 rounded-md text-sm text-stone-600 hover:text-ink transition-colors"
        >
          Annuleer
        </button>
      </div>
    </div>
  );
}
