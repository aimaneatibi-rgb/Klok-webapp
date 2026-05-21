"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

const STATUSES = [
  "new",
  "contacted",
  "qualified",
  "converted",
  "unresponsive",
  "dead",
] as const;

type Status = (typeof STATUSES)[number];

const STATUS_LABELS: Record<Status, string> = {
  new: "Nieuw",
  contacted: "Benaderd",
  qualified: "Gekwalificeerd",
  converted: "Geconverteerd",
  unresponsive: "Geen reactie",
  dead: "Dood",
};

const STATUS_TONE: Record<Status, string> = {
  new: "bg-blue-100 text-blue-900",
  contacted: "bg-amber-100 text-amber-900",
  qualified: "bg-lime/30 text-lime-dark",
  converted: "bg-stone-200 text-stone-700",
  unresponsive: "bg-stone-100 text-stone-600",
  dead: "bg-red-100 text-red-900",
};

export default function ProspectStatusForm({
  prospectId,
  initialStatus,
  initialLastContactAt,
}: {
  prospectId: string;
  initialStatus: Status;
  initialLastContactAt: string | null;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<Status>(initialStatus);
  const [lastContact, setLastContact] = useState(
    initialLastContactAt ? initialLastContactAt.slice(0, 16) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    const supabase = createClient();

    const { error: updErr } = await supabase
      .from("crm_prospects")
      .update({
        status,
        last_contact_at: lastContact
          ? new Date(lastContact).toISOString()
          : null,
      })
      .eq("id", prospectId);

    if (updErr) {
      setError(updErr.message);
      setSaving(false);
      return;
    }

    // Log status-change in activity timeline
    if (status !== initialStatus) {
      await supabase.from("crm_activities").insert({
        target_type: "prospect",
        target_id: prospectId,
        kind: "stage_change",
        summary: `Status: ${STATUS_LABELS[initialStatus]} → ${STATUS_LABELS[status]}`,
      });
    }

    setSavedAt(Date.now());
    setSaving(false);
    router.refresh();
  }

  const dirty =
    status !== initialStatus ||
    lastContact !==
      (initialLastContactAt ? initialLastContactAt.slice(0, 16) : "");

  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="eyebrow">Status</span>
        {savedAt && !dirty && (
          <span className="text-xs text-lime-dark font-medium">
            ✓ Opgeslagen
          </span>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label className="eyebrow block mb-2">Funnel-status</label>
          <div className="flex flex-wrap gap-1.5">
            {STATUSES.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  status === s
                    ? STATUS_TONE[s] + " ring-2 ring-ink/40"
                    : "bg-cream border border-stone-200 text-stone-600 hover:border-ink"
                }`}
              >
                {STATUS_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="eyebrow block mb-1.5">Laatste contact</label>
          <input
            type="datetime-local"
            value={lastContact}
            onChange={(e) => setLastContact(e.target.value)}
            className="w-full px-3 py-2 border border-stone-200 rounded-md bg-cream text-sm focus:outline-none focus:border-ink"
          />
        </div>

        {error && (
          <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200">
            {error}
          </div>
        )}

        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          className="w-full bg-ink text-paper py-2 rounded-md text-sm font-semibold hover:bg-ink-soft disabled:opacity-40 transition-colors"
        >
          {saving ? "Opslaan..." : dirty ? "Wijzigingen opslaan" : "Geen wijzigingen"}
        </button>
      </div>
    </div>
  );
}
