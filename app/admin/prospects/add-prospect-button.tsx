"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type ProspectType = "employer" | "employee";

export default function AddProspectButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ProspectType>("employer");
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sector, setSector] = useState("");
  const [source, setSource] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setType("employer");
    setCompanyName("");
    setContactName("");
    setEmail("");
    setPhone("");
    setSector("");
    setSource("");
    setNotes("");
    setError(null);
  }

  async function submit() {
    if (!contactName.trim()) {
      setError("Contactnaam is verplicht.");
      return;
    }
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { data: newProspect, error: insErr } = await supabase
      .from("crm_prospects")
      .insert({
        type,
        company_name: companyName.trim() || null,
        contact_name: contactName.trim(),
        email: email.trim() || null,
        phone: phone.trim() || null,
        sector: sector.trim() || null,
        source: source.trim() || null,
        notes: notes.trim() || null,
        owner_user_id: user?.id ?? null,
        status: "new",
      })
      .select("id")
      .single();

    if (insErr || !newProspect) {
      setError(insErr?.message ?? "Onbekende fout");
      setSaving(false);
      return;
    }

    setSaving(false);
    setOpen(false);
    reset();
    router.push(`/admin/prospects/${newProspect.id}`);
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="bg-lime text-ink px-4 py-2 rounded-md text-sm font-semibold hover:bg-lime-dark transition-colors whitespace-nowrap"
      >
        + Nieuwe prospect
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-ink/60 z-50 flex items-center justify-center p-4">
      <div className="bg-paper rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-medium">Nieuwe prospect</h2>
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              reset();
            }}
            disabled={saving}
            className="text-stone-500 hover:text-ink text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="eyebrow block mb-1.5">Type</label>
            <div className="flex gap-2">
              {(["employer", "employee"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`flex-1 px-3 py-2 rounded-md text-sm font-semibold transition-colors ${
                    type === t
                      ? "bg-ink text-paper"
                      : "bg-cream border border-stone-200 hover:border-ink"
                  }`}
                >
                  {t === "employer" ? "Werkgever" : "Werknemer"}
                </button>
              ))}
            </div>
          </div>

          {type === "employer" && (
            <Field label="Bedrijfsnaam">
              <input
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="Restaurant Bocca"
                className={inputCls}
              />
            </Field>
          )}

          <Field label="Contactpersoon *">
            <input
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              placeholder="Jan Janssen"
              className={inputCls}
              required
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jan@bedrijf.nl"
                className={inputCls}
              />
            </Field>
            <Field label="Telefoon">
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+31 6 12345678"
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Sector">
              <input
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="horeca, retail, etc."
                className={inputCls}
              />
            </Field>
            <Field label="Bron">
              <input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="LinkedIn, beurs, koud..."
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Notities (eerste impressie)">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Wat is besproken? Wat is hun pijnpunt?"
              className={`${inputCls} resize-y`}
            />
          </Field>

          {error && (
            <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                reset();
              }}
              disabled={saving}
              className="px-4 py-2 text-sm text-stone-600 hover:text-ink"
            >
              Annuleer
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={saving || !contactName.trim()}
              className="bg-lime text-ink px-5 py-2 rounded-md text-sm font-semibold hover:bg-lime-dark disabled:opacity-40 transition-colors"
            >
              {saving ? "Opslaan..." : "Prospect aanmaken"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-3 py-2 border border-stone-200 rounded-md bg-cream text-sm focus:outline-none focus:border-ink";

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
