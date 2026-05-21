"use client";

import PhotoUploader from "@/components/photo-uploader";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const PLATFORM_FEE_RATE = 0.115;

function defaultStart() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(17, 0, 0, 0);
  return toLocalInput(d);
}

function defaultEnd() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(23, 0, 0, 0);
  return toLocalInput(d);
}

function toLocalInput(d: Date) {
  // datetime-local expects yyyy-MM-ddTHH:mm in local tz
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
    d.getDate()
  )}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function NewShiftForm({
  employerId,
}: {
  employerId: string;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startsAt, setStartsAt] = useState(defaultStart());
  const [endsAt, setEndsAt] = useState(defaultEnd());
  const [hourlyRate, setHourlyRate] = useState(18);
  const [dressCode, setDressCode] = useState("");
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Live computed values
  const startDate = new Date(startsAt);
  const endDate = new Date(endsAt);
  const isValidRange =
    !isNaN(startDate.getTime()) &&
    !isNaN(endDate.getTime()) &&
    endDate > startDate;
  const hours = isValidRange
    ? (endDate.getTime() - startDate.getTime()) / 3_600_000
    : 0;
  const grossCents = Math.round(hours * hourlyRate * 100);
  const platformFeeCents = Math.round(grossCents * PLATFORM_FEE_RATE);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!isValidRange) {
      setError("Eindtijd moet na starttijd liggen.");
      return;
    }
    if (hourlyRate < 14) {
      setError("Minimumloon is €14/uur (placeholder check).");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { data, error: insertError } = await supabase
      .from("shifts")
      .insert({
        employer_id: employerId,
        title,
        description: description || null,
        starts_at: new Date(startsAt).toISOString(),
        ends_at: new Date(endsAt).toISOString(),
        hourly_rate_cents: Math.round(hourlyRate * 100),
        contract_partner: "platform",  // shifts gaan altijd via admin-aangewezen payroll partij
        dress_code: dressCode || null,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        platform_fee_cents: platformFeeCents,
        status: "open",
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/dashboard/shifts/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Basis */}
      <Section title="Wat voor shift?">
        <Field label="Titel">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="bv. Bartender vrijdagavond"
            className={inputClass}
          />
        </Field>

        <Field label="Omschrijving (optioneel)">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Wat moet er gebeuren, ervaringsniveau, sfeer..."
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Field label="Dress code (optioneel)">
          <input
            type="text"
            value={dressCode}
            onChange={(e) => setDressCode(e.target.value)}
            placeholder="bv. Zwart shirt + nette schoenen"
            className={inputClass}
          />
        </Field>
      </Section>

      {/* Foto's */}
      <Section title={`Foto's (${mediaUrls.length}/5)`}>
        <PhotoUploader
          bucket="shift-media"
          pathPrefix={`${employerId}/`}
          value={mediaUrls}
          onChange={setMediaUrls}
          label="Optioneel. Werknemers kunnen zo de werkplek of sfeer alvast zien."
        />
      </Section>

      {/* Wanneer */}
      <Section title="Wanneer?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Start">
            <input
              type="datetime-local"
              required
              value={startsAt}
              onChange={(e) => setStartsAt(e.target.value)}
              className={inputClass}
            />
          </Field>
          <Field label="Eind">
            <input
              type="datetime-local"
              required
              value={endsAt}
              onChange={(e) => setEndsAt(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
        {!isValidRange && startsAt && endsAt && (
          <div className="text-sm text-red-700">
            Eindtijd moet na starttijd liggen.
          </div>
        )}
      </Section>

      {/* Loon */}
      <Section title="Loon">
        <Field label="Uurloon (€)">
          <input
            type="number"
            required
            min={14}
            max={200}
            step={0.5}
            value={hourlyRate}
            onChange={(e) => setHourlyRate(Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <p className="text-xs text-stone-500">
          De payroll partij voor je sector (zie boven) handelt het contract +
          loonadministratie af.
        </p>

        {/* Live calc */}
        <div className="bg-cream rounded-md p-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-stone-600">Duur</span>
            <span className="font-mono">
              {isValidRange ? `${hours.toFixed(1)} uur` : "—"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-600">Bruto loon werknemer</span>
            <span className="font-mono">€ {(grossCents / 100).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lime-dark font-semibold border-t border-stone-200 pt-1">
            <span>Platform fee (11,5%)</span>
            <span className="font-mono">
              € {(platformFeeCents / 100).toFixed(2)}
            </span>
          </div>
        </div>
      </Section>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/dashboard/shifts"
          className="px-4 py-2 text-sm text-stone-600 hover:text-ink"
        >
          Annuleer
        </Link>
        <button
          type="submit"
          disabled={loading || !isValidRange}
          className="bg-lime text-ink px-6 py-2.5 rounded-md font-semibold hover:bg-lime-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Plaatsen..." : "Shift plaatsen"}
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
