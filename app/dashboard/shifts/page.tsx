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

export default async function ShiftsPage({
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
    .select("id")
    .eq("user_id", user!.id)
    .single();

  if (!employer) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <p className="text-stone-700">
            Geen werkgever-profiel gevonden. Ga eerst naar{" "}
            <Link href="/dashboard/instellingen" className="underline">
              Instellingen
            </Link>
            .
          </p>
        </div>
      </div>
    );
  }

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
      assigned_employee_id,
      shift_responses ( id )
    `,
      { count: "exact" }
    )
    .eq("employer_id", employer.id)
    .order("starts_at", { ascending: false })
    .limit(100);

  if (activeStatus !== "all") {
    query = query.eq("status", activeStatus);
  }

  const { data: shifts, count } = await query;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
        <div>
          <span className="eyebrow">— FLEX-WERK</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Mijn shifts ({count ?? 0})
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Plaats shifts en zie wie er reageert.
          </p>
        </div>
        <Link
          href="/dashboard/shifts/new"
          className="bg-lime text-ink px-4 py-2 rounded-md font-semibold text-sm hover:bg-lime-dark"
        >
          + Nieuwe shift
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {STATUSES.map((s) => (
          <Link
            key={s}
            href={
              s === "all" ? "/dashboard/shifts" : `/dashboard/shifts?status=${s}`
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

      {!shifts || shifts.length === 0 ? (
        <div className="bg-paper border border-stone-200 rounded-lg p-12 text-center">
          <div className="font-serif text-2xl text-stone-700 mb-2">
            {activeStatus === "all"
              ? "Nog geen shifts"
              : `Geen ${activeStatus} shifts`}
          </div>
          {activeStatus === "all" && (
            <>
              <p className="text-stone-500 text-sm mb-6">
                Plaats je eerste shift en vul &apos;m vaak binnen het uur.
              </p>
              <Link
                href="/dashboard/shifts/new"
                className="inline-block bg-ink text-paper px-5 py-2.5 rounded-md font-medium text-sm hover:bg-ink-soft"
              >
                + Eerste shift plaatsen
              </Link>
            </>
          )}
        </div>
      ) : (
        <div className="bg-paper border border-stone-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left">
                  <Th>Titel</Th>
                  <Th>Wanneer</Th>
                  <Th>Uurloon</Th>
                  <Th>Reacties</Th>
                  <Th>Status</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {shifts.map((s) => {
                  const responsesCount = Array.isArray(s.shift_responses)
                    ? s.shift_responses.length
                    : 0;
                  return (
                    <tr
                      key={s.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <Td className="font-medium">{s.title}</Td>
                      <Td className="text-stone-600">
                        {new Date(s.starts_at).toLocaleString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Td>
                      <Td>€ {(s.hourly_rate_cents / 100).toFixed(2)}</Td>
                      <Td>
                        {responsesCount > 0 ? (
                          <span className="bg-lime/20 text-lime-dark px-2 py-0.5 rounded text-xs font-semibold">
                            {responsesCount}{" "}
                            {responsesCount === 1 ? "reactie" : "reacties"}
                          </span>
                        ) : (
                          <span className="text-stone-400 text-xs">—</span>
                        )}
                      </Td>
                      <Td>
                        <StatusPill status={s.status} />
                      </Td>
                      <Td>
                        <Link
                          href={`/dashboard/shifts/${s.id}`}
                          className="text-ink underline hover:text-lime-dark"
                        >
                          Bekijk →
                        </Link>
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
