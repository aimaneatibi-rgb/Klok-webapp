import { createClient } from "@/lib/supabase/server";
import { eur, isDemoMode, METHOD_LABELS } from "@/lib/payments";
import { redirect } from "next/navigation";
import Link from "next/link";
import PayButton from "./pay-button";

const STATUSES = ["all", "sent", "overdue", "paid", "collections"] as const;
const STATUS_LABELS: Record<string, string> = {
  all: "Alle",
  sent: "Open",
  overdue: "Te laat",
  paid: "Betaald",
  collections: "Incasso",
};

export default async function FacturenPage({
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

  const { data: employer } = await supabase
    .from("employers")
    .select("id, company_name")
    .eq("user_id", user!.id)
    .single();

  if (!employer) redirect("/dashboard/instellingen");

  let query = supabase
    .from("invoices")
    .select(
      `
      id,
      invoice_number,
      period_month,
      subtotal_cents,
      vat_cents,
      total_cents,
      status,
      due_date,
      paid_at,
      paid_via,
      pdf_url,
      created_at
    `,
      { count: "exact" }
    )
    .eq("employer_id", employer.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (activeStatus !== "all") query = query.eq("status", activeStatus);

  const { data: invoices, count } = await query;

  // Default betaalmethode lookup voor "Direct betalen"
  const { data: defaultMethod } = await supabase
    .from("employer_payment_methods")
    .select("type, status, iban_last4")
    .eq("employer_id", employer.id)
    .eq("is_default", true)
    .maybeSingle();

  // Aggregate counts
  const totalOpen = (invoices ?? [])
    .filter((i) => i.status === "sent" || i.status === "overdue")
    .reduce((s, i) => s + (i.total_cents ?? 0), 0);
  const totalOverdue = (invoices ?? [])
    .filter((i) => i.status === "overdue")
    .reduce((s, i) => s + (i.total_cents ?? 0), 0);

  const demo = isDemoMode();
  const today = new Date();

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-6">
        <span className="eyebrow">— FINANCIEEL</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Mijn facturen ({count ?? 0})
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Maandelijkse vacature-fees en shift platform-fees. Betaal via je
          standaard methode of direct via iDEAL.
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        <SummaryCard
          label="Openstaand"
          value={eur(totalOpen)}
          dark
        />
        <SummaryCard
          label="Te laat"
          value={eur(totalOverdue)}
          alert={totalOverdue > 0}
        />
        <SummaryCard
          label="Standaard methode"
          value={
            defaultMethod
              ? METHOD_LABELS[defaultMethod.type as keyof typeof METHOD_LABELS] ?? "—"
              : "Niet ingesteld"
          }
          sublabel={
            defaultMethod?.iban_last4 ? `···· ${defaultMethod.iban_last4}` : undefined
          }
          link="/dashboard/betaalmethodes"
        />
      </div>

      {/* Filter pills */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              s === "all"
                ? "/dashboard/facturen"
                : `/dashboard/facturen?status=${s}`
            }
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              activeStatus === s
                ? "bg-ink text-paper"
                : "bg-paper border border-stone-200 hover:border-ink"
            }`}
          >
            {STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      {demo && (
        <div className="bg-amber-50 border border-amber-300 rounded-md p-3 mb-4 text-xs text-amber-900">
          🧪 Demo mode — &lsquo;Direct betalen&rsquo; en automatische incasso
          worden geactiveerd zodra Mollie API gewired is. Klik werkt nu
          ter simulatie (markeert factuur als betaald).
        </div>
      )}

      {!invoices || invoices.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center text-stone-500">
          {activeStatus !== "all"
            ? `Geen ${STATUS_LABELS[activeStatus].toLowerCase()} facturen.`
            : "Nog geen facturen. Bij je eerste vacature- of shift-actie wordt er een factuur gegenereerd."}
        </div>
      ) : (
        <div className="bg-paper border border-stone-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left">
                  <Th>Factuurnr</Th>
                  <Th>Periode</Th>
                  <Th>Bedrag</Th>
                  <Th>Vervaldatum</Th>
                  <Th>Status</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => {
                  const dueDate = new Date(inv.due_date);
                  const isOverdueOpen =
                    inv.status === "sent" && dueDate < today;
                  const effectiveStatus = isOverdueOpen ? "overdue" : inv.status;
                  const canPay =
                    inv.status === "sent" ||
                    inv.status === "overdue" ||
                    isOverdueOpen;

                  return (
                    <tr
                      key={inv.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <Td className="font-mono text-xs">
                        {inv.invoice_number}
                      </Td>
                      <Td className="text-stone-600">
                        {new Date(inv.period_month).toLocaleDateString("nl-NL", {
                          month: "short",
                          year: "2-digit",
                        })}
                      </Td>
                      <Td>
                        <div className="font-semibold">
                          {eur(inv.total_cents)}
                        </div>
                        <div className="text-xs text-stone-500">
                          excl. BTW {eur(inv.subtotal_cents)}
                        </div>
                      </Td>
                      <Td
                        className={
                          isOverdueOpen
                            ? "text-red-700 font-semibold"
                            : "text-stone-600"
                        }
                      >
                        {dueDate.toLocaleDateString("nl-NL")}
                        {inv.paid_at && (
                          <div className="text-xs text-lime-dark">
                            ✓ {new Date(inv.paid_at).toLocaleDateString("nl-NL")}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <StatusPill status={effectiveStatus} />
                        {inv.paid_via && (
                          <div className="text-xs text-stone-500 mt-1">
                            via {METHOD_LABELS[inv.paid_via as keyof typeof METHOD_LABELS] ?? inv.paid_via}
                          </div>
                        )}
                      </Td>
                      <Td>
                        <div className="flex gap-1.5 flex-wrap">
                          {canPay && (
                            <PayButton
                              invoiceId={inv.id}
                              amountCents={inv.total_cents}
                              demoMode={demo}
                              hasMandate={defaultMethod?.type === "sepa_dd" && defaultMethod?.status === "active"}
                            />
                          )}
                          {inv.pdf_url && (
                            <a
                              href={inv.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs px-2 py-1 rounded-md bg-stone-100 hover:bg-stone-200"
                            >
                              📄 PDF
                            </a>
                          )}
                        </div>
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

function SummaryCard({
  label,
  value,
  sublabel,
  link,
  dark = false,
  alert = false,
}: {
  label: string;
  value: string;
  sublabel?: string;
  link?: string;
  dark?: boolean;
  alert?: boolean;
}) {
  const inner = (
    <>
      <div className={`eyebrow ${dark ? "text-stone-400" : ""}`}>{label}</div>
      <div
        className={`font-serif text-2xl font-medium mt-1 ${
          dark ? "text-lime" : alert ? "text-red-700" : "text-ink"
        }`}
      >
        {value}
      </div>
      {sublabel && (
        <div
          className={`text-xs mt-1 font-mono ${
            dark ? "text-stone-400" : "text-stone-500"
          }`}
        >
          {sublabel}
        </div>
      )}
    </>
  );
  const className = `block p-5 rounded-lg border transition-colors ${
    dark ? "bg-ink text-paper border-ink" : "bg-paper border-stone-200 hover:border-stone-400"
  }`;
  return link ? (
    <Link href={link} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-stone-100 text-stone-600",
    sent: "bg-blue-100 text-blue-800",
    paid: "bg-lime/20 text-lime-dark",
    overdue: "bg-red-100 text-red-800",
    collections: "bg-red-200 text-red-900",
  };
  const labels: Record<string, string> = {
    draft: "Concept",
    sent: "Open",
    paid: "Betaald",
    overdue: "Te laat",
    collections: "Incasso",
  };
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap ${
        styles[status] ?? "bg-stone-100"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
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
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}
