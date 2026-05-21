import { createClient } from "@/lib/supabase/server";
import { SECTOR_LABELS } from "@/lib/sectors";
import Link from "next/link";
import { notFound } from "next/navigation";
import ApplyForm from "./apply-form";

export default async function VacancyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: employee } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  const { data: vacancy } = await supabase
    .from("vacancies")
    .select(
      `
      *,
      employers (
        company_name,
        sector,
        about,
        website
      )
    `
    )
    .eq("id", id)
    .single();

  if (!vacancy) notFound();

  const { data: existingApp } = employee?.id
    ? await supabase
        .from("vacancy_applications")
        .select("status, cover_letter, created_at")
        .eq("vacancy_id", id)
        .eq("employee_id", employee.id)
        .maybeSingle()
    : { data: null };

  const employer = Array.isArray(vacancy.employers)
    ? vacancy.employers[0]
    : vacancy.employers;
  const perks = (vacancy.perks as string[] | null) ?? [];
  const mediaUrls = (vacancy.media_urls as string[] | null) ?? [];

  const salaryLabel =
    vacancy.salary_min_cents && vacancy.salary_max_cents
      ? `€ ${(vacancy.salary_min_cents / 100).toFixed(0)} – € ${(vacancy.salary_max_cents / 100).toFixed(0)} per maand`
      : vacancy.salary_max_cents
        ? `tot € ${(vacancy.salary_max_cents / 100).toFixed(0)} per maand`
        : "Op aanvraag";

  const isFilled = vacancy.status !== "open";
  const sectorLabel = employer?.sector
    ? SECTOR_LABELS[employer.sector] ?? employer.sector
    : null;

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <Link
        href="/werknemer/vacatures"
        className="text-sm text-stone-600 hover:text-ink"
      >
        ← Terug naar vacatures
      </Link>

      <div className="mt-3 mb-6">
        <div className="flex items-center gap-2 mb-1">
          <span className="eyebrow">{employer?.company_name}</span>
          {sectorLabel && <span className="eyebrow lime">· {sectorLabel}</span>}
        </div>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          {vacancy.title}
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          {vacancy.hours_per_week} uur/wk ·{" "}
          {vacancy.contract_months >= 120
            ? "Vast contract"
            : `${vacancy.contract_months} maanden`}{" "}
          · {salaryLabel}
        </p>
      </div>

      {/* Media gallery */}
      {mediaUrls.length > 0 && (
        <div className="mb-4">
          <div
            className={`grid gap-2 ${
              mediaUrls.length === 1
                ? "grid-cols-1"
                : "grid-cols-2 md:grid-cols-3"
            }`}
          >
            {mediaUrls.map((url, i) => (
              <div
                key={url}
                className={`bg-stone-100 rounded-lg overflow-hidden border border-stone-200 ${
                  mediaUrls.length === 1 ? "aspect-[16/9]" : "aspect-square"
                } ${i === 0 && mediaUrls.length > 2 ? "md:col-span-2 md:row-span-2 md:aspect-square" : ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`${vacancy.title} foto ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {vacancy.description && (
        <div className="bg-paper border border-stone-200 rounded-lg p-5 mb-4">
          <h2 className="eyebrow mb-2">Omschrijving</h2>
          <p className="text-sm text-stone-700 whitespace-pre-wrap">
            {vacancy.description}
          </p>
        </div>
      )}

      {perks.length > 0 && (
        <div className="bg-paper border border-stone-200 rounded-lg p-5 mb-4">
          <h2 className="eyebrow mb-3">Wat krijg je</h2>
          <div className="flex flex-wrap gap-2">
            {perks.map((p) => (
              <span
                key={p}
                className="px-3 py-1 bg-lime/20 text-lime-dark rounded-full text-sm font-medium"
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      )}

      {employer?.about && (
        <div className="bg-paper border border-stone-200 rounded-lg p-5 mb-6">
          <h2 className="eyebrow mb-2">Over {employer.company_name}</h2>
          <p className="text-sm text-stone-700">{employer.about}</p>
          {employer.website && (
            <a
              href={employer.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-ink underline mt-2 inline-block"
            >
              {employer.website} ↗
            </a>
          )}
        </div>
      )}

      {/* Sollicitatie sectie */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6">
        <h2 className="font-serif text-xl font-medium mb-4">Solliciteer</h2>

        {!employee?.id ? (
          <p className="text-sm text-stone-600">
            Je hebt nog geen werknemer-profiel. Ga naar{" "}
            <Link href="/werknemer/profiel" className="underline font-semibold">
              je profiel
            </Link>{" "}
            om dat op te zetten.
          </p>
        ) : isFilled ? (
          <p className="text-sm text-stone-600">
            Deze vacature is al ingevuld. Kijk verder bij{" "}
            <Link href="/werknemer/vacatures" className="underline">
              open vacatures
            </Link>
            .
          </p>
        ) : existingApp ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="eyebrow">Status:</span>
              <ApplicationStatus status={existingApp.status} />
            </div>
            <div className="text-xs text-stone-500 mb-3">
              Gesolliciteerd op{" "}
              {new Date(existingApp.created_at).toLocaleDateString("nl-NL", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            {existingApp.cover_letter && (
              <div className="bg-cream rounded-md p-3 text-sm whitespace-pre-wrap">
                {existingApp.cover_letter}
              </div>
            )}
          </div>
        ) : (
          <ApplyForm vacancyId={vacancy.id} employeeId={employee.id} />
        )}
      </div>
    </div>
  );
}

function ApplicationStatus({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    accepted: "bg-lime/20 text-lime-dark",
    rejected: "bg-stone-200 text-stone-500",
  };
  const labels: Record<string, string> = {
    pending: "In afwachting",
    accepted: "Aangenomen!",
    rejected: "Afgewezen",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
        styles[status] ?? "bg-stone-100"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
