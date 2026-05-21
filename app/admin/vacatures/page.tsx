import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUSES = ["all", "open", "paused", "filled", "archived"] as const;

export default async function AdminVacaturesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = (status as (typeof STATUSES)[number]) ?? "all";

  const supabase = await createClient();

  let query = supabase
    .from("vacancies")
    .select(
      `
      id,
      title,
      status,
      hours_per_week,
      contract_months,
      salary_min_cents,
      salary_max_cents,
      match_fee_cents,
      created_at,
      filled_at,
      employers (
        company_name,
        sector
      )
    `,
      { count: "exact" }
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: vacancies, count } = await query;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— ADMIN · VACATURES</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Alle vacatures ({count ?? 0}).
        </h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/vacatures" : `/admin/vacatures?status=${s}`}
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

      {!vacancies || vacancies.length === 0 ? (
        <EmptyState message="Geen vacatures gevonden voor dit filter." />
      ) : (
        <div className="bg-paper border border-stone-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left">
                  <Th>Bedrijf</Th>
                  <Th>Titel</Th>
                  <Th>Uren/wk</Th>
                  <Th>Contract</Th>
                  <Th>Salaris</Th>
                  <Th>Match fee</Th>
                  <Th>Geplaatst</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {vacancies.map((v) => {
                  const employer = Array.isArray(v.employers)
                    ? v.employers[0]
                    : v.employers;
                  const salary =
                    v.salary_min_cents && v.salary_max_cents
                      ? `€ ${(v.salary_min_cents / 100).toFixed(0)}–${(v.salary_max_cents / 100).toFixed(0)}`
                      : v.salary_max_cents
                        ? `tot € ${(v.salary_max_cents / 100).toFixed(0)}`
                        : "—";
                  return (
                    <tr
                      key={v.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <Td className="font-medium">
                        {employer?.company_name ?? "—"}
                      </Td>
                      <Td className="text-stone-700">{v.title}</Td>
                      <Td>{v.hours_per_week}</Td>
                      <Td>{v.contract_months}m</Td>
                      <Td className="text-stone-600">{salary}</Td>
                      <Td className="font-semibold">
                        € {(v.match_fee_cents / 100).toFixed(0)}
                      </Td>
                      <Td className="text-stone-600">
                        {new Date(v.created_at).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                        })}
                      </Td>
                      <Td>
                        <StatusPill status={v.status} />
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
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-lime/20 text-lime-dark",
    paused: "bg-amber-100 text-amber-800",
    filled: "bg-blue-100 text-blue-800",
    archived: "bg-stone-100 text-stone-600",
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center text-stone-500">
      {message}
    </div>
  );
}
