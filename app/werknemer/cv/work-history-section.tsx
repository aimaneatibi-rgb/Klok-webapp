"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { WorkHistoryItem } from "./page";

type Draft = Omit<WorkHistoryItem, "id"> & { id?: string };

const CURRENT_YEAR = new Date().getFullYear();

export default function WorkHistorySection({
  employeeId,
  initial,
}: {
  employeeId: string;
  initial: WorkHistoryItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<WorkHistoryItem[]>(
    [...initial].sort(
      (a, b) =>
        (b.end_year ?? CURRENT_YEAR + 1) - (a.end_year ?? CURRENT_YEAR + 1)
    )
  );
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setDraft({
      company: "",
      role: "",
      start_year: CURRENT_YEAR,
      end_year: null,
      description: "",
    });
    setEditing("new");
    setError(null);
  }

  function startEdit(item: WorkHistoryItem) {
    setDraft({ ...item });
    setEditing(item.id);
    setError(null);
  }

  function cancel() {
    setEditing(null);
    setDraft(null);
    setError(null);
  }

  async function saveAll(newItems: WorkHistoryItem[]) {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: updErr } = await supabase
      .from("employees")
      .update({ work_history: newItems.length > 0 ? newItems : null })
      .eq("id", employeeId);

    if (updErr) {
      setError(updErr.message);
      setLoading(false);
      return false;
    }
    setLoading(false);
    router.refresh();
    return true;
  }

  async function saveDraft() {
    if (!draft) return;
    if (!draft.company.trim() || !draft.role.trim()) {
      setError("Bedrijfsnaam en functie zijn verplicht.");
      return;
    }
    if (draft.end_year != null && draft.end_year < draft.start_year) {
      setError("Eindjaar moet ≥ startjaar zijn.");
      return;
    }

    const sanitized: WorkHistoryItem = {
      id: draft.id ?? crypto.randomUUID(),
      company: draft.company.trim(),
      role: draft.role.trim(),
      start_year: draft.start_year,
      end_year: draft.end_year,
      description: draft.description?.trim() || null,
    };

    let next: WorkHistoryItem[];
    if (draft.id) {
      next = items.map((i) => (i.id === draft.id ? sanitized : i));
    } else {
      next = [sanitized, ...items];
    }
    next.sort(
      (a, b) =>
        (b.end_year ?? CURRENT_YEAR + 1) - (a.end_year ?? CURRENT_YEAR + 1)
    );

    const ok = await saveAll(next);
    if (ok) {
      setItems(next);
      setEditing(null);
      setDraft(null);
    }
  }

  async function deleteItem(id: string) {
    if (!confirm("Weet je zeker dat je deze ervaring wilt verwijderen?")) return;
    const next = items.filter((i) => i.id !== id);
    const ok = await saveAll(next);
    if (ok) setItems(next);
  }

  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="font-serif text-xl font-medium">
            Werkervaring ({items.length})
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Vermeld je vorige werkgevers en functies. Recente eerst.
          </p>
        </div>
        {editing !== "new" && (
          <button
            type="button"
            onClick={startAdd}
            className="bg-ink text-paper px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-ink-soft transition-colors"
          >
            + Ervaring toevoegen
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200 mb-3">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {editing === "new" && draft && (
          <EditCard
            draft={draft}
            onChange={setDraft}
            onSave={saveDraft}
            onCancel={cancel}
            loading={loading}
          />
        )}

        {items.map((item) =>
          editing === item.id && draft ? (
            <EditCard
              key={item.id}
              draft={draft}
              onChange={setDraft}
              onSave={saveDraft}
              onCancel={cancel}
              loading={loading}
            />
          ) : (
            <div
              key={item.id}
              className="border border-stone-200 rounded-md p-4 bg-cream"
            >
              <div className="flex items-start justify-between gap-2 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="font-semibold">{item.role}</div>
                  <div className="text-sm text-stone-600">
                    {item.company} ·{" "}
                    <span className="font-mono text-xs">
                      {item.start_year} – {item.end_year ?? "heden"}
                    </span>
                  </div>
                  {item.description && (
                    <p className="text-sm text-stone-700 mt-2">
                      {item.description}
                    </p>
                  )}
                </div>
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => startEdit(item)}
                    disabled={loading || editing !== null}
                    className="text-xs px-2 py-1 rounded-md bg-paper hover:bg-stone-100 border border-stone-200 disabled:opacity-50"
                  >
                    Bewerk
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteItem(item.id)}
                    disabled={loading}
                    className="text-xs px-2 py-1 rounded-md text-red-700 hover:bg-red-50 disabled:opacity-50"
                  >
                    Verwijder
                  </button>
                </div>
              </div>
            </div>
          )
        )}

        {items.length === 0 && editing !== "new" && (
          <p className="text-sm text-stone-500 text-center py-6">
            Geen werkervaring toegevoegd. Klik &lsquo;Ervaring toevoegen&rsquo;.
          </p>
        )}
      </div>
    </div>
  );
}

function EditCard({
  draft,
  onChange,
  onSave,
  onCancel,
  loading,
}: {
  draft: Draft;
  onChange: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    onChange({ ...draft, [k]: v });
  }
  return (
    <div className="border-2 border-ink rounded-md p-4 bg-paper">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <Field label="Functie *">
          <input
            type="text"
            required
            value={draft.role}
            onChange={(e) => set("role", e.target.value)}
            placeholder="Bartender"
            className={inputClass}
          />
        </Field>
        <Field label="Bedrijf *">
          <input
            type="text"
            required
            value={draft.company}
            onChange={(e) => set("company", e.target.value)}
            placeholder="Café Brecht"
            className={inputClass}
          />
        </Field>
        <Field label="Startjaar">
          <input
            type="number"
            min={1970}
            max={CURRENT_YEAR}
            value={draft.start_year}
            onChange={(e) => set("start_year", Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <Field label="Eindjaar (leeg = heden)">
          <input
            type="number"
            min={1970}
            max={CURRENT_YEAR}
            value={draft.end_year ?? ""}
            onChange={(e) =>
              set(
                "end_year",
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            placeholder="2024"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Toelichting (optioneel)">
        <textarea
          value={draft.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          rows={2}
          placeholder="Wat deed je daar, wat heb je geleerd?"
          className={`${inputClass} resize-none`}
        />
      </Field>

      <div className="flex justify-end gap-2 mt-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-3 py-1.5 text-sm text-stone-600 hover:text-ink"
        >
          Annuleer
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={loading}
          className="bg-lime text-ink px-4 py-1.5 rounded-md text-sm font-semibold hover:bg-lime-dark disabled:opacity-50"
        >
          {loading ? "Opslaan..." : "Opslaan"}
        </button>
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 border border-stone-200 rounded-md bg-paper text-sm focus:outline-none focus:border-ink";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="eyebrow block mb-1">{label}</label>
      {children}
    </div>
  );
}
