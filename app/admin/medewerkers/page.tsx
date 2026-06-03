import { createClient } from "@/lib/supabase/server";
import { SECTOR_LABELS } from "@/lib/sectors";
import Link from "next/link";

export default async function AdminMedewerkersPage() {
  const supabase = await createClient();

  const { data: employees } = await supabase
    .from("employees")
    .select(
      `
      id,
      date_of_birth,
      sectors,
      avg_rating,
      total_shifts,
      created_at,
      users (
        email,
        phone,
        status,
        first_name,
        last_name,
        digid_verified_at
      )
    `
    )
    .order("created_at", { ascending: false });

  const { count: totalCount } = await supabase
    .from("employees")
    .select("*", { count: "exact", head: true });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— ADMIN · MEDEWERKERS</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Alle werknemers ({totalCount ?? 0}).
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Alle geregistreerde werknemers met hun profielinfo.
        </p>
      </div>

      {!employees || employees.length === 0 ? (
        <EmptyState message="Nog geen werknemers geregistreerd." />
      ) : (
        <div className="bg-paper border border-stone-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left">
                  <Th>Naam</Th>
                  <Th>Email</Th>
                  <Th>Sectoren</Th>
                  <Th>Rating</Th>
                  <Th>Shifts</Th>
                  <Th>DigiD</Th>
                  <Th>Status</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {employees.map((e) => {
                  const user = Array.isArray(e.users) ? e.users[0] : e.users;
                  const fullName =
                    [user?.first_name, user?.last_name]
                      .filter(Boolean)
                      .join(" ") || "Geen naam ingevuld";
                  const sectors = (e.sectors as string[] | null) ?? [];
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <Td className="font-medium">{fullName}</Td>
                      <Td className="text-stone-600">{user?.email ?? "—"}</Td>
                      <Td>
                        {sectors.length === 0 ? (
                          <span className="text-stone-400 text-xs">—</span>
                        ) : (
                          <div className="flex flex-wrap gap-1">
                            {sectors.slice(0, 3).map((s) => (
                              <span
                                key={s}
                                className="px-1.5 py-0.5 bg-lime/20 text-lime-dark rounded text-xs"
                              >
                                {SECTOR_LABELS[s] ?? s}
                              </span>
                            ))}
                            {sectors.length > 3 && (
                              <span className="text-xs text-stone-500">
                                +{sectors.length - 3}
                              </span>
                            )}
                          </div>
                        )}
                      </Td>
                      <Td>
                        {Number(e.avg_rating) > 0
                          ? `${Number(e.avg_rating).toFixed(1)} ⭐`
                          : "—"}
                      </Td>
                      <Td>{e.total_shifts ?? 0}</Td>
                      <Td>
                        {user?.digid_verified_at ? (
                          <span className="text-lime-dark text-xs font-semibold">
                            ✓
                          </span>
                        ) : (
                          <span className="text-stone-400 text-xs">—</span>
                        )}
                      </Td>
                      <Td>
                        <StatusPill status={user?.status ?? "active"} />
                      </Td>
                      <Td>
                        <Link
                          href={`/admin/medewerkers/${e.id}`}
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
    active: "bg-lime/20 text-lime-dark",
    suspended: "bg-amber-100 text-amber-800",
    blocked: "bg-red-100 text-red-800",
    pending: "bg-stone-100 text-stone-600",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
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
