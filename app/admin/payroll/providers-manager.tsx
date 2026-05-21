"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ProviderRow } from "./page";

type SectorOpt = { value: string; label: string };
type Draft = Omit<ProviderRow, "id"> & { id?: string };

export default function PayrollProvidersManager({
  initialProviders,
  sectorOptions,
}: {
  initialProviders: ProviderRow[];
  sectorOptions: SectorOpt[];
}) {
  const router = useRouter();
  const [providers, setProviders] = useState(initialProviders);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setDraft({
      sector: sectorOptions[0]?.value ?? "",
      provider_name: "",
      provider_legal_name: null,
      factoring_rate_bps: null,
      contract_url: null,
      notes: null,
      active: true,
    });
    setEditing("new");
    setError(null);
  }

  function startEdit(p: ProviderRow) {
    setDraft({ ...p });
    setEditing(p.id);
    setError(null);
  }

  function cancel() {
    setEditing(null);
    setDraft(null);
    setError(null);
  }

  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase
      .from("sector_payroll_providers")
      .select("*")
      .order("sector", { ascending: true })
      .order("active", { ascending: false });
    setProviders((data ?? []) as ProviderRow[]);
    router.refresh();
  }

  async function saveDraft() {
    if (!draft) return;
    if (!draft.provider_name.trim()) {
      setError("Provider naam is verplicht.");
      return;
    }
    setLoading(true);
    setError(null);

    const supabase = createClient();

    // Als nieuwe rij active=true: zet eventuele andere actieve voor deze sector op false
    if (draft.active) {
      await supabase
        .from("sector_payroll_providers")
        .update({ active: false })
        .eq("sector", draft.sector)
        .eq("active", true)
        .neq("id", draft.id ?? "00000000-0000-0000-0000-000000000000");
    }

    const payload = {
      sector: draft.sector,
      provider_name: draft.provider_name.trim(),
      provider_legal_name: draft.provider_legal_name?.trim() || null,
      factoring_rate_bps: draft.factoring_rate_bps,
      contract_url: draft.contract_url?.trim() || null,
      notes: draft.notes?.trim() || null,
      active: draft.active,
    };

    if (draft.id) {
      const { error: updErr } = await supabase
        .from("sector_payroll_providers")
        .update(payload)
        .eq("id", draft.id);
      if (updErr) {
        setError(updErr.message);
        setLoading(false);
        return;
      }
    } else {
      const { error: insErr } = await supabase
        .from("sector_payroll_providers")
        .insert(payload);
      if (insErr) {
        setError(insErr.message);
        setLoading(false);
        return;
      }
    }

    await refresh();
    setEditing(null);
    setDraft(null);
    setLoading(false);
  }

  async function deleteRow(id: string) {
    if (!confirm("Weet je zeker dat je deze koppeling wilt verwijderen?"))
      return;
    setLoading(true);
    const supabase = createClient();
    const { error: delErr } = await supabase
      .from("sector_payroll_providers")
      .delete()
      .eq("id", id);
    if (delErr) {
      setError(delErr.message);
      setLoading(false);
      return;
    }
    await refresh();
    setLoading(false);
  }

  const labelMap = Object.fromEntries(
    sectorOptions.map((s) => [s.value, s.label])
  );

  // Welke sectoren hebben geen actieve provider?
  const sectorsWithActive = new Set(
    providers.filter((p) => p.active).map((p) => p.sector)
  );
  const missingSectors = sectorOptions
    .filter((s) => !sectorsWithActive.has(s.value))
    .map((s) => s.label);

  return (
    <>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex flex-wrap gap-3 text-sm">
          <div>
            <span className="eyebrow">Actief:</span>{" "}
            <span className="font-semibold">{sectorsWithActive.size}</span> /{" "}
            {sectorOptions.length} sectoren
          </div>
          {missingSectors.length > 0 && (
            <div className="text-amber-700">
              ⚠ {missingSectors.length} sectoren zonder actieve partij
            </div>
          )}
        </div>
        {editing !== "new" && (
          <button
            type="button"
            onClick={startAdd}
            className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-semibold hover:bg-ink-soft transition-colors"
          >
            + Provider toevoegen
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200 mb-3">
          {error}
        </div>
      )}

      {/* Edit form */}
      {editing === "new" && draft && (
        <EditCard
          draft={draft}
          sectorOptions={sectorOptions}
          onChange={setDraft}
          onSave={saveDraft}
          onCancel={cancel}
          loading={loading}
        />
      )}

      {/* List */}
      <div className="bg-paper border border-stone-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-left">
                <Th>Sector</Th>
                <Th>Provider</Th>
                <Th>Factoring</Th>
                <Th>Status</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {providers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-stone-500">
                    Nog geen providers. Voeg er één toe om te beginnen.
                  </td>
                </tr>
              ) : (
                providers.map((p) =>
                  editing === p.id && draft ? (
                    <tr key={p.id}>
                      <td colSpan={5} className="px-2 py-2">
                        <EditCard
                          draft={draft}
                          sectorOptions={sectorOptions}
                          onChange={setDraft}
                          onSave={saveDraft}
                          onCancel={cancel}
                          loading={loading}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr
                      key={p.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <Td className="font-medium">
                        {labelMap[p.sector] ?? p.sector}
                      </Td>
                      <Td>
                        <div className="font-medium">{p.provider_name}</div>
                        {p.provider_legal_name && (
                          <div className="text-xs text-stone-500">
                            {p.provider_legal_name}
                          </div>
                        )}
                      </Td>
                      <Td className="font-mono text-xs">
                        {p.factoring_rate_bps != null
                          ? `${(p.factoring_rate_bps / 100).toFixed(2)}%`
                          : "—"}
                      </Td>
                      <Td>
                        {p.active ? (
                          <span className="bg-lime/20 text-lime-dark px-2 py-0.5 rounded text-xs font-semibold">
                            ✓ Actief
                          </span>
                        ) : (
                          <span className="bg-stone-100 text-stone-500 px-2 py-0.5 rounded text-xs">
                            Inactief
                          </span>
                        )}
                      </Td>
                      <Td>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            onClick={() => startEdit(p)}
                            disabled={loading || editing !== null}
                            className="text-xs px-2 py-1 rounded bg-stone-100 hover:bg-stone-200 disabled:opacity-50"
                          >
                            Bewerk
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteRow(p.id)}
                            disabled={loading}
                            className="text-xs px-2 py-1 rounded text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            Verwijder
                          </button>
                        </div>
                      </Td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

function EditCard({
  draft,
  sectorOptions,
  onChange,
  onSave,
  onCancel,
  loading,
}: {
  draft: Draft;
  sectorOptions: SectorOpt[];
  onChange: (d: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  function set<K extends keyof Draft>(k: K, v: Draft[K]) {
    onChange({ ...draft, [k]: v });
  }
  const ratePercent =
    draft.factoring_rate_bps != null ? draft.factoring_rate_bps / 100 : "";

  return (
    <div className="border-2 border-ink rounded-lg p-4 bg-paper mb-3">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <Field label="Sector *">
          <select
            value={draft.sector}
            onChange={(e) => set("sector", e.target.value)}
            className={inputClass}
          >
            {sectorOptions.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Provider naam *">
          <input
            type="text"
            required
            value={draft.provider_name}
            onChange={(e) => set("provider_name", e.target.value)}
            placeholder="Tentoo Payroll"
            className={inputClass}
          />
        </Field>
        <Field label="Juridische naam">
          <input
            type="text"
            value={draft.provider_legal_name ?? ""}
            onChange={(e) => set("provider_legal_name", e.target.value)}
            placeholder="Tentoo Payroll B.V."
            className={inputClass}
          />
        </Field>
        <Field label="Factoring rate (%)">
          <input
            type="number"
            min={0}
            max={50}
            step={0.01}
            value={ratePercent}
            onChange={(e) =>
              set(
                "factoring_rate_bps",
                e.target.value === ""
                  ? null
                  : Math.round(parseFloat(e.target.value) * 100)
              )
            }
            placeholder="3.50"
            className={inputClass}
          />
        </Field>
        <Field label="Contract template URL">
          <input
            type="url"
            value={draft.contract_url ?? ""}
            onChange={(e) => set("contract_url", e.target.value)}
            placeholder="https://tentoo.nl/contract-..."
            className={inputClass}
          />
        </Field>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={draft.active}
              onChange={(e) => set("active", e.target.checked)}
            />
            <span>Actief (1 actief per sector)</span>
          </label>
        </div>
      </div>
      <Field label="Notities (intern)">
        <textarea
          value={draft.notes ?? ""}
          onChange={(e) => set("notes", e.target.value)}
          rows={2}
          placeholder="Contactpersoon, deal-condities, etc."
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

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wider text-stone-600">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
