"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const KIND_OPTIONS: { value: string; label: string; icon: string }[] = [
  { value: "call_out", label: "Uitgaand gesprek", icon: "📞" },
  { value: "call_in", label: "Inkomend gesprek", icon: "📞" },
  { value: "email_out", label: "Uitgaande mail", icon: "✉️" },
  { value: "email_in", label: "Inkomende mail", icon: "📥" },
  { value: "meeting", label: "Meeting", icon: "🤝" },
  { value: "custom", label: "Anders", icon: "•" },
];

export default function CrmActivityForm({
  targetType,
  targetId,
}: {
  targetType: "employer" | "employee" | "prospect";
  targetId: string;
}) {
  const router = useRouter();
  const [kind, setKind] = useState("call_out");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [occurredAt, setOccurredAt] = useState(
    new Date().toISOString().slice(0, 16)
  );
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!summary.trim()) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insErr } = await supabase.from("crm_activities").insert({
      target_type: targetType,
      target_id: targetId,
      kind,
      summary: summary.trim(),
      details: details.trim() || null,
      occurred_at: new Date(occurredAt).toISOString(),
      author_user_id: user?.id ?? null,
    });

    if (insErr) {
      setError(insErr.message);
      setSaving(false);
      return;
    }

    setSummary("");
    setDetails("");
    setKind("call_out");
    setOccurredAt(new Date().toISOString().slice(0, 16));
    setExpanded(false);
    setSaving(false);
    router.refresh();
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="bg-cream border border-stone-200 hover:border-ink text-ink px-4 py-2 rounded-md text-sm font-semibold transition-colors"
      >
        + Activity loggen
      </button>
    );
  }

  return (
    <div className="bg-cream border border-stone-200 rounded-lg p-4 space-y-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="eyebrow block mb-1.5">Soort</label>
          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-md bg-paper text-sm focus:outline-none focus:border-ink"
          >
            {KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.icon} {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="eyebrow block mb-1.5">Wanneer</label>
          <input
            type="datetime-local"
            value={occurredAt}
            onChange={(e) => setOccurredAt(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-md bg-paper text-sm focus:outline-none focus:border-ink"
          />
        </div>
      </div>

      <div>
        <label className="eyebrow block mb-1.5">Samenvatting</label>
        <input
          type="text"
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Bv. 'Gebeld over uitbetaling — opgelost'"
          maxLength={200}
          className="w-full px-3 py-2 border border-stone-200 rounded-md bg-paper text-sm focus:outline-none focus:border-ink"
        />
      </div>

      <div>
        <label className="eyebrow block mb-1.5">Details (optioneel)</label>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder="Langere notitie, transcript, follow-ups..."
          rows={3}
          maxLength={4000}
          className="w-full px-3 py-2 border border-stone-200 rounded-md bg-paper text-sm focus:outline-none focus:border-ink resize-y"
        />
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-xs px-2 py-1 rounded">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
            setError(null);
          }}
          disabled={saving}
          className="px-3 py-1.5 text-sm text-stone-600 hover:text-ink"
        >
          Annuleer
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={saving || !summary.trim()}
          className="bg-ink text-paper px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-ink-soft disabled:opacity-40 transition-colors"
        >
          {saving ? "Opslaan..." : "Activity opslaan"}
        </button>
      </div>
    </div>
  );
}
