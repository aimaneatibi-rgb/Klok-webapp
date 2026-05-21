import { createClient } from "@/lib/supabase/server";
import { SECTOR_LABELS } from "@/lib/sectors";
import Link from "next/link";
import ReactButton from "./react-button";

export default async function ShiftsZoekenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Profile completeness check
  const { data: userProfile } = await supabase
    .from("users")
    .select("first_name, phone")
    .eq("id", user!.id)
    .single();

  const { data: employee } = await supabase
    .from("employees")
    .select("date_of_birth, sectors")
    .eq("user_id", user!.id)
    .single();

  const profileComplete =
    userProfile?.first_name &&
    userProfile?.phone &&
    employee?.date_of_birth &&
    employee?.sectors &&
    (employee.sectors as string[]).length > 0;

  // Existing responses from this employee — so we can mark "already responded"
  const { data: employeeRow } = await supabase
    .from("employees")
    .select("id")
    .eq("user_id", user!.id)
    .single();

  const employeeId = employeeRow?.id ?? null;

  const { data: existingResponses } = employeeId
    ? await supabase
        .from("shift_responses")
        .select("shift_id")
        .eq("employee_id", employeeId)
    : { data: [] };

  const respondedShiftIds = new Set(
    (existingResponses ?? []).map((r) => r.shift_id)
  );

  // Open shifts in de toekomst, join met employers voor bedrijfsnaam + sector
  const { data: shifts } = await supabase
    .from("shifts")
    .select(
      `
      id,
      title,
      description,
      starts_at,
      ends_at,
      hourly_rate_cents,
      dress_code,
      media_urls,
      employers (
        company_name,
        sector
      )
    `
    )
    .eq("status", "open")
    .gt("starts_at", new Date().toISOString())
    .order("starts_at", { ascending: true });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">— SHIFTS ZOEKEN</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Open shifts.
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {employee?.sectors && (employee.sectors as string[]).length > 0
              ? `Gefilterd op jouw sectoren: ${(employee.sectors as string[])
                  .map((s) => SECTOR_LABELS[s] ?? s)
                  .join(", ")}`
              : "Alle open shifts. Vul je sectoren in op je profiel om te filteren."}
          </p>
        </div>
      </div>

      {!profileComplete && (
        <div className="bg-lime/20 border border-lime rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="font-semibold text-ink">
              Je profiel is nog niet compleet.
            </div>
            <div className="text-sm text-stone-700">
              Je kan rondkijken, maar om te reageren moet je profiel compleet zijn.
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

      {!shifts || shifts.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <div className="font-serif text-xl text-stone-700 mb-2">
            Geen open shifts gevonden.
          </div>
          <div className="text-sm text-stone-500">
            Werkgevers plaatsen continu nieuwe shifts. Kom later terug of zet
            notificaties aan.
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => {
            // Supabase typings: employers is array OR object depending on relation
            const employer = Array.isArray(shift.employers)
              ? shift.employers[0]
              : shift.employers;
            const responded = respondedShiftIds.has(shift.id);
            const media = (shift.media_urls as string[] | null) ?? [];

            return (
              <ShiftCard
                key={shift.id}
                shiftId={shift.id}
                title={shift.title}
                description={shift.description}
                startsAt={shift.starts_at}
                endsAt={shift.ends_at}
                hourlyRateCents={shift.hourly_rate_cents}
                dressCode={shift.dress_code}
                thumbnailUrl={media[0] ?? null}
                companyName={employer?.company_name ?? "Onbekend bedrijf"}
                sector={employer?.sector ?? null}
                canReact={!!profileComplete && !!employeeId}
                alreadyResponded={responded}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function ShiftCard({
  shiftId,
  title,
  description,
  startsAt,
  endsAt,
  hourlyRateCents,
  dressCode,
  thumbnailUrl,
  companyName,
  sector,
  canReact,
  alreadyResponded,
}: {
  shiftId: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  hourlyRateCents: number;
  dressCode: string | null;
  thumbnailUrl: string | null;
  companyName: string;
  sector: string | null;
  canReact: boolean;
  alreadyResponded: boolean;
}) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);
  const dateLabel = start.toLocaleDateString("nl-NL", {
    weekday: "short",
    day: "numeric",
    month: "long",
  });
  const timeLabel = `${start.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  })} – ${end.toLocaleTimeString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
  const hours = (end.getTime() - start.getTime()) / 3_600_000;
  const totalCents = Math.round(hours * hourlyRateCents);
  const sectorLabel = sector ? SECTOR_LABELS[sector] ?? sector : null;

  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-5 hover:border-stone-400 transition-colors">
      <div className="flex items-start gap-4 flex-wrap">
        {thumbnailUrl && (
          <div className="shrink-0 w-20 h-20 md:w-24 md:h-24 rounded-md overflow-hidden bg-stone-100 border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thumbnailUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <div className="flex-1 min-w-[200px]">
          <div className="flex items-center gap-2 mb-1">
            <span className="eyebrow">{companyName}</span>
            {sectorLabel && (
              <span className="eyebrow lime">· {sectorLabel}</span>
            )}
          </div>
          <h3 className="font-serif text-xl font-medium tracking-tight mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-stone-600 mb-3 line-clamp-2">
              {description}
            </p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-700">
            <span>📅 {dateLabel}</span>
            <span>🕐 {timeLabel}</span>
            <span>
              💶 € {(hourlyRateCents / 100).toFixed(2)}/u · totaal € {(totalCents / 100).toFixed(2)}
            </span>
            {dressCode && <span>👔 {dressCode}</span>}
          </div>
          <div className="mt-2">
            <span
              className="inline-flex items-center gap-1 font-mono text-xs font-bold bg-lime/30 text-lime-dark px-2 py-0.5 rounded"
              title="Referral bonus — verdien dit als jij iemand voor deze shift aanbrengt (€1/u)"
            >
              ✨ € {hours.toFixed(0)} referral bonus
            </span>
          </div>
        </div>
        <div className="shrink-0">
          {alreadyResponded ? (
            <button
              disabled
              className="bg-stone-100 text-stone-500 px-4 py-2 rounded-md text-sm font-semibold cursor-not-allowed"
            >
              ✓ Gereageerd
            </button>
          ) : canReact ? (
            <ReactButton shiftId={shiftId} />
          ) : (
            <Link
              href="/werknemer/profiel"
              className="bg-stone-100 text-stone-700 px-4 py-2 rounded-md text-sm font-semibold hover:bg-stone-200 transition-colors inline-block"
            >
              Vul profiel aan
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
