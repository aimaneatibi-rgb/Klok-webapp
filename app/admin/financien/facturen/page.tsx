import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUSES = [
  "all",
  "draft",
  "sent",
  "paid",
  "overdue",
  "collections",
] as const;

function eur(cents: number | null | undefined) {
  return `€ ${((cents ?? 0) / 100).toLocaleString("nl-NL", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default async function AdminFacturenPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = (status as (typeof STATUSES)[number]) ?? "all";

  const supabase = await createClient();

  let query = supabase
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      total_cents,
      vat_cents,
      subtotal_cents,
      status,
      due_date,
      paid_at,
      created_at,
      period_month,
      employers (
        id,
        company_name
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .limit(200);

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: invoices, count } = await query;

  const sumTotal = (invoices ?? []).reduce(
    (s, i) => s + (i.total_cents ?? 0),
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
          <span className="eyebrow">— ADMIN · FACTUREN</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Facturen ({count ?? 0}).
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
                ? "/admin/financien/facturen"
                : `/admin/financien/facturen?status=${s}`
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

      {!invoices || invoices.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center text-stone-500">
          Geen facturen gevonden.
        </div>
      ) : (
        <div className="bg-paper border border-stone-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left">
                  <Th>Factuurnr</Th>
                  <Th>Klant</Th>
                  <Th>Periode</Th>
                  <Th>Subtotaal</Th>
                  <Th>BTW</Th>
                  <Th>Totaal</Th>
                  <Th>Vervaldatum</Th>
                  <Th>Betaald</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const emp = Array.isArray(inv.employers)
                    ? inv.employers[0]
                    : inv.employers;
                  const today = new Date();
                  const dueDate = new Date(inv.due_date);
                  const isOverdueOpen =
                    inv.status === "sent" && dueDate < today;
                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <Td className="font-mono text-xs">
                        {inv.invoice_number}
                      </Td>
                      <Td className="font-medium">
                        {emp?.id ? (
                          <Link
                            href={`/admin/klanten/${emp.id}`}
                            className="hover:underline"
                          >
                            {emp.company_name}
                          </Link>
                        ) : (
                          "—"
                        )}
                      </Td>
                      <Td className="text-stone-600">
                        {new Date(inv.period_month).toLocaleDateString("nl-NL", {
                          month: "short",
                          year: "2-digit",
                        })}
                      </Td>
                      <Td className="text-stone-600">
                        {eur(inv.subtotal_cents)}
                      </Td>
                      <Td className="text-stone-600">
                        {eur(inv.vat_cents)}
                      </Td>
                      <Td className="font-semibold">
                        {eur(inv.total_cents)}
                      </Td>
                      <Td
                        className={
                          isOverdueOpen
                            ? "text-red-700 font-semibold"
                            : "text-stone-600"
                        }
                      >
                        {new Date(inv.due_date).toLocaleDateString("nl-NL")}
                      </Td>
                      <Td className="text-stone-600">
                        {inv.paid_at
                          ? new Date(inv.paid_at).toLocaleDateString("nl-NL")
                          : "—"}
                      </Td>
                      <Td>
                        <StatusPill
                          status={isOverdueOpen ? "overdue" : inv.status}
                        />
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
    draft: "bg-stone-100 text-stone-600",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-lime/20 text-lime-dark",
    overdue: "bg-red-100 text-red-800",
    collections: "bg-red-200 text-red-900",
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
