"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CrmNoteForm({
  targetType,
  targetId,
}: {
  targetType: "employer" | "employee" | "prospect";
  targetId: string;
}) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (!body.trim()) return;
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insErr } = await supabase.from("crm_notes").insert({
      target_type: targetType,
      target_id: targetId,
      body: body.trim(),
      author_user_id: user?.id ?? null,
    });

    if (insErr) {
      setError(insErr.message);
      setSaving(false);
      return;
    }

    // Spiegel ook in activity-timeline zodat alles in één tijdlijn komt
    await supabase.from("crm_activities").insert({
      target_type: targetType,
      target_id: targetId,
      kind: "note",
      summary: body.trim().length > 80 ? body.trim().slice(0, 77) + "..." : body.trim(),
      author_user_id: user?.id ?? null,
    });

    setBody("");
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Notitie — vrij tekstveld. Wat is besproken, afgesproken, wat is de status?"
        rows={3}
        maxLength={2000}
        className="w-full px-3 py-2 border border-stone-200 rounded-md bg-paper text-sm focus:outline-none focus:border-ink resize-y"
      />
      {error && (
        <div className="bg-red-50 text-red-800 text-xs px-2 py-1 rounded">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs text-stone-400">{body.length} / 2000</span>
        <button
          type="button"
          onClick={submit}
          disabled={saving || !body.trim()}
          className="bg-lime text-ink px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-lime-dark disabled:opacity-40 transition-colors"
        >
          {saving ? "Opslaan..." : "Notitie toevoegen"}
        </button>
      </div>
    </div>
  );
}
