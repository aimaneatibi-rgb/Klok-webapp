"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type FunnelStage =
  | "prospect"
  | "onboarding"
  | "active"
  | "dormant"
  | "churned";

const STAGE_LABELS: Record<FunnelStage, string> = {
  prospect: "Prospect",
  onboarding: "Onboarding",
  active: "Actief",
  dormant: "Slapend",
  churned: "Churned",
};

const STAGE_COLORS: Record<FunnelStage, string> = {
  prospect: "bg-blue-100 text-blue-900",
  onboarding: "bg-amber-100 text-amber-900",
  active: "bg-lime/30 text-lime-dark",
  dormant: "bg-stone-200 text-stone-700",
  churned: "bg-red-100 text-red-900",
};

export default function CrmStageForm({
  targetType,
  targetId,
  initialStage,
  initialNextAction,
  initialNextActionDueAt,
}: {
  targetType: "employer" | "employee";
  targetId: string;
  initialStage: FunnelStage;
  initialNextAction: string | null;
  initialNextActionDueAt: string | null;
}) {
  const router = useRouter();
  const [stage, setStage] = useState<FunnelStage>(initialStage);
  const [nextAction, setNextAction] = useState(initialNextAction ?? "");
  const [nextActionDue, setNextActionDue] = useState(
    initialNextActionDueAt ? initialNextActionDueAt.slice(0, 16) : ""
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  async function save() {
    setSaving(true);
    setError(null);

    const table = targetType === "employer" ? "employers" : "employees";
    const supabase = createClient();
    const { error: updErr } = await supabase
      .from(table)
      .update({
        funnel_stage: stage,
        next_action: nextAction.trim() || null,
        next_action_due_at: nextActionDue
          ? new Date(nextActionDue).toISOString()
          : null,
      })
      .eq("id", targetId);

    if (updErr) {
      setError(updErr.message);
      setSaving(false);
      return;
    }

    // Log activity bij stage-change (alleen als hij echt veranderde)
    if (stage !== initialStage) {
      await supabase.from("crm_activities").insert({
        target_type: targetType,
        target_id: targetId,
        kind: "stage_change",
        summary: `Stadium gewijzigd: ${STAGE_LABELS[initialStage]} → ${STAGE_LABELS[stage]}`,
      });
    }

    setSavedAt(Date.now());
    setSaving(false);
    router.refresh();
  }

  const dirty =
    stage !== initialStage ||
    (nextAction.trim() || "") !== (initialNextAction ?? "") ||
    nextActionDue !==
      (initialNextActionDueAt ? initialNextActionDueAt.slice(0, 16) : "");

  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-5">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <span className="eyebrow">CRM · stadium & actie</span>
        {savedAt && !dirty && (
          <span className="text-xs text-lime-dark font-medium">
            ✓ Opgeslagen
          </span>
        )}
      </div>

      <div className="space-y-4">
        <div>
          <label className="eyebrow block mb-2">Funnel-stadium</label>
          <div className="flex flex-wrap gap-1.5">
            {(Object.keys(STAGE_LABELS) as FunnelStage[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setStage(s)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
                  stage === s
                    ? STAGE_COLORS[s] + " ring-2 ring-ink/40"
                    : "bg-cream border border-stone-200 text-stone-600 hover:border-ink"
                }`}
              >
                {STAGE_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="eyebrow block mb-1.5">Volgende actie</label>
          <input
            type="text"
            value={nextAction}
            onChange={(e) => setNextAction(e.target.value)}
            placeholder="Bv. 'Bellen over voorstel'"
            maxLength={200}
            className="w-full px-3 py-2 border border-stone-200 rounded-md bg-cream text-sm focus:outline-none focus:border-ink"
          />
        </div>

        <div>
          <label className="eyebrow block mb-1.5">Deadline</label>
          <input
            type="datetime-local"
            value={nextActionDue}
            onChange={(e) => setNextActionDue(e.target.value)}
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
          className="w-full bg-ink text-paper py-2 rounded-md text-sm font-semibold hover:bg-ink-soft disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {saving ? "Opslaan..." : dirty ? "Wijzigingen opslaan" : "Geen wijzigingen"}
        </button>
      </div>
    </div>
  );
}
