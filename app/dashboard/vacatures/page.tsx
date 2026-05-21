import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUSES = ["all", "open", "paused", "filled", "archived"] as const;
const STATUS_LABELS: Record<string, string> = {
  all: "Alle",
  open: "Open",
  paused: "Gepauzeerd",
  filled: "Ingevuld",
  archived: "Gearchiveerd",
};

function daysAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days === 0) return "Vandaag geplaatst";
  if (days === 1) return "1 dag geleden";
  return `${days} dagen geleden`;
}

export default async function VacaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = (status as (typeof STATUSES)[number]) ?? "all";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: employer } = await supabase
    .from("employers")
    .select("id, company_name, sector")
    .eq("user_id", user!.id)
    .single();

  if (!employer) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <p className="text-stone-700">
            Geen werkgever-profiel gevonden. Ga eerst naar{" "}
            <Link href="/dashboard/instellingen" className="underline">
              Instellingen
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  let query = supabase
    .from("vacancies")
    .select(
      `
      id,
      title,
      description,
      status,
      hours_per_week,
      contract_months,
      salary_min_cents,
      salary_max_cents,
      match_fee_cents,
      monthly_fee_cents,
      perks,
      media_urls,
      created_at,
      vacancy_applications ( id, status )
    `,
      { count: "exact" }
    )
    .eq("employer_id", employer.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: vacancies, count } = await query;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <span className="eyebrow">— VASTE BANEN</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Mijn vacatures ({count ?? 0})
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Plaats vaste posities. Maandelijkse fee vanaf €235/m (volume-korting
            bij meerdere vacatures).
          </p>
        </div>
        <Link
          href="/dashboard/vacatures/new"
          className="bg-lime text-ink px-4 py-2 rounded-md font-semibold text-sm hover:bg-lime-dark whitespace-nowrap"
        >
          + Nieuwe vacature
        </Link>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              s === "all"
                ? "/dashboard/vacatures"
                : `/dashboard/vacatures?status=${s}`
            }
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeStatus === s
                ? "bg-ink text-paper"
                : "bg-paper border border-stone-200 hover:border-ink"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
        <span className="ml-auto font-mono text-xs text-stone-500">
          {count ?? 0} {(count ?? 0) === 1 ? "vacature" : "vacatures"}
        </span>
      </div>

      {!vacancies || vacancies.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <div className="font-serif text-2xl text-stone-700 mb-2">
            {activeStatus === "all"
              ? "Nog geen vacatures"
              : `Geen ${STATUS_LABELS[activeStatus].toLowerCase()} vacatures`}
          </div>
          {activeStatus === "all" && (
            <>
              <p className="text-stone-500 text-sm mb-6">
                Open een vaste positie en bouw je team uit.
              </p>
              <Link
                href="/dashboard/vacatures/new"
                className="inline-block bg-ink text-paper px-5 py-2.5 rounded-md font-medium text-sm hover:bg-ink-soft"
              >
                + Eerste vacature plaatsen
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
          {vacancies.map((v) => {
            const applications = Array.isArray(v.vacancy_applications)
              ? v.vacancy_applications
              : [];
            const pendingApps = applications.filter(
              (a) => a.status === "pending"
            ).length;
            const totalApps = applications.length;
            const media = (v.media_urls as string[] | null) ?? [];
            const perks = (v.perks as string[] | null) ?? [];
            const salary =
              v.salary_min_cents && v.salary_max_cents
                ? `€${(v.salary_min_cents / 100).toFixed(0)}–€${(v.salary_max_cents / 100).toFixed(0)}`
                : v.salary_max_cents
                  ? `tot €${(v.salary_max_cents / 100).toFixed(0)}`
                  : "Op aanvraag";

            return (
              <Link
                key={v.id}
                href={`/dashboard/vacatures/${v.id}`}
                className="group bg-paper border border-stone-200 rounded-lg overflow-hidden hover:border-stone-400 transition-colors flex flex-col"
              >
                {media[0] && (
                  <div className="aspect-[16/10] bg-stone-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={media[0]}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="p-5 flex flex-col gap-3 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className="eyebrow truncate">
                      {employer.company_name}
                    </span>
                    <StatusPill status={v.status} />
                  </div>

                  <h3 className="font-serif text-xl font-medium tracking-tight leading-snug">
                    {v.title}
                  </h3>

                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-stone-700">
                    <span>⏱ {v.hours_per_week} uur/wk</span>
                    <span>
                      📜{" "}
                      {v.contract_months >= 120
                        ? "Vast"
                        : `${v.contract_months}mnd`}
                    </span>
                  </div>
                  <div className="text-sm font-semibold text-ink">
                    💶 {salary}/m
                  </div>

                  {perks.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {perks.slice(0, 3).map((p) => (
                        <span
                          key={p}
                          className="text-[11px] px-2 py-0.5 bg-cream rounded text-stone-700"
                        >
                          {p}
                        </span>
                      ))}
                      {perks.length > 3 && (
                        <span className="text-[11px] px-2 py-0.5 text-stone-500">
                          +{perks.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  {/* Werkgever-specifieke info: sollicitatie counts + fee */}
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-cream rounded p-2">
                      <div className="eyebrow text-[10px]">Sollicitaties</div>
                      <div className="font-semibold text-ink mt-0.5">
                        {totalApps}{" "}
                        {pendingApps > 0 && (
                          <span className="text-lime-dark">
                            ({pendingApps} pending)
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="bg-cream rounded p-2">
                      <div className="eyebrow text-[10px]">Match fee</div>
                      <div className="font-semibold text-ink mt-0.5">
                        € {(v.match_fee_cents / 100).toFixed(0)}
                      </div>
                    </div>
                  </div>

                  {v.monthly_fee_cents != null && (
                    <div className="text-[11px] text-stone-500 font-mono">
                      Maandelijkse fee: € {(v.monthly_fee_cents / 100).toFixed(0)}
                    </div>
                  )}

                  <div className="mt-auto pt-3 border-t border-stone-100 flex justify-between items-center">
                    <span className="font-mono text-[11px] text-stone-500">
                      {daysAgo(v.created_at)}
                    </span>
                    <span className="bg-lime text-ink px-3 py-1 rounded-md text-xs font-bold group-hover:bg-lime-dark transition-colors">
                      Beheer →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-lime/20 text-lime-dark",
    paused: "bg-amber-100 text-amber-800",
    filled: "bg-blue-100 text-blue-800",
    archived: "bg-stone-100 text-stone-600",
  };
  return (
    <span
      className={`font-mono text-[9px] font-bold uppercase tracking-[0.12em] px-1.5 py-0.5 rounded whitespace-nowrap ${
        styles[status] ?? "bg-stone-100 text-stone-700"
      }`}
    >
      {status}
    </span>
  );
}
