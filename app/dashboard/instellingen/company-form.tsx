"use client";

import { createClient } from "@/lib/supabase/client";
import { SECTORS, type SectorValue } from "@/lib/sectors";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Initial = {
  company_name: string;
  trade_name: string;
  legal_name: string;
  kvk_number: string;
  vat_number: string;
  sector: string;
  website: string;
  about: string;
  established_at: string;
  sbi_codes: string[];
};

export default function CompanyForm({
  employerId,
  initial,
}: {
  employerId: string;
  initial: Initial;
}) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function update<K extends keyof Initial>(key: K, value: Initial[K]) {
    setData((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const { error: updErr } = await supabase
      .from("employers")
      .update({
        company_name: data.company_name,
        trade_name: data.trade_name || null,
        legal_name: data.legal_name || null,
        kvk_number: data.kvk_number || null,
        vat_number: data.vat_number || null,
        sector: data.sector as SectorValue,
        website: data.website || null,
        about: data.about || null,
        established_at: data.established_at || null,
        sbi_codes: data.sbi_codes.length > 0 ? data.sbi_codes : null,
      })
      .eq("id", employerId);

    if (updErr) {
      setError(updErr.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  }

  function handleKvkLookup() {
    setError(
      "KvK API integratie komt in volgende fase. Vul de gegevens nu handmatig in (KvK + BTW gegevens vind je op https://www.kvk.nl/zoeken)."
    );
  }

  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="font-serif text-xl font-medium">Bedrijfsgegevens</h2>
        <button
          type="button"
          onClick={handleKvkLookup}
          className="text-sm bg-stone-100 text-stone-700 px-3 py-1.5 rounded-md hover:bg-stone-200 transition-colors"
          title="KvK lookup komt in volgende fase"
        >
          🔍 Haal op uit KvK
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Bedrijfsnaam (statutair)">
          <input
            type="text"
            required
            value={data.company_name}
            onChange={(e) => update("company_name", e.target.value)}
            className={inputClass}
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Handelsnaam (KvK)">
            <input
              type="text"
              value={data.trade_name}
              onChange={(e) => update("trade_name", e.target.value)}
              placeholder="Optioneel"
              className={inputClass}
            />
          </Field>
          <Field label="Statutaire naam (formeel)">
            <input
              type="text"
              value={data.legal_name}
              onChange={(e) => update("legal_name", e.target.value)}
              placeholder="Optioneel"
              className={inputClass}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="KvK-nummer">
            <input
              type="text"
              pattern="[0-9]{8}"
              value={data.kvk_number}
              onChange={(e) => update("kvk_number", e.target.value)}
              placeholder="12345678"
              className={inputClass}
            />
          </Field>
          <Field label="BTW-nummer">
            <input
              type="text"
              value={data.vat_number}
              onChange={(e) => update("vat_number", e.target.value.toUpperCase())}
              placeholder="NL000000000B00"
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Sector">
          <select
            required
            value={data.sector}
            onChange={(e) => update("sector", e.target.value)}
            className={inputClass}
          >
            {SECTORS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Website">
            <input
              type="url"
              value={data.website}
              onChange={(e) => update("website", e.target.value)}
              placeholder="https://"
              className={inputClass}
            />
          </Field>
          <Field label="Opgericht op">
            <input
              type="date"
              value={data.established_at}
              onChange={(e) => update("established_at", e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Over het bedrijf">
          <textarea
            value={data.about}
            onChange={(e) => update("about", e.target.value)}
            rows={4}
            placeholder="Korte intro voor werknemers — wat doen jullie, sfeer, etc."
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Field label="SBI-codes (komma-gescheiden, optioneel)">
          <input
            type="text"
            value={data.sbi_codes.join(", ")}
            onChange={(e) =>
              update(
                "sbi_codes",
                e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean)
              )
            }
            placeholder="5610, 5630"
            className={inputClass}
          />
        </Field>

        {error && (
          <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-lime/20 text-ink text-sm px-3 py-2 rounded-md border border-lime">
            ✓ Bedrijfsgegevens opgeslagen.
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-stone-100">
          <button
            type="submit"
            disabled={loading}
            className="bg-lime text-ink px-5 py-2 rounded-md font-semibold hover:bg-lime-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      </form>
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="eyebrow block mb-1.5">{label}</label>
      {children}
    </div>
  );
}
