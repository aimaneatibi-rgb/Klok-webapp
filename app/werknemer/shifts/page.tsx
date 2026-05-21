import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ClockButtons from "./clock-buttons";
import SignContractModal from "./sign-contract-modal";

const STATUSES = [
  "all",
  "confirmed",
  "in_progress",
  "completed",
  "no_show",
  "cancelled",
] as const;

const STATUS_LABELS: Record<string, string> = {
  all: "Alle",
  confirmed: "Aankomend",
  in_progress: "Bezig",
  completed: "Voltooid",
  no_show: "No-show",
  cancelled: "Geannuleerd",
};

export default async function WerknemerShiftsPage({
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

  const { data: employee } = await supabase
    .from("employees")
    .select("id, total_shifts, no_show_count")
    .eq("user_id", user!.id)
    .single();

  if (!employee) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <p className="text-stone-700">
            Geen werknemer-profiel gevonden.{" "}
            <Link href="/werknemer/profiel" className="underline">
              Vul je profiel aan
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

  // Werknemer + user details voor contract generatie
  const { data: userRow } = await supabase
    .from("users")
    .select("first_name, last_name, email, iban")
    .eq("id", user!.id)
    .single();

  const { data: employeeDetails } = await supabase
    .from("employees")
    .select("date_of_birth")
    .eq("user_id", user!.id)
    .single();

  let query = supabase
    .from("shifts")
    .select(
      `
      id,
      title,
      description,
      starts_at,
      ends_at,
      hourly_rate_cents,
      hours_worked,
      clock_in_at,
      clock_out_at,
      approved_at,
      contract_signed_at,
      contract_partner,
      dress_code,
      status,
      employers (
        company_name,
        legal_name,
        kvk_number,
        sector,
        address
      )
    `,
      { count: "exact" }
    )
    .eq("assigned_employee_id", employee.id)
    .order("starts_at", { ascending: false })
    .limit(100);

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: shifts, count } = await query;

  // Fetch payroll providers voor alle sectoren die voorkomen in shifts
  const usedSectors = new Set<string>();
  for (const s of shifts ?? []) {
    const e = Array.isArray(s.employers) ? s.employers[0] : s.employers;
    if (e?.sector) usedSectors.add(e.sector);
  }
  const { data: payrollProviders } =
    usedSectors.size > 0
      ? await supabase
          .from("sector_payroll_providers")
          .select("sector, provider_name")
          .in("sector", Array.from(usedSectors))
          .eq("active", true)
      : { data: [] };
  const providerBySector = new Map(
    (payrollProviders ?? []).map((p) => [p.sector, p.provider_name])
  );

  // Totaal verdiend (alle completed)
  const { data: completedShifts } = await supabase
    .from("shifts")
    .select("hours_worked, hourly_rate_cents")
    .eq("assigned_employee_id", employee.id)
    .eq("status", "completed");

  const totalEarnedCents = (completedShifts ?? []).reduce(
    (sum, s) =>
      sum +
      Math.round((Number(s.hours_worked) || 0) * (s.hourly_rate_cents ?? 0)),
    0
  );

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— MIJN SHIFTS</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Mijn shifts ({count ?? 0})
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Shifts waar je bent geaccepteerd — aankomend en historisch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <StatCard
          label="Voltooid"
          value={String(employee.total_shifts ?? 0)}
          dark
        />
        <StatCard
          label="Totaal verdiend"
          value={`€ ${(totalEarnedCents / 100).toFixed(2)}`}
        />
        <StatCard
          label="No-shows"
          value={String(employee.no_show_count ?? 0)}
          alert={(employee.no_show_count ?? 0) > 0}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              s === "all"
                ? "/werknemer/shifts"
                : `/werknemer/shifts?status=${s}`
            }
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeStatus === s
                ? "bg-ink text-paper"
                : "bg-paper border border-stone-200 hover:border-ink"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {!shifts || shifts.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <div className="font-serif text-xl text-stone-700 mb-2">
            {activeStatus === "all"
              ? "Nog geen shifts"
              : `Geen ${STATUS_LABELS[activeStatus].toLowerCase()} shifts`}
          </div>
          {activeStatus === "all" && (
            <>
              <p className="text-stone-500 text-sm mb-6">
                Reageer op open shifts om aan de slag te gaan.
              </p>
              <Link
                href="/werknemer/zoeken"
                className="inline-block bg-lime text-ink px-5 py-2.5 rounded-md font-medium text-sm hover:bg-lime-dark"
              >
                Shifts zoeken →
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {shifts.map((s) => {
            const employer = Array.isArray(s.employers)
              ? s.employers[0]
              : s.employers;
            const start = new Date(s.starts_at);
            const end = new Date(s.ends_at);
            const plannedHours = (end.getTime() - start.getTime()) / 3_600_000;
            const actualHours = Number(s.hours_worked) || 0;
            const earnedCents =
              s.status === "completed"
                ? Math.round(actualHours * s.hourly_rate_cents)
                : Math.round(plannedHours * s.hourly_rate_cents);

            return (
              <div
                key={s.id}
                className="bg-paper border border-stone-200 rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="eyebrow">{employer?.company_name}</span>
                      <StatusPill status={s.status} />
                    </div>
                    <h3 className="font-serif text-xl font-medium tracking-tight mb-2">
                      {s.title}
                    </h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-stone-700">
                      <span>
                        📅{" "}
                        {start.toLocaleString("nl-NL", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                        })}
                      </span>
                      <span>
                        🕐{" "}
                        {start.toLocaleTimeString("nl-NL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        –{" "}
                        {end.toLocaleTimeString("nl-NL", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                        ({plannedHours.toFixed(1)}u gepland)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-serif text-xl font-semibold text-lime-dark">
                      € {(earnedCents / 100).toFixed(2)}
                    </div>
                    <div className="text-xs text-stone-500">
                      € {(s.hourly_rate_cents / 100).toFixed(2)}/u
                    </div>
                    {s.status === "completed" && actualHours > 0 && (
                      <div className="text-xs text-stone-500 mt-1">
                        {actualHours.toFixed(1)}u gewerkt
                      </div>
                    )}
                    {s.approved_at && (
                      <div className="text-xs text-lime-dark mt-1 font-semibold">
                        ✓ Goedgekeurd
                      </div>
                    )}
                  </div>
                </div>
                {/* Contract tekenen — verplicht voor confirmed shifts vóór clock-in */}
                {s.status === "confirmed" && !s.contract_signed_at && (
                  <div className="mt-4 pt-4 border-t border-stone-100 bg-amber-50 -mx-5 -mb-5 px-5 py-4 rounded-b-lg flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-semibold text-amber-900 text-sm">
                        📝 Contract nog niet ondertekend
                      </div>
                      <div className="text-xs text-amber-800 mt-0.5">
                        Onderteken het contract om te kunnen inklokken.
                      </div>
                    </div>
                    <SignContractModal
                      shiftId={s.id}
                      contractInput={{
                        partner:
                          (s.contract_partner as
                            | "platform"
                            | "direct"
                            | "tentoo"
                            | "persoonlijk_bv"
                            | "other") ?? "platform",
                        providerName:
                          providerBySector.get(employer?.sector ?? "") ??
                          undefined,
                        shift: {
                          title: s.title,
                          description: s.description ?? null,
                          starts_at: s.starts_at,
                          ends_at: s.ends_at,
                          hourly_rate_cents: s.hourly_rate_cents,
                          dress_code: s.dress_code ?? null,
                        },
                        employer: {
                          company_name: employer?.company_name ?? "",
                          legal_name: employer?.legal_name ?? null,
                          kvk_number: employer?.kvk_number ?? null,
                          sector: employer?.sector ?? "",
                          address:
                            (employer?.address as Record<
                              string,
                              string
                            > | null) ?? null,
                        },
                        employee: {
                          fullName:
                            [userRow?.first_name, userRow?.last_name]
                              .filter(Boolean)
                              .join(" ") || (userRow?.email ?? ""),
                          email: userRow?.email ?? "",
                          date_of_birth:
                            employeeDetails?.date_of_birth ?? null,
                          iban: userRow?.iban ?? null,
                        },
                      }}
                    />
                  </div>
                )}

                {/* Signed indicator (subtiel) — laat zien dat contract al ondertekend is */}
                {s.contract_signed_at && s.status !== "cancelled" && (
                  <div className="mt-3 text-xs text-stone-500 flex items-center gap-1">
                    <span className="text-lime-dark">✓</span> Contract ondertekend
                    op{" "}
                    {new Date(s.contract_signed_at).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                    })}
                  </div>
                )}

                {/* Clock in/out buttons — alleen als contract ondertekend */}
                {s.contract_signed_at &&
                  (s.status === "confirmed" ||
                    (s.status === "in_progress" &&
                      s.clock_in_at &&
                      !s.clock_out_at) ||
                    (s.status === "completed" &&
                      s.clock_out_at &&
                      !s.approved_at)) && (
                    <div className="mt-4 pt-4 border-t border-stone-100 flex justify-end">
                      <ClockButtons
                        shiftId={s.id}
                        shiftStatus={s.status}
                        clockInAt={s.clock_in_at}
                        clockOutAt={s.clock_out_at}
                        hourlyRateCents={s.hourly_rate_cents}
                      />
                    </div>
                  )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  dark = false,
  alert = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
  alert?: boolean;
}) {
  return (
    <div
      className={`p-5 rounded-lg border ${
        dark ? "bg-ink text-paper border-ink" : "bg-paper border-stone-200"
      }`}
    >
      <div className={`eyebrow ${dark ? "text-stone-400" : ""}`}>{label}</div>
      <div
        className={`font-serif text-3xl font-medium tracking-tight mt-2 ${
          dark ? "text-lime" : alert ? "text-red-700" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    confirmed: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    completed: "bg-lime/20 text-lime-dark",
    cancelled: "bg-stone-200 text-stone-500",
    no_show: "bg-red-100 text-red-800",
  };
  const labels: Record<string, string> = {
    confirmed: "Aankomend",
    in_progress: "Bezig",
    completed: "Voltooid",
    cancelled: "Geannuleerd",
    no_show: "No-show",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
        styles[status] ?? "bg-stone-100"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}
