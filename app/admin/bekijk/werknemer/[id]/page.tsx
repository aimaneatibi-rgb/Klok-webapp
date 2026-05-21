import { createClient } from "@/lib/supabase/server";
import { SECTOR_LABELS } from "@/lib/sectors";
import Link from "next/link";
import { notFound } from "next/navigation";

function eur(cents: number | null | undefined) {
  return `€ ${((cents ?? 0) / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function PreviewWerknemerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: employee } = await supabase
    .from("employees")
    .select(
      `
      id,
      user_id,
      date_of_birth,
      sectors,
      avg_rating,
      total_shifts,
      hours_per_week,
      search_radius_km,
      users (
        first_name,
        last_name,
        email,
        phone,
        iban
      )
    `
    )
    .eq("id", id)
    .single();

  if (!employee) notFound();

  const user = Array.isArray(employee.users)
    ? employee.users[0]
    : employee.users;
  const sectors = (employee.sectors as string[] | null) ?? [];

  const profileComplete =
    user?.first_name &&
    user?.phone &&
    employee.date_of_birth &&
    sectors.length > 0;

  const [{ data: upcomingShifts }, { data: payouts }] = await Promise.all([
    supabase
      .from("shifts")
      .select(
        `
        id, title, starts_at, ends_at, status, hourly_rate_cents,
        employers ( company_name )
      `
      )
      .eq("assigned_employee_id", id)
      .order("starts_at", { ascending: false })
      .limit(5),
    supabase
      .from("payouts")
      .select("total_cents, status, paid_at")
      .eq("employee_id", id),
  ]);

  const totalEarned = (payouts ?? [])
    .filter((p) => p.status === "paid")
    .reduce((s, p) => s + (p.total_cents ?? 0), 0);

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    "Werknemer";

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Preview banner */}
      <div className="bg-ink text-paper rounded-lg p-4 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="eyebrow lime">— ADMIN PREVIEW MODE</span>
          <div className="text-sm mt-1">
            Je kijkt naar het werknemer-dashboard van{" "}
            <strong>{displayName}</strong>. Acties zijn uitgeschakeld.
          </div>
        </div>
        <div className="flex gap-2">
          <Link
            href={`/admin/medewerkers/${employee.id}`}
            className="bg-paper text-ink px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-stone-200 transition-colors"
          >
            Medewerker details
          </Link>
          <Link
            href="/admin/medewerkers"
            className="bg-stone-700 text-paper px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-stone-600 transition-colors"
          >
            ← Terug naar admin
          </Link>
        </div>
      </div>

      {/* Greeting zoals werknemer ziet */}
      <div className="mb-8">
        <span className="eyebrow">— OVERZICHT</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Hoi, {user?.first_name || "daar"}.
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Welkom op je werknemers-dashboard. Vind shifts die bij je passen.
        </p>
      </div>

      {!profileComplete && (
        <div className="bg-lime/20 border border-lime rounded-lg p-6 mb-8">
          <span className="eyebrow text-lime-dark">— ACTIE NODIG</span>
          <h2 className="font-serif text-xl font-medium mt-2 mb-1">
            Vul je profiel aan om te kunnen reageren op shifts.
          </h2>
          <p className="text-sm text-stone-700">
            Werknemer ziet hier de prompt om naar /werknemer/profiel te gaan.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <StatCard
          label="Shifts voltooid"
          value={String(employee.total_shifts ?? 0)}
          dark
        />
        <StatCard label="Totaal verdiend" value={eur(totalEarned)} />
        <StatCard
          label="Gemiddelde rating"
          value={
            Number(employee.avg_rating) > 0
              ? `${Number(employee.avg_rating).toFixed(1)} ⭐`
              : "—"
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-paper border border-stone-200 rounded-lg p-6">
          <h2 className="font-serif text-xl font-medium mb-4">
            Recente / aankomende shifts
          </h2>
          {!upcomingShifts || upcomingShifts.length === 0 ? (
            <div className="text-stone-500 text-sm py-8 text-center">
              Nog geen shifts. Werknemer ziet aanbevolen shifts in
              /werknemer/zoeken.
            </div>
          ) : (
            <ul className="divide-y divide-stone-100">
              {upcomingShifts.map((s) => {
                const emp = Array.isArray(s.employers)
                  ? s.employers[0]
                  : s.employers;
                return (
                  <li
                    key={s.id}
                    className="py-3 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{s.title}</div>
                      <div className="text-xs text-stone-500">
                        {emp?.company_name} ·{" "}
                        {new Date(s.starts_at).toLocaleString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>
                    <StatusPill status={s.status} />
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="bg-paper border border-stone-200 rounded-lg p-6">
          <h2 className="font-serif text-xl font-medium mb-4">Profiel info</h2>
          <div className="space-y-2 text-sm">
            <Row label="Email">{user?.email ?? "—"}</Row>
            <Row label="Telefoon">{user?.phone ?? "—"}</Row>
            <Row label="Geboortedatum">
              {employee.date_of_birth
                ? new Date(employee.date_of_birth).toLocaleDateString("nl-NL")
                : "—"}
            </Row>
            <Row label="Sectoren">
              {sectors.length === 0
                ? "—"
                : sectors.map((s) => SECTOR_LABELS[s] ?? s).join(", ")}
            </Row>
            <Row label="Zoekradius">{employee.search_radius_km ?? "—"} km</Row>
            <Row label="Uren/wk">{employee.hours_per_week ?? "—"}</Row>
            <Row label="IBAN">
              {user?.iban ? (
                <span className="font-mono text-xs">{user.iban}</span>
              ) : (
                "—"
              )}
            </Row>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  dark = false,
}: {
  label: string;
  value: string;
  dark?: boolean;
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
          dark ? "text-lime" : "text-ink"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-right">{children}</span>
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
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
        styles[status] ?? "bg-stone-100"
      }`}
    >
      {status}
    </span>
  );
}
