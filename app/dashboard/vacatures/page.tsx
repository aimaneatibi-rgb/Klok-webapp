import { createClient } from "@/lib/supabase/server";
import { getSectorEmoji } from "@/lib/sectors";
import Link from "next/link";

const PAGE_SIZE = 15;

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
  if (days === 0) return "Vandaag";
  if (days === 1) return "1 dag";
  return `${days}d`;
}

export default async function VacaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>;
}) {
  const { status, page: pageParam } = await searchParams;
  const activeStatus = (status as (typeof STATUSES)[number]) ?? "all";
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

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
      status,
      hours_per_week,
      contract_months,
      salary_min_cents,
      salary_max_cents,
      match_fee_cents,
      monthly_fee_cents,
      media_urls,
      created_at,
      vacancy_applications ( id, status )
    `,
      { count: "exact" }
    )
    .eq("employer_id", employer.id)
    .order("created_at", { ascending: false });

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: vacancies, count } = await query.range(
    offset,
    offset + PAGE_SIZE - 1
  );
  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (activeStatus !== "all") params.set("status", activeStatus);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/dashboard/vacatures${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-5 flex-wrap gap-4">
        <div>
          <span className="eyebrow">— VASTE BANEN</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Mijn vacatures ({count ?? 0})
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Plaats vaste posities. De eerste 50 dagen gratis; daarna € 195 per
            vacature per maand (ex btw) via automatische incasso.
          </p>
        </div>
        <Link
          href="/dashboard/vacatures/new"
          className="bg-lime text-ink px-4 py-2 rounded-md font-semibold text-sm hover:bg-lime-dark whitespace-nowrap"
        >
          + Nieuwe vacature
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              s === "all"
                ? "/dashboard/vacatures"
                : `/dashboard/vacatures?status=${s}`
            }
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
              activeStatus === s
                ? "bg-ink text-paper"
                : "bg-paper border border-stone-200 hover:border-ink"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
        <span className="ml-auto font-mono text-xs text-stone-500">
          {count ?? 0} totaal
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
        <>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {vacancies.map((v) => {
              const applications = Array.isArray(v.vacancy_applications)
                ? v.vacancy_applications
                : [];
              const pendingApps = applications.filter(
                (a) => a.status === "pending"
              ).length;
              const totalApps = applications.length;
              const media = (v.media_urls as string[] | null) ?? [];
              const salary =
                v.salary_min_cents && v.salary_max_cents
                  ? `€${(v.salary_min_cents / 100).toFixed(0)}–${(v.salary_max_cents / 100).toFixed(0)}`
                  : v.salary_max_cents
                    ? `tot €${(v.salary_max_cents / 100).toFixed(0)}`
                    : "—";

              return (
                <Link
                  key={v.id}
                  href={`/dashboard/vacatures/${v.id}`}
                  className="group bg-paper border border-stone-200 rounded-lg overflow-hidden hover:border-stone-400 transition-colors flex flex-col"
                >
                  {media[0] ? (
                    <div className="aspect-[16/9] bg-stone-100 overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={media[0]}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="aspect-[16/9] bg-cream border-b border-stone-100 flex items-center justify-center">
                      <span className="text-5xl opacity-40 select-none">
                        {getSectorEmoji(employer.sector)}
                      </span>
                    </div>
                  )}

                  <div className="p-3 flex flex-col gap-1.5 flex-1">
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="eyebrow text-[10px] truncate">
                        {employer.company_name}
                      </span>
                      <StatusPill status={v.status} />
                    </div>

                    <h3 className="font-serif text-base font-medium leading-snug tracking-tight line-clamp-2 min-h-[2.6em]">
                      {v.title}
                    </h3>

                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-stone-600">
                      <span>⏱ {v.hours_per_week}u</span>
                      <span>
                        📜 {v.contract_months >= 120 ? "Vast" : `${v.contract_months}m`}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-ink">
                      💶 {salary}/m
                    </div>

                    {/* Sollicitatie counter */}
                    <div className="flex gap-1.5 text-[10px]">
                      <span className="bg-cream px-1.5 py-0.5 rounded">
                        {totalApps} {totalApps === 1 ? "sollicitatie" : "sollicitaties"}
                      </span>
                      {pendingApps > 0 && (
                        <span className="bg-lime/20 text-lime-dark px-1.5 py-0.5 rounded font-semibold">
                          {pendingApps} pending
                        </span>
                      )}
                    </div>

                    <div className="mt-auto pt-2 border-t border-stone-100 flex justify-between items-center">
                      <span className="font-mono text-[10px] text-stone-500">
                        {daysAgo(v.created_at)}
                      </span>
                      <span className="bg-lime text-ink px-2 py-0.5 rounded text-[10px] font-bold group-hover:bg-lime-dark transition-colors">
                        Beheer →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs font-mono text-stone-500">
                Pagina {page} van {totalPages} · {count ?? 0} vacatures
              </div>
              <div className="flex items-center gap-1">
                <PageLink href={buildPageUrl(page - 1)} disabled={page <= 1}>
                  ← Vorige
                </PageLink>
                {generatePageNumbers(page, totalPages).map((p, i) =>
                  typeof p === "number" ? (
                    <PageLink
                      key={i}
                      href={buildPageUrl(p)}
                      active={p === page}
                    >
                      {p}
                    </PageLink>
                  ) : (
                    <span key={i} className="px-2 text-stone-400 text-sm">
                      …
                    </span>
                  )
                )}
                <PageLink
                  href={buildPageUrl(page + 1)}
                  disabled={page >= totalPages}
                >
                  Volgende →
                </PageLink>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function generatePageNumbers(
  current: number,
  total: number
): (number | "...")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const result: (number | "...")[] = [1];
  if (current > 3) result.push("...");
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) {
    result.push(p);
  }
  if (current < total - 2) result.push("...");
  result.push(total);
  return result;
}

function PageLink({
  href,
  children,
  disabled = false,
  active = false,
}: {
  href: string;
  children: React.ReactNode;
  disabled?: boolean;
  active?: boolean;
}) {
  if (disabled) {
    return (
      <span className="px-2.5 py-1 rounded-md text-xs font-medium text-stone-300 cursor-not-allowed">
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors min-w-[32px] text-center ${
        active
          ? "bg-ink text-paper"
          : "bg-paper border border-stone-200 hover:border-ink"
      }`}
    >
      {children}
    </Link>
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
      className={`font-mono text-[9px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded whitespace-nowrap ${
        styles[status] ?? "bg-stone-100 text-stone-700"
      }`}
    >
      {status}
    </span>
  );
}
