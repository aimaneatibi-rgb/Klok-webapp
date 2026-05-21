import { createClient } from "@/lib/supabase/server";
import { SECTOR_LABELS } from "@/lib/sectors";
import Link from "next/link";

function daysAgo(iso: string) {
  const ms = Date.now() - new Date(iso).getTime();
  const days = Math.floor(ms / (1000 * 60 * 60 * 24));
  if (days === 0) return "Vandaag geplaatst";
  if (days === 1) return "1 dag geleden";
  return `${days} dagen geleden`;
}

export default async function WerknemerVacaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ sector?: string }>;
}) {
  const { sector: activeSector } = await searchParams;

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

  const { data: vacancies } = await supabase
    .from("vacancies")
    .select(
      `
      id,
      title,
      description,
      hours_per_week,
      contract_months,
      salary_min_cents,
      salary_max_cents,
      match_fee_cents,
      perks,
      media_urls,
      created_at,
      employers (
        company_name,
        sector,
        address
      )
    `
    )
    .eq("status", "open")
    .order("created_at", { ascending: false });

  // Sectoren met open vacatures
  const availableSectors = new Set<string>();
  for (const v of vacancies ?? []) {
    const emp = Array.isArray(v.employers) ? v.employers[0] : v.employers;
    if (emp?.sector) availableSectors.add(emp.sector);
  }
  const sortedSectors = Array.from(availableSectors).sort();

  const filtered = (vacancies ?? []).filter((v) => {
    if (!activeSector) return true;
    const emp = Array.isArray(v.employers) ? v.employers[0] : v.employers;
    return emp?.sector === activeSector;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header — standaard dashboard patroon */}
      <div className="mb-6">
        <span className="eyebrow">— OPEN VACATURES</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Werk dat <em className="italic text-lime-dark">klopt.</em>
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Vaste banen bij werkgevers die kiezen voor eerlijke werving.
        </p>
      </div>

      {/* Filter pills + telling — standaard dashboard stijl */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
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
          {filtered.length}{" "}
          {filtered.length === 1 ? "vacature" : "vacatures"}
        </span>
      </div>

      {/* Profile incomplete banner — zelfde stijl als elders in dashboard */}
      {!profileComplete && (
        <div className="bg-lime/20 border border-lime rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-semibold text-ink">
              Je profiel is nog niet compleet.
            </div>
            <div className="text-sm text-stone-700">
              Vul je profiel aan om te kunnen solliciteren.
            </div>
          </div>
          <Link
            href="/werknemer/profiel"
            className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-semibold hover:bg-ink-soft transition-colors"
          >
            Profiel completen →
          </Link>
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <div className="font-serif text-xl text-stone-700 mb-2">
            Geen vacatures gevonden.
          </div>
          <p className="text-sm text-stone-500">
            {activeSector
              ? "Probeer een andere sector of bekijk alle vacatures."
              : "Werkgevers plaatsen continu nieuwe vacatures. Kom later terug."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(320px,1fr))]">
          {filtered.map((v) => {
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
                ? `€${(v.salary_min_cents / 100).toFixed(0)}–€${(v.salary_max_cents / 100).toFixed(0)}`
                : v.salary_max_cents
                  ? `tot €${(v.salary_max_cents / 100).toFixed(0)}`
                  : "Op aanvraag";
            const perks = (v.perks as string[] | null) ?? [];
            const media = (v.media_urls as string[] | null) ?? [];
            const appliedStatus = appliedMap.get(v.id);

            return (
              <VacatureCard
                key={v.id}
                href={`/werknemer/vacatures/${v.id}`}
                thumbnail={media[0] ?? null}
                company={employer?.company_name ?? "Onbekend"}
                sectorLabel={sectorLabel}
                title={v.title}
                hoursPerWeek={v.hours_per_week}
                contractMonths={v.contract_months}
                city={city}
                salary={salary}
                perks={perks}
                postedAt={daysAgo(v.created_at)}
                appliedStatus={appliedStatus}
                profileComplete={!!profileComplete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
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
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
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
  company,
  sectorLabel,
  title,
  hoursPerWeek,
  contractMonths,
  city,
  salary,
  perks,
  postedAt,
  appliedStatus,
  profileComplete,
}: {
  href: string;
  thumbnail: string | null;
  company: string;
  sectorLabel: string | null;
  title: string;
  hoursPerWeek: number;
  contractMonths: number;
  city: string | null;
  salary: string;
  perks: string[];
  postedAt: string;
  appliedStatus: string | undefined;
  profileComplete: boolean;
}) {
  return (
    <Link
      href={href}
      className="group bg-paper border border-stone-200 rounded-lg overflow-hidden hover:border-stone-400 transition-colors flex flex-col"
    >
      {thumbnail && (
        <div className="aspect-[16/10] bg-stone-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnail}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-5 flex flex-col gap-3 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="eyebrow truncate">{company}</span>
          {sectorLabel && (
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] bg-lime/30 text-lime-dark px-1.5 py-0.5 rounded whitespace-nowrap shrink-0">
              {sectorLabel}
            </span>
          )}
        </div>

        <h3 className="font-serif text-xl font-medium tracking-tight leading-snug">
          {title}
        </h3>

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-stone-700">
          <span>⏱ {hoursPerWeek} uur/wk</span>
          <span>
            📜 {contractMonths >= 120 ? "Vast" : `${contractMonths}mnd`}
          </span>
          {city && <span>📍 {city}</span>}
        </div>
        <div className="text-sm font-semibold text-ink">💶 {salary}</div>

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

        <div className="mt-auto pt-3 border-t border-stone-100 flex justify-between items-center">
          <span className="font-mono text-[11px] text-stone-500">
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
      <span className="bg-lime/20 text-lime-dark px-3 py-1 rounded-md text-xs font-bold">
        ✓ Aangenomen
      </span>
    );
  if (status === "rejected")
    return (
      <span className="bg-stone-100 text-stone-500 px-3 py-1 rounded-md text-xs font-semibold">
        Afgewezen
      </span>
    );
  if (status === "pending")
    return (
      <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-md text-xs font-semibold">
        ✓ Gesolliciteerd
      </span>
    );

  if (!profileComplete) {
    return (
      <span className="bg-stone-100 text-stone-700 px-3 py-1 rounded-md text-xs font-semibold">
        Vul profiel aan
      </span>
    );
  }

  return (
    <span className="bg-lime text-ink px-3 py-1 rounded-md text-xs font-bold group-hover:bg-lime-dark transition-colors">
      Bekijk →
    </span>
  );
}
