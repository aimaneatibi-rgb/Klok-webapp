import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUSES = ["all", "open", "reviewed", "blocked", "dismissed"] as const;
const PRIORITIES = ["all", "high", "medium", "low"] as const;

export default async function AdminFraudPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; priority?: string }>;
}) {
  const { status, priority } = await searchParams;
  const activeStatus = (status as (typeof STATUSES)[number]) ?? "all";
  const activePriority = (priority as (typeof PRIORITIES)[number]) ?? "all";

  const supabase = await createClient();

  let query = supabase
    .from("fraud_alerts")
    .select(
      `
      id,
      alert_type,
      risk_score,
      priority,
      status,
      evidence,
      created_at,
      reviewed_at,
      users:user_id (
        email,
        first_name,
        last_name,
        user_type
      )
    `,
      { count: "exact" }
    )
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(200);

  if (activeStatus !== "all") query = query.eq("status", activeStatus);
  if (activePriority !== "all") query = query.eq("priority", activePriority);

  const { data: alerts, count } = await query;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— ADMIN · FRAUD ALERTS</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Fraud alerts ({count ?? 0}).
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Automatisch geflagde signalen van het fraud-detection systeem.
          Hoog-risico eerst.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <span className="eyebrow self-center mr-1">Status:</span>
        {STATUSES.map((s) => (
          <FilterPill
            key={s}
            href={
              s === "all"
                ? activePriority === "all"
                  ? "/admin/fraud"
                  : `/admin/fraud?priority=${activePriority}`
                : `/admin/fraud?status=${s}${activePriority !== "all" ? `&priority=${activePriority}` : ""}`
            }
            active={activeStatus === s}
          >
            {s === "all" ? "Alle" : s}
          </FilterPill>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        <span className="eyebrow self-center mr-1">Prioriteit:</span>
        {PRIORITIES.map((p) => (
          <FilterPill
            key={p}
            href={
              p === "all"
                ? activeStatus === "all"
                  ? "/admin/fraud"
                  : `/admin/fraud?status=${activeStatus}`
                : `/admin/fraud?priority=${p}${activeStatus !== "all" ? `&status=${activeStatus}` : ""}`
            }
            active={activePriority === p}
          >
            {p === "all" ? "Alle" : p}
          </FilterPill>
        ))}
      </div>

      {!alerts || alerts.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center text-stone-500">
          {activeStatus !== "all" || activePriority !== "all"
            ? "Geen alerts voor dit filter."
            : "Geen fraud alerts — alles in orde."}
        </div>
      ) : (
        <div className="bg-paper border border-stone-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left">
                  <Th>Wanneer</Th>
                  <Th>Gebruiker</Th>
                  <Th>Type</Th>
                  <Th>Risk</Th>
                  <Th>Prioriteit</Th>
                  <Th>Status</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => {
                  const u = Array.isArray(a.users) ? a.users[0] : a.users;
                  const name =
                    [u?.first_name, u?.last_name]
                      .filter(Boolean)
                      .join(" ") ||
                    u?.email?.split("@")[0] ||
                    "—";
                  return (
                    <tr
                      key={a.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <Td className="text-stone-600 whitespace-nowrap">
                        {new Date(a.created_at).toLocaleString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Td>
                      <Td>
                        <div className="font-medium">{name}</div>
                        <div className="text-xs text-stone-500">{u?.email}</div>
                      </Td>
                      <Td className="font-mono text-xs">{a.alert_type}</Td>
                      <Td>
                        <RiskBadge score={a.risk_score} />
                      </Td>
                      <Td>
                        <PriorityBadge priority={a.priority} />
                      </Td>
                      <Td>
                        <StatusBadge status={a.status} />
                      </Td>
                      <Td>
                        <span className="text-xs text-stone-400">
                          Review later
                        </span>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="text-xs text-stone-500 mt-4">
        💡 Review-actions (markeer als reviewed/blocked/dismissed) komen in
        volgende ronde. Voor nu is dit een read-only overzicht.
      </p>
    </div>
  );
}

function FilterPill({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
        active
          ? "bg-ink text-paper"
          : "bg-paper border border-stone-200 hover:border-ink"
      }`}
    >
      {children}
    </Link>
  );
}

function RiskBadge({ score }: { score: number | null }) {
  if (score == null) return <span className="text-stone-400 text-xs">—</span>;
  const color =
    score >= 70
      ? "bg-red-100 text-red-800"
      : score >= 40
        ? "bg-amber-100 text-amber-800"
        : "bg-stone-100 text-stone-700";
  return (
    <span
      className={`font-mono text-xs font-semibold px-2 py-0.5 rounded ${color}`}
    >
      {score}
    </span>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-stone-100 text-stone-600",
  };
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded uppercase ${
        styles[priority] ?? "bg-stone-100"
      }`}
    >
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    open: "bg-amber-100 text-amber-800",
    reviewed: "bg-blue-100 text-blue-800",
    blocked: "bg-red-100 text-red-800",
    dismissed: "bg-stone-100 text-stone-500",
  };
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded ${
        styles[status] ?? "bg-stone-100"
      }`}
    >
      {status}
    </span>
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
