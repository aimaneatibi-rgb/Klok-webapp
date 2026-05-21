import { createClient } from "@/lib/supabase/server";
import { SECTOR_LABELS, getSectorEmoji } from "@/lib/sectors";
import Link from "next/link";

const PAGE_SIZE = 15;

function daysAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days === 0) return "Vandaag";
  if (days === 1) return "1 dag";
  return `${days}d`;
}

export default async function WerknemerVacaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string; page?: string }>;
}) {
  const { sector: activeSector, page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: userProfile } = await supabase
    .from("users")
    .select("first_name, phone")
    .eq("id", user!.id)
    .single();

  const { data: employee } = await supabase
    .from("employees")
    .select("id, date_of_birth, sectors")
    .eq("user_id", user!.id)
    .single();

  const profileComplete =
    userProfile?.first_name &&
    userProfile?.phone &&
    employee?.date_of_birth &&
    employee?.sectors &&
    (employee.sectors as string[]).length > 0;

  const { data: existingApps } = employee?.id
    ? await supabase
        .from("vacancy_applications")
        .select("vacancy_id, status")
        .eq("employee_id", employee.id)
    : { data: [] };

  const appliedMap = new Map(
    (existingApps ?? []).map((a) => [a.vacancy_id, a.status])
  );

  // Sector lookup voor filter pills — fetch ALLE open vacatures' sectoren (kleine count, geen pagination)
  const { data: allOpen } = await supabase
    .from("vacancies")
    .select("employers (sector)")
    .eq("status", "open");

  const availableSectors = new Set<string>();
  for (const v of allOpen ?? []) {
    const emp = Array.isArray(v.employers) ? v.employers[0] : v.employers;
    if (emp?.sector) availableSectors.add(emp.sector);
  }
  const sortedSectors = Array.from(availableSectors).sort();

  // Hoofd query met pagination + count
  let query = supabase
    .from("vacancies")
    .select(
      `
      id,
      title,
      hours_per_week,
      contract_months,
      salary_min_cents,
      salary_max_cents,
      media_urls,
      created_at,
      employers!inner (
        company_name,
        sector,
        address
      )
    `,
      { count: "exact" }
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (activeSector) {
    query = query.eq("employers.sector", activeSector);
  }

  const { data: vacancies, count } = await query.range(
    offset,
    offset + PAGE_SIZE - 1
  );

  const totalPages = Math.max(1, Math.ceil((count ?? 0) / PAGE_SIZE));

  // Build pagination URLs
  const buildPageUrl = (p: number) => {
    const params = new URLSearchParams();
    if (activeSector) params.set("sector", activeSector);
    if (p > 1) params.set("page", String(p));
    const qs = params.toString();
    return `/werknemer/vacatures${qs ? `?${qs}` : ""}`;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-5">
        <span className="eyebrow">— OPEN VACATURES</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Werk dat <em className="italic text-lime-dark">klopt.</em>
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Vaste banen bij werkgevers die kiezen voor eerlijke werving.
        </p>
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <FilterPill href="/werknemer/vacatures" active={!activeSector}>
          Alle
        </FilterPill>
        {sortedSectors.map((s) => (
          <FilterPill
            key={s}
            href={`/werknemer/vacatures?sector=${s}`}
            active={activeSector === s}
          >
            {SECTOR_LABELS[s] ?? s}
          </FilterPill>
        ))}
        <span className="ml-auto font-mono text-xs text-stone-500">
          {count ?? 0} {(count ?? 0) === 1 ? "vacature" : "vacatures"}
        </span>
      </div>

      {/* Profile incomplete banner */}
      {!profileComplete && (
        <div className="bg-lime/20 border border-lime rounded-lg p-3 mb-5 flex items-center justify-between flex-wrap gap-3">
          <div className="text-sm">
            <strong>Je profiel is nog niet compleet.</strong>{" "}
            <span className="text-stone-700">
              Vul je profiel aan om te kunnen solliciteren.
            </span>
          </div>
          <Link
            href="/werknemer/profiel"
            className="bg-ink text-paper px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-ink-soft transition-colors"
          >
            Profiel completen →
          </Link>
        </div>
      )}

      {/* Grid — compactere cards (260px min = ~4 koloms op 1100px content) */}
      {!vacancies || vacancies.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <div className="font-serif text-xl text-stone-700 mb-2">
            Geen vacatures gevonden.
          </div>
          <p className="text-sm text-stone-500">
            {activeSector
              ? "Probeer een andere sector."
              : "Werkgevers plaatsen continu nieuwe vacatures."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-3 [grid-template-columns:repeat(auto-fill,minmax(260px,1fr))]">
            {vacancies.map((v) => {
              const employer = Array.isArray(v.employers)
                ? v.employers[0]
                : v.employers;
              const sectorLabel = employer?.sector
                ? SECTOR_LABELS[employer.sector] ?? employer.sector
                : null;
              const city =
                (employer?.address as Record<string, string> | null)?.city ??
                null;
              const salary =
                v.salary_min_cents && v.salary_max_cents
                  ? `€${(v.salary_min_cents / 100).toFixed(0)}–${(v.salary_max_cents / 100).toFixed(0)}`
                  : v.salary_max_cents
                    ? `tot €${(v.salary_max_cents / 100).toFixed(0)}`
                    : "—";
              const media = (v.media_urls as string[] | null) ?? [];
              const appliedStatus = appliedMap.get(v.id);

              return (
                <VacatureCard
                  key={v.id}
                  href={`/werknemer/vacatures/${v.id}`}
                  thumbnail={media[0] ?? null}
                  sectorEmoji={getSectorEmoji(employer?.sector)}
                  company={employer?.company_name ?? "Onbekend"}
                  sectorLabel={sectorLabel}
                  title={v.title}
                  hoursPerWeek={v.hours_per_week}
                  contractMonths={v.contract_months}
                  city={city}
                  salary={salary}
                  postedAt={daysAgo(v.created_at)}
                  appliedStatus={appliedStatus}
                  profileComplete={!!profileComplete}
                />
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between flex-wrap gap-3">
              <div className="text-xs font-mono text-stone-500">
                Pagina {page} van {totalPages} · {count ?? 0}{" "}
                {(count ?? 0) === 1 ? "vacature" : "vacatures"}
              </div>
              <div className="flex items-center gap-1">
                <PageLink
                  href={buildPageUrl(page - 1)}
                  disabled={page <= 1}
                >
                  ← Vorige
                </PageLink>
                {/* Page number pills — show window */}
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
                    <span
                      key={i}
                      className="px-2 text-stone-400 text-sm"
                    >
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

/**
 * Geeft een lijst met pagina-nummers + "…" gaten terug voor pagination UI.
 * Bijv. bij page=5, totalPages=20: [1, "...", 4, 5, 6, "...", 20]
 */
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

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-ink text-paper"
          : "bg-paper border border-stone-200 hover:border-ink"
      }`}
    >
      {children}
    </Link>
  );
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

function VacatureCard({
  href,
  thumbnail,
  sectorEmoji,
  company,
  sectorLabel,
  title,
  hoursPerWeek,
  contractMonths,
  city,
  salary,
  postedAt,
  appliedStatus,
  profileComplete,
}: {
  href: string;
  thumbnail: string | null;
  sectorEmoji: string;
  company: string;
  sectorLabel: string | null;
  title: string;
  hoursPerWeek: number;
  contractMonths: number;
  city: string | null;
  salary: string;
  postedAt: string;
  appliedStatus: string | undefined;
  profileComplete: boolean;
}) {
  return (
    <Link
      href={href}
      className="group bg-paper border border-stone-200 rounded-lg overflow-hidden hover:border-stone-400 transition-colors flex flex-col"
    >
      {thumbnail ? (
        <div className="aspect-[16/9] bg-stone-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-[16/9] bg-cream border-b border-stone-100 flex items-center justify-center">
          <span className="text-5xl opacity-40 select-none">{sectorEmoji}</span>
        </div>
      )}

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <div className="flex items-start justify-between gap-1.5">
          <span className="eyebrow text-[10px] truncate">{company}</span>
          {sectorLabel && (
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] bg-lime/30 text-lime-dark px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
              {sectorLabel}
            </span>
          )}
        </div>

        <h3 className="font-serif text-base font-medium leading-snug tracking-tight line-clamp-2 min-h-[2.6em]">
          {title}
        </h3>

        <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-stone-600">
          <span>⏱ {hoursPerWeek}u</span>
          <span>
            📜 {contractMonths >= 120 ? "Vast" : `${contractMonths}m`}
          </span>
          {city && <span className="truncate">📍 {city}</span>}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="text-sm font-semibold text-ink">💶 {salary}</div>
          <span
            className="font-mono text-[10px] font-bold bg-lime/30 text-lime-dark px-1.5 py-0.5 rounded whitespace-nowrap"
            title="Referral bonus — verdien dit als jij deze vacature aanbrengt"
          >
            ✨ €100 ref
          </span>
        </div>

        <div className="mt-auto pt-2 border-t border-stone-100 flex justify-between items-center">
          <span className="font-mono text-[10px] text-stone-500">
            {postedAt}
          </span>
          <ApplyState
            status={appliedStatus}
            profileComplete={profileComplete}
          />
        </div>
      </div>
    </Link>
  );
}

function ApplyState({
  status,
  profileComplete,
}: {
  status: string | undefined;
  profileComplete: boolean;
}) {
  if (status === "accepted")
    return (
      <span className="bg-lime/20 text-lime-dark px-2 py-0.5 rounded text-[10px] font-bold">
        ✓ Aangenomen
      </span>
    );
  if (status === "rejected")
    return (
      <span className="bg-stone-100 text-stone-500 px-2 py-0.5 rounded text-[10px] font-semibold">
        Afgewezen
      </span>
    );
  if (status === "pending")
    return (
      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-semibold">
        ✓ Gesolliciteerd
      </span>
    );
  if (!profileComplete) {
    return (
      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[10px] font-semibold">
        Profiel
      </span>
    );
  }
  return (
    <span className="bg-lime text-ink px-2 py-0.5 rounded text-[10px] font-bold group-hover:bg-lime-dark transition-colors">
      Bekijk →
    </span>
  );
}
