"use client";

import PhotoUploader from "@/components/photo-uploader";
import { createClient } from "@/lib/supabase/client";
import { getVacancyMonthlyFee } from "@/lib/pricing";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BillingConfirmModal from "./billing-confirm-modal";

const MIN_MATCH_FEE_EUR = 100;

export default function NewVacancyForm({
  employerId,
  initialAbout,
  currentActiveCount,
}: {
  employerId: string;
  initialAbout: string;
  currentActiveCount: number;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState(32);
  const [contractMonths, setContractMonths] = useState(12);
  const [salaryMin, setSalaryMin] = useState<number | "">(2400);
  const [salaryMax, setSalaryMax] = useState<number | "">(3200);
  const [matchFee, setMatchFee] = useState(350);
  const [perksRaw, setPerksRaw] = useState("");
  const [about, setAbout] = useState(initialAbout);
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [contractType, setContractType] = useState<"direct" | "platform">(
    "direct"
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showBilling, setShowBilling] = useState(false);

  const minOk = salaryMin === "" || salaryMin > 0;
  const maxOk = salaryMax === "" || salaryMax > 0;
  const rangeOk =
    salaryMin === "" ||
    salaryMax === "" ||
    Number(salaryMax) >= Number(salaryMin);


  function handleOpenBilling(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (matchFee < MIN_MATCH_FEE_EUR) {
      setError(`Match fee moet minimaal € ${MIN_MATCH_FEE_EUR} zijn.`);
      return;
    }
    if (!rangeOk) {
      setError("Max salaris moet ≥ min salaris zijn.");
      return;
    }
    if (!title.trim()) {
      setError("Functietitel is verplicht.");
      return;
    }

    // Form ok → open billing modal voor expliciete bevestiging
    setShowBilling(true);
  }

  async function handleActualSubmit() {
    setLoading(true);
    setError(null);

    const perks = perksRaw
      .split(",")
      .map((p) => p.trim())
      .filter(Boolean);

    const supabase = createClient();

    // Update employer.about indien gewijzigd
    if (about.trim() !== initialAbout.trim()) {
      const { error: aboutErr } = await supabase
        .from("employers")
        .update({ about: about.trim() || null })
        .eq("id", employerId);
      if (aboutErr) {
        setError(`Bedrijfsbeschrijving opslaan mislukt: ${aboutErr.message}`);
        setLoading(false);
        return;
      }
    }

    // Bereken lock-in monthly fee
    const { cents: monthlyCents } = getVacancyMonthlyFee(
      currentActiveCount + 1
    );

    const { data, error: insertError } = await supabase
      .from("vacancies")
      .insert({
        employer_id: employerId,
        title,
        description: description || null,
        hours_per_week: hoursPerWeek,
        contract_months: contractMonths,
        salary_min_cents:
          salaryMin === "" ? null : Math.round(Number(salaryMin) * 100),
        salary_max_cents:
          salaryMax === "" ? null : Math.round(Number(salaryMax) * 100),
        match_fee_cents: Math.round(matchFee * 100),
        perks: perks.length > 0 ? perks : null,
        media_urls: mediaUrls.length > 0 ? mediaUrls : null,
        monthly_fee_cents: monthlyCents,
        billing_confirmed_at: new Date().toISOString(),
        contract_partner: contractType,
        listing_started_at: new Date().toISOString(),
        status: "open",
      })
      .select("id")
      .single();

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      setShowBilling(false);
      return;
    }

    router.push(`/dashboard/vacatures/${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={handleOpenBilling} className="space-y-5">
      <Section title="De vacature">
        <Field label="Functietitel">
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="bv. Sous-chef · 32 uur"
            className={inputClass}
          />
        </Field>

        <Field label="Omschrijving">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Wat is de functie, het team, sfeer, doorgroeimogelijkheden..."
            className={`${inputClass} resize-none`}
          />
        </Field>

        <Field label="Perks (komma-gescheiden, optioneel)">
          <input
            type="text"
            value={perksRaw}
            onChange={(e) => setPerksRaw(e.target.value)}
            placeholder="Reiskostenvergoeding, gratis lunch, trainingsbudget"
            className={inputClass}
          />
        </Field>
      </Section>

      {/* Foto's */}
      <Section title={`Foto's (${mediaUrls.length}/5)`}>
        <PhotoUploader
          bucket="vacancy-media"
          pathPrefix={`${employerId}/`}
          value={mediaUrls}
          onChange={setMediaUrls}
          label="Optioneel. Toon je werkplek, team of sfeer."
        />
      </Section>

      {/* Over je bedrijf — update employer.about */}
      <Section title="Over je bedrijf">
        <p className="text-xs text-stone-500 -mt-2 mb-2">
          Korte intro voor sollicitanten. Geldt voor al je vacatures — wijzig
          hier ook je algemene bedrijfsbeschrijving.
        </p>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          rows={5}
          placeholder="Vertel iets over je bedrijf, sfeer, team, missie..."
          className={`${inputClass} resize-none`}
        />
        {about !== initialAbout && (
          <p className="text-xs text-lime-dark mt-1">
            ⓘ Aangepast — wordt bij opslaan ook bijgewerkt in je bedrijfsprofiel.
          </p>
        )}
      </Section>

      <Section title="Voorwaarden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Uren per week">
            <input
              type="number"
              required
              min={1}
              max={60}
              value={hoursPerWeek}
              onChange={(e) => setHoursPerWeek(Number(e.target.value))}
              className={inputClass}
            />
          </Field>
          <Field label="Contractduur (maanden)">
            <select
              value={contractMonths}
              onChange={(e) => setContractMonths(Number(e.target.value))}
              className={inputClass}
            >
              <option value={6}>6 maanden</option>
              <option value={12}>12 maanden</option>
              <option value={24}>24 maanden</option>
              <option value={36}>36 maanden</option>
              <option value={120}>Onbepaalde tijd (vast)</option>
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Field label="Salaris min (€/maand)">
            <input
              type="number"
              min={0}
              value={salaryMin}
              onChange={(e) =>
                setSalaryMin(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="2400"
              className={inputClass}
            />
          </Field>
          <Field label="Salaris max (€/maand)">
            <input
              type="number"
              min={0}
              value={salaryMax}
              onChange={(e) =>
                setSalaryMax(e.target.value === "" ? "" : Number(e.target.value))
              }
              placeholder="3200"
              className={inputClass}
            />
          </Field>
        </div>
        {(!minOk || !maxOk || !rangeOk) && (
          <div className="text-sm text-red-700">
            Salarisbedragen moeten positief zijn, en max ≥ min.
          </div>
        )}
      </Section>

      <Section title="Contract">
        <Field label="Soort overeenkomst">
          <div className="space-y-2">
            <label className="flex items-start gap-2 p-3 border border-stone-200 rounded-md hover:border-ink cursor-pointer">
              <input
                type="radio"
                name="contractType"
                value="direct"
                checked={contractType === "direct"}
                onChange={() => setContractType("direct")}
                className="mt-1"
              />
              <div className="text-sm">
                <div className="font-semibold">Direct contract (jij bent werkgever)</div>
                <div className="text-xs text-stone-600 mt-0.5">
                  Jij sluit zelf een arbeidsovereenkomst met de kandidaat.
                  KLOK rekent alleen de match-fee bij invulling.
                </div>
              </div>
            </label>
            <label className="flex items-start gap-2 p-3 border border-stone-200 rounded-md hover:border-ink cursor-pointer">
              <input
                type="radio"
                name="contractType"
                value="platform"
                checked={contractType === "platform"}
                onChange={() => setContractType("platform")}
                className="mt-1"
              />
              <div className="text-sm">
                <div className="font-semibold">
                  Via platform-payroll (KLOK&apos;s partij)
                </div>
                <div className="text-xs text-stone-600 mt-0.5">
                  KLOK&apos;s aangewezen payroll partij voor jouw sector
                  verzorgt het contract en de loonadministratie.
                </div>
              </div>
            </label>
          </div>
        </Field>
      </Section>

      <Section title="Match fee">
        <Field label={`Match fee (€) · minimaal € ${MIN_MATCH_FEE_EUR}`}>
          <input
            type="number"
            required
            min={MIN_MATCH_FEE_EUR}
            max={5000}
            step={10}
            value={matchFee}
            onChange={(e) => setMatchFee(Number(e.target.value))}
            className={inputClass}
          />
        </Field>
        <p className="text-xs text-stone-500">
          Je betaalt deze fee alléén als je iemand aanneemt via KLOK. Hoe hoger
          de fee, hoe meer aandacht voor je vacature (en de werknemer-referrer
          krijgt € 100 bonus bij invulling).
        </p>
      </Section>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <Link
          href="/dashboard/vacatures"
          className="px-4 py-2 text-sm text-stone-600 hover:text-ink"
        >
          Annuleer
        </Link>
        <button
          type="submit"
          disabled={loading || !rangeOk}
          className="bg-lime text-ink px-6 py-2.5 rounded-md font-semibold hover:bg-lime-dark transition-colors disabled:opacity-50"
        >
          Bekijk kosten →
        </button>
      </div>

      <BillingConfirmModal
        open={showBilling}
        currentActiveCount={currentActiveCount}
        loading={loading}
        onClose={() => setShowBilling(false)}
        onConfirm={() => handleActualSubmit()}
      />
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
