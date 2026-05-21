import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1, 0, 0, 0, 0);
}

function monthKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

const MONTH_LABELS = [
  "Jan", "Feb", "Mrt", "Apr", "Mei", "Jun",
  "Jul", "Aug", "Sep", "Okt", "Nov", "Dec",
];

function eur(cents: number | null | undefined) {
  return `€ ${((cents ?? 0) / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function AdminFinancienPage() {
  const supabase = await createClient();

  const now = new Date();
  const thisMonthStart = startOfMonth(now);
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Fetch alle relevante data in parallel
  const [
    { data: completedShifts },
    { data: filledVacancies },
    { data: paidInvoicesThisMonth },
    { data: openInvoices },
    { data: paidPayoutsThisMonth },
    { data: pendingPayouts },
    { count: failedPayoutsCount },
    { data: recentInvoices },
    { data: recentPayouts },
    { data: referralPaid },
    { data: referralPending },
  ] = await Promise.all([
    supabase
      .from("shifts")
      .select("platform_fee_cents, ends_at")
      .eq("status", "completed")
      .gte("ends_at", sixMonthsAgo.toISOString()),
    supabase
      .from("vacancies")
      .select("match_fee_cents, filled_at")
      .eq("status", "filled")
      .gte("filled_at", sixMonthsAgo.toISOString()),
    supabase
      .from("invoices")
      .select("total_cents")
      .eq("status", "paid")
      .gte("paid_at", thisMonthStart.toISOString()),
    supabase
      .from("invoices")
      .select("total_cents, status, due_date")
      .in("status", ["sent", "overdue", "collections"]),
    supabase
      .from("payouts")
      .select("total_cents")
      .eq("status", "paid")
      .gte("paid_at", thisMonthStart.toISOString()),
    supabase
      .from("payouts")
      .select("total_cents")
      .eq("status", "pending"),
    supabase
      .from("payouts")
      .select("*", { count: "exact", head: true })
      .eq("status", "failed"),
    supabase
      .from("invoices")
      .select(
        `id, invoice_number, total_cents, status, due_date, paid_at, created_at,
         employers (company_name)`
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("payouts")
      .select(
        `id, total_cents, status, period_start, period_end, paid_at,
         employees (
           users ( first_name, last_name )
         )`
      )
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("referral_earnings")
      .select("amount_cents")
      .not("paid_at", "is", null),
    supabase
      .from("referral_earnings")
      .select("amount_cents")
      .is("paid_at", null),
  ]);

  // Aggregeer revenue per maand
  const monthlyRevenue: Record<string, { shifts: number; vacancies: number }> =
    {};
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyRevenue[monthKey(d)] = { shifts: 0, vacancies: 0 };
  }

  for (const s of completedShifts ?? []) {
    if (!s.ends_at) continue;
    const k = monthKey(new Date(s.ends_at));
    if (monthlyRevenue[k]) {
      monthlyRevenue[k].shifts += s.platform_fee_cents ?? 0;
    }
  }
  for (const v of filledVacancies ?? []) {
    if (!v.filled_at) continue;
    const k = monthKey(new Date(v.filled_at));
    if (monthlyRevenue[k]) {
      monthlyRevenue[k].vacancies += v.match_fee_cents ?? 0;
    }
  }

  const months = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, val]) => {
      const [year, month] = key.split("-").map(Number);
      return {
        key,
        label: MONTH_LABELS[month - 1],
        year,
        shifts: val.shifts,
        vacancies: val.vacancies,
        total: val.shifts + val.vacancies,
      };
    });

  const maxMonthlyTotal = Math.max(...months.map((m) => m.total), 1);
  const totalRevenue6mo = months.reduce((sum, m) => sum + m.total, 0);
  const thisMonth = months[months.length - 1];

  // Aggregeer overige cijfers
  const sumPaidInvoices = (paidInvoicesThisMonth ?? []).reduce(
    (s, x) => s + (x.total_cents ?? 0),
    0
  );
  const sumPaidPayouts = (paidPayoutsThisMonth ?? []).reduce(
    (s, x) => s + (x.total_cents ?? 0),
    0
  );
  const sumPendingPayouts = (pendingPayouts ?? []).reduce(
    (s, x) => s + (x.total_cents ?? 0),
    0
  );

  const today = new Date();
  let openInvoicesSent = 0;
  let openInvoicesOverdue = 0;
  let openInvoicesCollections = 0;
  for (const inv of openInvoices ?? []) {
    const dueDate = new Date(inv.due_date);
    const isOverdue =
      inv.status === "overdue" ||
      (inv.status === "sent" && dueDate < today);
    if (inv.status === "collections") {
      openInvoicesCollections += inv.total_cents ?? 0;
    } else if (isOverdue) {
      openInvoicesOverdue += inv.total_cents ?? 0;
    } else {
      openInvoicesSent += inv.total_cents ?? 0;
    }
  }

  const sumReferralPaid = (referralPaid ?? []).reduce(
    (s, x) => s + (x.amount_cents ?? 0),
    0
  );
  const sumReferralPending = (referralPending ?? []).reduce(
    (s, x) => s + (x.amount_cents ?? 0),
    0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— ADMIN · FINANCIËN</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Financieel overzicht.
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Platform omzet, facturen, uitbetalingen — laatste 6 maanden.
        </p>
      </div>

      {/* Top stats — deze maand */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Omzet deze maand"
          value={eur(thisMonth?.total ?? 0)}
          dark
        />
        <StatCard
          label="Betaald (klanten)"
          value={eur(sumPaidInvoices)}
          sublabel="Facturen deze maand"
        />
        <StatCard
          label="Uitbetaald (werknemers)"
          value={eur(sumPaidPayouts)}
          sublabel="Payouts deze maand"
        />
        <StatCard
          label="Omzet 6 maanden"
          value={eur(totalRevenue6mo)}
          sublabel="Rolling"
        />
      </div>

      {/* Maand-grafiek */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-serif text-xl font-medium">
            Omzet per maand
          </h2>
          <div className="flex gap-4 text-xs">
            <Legend color="bg-lime" label="Shift platform fees" />
            <Legend color="bg-ink" label="Vacature match fees" />
          </div>
        </div>
        <RevenueChart months={months} max={maxMonthlyTotal} />
      </div>

      {/* Facturen & Payouts twee kolommen */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        {/* Facturen */}
        <div className="bg-paper border border-stone-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-medium">
              Facturen (klanten)
            </h2>
            <Link
              href="/admin/financien/facturen"
              className="text-sm text-stone-600 hover:text-ink underline"
            >
              Alle →
            </Link>
          </div>
          <div className="space-y-3 mb-4">
            <Row label="Verstuurd (open)" value={eur(openInvoicesSent)} />
            <Row
              label="Verstreken (overdue)"
              value={eur(openInvoicesOverdue)}
              alert
            />
            <Row
              label="In collections"
              value={eur(openInvoicesCollections)}
              alert
            />
          </div>
          <div className="border-t border-stone-200 pt-3">
            <div className="eyebrow mb-2">Laatste 5 facturen</div>
            {!recentInvoices || recentInvoices.length === 0 ? (
              <div className="text-sm text-stone-500 py-2">Geen facturen.</div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {recentInvoices.map((inv) => {
                  const emp = Array.isArray(inv.employers)
                    ? inv.employers[0]
                    : inv.employers;
                  return (
                    <li
                      key={inv.id}
                      className="py-2 flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">
                          {emp?.company_name ?? "—"}
                        </div>
                        <div className="text-xs text-stone-500 font-mono">
                          {inv.invoice_number}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {eur(inv.total_cents)}
                      </div>
                      <StatusPill status={inv.status} />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* Payouts */}
        <div className="bg-paper border border-stone-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl font-medium">
              Uitbetalingen (werknemers)
            </h2>
            <Link
              href="/admin/financien/payouts"
              className="text-sm text-stone-600 hover:text-ink underline"
            >
              Alle →
            </Link>
          </div>
          <div className="space-y-3 mb-4">
            <Row label="Pending uitbetalen" value={eur(sumPendingPayouts)} />
            <Row
              label="Failed payouts"
              value={String(failedPayoutsCount ?? 0)}
              alert={(failedPayoutsCount ?? 0) > 0}
            />
            <Row
              label="Uitbetaald deze maand"
              value={eur(sumPaidPayouts)}
              good
            />
          </div>
          <div className="border-t border-stone-200 pt-3">
            <div className="eyebrow mb-2">Laatste 5 payouts</div>
            {!recentPayouts || recentPayouts.length === 0 ? (
              <div className="text-sm text-stone-500 py-2">Geen payouts.</div>
            ) : (
              <ul className="divide-y divide-stone-100">
                {recentPayouts.map((p) => {
                  const emp = Array.isArray(p.employees)
                    ? p.employees[0]
                    : p.employees;
                  const user = emp
                    ? Array.isArray(emp.users)
                      ? emp.users[0]
                      : emp.users
                    : null;
                  const name =
                    [user?.first_name, user?.last_name]
                      .filter(Boolean)
                      .join(" ") || "—";
                  return (
                    <li
                      key={p.id}
                      className="py-2 flex items-center justify-between gap-2 text-sm"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-medium truncate">{name}</div>
                        <div className="text-xs text-stone-500">
                          {new Date(p.period_start).toLocaleDateString("nl-NL")}{" "}
                          – {new Date(p.period_end).toLocaleDateString("nl-NL")}
                        </div>
                      </div>
                      <div className="font-semibold">
                        {eur(p.total_cents)}
                      </div>
                      <StatusPill status={p.status} />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* Referrals */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6">
        <h2 className="font-serif text-xl font-medium mb-4">
          Referral uitgaven
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Row label="Uitbetaald (totaal)" value={eur(sumReferralPaid)} good />
          <Row
            label="Nog uit te betalen"
            value={eur(sumReferralPending)}
            alert={sumReferralPending > 0}
          />
        </div>
        <p className="text-xs text-stone-500 mt-3">
          €1/u voor shifts via referral · €100 per ingevulde vacature
        </p>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  sublabel,
  dark = false,
}: {
  label: string;
  value: string;
  sublabel?: string;
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
        className={`font-serif text-2xl font-medium tracking-tight mt-2 ${
          dark ? "text-lime" : "text-ink"
        }`}
      >
        {value}
      </div>
      {sublabel && (
        <div
          className={`text-xs mt-1 ${dark ? "text-stone-400" : "text-stone-500"}`}
        >
          {sublabel}
        </div>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  alert = false,
  good = false,
}: {
  label: string;
  value: string;
  alert?: boolean;
  good?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-stone-700">{label}</span>
      <span
        className={`font-semibold font-mono ${
          alert ? "text-red-700" : good ? "text-lime-dark" : "text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5 text-stone-600">
      <span className={`inline-block w-3 h-3 rounded ${color}`} />
      {label}
    </span>
  );
}

function RevenueChart({
  months,
  max,
}: {
  months: { key: string; label: string; shifts: number; vacancies: number; total: number }[];
  max: number;
}) {
  return (
    <div className="flex items-end gap-3 h-48">
      {months.map((m) => {
        const shiftsPct = (m.shifts / max) * 100;
        const vacanciesPct = (m.vacancies / max) * 100;
        return (
          <div key={m.key} className="flex-1 flex flex-col items-center gap-1.5">
            <div className="text-xs font-mono text-stone-600">
              {m.total > 0 ? `€${(m.total / 100).toFixed(0)}` : "—"}
            </div>
            <div className="w-full flex-1 flex flex-col-reverse min-h-[8px]">
              {m.shifts > 0 && (
                <div
                  className="w-full bg-lime rounded-t-sm"
                  style={{ height: `${shiftsPct}%`, minHeight: "2px" }}
                  title={`Shifts: ${(m.shifts / 100).toFixed(2)}`}
                />
              )}
              {m.vacancies > 0 && (
                <div
                  className="w-full bg-ink"
                  style={{ height: `${vacanciesPct}%`, minHeight: "2px" }}
                  title={`Vacatures: ${(m.vacancies / 100).toFixed(2)}`}
                />
              )}
            </div>
            <div className="eyebrow">{m.label}</div>
          </div>
        );
      })}
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-stone-100 text-stone-600",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-lime/20 text-lime-dark",
    overdue: "bg-red-100 text-red-800",
    collections: "bg-red-200 text-red-900",
    pending: "bg-amber-100 text-amber-800",
    failed: "bg-red-100 text-red-800",
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
