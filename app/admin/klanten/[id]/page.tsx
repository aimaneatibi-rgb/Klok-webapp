import { createClient } from "@/lib/supabase/server";
import { SECTOR_LABELS } from "@/lib/sectors";
import Link from "next/link";
import { notFound } from "next/navigation";
import CrmPanel from "@/components/admin/crm-panel";
import type { FunnelStage } from "@/components/admin/crm-stage-form";

export default async function AdminKlantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: employer } = await supabase
    .from("employers")
    .select(
      `
      *,
      users (
        email,
        phone,
        status,
        created_at
      )
    `
    )
    .eq("id", id)
    .single();

  if (!employer) notFound();

  const user = Array.isArray(employer.users) ? employer.users[0] : employer.users;

  const [
    { data: shifts, count: shiftCount },
    { data: vacancies, count: vacancyCount },
    { data: invoices, count: invoiceCount },
  ] = await Promise.all([
    supabase
      .from("shifts")
      .select("id, title, status, starts_at, hourly_rate_cents", {
        count: "exact",
      })
      .eq("employer_id", id)
      .order("starts_at", { ascending: false })
      .limit(10),
    supabase
      .from("vacancies")
      .select("id, title, status, match_fee_cents, created_at", {
        count: "exact",
      })
      .eq("employer_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("invoices")
      .select("id, invoice_number, total_cents, status, due_date", {
        count: "exact",
      })
      .eq("employer_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <Link
        href="/admin/klanten"
        className="text-sm text-stone-600 hover:text-ink"
      >
        ← Terug naar klanten
      </Link>

      <div className="mb-8 mt-3 flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">— KLANT</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            {employer.company_name}
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            {SECTOR_LABELS[employer.sector] ?? employer.sector} · sinds{" "}
            {new Date(employer.created_at).toLocaleDateString("nl-NL", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
        <Link
          href={`/admin/bekijk/werkgever/${employer.id}`}
          className="bg-ink text-paper px-4 py-2 rounded-md text-sm font-semibold hover:bg-ink-soft transition-colors whitespace-nowrap"
        >
          👁 Bekijk hun dashboard
        </Link>
      </div>

      <CrmPanel
        targetType="employer"
        targetId={employer.id}
        initialStage={(employer.funnel_stage ?? "onboarding") as FunnelStage}
        initialNextAction={employer.next_action ?? null}
        initialNextActionDueAt={employer.next_action_due_at ?? null}
        source={employer.source ?? null}
        utmSource={employer.utm_source ?? null}
        utmMedium={employer.utm_medium ?? null}
        utmCampaign={employer.utm_campaign ?? null}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <InfoCard label="Bedrijfsinfo">
          <Field label="KvK">{employer.kvk_number ?? "—"}</Field>
          <Field label="BTW">{employer.vat_number ?? "—"}</Field>
          <Field label="Sector">
            {SECTOR_LABELS[employer.sector] ?? employer.sector}
          </Field>
          <Field label="Website">{employer.website ?? "—"}</Field>
        </InfoCard>

        <InfoCard label="Contact">
          <Field label="Email">{user?.email ?? "—"}</Field>
          <Field label="Telefoon">{user?.phone ?? "—"}</Field>
          <Field label="Status">{user?.status ?? "—"}</Field>
          <Field label="Account sinds">
            {user?.created_at
              ? new Date(user.created_at).toLocaleDateString("nl-NL")
              : "—"}
          </Field>
        </InfoCard>

        <InfoCard label="Statistieken">
          <Field label="Shifts geplaatst">{shiftCount ?? 0}</Field>
          <Field label="Vacatures geplaatst">{vacancyCount ?? 0}</Field>
          <Field label="Facturen">{invoiceCount ?? 0}</Field>
          <Field label="Payment method">
            {employer.payment_method ?? "—"}
          </Field>
        </InfoCard>
      </div>

      <Section title={`Shifts (${shiftCount ?? 0})`}>
        {!shifts || shifts.length === 0 ? (
          <EmptyRow>Geen shifts geplaatst.</EmptyRow>
        ) : (
          <ul className="divide-y divide-stone-100">
            {shifts.map((s) => (
              <li
                key={s.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{s.title}</div>
                  <div className="text-xs text-stone-500">
                    {new Date(s.starts_at).toLocaleString("nl-NL", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    · € {(s.hourly_rate_cents / 100).toFixed(2)}/u
                  </div>
                </div>
                <StatusPill status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Vacatures (${vacancyCount ?? 0})`}>
        {!vacancies || vacancies.length === 0 ? (
          <EmptyRow>Geen vacatures geplaatst.</EmptyRow>
        ) : (
          <ul className="divide-y divide-stone-100">
            {vacancies.map((v) => (
              <li
                key={v.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{v.title}</div>
                  <div className="text-xs text-stone-500">
                    Match fee: € {(v.match_fee_cents / 100).toFixed(2)}
                  </div>
                </div>
                <StatusPill status={v.status} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title={`Facturen (${invoiceCount ?? 0})`}>
        {!invoices || invoices.length === 0 ? (
          <EmptyRow>Geen facturen.</EmptyRow>
        ) : (
          <ul className="divide-y divide-stone-100">
            {invoices.map((inv) => (
              <li
                key={inv.id}
                className="px-4 py-3 flex items-center justify-between gap-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-mono text-xs">{inv.invoice_number}</div>
                  <div className="text-xs text-stone-500">
                    Vervaldatum:{" "}
                    {new Date(inv.due_date).toLocaleDateString("nl-NL")}
                  </div>
                </div>
                <div className="text-sm font-semibold">
                  € {(inv.total_cents / 100).toFixed(2)}
                </div>
                <StatusPill status={inv.status} />
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
    paused: "bg-amber-100 text-amber-800",
    filled: "bg-stone-200 text-stone-700",
    archived: "bg-stone-100 text-stone-600",
    draft: "bg-stone-100 text-stone-600",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-lime/20 text-lime-dark",
    overdue: "bg-red-100 text-red-800",
    collections: "bg-red-200 text-red-900",
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
