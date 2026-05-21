"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ContactRow } from "./page";

type DraftContact = {
  id?: string; // undefined als nieuw
  name: string;
  role: string;
  email: string;
  phone: string;
  is_primary: boolean;
};

export default function ContactsSection({
  employerId,
  initialContacts,
}: {
  employerId: string;
  initialContacts: ContactRow[];
}) {
  const router = useRouter();
  const [contacts, setContacts] = useState<ContactRow[]>(initialContacts);
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<DraftContact | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function startAdd() {
    setDraft({
      name: "",
      role: "",
      email: "",
      phone: "",
      is_primary: contacts.length === 0, // eerste contact = automatisch primary
    });
    setEditing("new");
    setError(null);
  }

  function startEdit(c: ContactRow) {
    setDraft({
      id: c.id,
      name: c.name,
      role: c.role ?? "",
      email: c.email,
      phone: c.phone ?? "",
      is_primary: c.is_primary,
    });
    setEditing(c.id);
    setError(null);
  }

  function cancelEdit() {
    setEditing(null);
    setDraft(null);
    setError(null);
  }

  async function saveDraft() {
    if (!draft) return;
    if (!draft.name.trim() || !draft.email.trim()) {
      setError("Naam en email zijn verplicht.");
      return;
    }

    setLoading("save");
    setError(null);
    const supabase = createClient();

    // Als deze contact primary wordt: zet anderen op niet-primary
    if (draft.is_primary) {
      const others = contacts
        .filter((c) => c.is_primary && c.id !== draft.id)
        .map((c) => c.id);
      if (others.length > 0) {
        const { error: clearErr } = await supabase
          .from("employer_contacts")
          .update({ is_primary: false })
          .in("id", others);
        if (clearErr) {
          setError(clearErr.message);
          setLoading(null);
          return;
        }
      }
    }

    if (draft.id) {
      // UPDATE
      const { error: updErr } = await supabase
        .from("employer_contacts")
        .update({
          name: draft.name,
          role: draft.role || null,
          email: draft.email,
          phone: draft.phone || null,
          is_primary: draft.is_primary,
        })
        .eq("id", draft.id);
      if (updErr) {
        setError(updErr.message);
        setLoading(null);
        return;
      }
    } else {
      // INSERT
      const { error: insErr } = await supabase
        .from("employer_contacts")
        .insert({
          employer_id: employerId,
          name: draft.name,
          role: draft.role || null,
          email: draft.email,
          phone: draft.phone || null,
          is_primary: draft.is_primary,
        });
      if (insErr) {
        setError(insErr.message);
        setLoading(null);
        return;
      }
    }

    // Refresh data
    const { data: fresh } = await supabase
      .from("employer_contacts")
      .select("*")
      .eq("employer_id", employerId)
      .order("is_primary", { ascending: false })
      .order("created_at", { ascending: true });

    setContacts((fresh ?? []) as ContactRow[]);
    setEditing(null);
    setDraft(null);
    setLoading(null);
    router.refresh();
  }

  async function deleteContact(id: string) {
    if (contacts.length <= 1) {
      setError("Er moet minstens 1 contactpersoon zijn.");
      return;
    }
    if (!confirm("Weet je zeker dat je deze contactpersoon wilt verwijderen?"))
      return;

    setLoading(id);
    setError(null);
    const supabase = createClient();

    const target = contacts.find((c) => c.id === id);
    const { error: delErr } = await supabase
      .from("employer_contacts")
      .delete()
      .eq("id", id);

    if (delErr) {
      setError(delErr.message);
      setLoading(null);
      return;
    }

    // Als de verwijderde primary was: maak eerste resterende primary
    if (target?.is_primary) {
      const remaining = contacts.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        await supabase
          .from("employer_contacts")
          .update({ is_primary: true })
          .eq("id", remaining[0].id);
      }
    }

    setContacts((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      if (target?.is_primary && updated.length > 0) {
        updated[0] = { ...updated[0], is_primary: true };
      }
      return updated;
    });
    setLoading(null);
    router.refresh();
  }

  async function setPrimary(id: string) {
    setLoading(id);
    setError(null);
    const supabase = createClient();

    // Stap 1: zet alle anderen op niet-primary
    const others = contacts.filter((c) => c.is_primary).map((c) => c.id);
    if (others.length > 0) {
      await supabase
        .from("employer_contacts")
        .update({ is_primary: false })
        .in("id", others);
    }

    // Stap 2: zet nieuwe primary
    const { error: updErr } = await supabase
      .from("employer_contacts")
      .update({ is_primary: true })
      .eq("id", id);

    if (updErr) {
      setError(updErr.message);
      setLoading(null);
      return;
    }

    setContacts((prev) =>
      prev.map((c) => ({ ...c, is_primary: c.id === id }))
    );
    setLoading(null);
    router.refresh();
  }

  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h2 className="font-serif text-xl font-medium">
            Contactpersonen ({contacts.length})
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Minstens 1 contactpersoon verplicht. ⭐ = primair (voor facturen en
            communicatie).
          </p>
        </div>
        {editing !== "new" && (
          <button
            type="button"
            onClick={startAdd}
            className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-semibold hover:bg-ink-soft transition-colors"
          >
            + Contactpersoon toevoegen
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200 mb-3">
          {error}
        </div>
      )}

      {contacts.length === 0 && editing !== "new" && (
        <div className="bg-amber-50 border border-amber-300 rounded-md p-4 mb-3 text-sm text-amber-900">
          Nog geen contactpersoon ingesteld. Voeg je eerste contact toe.
        </div>
      )}

      <div className="space-y-3">
        {editing === "new" && draft && (
          <ContactEditCard
            draft={draft}
            onChange={setDraft}
            onSave={saveDraft}
            onCancel={cancelEdit}
            loading={loading === "save"}
            isFirst={contacts.length === 0}
          />
        )}

        {contacts.map((c) =>
          editing === c.id && draft ? (
            <ContactEditCard
              key={c.id}
              draft={draft}
              onChange={setDraft}
              onSave={saveDraft}
              onCancel={cancelEdit}
              loading={loading === "save"}
              isFirst={contacts.length === 1}
            />
          ) : (
            <div
              key={c.id}
              className={`border rounded-lg p-4 ${
                c.is_primary
                  ? "border-lime bg-lime/5"
                  : "border-stone-200 bg-cream"
              }`}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-[200px]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{c.name}</span>
                    {c.is_primary && (
                      <span className="text-xs bg-lime/30 text-lime-dark px-1.5 py-0.5 rounded font-semibold">
                        ⭐ Primair
                      </span>
                    )}
                  </div>
                  {c.role && (
                    <div className="text-sm text-stone-600">{c.role}</div>
                  )}
                  <div className="text-sm text-stone-700 mt-1">
                    <a
                      href={`mailto:${c.email}`}
                      className="underline hover:text-ink"
                    >
                      {c.email}
                    </a>
                    {c.phone && (
                      <>
                        {" · "}
                        <a
                          href={`tel:${c.phone}`}
                          className="underline hover:text-ink"
                        >
                          {c.phone}
                        </a>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {!c.is_primary && (
                    <button
                      type="button"
                      onClick={() => setPrimary(c.id)}
                      disabled={loading !== null}
                      className="text-xs px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 disabled:opacity-50"
                    >
                      Maak primair
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => startEdit(c)}
                    disabled={loading !== null || editing !== null}
                    className="text-xs px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 disabled:opacity-50"
                  >
                    Bewerk
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteContact(c.id)}
                    disabled={loading !== null || contacts.length <= 1}
                    className="text-xs px-2.5 py-1 rounded-md text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={
                      contacts.length <= 1
                        ? "Minstens 1 contact verplicht"
                        : "Verwijderen"
                    }
                  >
                    {loading === c.id ? "..." : "Verwijder"}
                  </button>
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ContactEditCard({
  draft,
  onChange,
  onSave,
  onCancel,
  loading,
  isFirst,
}: {
  draft: DraftContact;
  onChange: (d: DraftContact) => void;
  onSave: () => void;
  onCancel: () => void;
  loading: boolean;
  isFirst: boolean;
}) {
  function set<K extends keyof DraftContact>(k: K, v: DraftContact[K]) {
    onChange({ ...draft, [k]: v });
  }
  return (
    <div className="border border-ink rounded-lg p-4 bg-paper">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
        <Field label="Naam *">
          <input
            type="text"
            required
            value={draft.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Jan Janssen"
            className={inputClass}
          />
        </Field>
        <Field label="Functie">
          <input
            type="text"
            value={draft.role}
            onChange={(e) => set("role", e.target.value)}
            placeholder="bv. HR Manager"
            className={inputClass}
          />
        </Field>
        <Field label="Email *">
          <input
            type="email"
            required
            value={draft.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="jan@bedrijf.nl"
            className={inputClass}
          />
        </Field>
        <Field label="Telefoon">
          <input
            type="tel"
            value={draft.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+31 6 12345678"
            className={inputClass}
          />
        </Field>
      </div>

      <label className="flex items-center gap-2 text-sm mb-3">
        <input
          type="checkbox"
          checked={draft.is_primary}
          disabled={isFirst}
          onChange={(e) => set("is_primary", e.target.checked)}
        />
        <span>
          ⭐ Primair contact{" "}
          {isFirst && (
            <span className="text-stone-500 text-xs">
              (verplicht — enige contact)
            </span>
          )}
        </span>
      </label>

      <div className="flex justify-end gap-2">
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
