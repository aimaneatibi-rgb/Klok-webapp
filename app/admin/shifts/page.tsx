import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUSES = [
  "all",
  "open",
  "confirmed",
  "in_progress",
  "completed",
  "no_show",
  "cancelled",
] as const;

export default async function AdminShiftsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = (status as (typeof STATUSES)[number]) ?? "all";

  const supabase = await createClient();

  let query = supabase
    .from("shifts")
    .select(
      `
      id,
      title,
      starts_at,
      ends_at,
      status,
      hourly_rate_cents,
      platform_fee_cents,
      assigned_employee_id,
      employers (
        company_name,
        sector
      )
    `,
      { count: "exact" }
    )
    .order("starts_at", { ascending: false })
    .limit(100);

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: shifts, count } = await query;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— ADMIN · SHIFTS</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Alle shifts ({count ?? 0}).
        </h1>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={s === "all" ? "/admin/shifts" : `/admin/shifts?status=${s}`}
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

      {!shifts || shifts.length === 0 ? (
        <EmptyState message="Geen shifts gevonden voor dit filter." />
      ) : (
        <div className="bg-paper border border-stone-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left">
                  <Th>Bedrijf</Th>
                  <Th>Titel</Th>
                  <Th>Datum</Th>
                  <Th>Uurloon</Th>
                  <Th>Platform fee</Th>
                  <Th>Status</Th>
                  <Th>Toegewezen</Th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => {
                  const employer = Array.isArray(s.employers)
                    ? s.employers[0]
                    : s.employers;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <Td className="font-medium">
                        {employer?.company_name ?? "—"}
                      </Td>
                      <Td className="text-stone-700">{s.title}</Td>
                      <Td className="text-stone-600">
                        {new Date(s.starts_at).toLocaleString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          year: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Td>
                      <Td>€ {(s.hourly_rate_cents / 100).toFixed(2)}</Td>
                      <Td className="text-stone-600">
                        {s.platform_fee_cents != null
                          ? `€ ${(s.platform_fee_cents / 100).toFixed(2)}`
                          : "—"}
                      </Td>
                      <Td>
                        <StatusPill status={s.status} />
                      </Td>
                      <Td className="text-xs text-stone-500">
                        {s.assigned_employee_id ? "✓" : "—"}
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
    confirmed: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    completed: "bg-stone-200 text-stone-700",
    cancelled: "bg-red-100 text-red-800",
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center text-stone-500">
      {message}
    </div>
  );
}
