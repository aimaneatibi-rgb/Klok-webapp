"use client";

import { createClient } from "@/lib/supabase/client";
import { SECTORS, type SectorValue } from "@/lib/sectors";
import { useRouter } from "next/navigation";
import { useState } from "react";

export type ProfileInitial = {
  first_name: string;
  last_name: string;
  phone: string;
  iban: string;
  date_of_birth: string;
  sectors: string[];
  search_radius_km: number;
  hours_per_week: number | null;
  linkedin_url: string;
};

export default function ProfileForm({
  email,
  initial,
}: {
  email: string;
  initial: ProfileInitial;
}) {
  const router = useRouter();
  const [firstName, setFirstName] = useState(initial.first_name);
  const [lastName, setLastName] = useState(initial.last_name);
  const [phone, setPhone] = useState(initial.phone);
  const [iban, setIban] = useState(initial.iban);
  const [dob, setDob] = useState(initial.date_of_birth);
  const [sectors, setSectors] = useState<string[]>(initial.sectors);
  const [radius, setRadius] = useState(initial.search_radius_km);
  const [hoursPerWeek, setHoursPerWeek] = useState<number | "">(
    initial.hours_per_week ?? ""
  );
  const [linkedin, setLinkedin] = useState(initial.linkedin_url);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function toggleSector(value: SectorValue) {
    setSectors((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("Niet ingelogd.");
      setLoading(false);
      return;
    }

    // Update users table
    const { error: userError } = await supabase
      .from("users")
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        iban: iban || null,
      })
      .eq("id", user.id);

    if (userError) {
      setError(`Profiel opslaan mislukt: ${userError.message}`);
      setLoading(false);
      return;
    }

    // Update employees table
    const { error: empError } = await supabase
      .from("employees")
      .update({
        date_of_birth: dob || null,
        sectors: sectors.length > 0 ? (sectors as SectorValue[]) : null,
        search_radius_km: radius,
        hours_per_week: hoursPerWeek === "" ? null : hoursPerWeek,
        linkedin_url: linkedin || null,
      })
      .eq("user_id", user.id);

    if (empError) {
      setError(`Werknemer-data opslaan mislukt: ${empError.message}`);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  }

  const isComplete =
    firstName.trim() &&
    phone.trim() &&
    dob &&
    sectors.length > 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Persoonlijke gegevens */}
      <Section title="Persoonlijke gegevens">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Voornaam">
            <input
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Achternaam">
            <input
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>

        <Field label="Email (kan niet gewijzigd worden)">
          <input
            type="email"
            disabled
            value={email}
            className={`${inputClass} bg-stone-100 text-stone-500`}
          />
        </Field>

        <Field label="Telefoon">
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+31 6 12345678"
            className={inputClass}
          />
        </Field>

        <Field label="Geboortedatum">
          <input
            type="date"
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            max={new Date().toISOString().slice(0, 10)}
            className={inputClass}
          />
        </Field>
      </Section>

      {/* Werkvoorkeuren */}
      <Section title="Werkvoorkeuren">
        <Field label="In welke sectoren werk je?">
          <div className="grid grid-cols-2 gap-2">
            {SECTORS.map((s) => (
              <label
                key={s.value}
                className={`flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer transition-colors ${
                  sectors.includes(s.value)
                    ? "bg-lime/20 border-lime"
                    : "bg-paper border-stone-200 hover:border-stone-400"
                }`}
              >
                <input
                  type="checkbox"
                  checked={sectors.includes(s.value)}
                  onChange={() => toggleSector(s.value)}
                  className="sr-only"
                />
                <span className="text-sm font-medium">{s.label}</span>
              </label>
            ))}
          </div>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label={`Zoekradius (${radius} km)`}>
            <input
              type="range"
              min={1}
              max={50}
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-lime"
            />
          </Field>
          <Field label="Beschikbare uren/week">
            <input
              type="number"
              min={0}
              max={60}
              value={hoursPerWeek}
              onChange={(e) =>
                setHoursPerWeek(
                  e.target.value === "" ? "" : Number(e.target.value)
                )
              }
              placeholder="bijv. 20"
              className={inputClass}
            />
          </Field>
        </div>
      </Section>

      {/* Optioneel */}
      <Section title="Optioneel">
        <Field label="IBAN (voor uitbetalingen)">
          <input
            type="text"
            value={iban}
            onChange={(e) => setIban(e.target.value.toUpperCase())}
            placeholder="NL00 BANK 0000 0000 00"
            className={inputClass}
          />
        </Field>

        <Field label="LinkedIn">
          <input
            type="url"
            value={linkedin}
            onChange={(e) => setLinkedin(e.target.value)}
            placeholder="https://linkedin.com/in/..."
            className={inputClass}
          />
        </Field>
      </Section>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-lime/20 text-ink text-sm px-3 py-2 rounded-md border border-lime">
          ✓ Profiel opgeslagen.
          {isComplete
            ? " Je profiel is compleet — je kan nu op shifts reageren."
            : " Vul nog je geboortedatum en minstens 1 sector in om compleet te zijn."}
        </div>
      )}

      <div className="flex items-center justify-between pt-4 border-t border-stone-200">
        <div className="text-sm text-stone-500">
          {isComplete ? (
            <span className="text-lime-dark font-semibold">
              ✓ Profiel compleet
            </span>
          ) : (
            <span>Niet compleet — kan nog niet reageren op shifts</span>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-lime text-ink px-6 py-2.5 rounded-md font-semibold hover:bg-lime-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Opslaan..." : "Profiel opslaan"}
        </button>
      </div>
    </form>
  );
}

const inputClass =
  "w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink";

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-6">
      <h2 className="font-serif text-xl font-medium mb-4">{title}</h2>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

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
