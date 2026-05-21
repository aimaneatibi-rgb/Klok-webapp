import { createClient } from "@/lib/supabase/server";
import { SECTOR_LABELS } from "@/lib/sectors";
import Link from "next/link";
import { notFound } from "next/navigation";
import CrmPanel from "@/components/admin/crm-panel";
import type { FunnelStage } from "@/components/admin/crm-stage-form";

export default async function AdminMedewerkerDetailPage({
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
      *,
      users (
        email,
        phone,
        status,
        first_name,
        last_name,
        digid_verified_at,
        phone_verified_at,
        iban,
        created_at
      )
    `
    )
    .eq("id", id)
    .single();

  if (!employee) notFound();

  const user = Array.isArray(employee.users) ? employee.users[0] : employee.users;
  const fullName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") ||
    "Geen naam";
  const sectors = (employee.sectors as string[] | null) ?? [];

  const [
    { data: workedShifts, count: shiftsCount },
    { data: payouts, count: payoutsCount },
  ] = await Promise.all([
    supabase
      .from("shifts")
      .select("id, title, status, starts_at, hours_worked, hourly_rate_cents", {
        count: "exact",
      })
      .eq("assigned_employee_id", id)
      .order("starts_at", { ascending: false })
      .limit(10),
    supabase
      .from("payouts")
      .select("id, period_start, period_end, total_cents, status, paid_at", {
        count: "exact",
      })
      .eq("employee_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const ageYears = employee.date_of_birth
    ? Math.floor(
        (Date.now() - new Date(employee.date_of_birth).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link
        href="/admin/medewerkers"
        className="text-sm text-stone-600 hover:text-ink"
      >
        ← Terug naar medewerkers
      </Link>

      <div className="mb-8 mt-3 flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">— MEDEWERKER</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            {fullName}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {ageYears ? `${ageYears} jaar · ` : ""}
            {Number(employee.avg_rating) > 0
              ? `${Number(employee.avg_rating).toFixed(1)} ⭐`
              : "Geen rating"}{" "}
            · {employee.total_shifts ?? 0} shifts
          </p>
        </div>
        <Link
          href={`/admin/bekijk/werknemer/${employee.id}`}
          className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-semibold hover:bg-ink-soft transition-colors whitespace-nowrap"
        >
          👁 Bekijk hun dashboard
        </Link>
      </div>

      <CrmPanel
        targetType="employee"
        targetId={employee.id}
        initialStage={(employee.funnel_stage ?? "onboarding") as FunnelStage}
        initialNextAction={employee.next_action ?? null}
        initialNextActionDueAt={employee.next_action_due_at ?? null}
        source={employee.source ?? null}
        utmSource={employee.utm_source ?? null}
        utmMedium={employee.utm_medium ?? null}
        utmCampaign={employee.utm_campaign ?? null}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <InfoCard label="Persoonsgegevens">
          <Field label="Email">{user?.email ?? "—"}</Field>
          <Field label="Telefoon">{user?.phone ?? "—"}</Field>
          <Field label="Geboortedatum">
            {employee.date_of_birth
              ? new Date(employee.date_of_birth).toLocaleDateString("nl-NL")
              : "—"}
          </Field>
          <Field label="IBAN">
            {user?.iban ? (
              <span className="font-mono text-xs">{user.iban}</span>
            ) : (
              "—"
            )}
          </Field>
        </InfoCard>

        <InfoCard label="Werk voorkeuren">
          <Field label="Sectoren">
            {sectors.length === 0 ? (
              "—"
            ) : (
              <div className="flex flex-wrap gap-1 justify-end">
                {sectors.map((s) => (
                  <span
                    key={s}
                    className="px-1.5 py-0.5 bg-lime/20 text-lime-dark rounded text-xs"
                  >
                    {SECTOR_LABELS[s] ?? s}
                  </span>
                ))}
              </div>
            )}
          </Field>
          <Field label="Zoekradius">
            {employee.search_radius_km ?? "—"} km
          </Field>
          <Field label="Uren/week">{employee.hours_per_week ?? "—"}</Field>
          <Field label="No-shows">{employee.no_show_count ?? 0}</Field>
        </InfoCard>

        <InfoCard label="Verificatie & Status">
          <Field label="Account status">{user?.status ?? "—"}</Field>
          <Field label="Telefoon verified">
            {user?.phone_verified_at ? "✓" : "—"}
          </Field>
          <Field label="DigiD verified">
            {user?.digid_verified_at ? "✓" : "—"}
          </Field>
          <Field label="Account sinds">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("nl-NL")
              : "—"}
          </Field>
        </InfoCard>
      </div>

      <Section title={`Gewerkte shifts (${shiftsCount ?? 0})`}>
        {!workedShifts || workedShifts.length === 0 ? (
          <EmptyRow>Nog geen shifts gedaan.</EmptyRow>
        ) : (
          <ul className="divide-y divide-stone-100">
            {workedShifts.map((s) => (
              <li
                key={s.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{s.title}</div>
                  <div className="text-xs text-stone-500">
                    {new Date(s.starts_at).toLocaleDateString("nl-NL", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                    {s.hours_worked
                      ? ` · ${Number(s.hours_worked).toFixed(1)} uur`
                      : ""}{" "}
                    · € {(s.hourly_rate_cents / 100).toFixed(2)}/u
                  </div>
                </div>
                <StatusPill status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Uitbetalingen (${payoutsCount ?? 0})`}>
        {!payouts || payouts.length === 0 ? (
          <EmptyRow>Nog geen uitbetalingen.</EmptyRow>
        ) : (
          <ul className="divide-y divide-stone-100">
            {payouts.map((p) => (
              <li
                key={p.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium">
                    {new Date(p.period_start).toLocaleDateString("nl-NL")} –{" "}
                    {new Date(p.period_end).toLocaleDateString("nl-NL")}
                  </div>
                  <div className="text-xs text-stone-500">
                    {p.paid_at
                      ? `Betaald: ${new Date(p.paid_at).toLocaleDateString("nl-NL")}`
                      : "Niet betaald"}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  € {(p.total_cents / 100).toFixed(2)}
                </div>
                <StatusPill status={p.status} />
              </li>
            ))}
          </ul>
        )}
      </Section>
    </div>
  );
}

function InfoCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-5">
      <span className="eyebrow">{label}</span>
      <div className="mt-3 space-y-2">{children}</div>
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
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium text-right">{children}</span>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-paper border border-stone-200 rounded-lg mb-4 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-200 bg-stone-50">
        <h2 className="font-serif text-lg font-medium">{title}</h2>
      </div>
      {children}
    </div>
  );
}

function EmptyRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-6 text-center text-sm text-stone-500">
      {children}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-lime/20 text-lime-dark",
    confirmed: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    completed: "bg-stone-200 text-stone-700",
    cancelled: "bg-red-100 text-red-800",
    no_show: "bg-red-100 text-red-800",
    pending: "bg-amber-100 text-amber-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-lime/20 text-lime-dark",
    failed: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
        styles[status] ?? "bg-stone-100 text-stone-700"
      }`}
    >
      {status}
    </span>
  );
}
