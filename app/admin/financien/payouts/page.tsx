import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUSES = ["all", "pending", "sent", "paid", "failed"] as const;

function eur(cents: number | null | undefined) {
  return `€ ${((cents ?? 0) / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function AdminPayoutsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = (status as (typeof STATUSES)[number]) ?? "all";

  const supabase = await createClient();

  let query = supabase
    .from("payouts")
    .select(
      `
      id,
      period_start,
      period_end,
      wage_cents,
      referral_cents,
      match_fee_cents,
      total_cents,
      sepa_batch_id,
      status,
      paid_at,
      created_at,
      employees (
        id,
        users (
          first_name,
          last_name,
          email
        )
      )
    `,
      { count: "exact" }
    )
    .order("period_end", { ascending: false })
    .limit(200);

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: payouts, count } = await query;

  const sumTotal = (payouts ?? []).reduce(
    (s, p) => s + (p.total_cents ?? 0),
    0
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link
        href="/admin/financien"
        className="text-sm text-stone-600 hover:text-ink"
      >
        ← Terug naar financiën
      </Link>

      <div className="mb-8 mt-3 flex items-end justify-between flex-wrap gap-3">
        <div>
          <span className="eyebrow">— ADMIN · PAYOUTS</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Uitbetalingen ({count ?? 0}).
          </h1>
        </div>
        <div className="text-right">
          <div className="eyebrow">Totaal getoond</div>
          <div className="font-serif text-2xl font-medium">{eur(sumTotal)}</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              s === "all"
                ? "/admin/financien/payouts"
                : `/admin/financien/payouts?status=${s}`
            }
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeStatus === s
                ? "bg-ink text-paper"
                : "bg-paper border border-stone-200 hover:border-ink"
            }`}
          >
            {s === "all" ? "Alle" : s}
          </Link>
        ))}
      </div>

      {!payouts || payouts.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center text-stone-500">
          Geen payouts gevonden.
        </div>
      ) : (
        <div className="bg-paper border border-stone-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left">
                  <Th>Werknemer</Th>
                  <Th>Periode</Th>
                  <Th>Loon</Th>
                  <Th>Referral</Th>
                  <Th>Match fee</Th>
                  <Th>Totaal</Th>
                  <Th>SEPA batch</Th>
                  <Th>Betaald</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {payouts.map((p) => {
                  const emp = Array.isArray(p.employees)
                    ? p.employees[0]
                    : p.employees;
                  const user = emp
                    ? Array.isArray(emp.users)
                      ? emp.users[0]
                      : emp.users
                    : null;
                  const fullName =
                    [user?.first_name, user?.last_name]
                      .filter(Boolean)
                      .join(" ") || "—";
                  return (
                    <tr
                      key={p.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <Td className="font-medium">
                        {emp?.id ? (
                          <Link
                            href={`/admin/medewerkers/${emp.id}`}
                            className="hover:underline"
                          >
                            {fullName}
                          </Link>
                        ) : (
                          fullName
                        )}
                      </Td>
                      <Td className="text-stone-600 whitespace-nowrap">
                        {new Date(p.period_start).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                        })}{" "}
                        –{" "}
                        {new Date(p.period_end).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Td>
                      <Td className="text-stone-600">{eur(p.wage_cents)}</Td>
                      <Td className="text-stone-600">
                        {eur(p.referral_cents)}
                      </Td>
                      <Td className="text-stone-600">
                        {eur(p.match_fee_cents)}
                      </Td>
                      <Td className="font-semibold">
                        {eur(p.total_cents)}
                      </Td>
                      <Td className="font-mono text-xs text-stone-500">
                        {p.sepa_batch_id ?? "—"}
                      </Td>
                      <Td className="text-stone-600">
                        {p.paid_at
                          ? new Date(p.paid_at).toLocaleDateString("nl-NL")
                          : "—"}
                      </Td>
                      <Td>
                        <StatusPill status={p.status} />
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-3 font-mono text-xs uppercase tracking-wider text-stone-600">
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-amber-100 text-amber-800",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-lime/20 text-lime-dark",
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
