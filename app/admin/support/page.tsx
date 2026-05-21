import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

const STATUSES = ["all", "open", "in_progress", "resolved"] as const;

export default async function AdminSupportPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = (status as (typeof STATUSES)[number]) ?? "all";

  const supabase = await createClient();

  let query = supabase
    .from("support_tickets")
    .select(
      `
      id,
      subject,
      body,
      priority,
      status,
      created_at,
      resolved_at,
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

  const { data: tickets, count } = await query;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— ADMIN · SUPPORT TICKETS</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Support inbox ({count ?? 0}).
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Vragen en problemen van werkgevers en werknemers.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              s === "all"
                ? "/admin/support"
                : `/admin/support?status=${s}`
            }
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              activeStatus === s
                ? "bg-ink text-paper"
                : "bg-paper border border-stone-200 hover:border-ink"
            }`}
          >
            {s === "all" ? "Alle" : s}
          </Link>
        ))}
      </div>

      {!tickets || tickets.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center text-stone-500">
          {activeStatus !== "all"
            ? "Geen tickets voor dit filter."
            : "Geen support tickets — iedereen is tevreden 🎉"}
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((t) => {
            const u = Array.isArray(t.users) ? t.users[0] : t.users;
            const name =
              [u?.first_name, u?.last_name]
                .filter(Boolean)
                .join(" ") || u?.email?.split("@")[0] || "—";

            return (
              <div
                key={t.id}
                className="bg-paper border border-stone-200 rounded-lg p-5"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-serif text-lg font-medium tracking-tight">
                        {t.subject}
                      </h3>
                      <PriorityBadge priority={t.priority} />
                      <StatusBadge status={t.status} />
                    </div>
                    <div className="text-xs text-stone-500">
                      {name} ({u?.user_type ?? "—"}) ·{" "}
                      {new Date(t.created_at).toLocaleString("nl-NL", {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  {u?.email && (
                    <a
                      href={`mailto:${u.email}`}
                      className="text-xs bg-stone-100 px-2.5 py-1 rounded hover:bg-stone-200"
                    >
                      📧 Reageren
                    </a>
                  )}
                </div>
                <p className="text-sm text-stone-700 mt-2 whitespace-pre-wrap bg-cream rounded p-3">
                  {t.body}
                </p>
                {t.resolved_at && (
                  <div className="text-xs text-lime-dark mt-2 font-semibold">
                    ✓ Resolved op{" "}
                    {new Date(t.resolved_at).toLocaleDateString("nl-NL")}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-xs text-stone-500 mt-4">
        💡 In-app reply + status-update komt in volgende ronde. Voor nu kan je
        reageren via je eigen email.
      </p>
    </div>
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
    in_progress: "bg-blue-100 text-blue-800",
    resolved: "bg-lime/20 text-lime-dark",
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
