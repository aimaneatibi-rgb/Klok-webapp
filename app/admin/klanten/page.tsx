import { createClient } from "@/lib/supabase/server";
import { SECTOR_LABELS } from "@/lib/sectors";
import Link from "next/link";

export default async function AdminKlantenPage() {
  const supabase = await createClient();

  const { data: employers } = await supabase
    .from("employers")
    .select(
      `
      id,
      company_name,
      kvk_number,
      sector,
      created_at,
      users (
        email,
        phone,
        status
      )
    `
    )
    .order("created_at", { ascending: false });

  const { count: totalCount } = await supabase
    .from("employers")
    .select("*", { count: "exact", head: true });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— ADMIN · KLANTEN</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Alle werkgevers ({totalCount ?? 0}).
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Alle bedrijven die zich hebben geregistreerd op KLOK Works.
        </p>
      </div>

      {!employers || employers.length === 0 ? (
        <EmptyState message="Nog geen klanten geregistreerd." />
      ) : (
        <div className="bg-paper border border-stone-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50 text-left">
                  <Th>Bedrijf</Th>
                  <Th>KvK</Th>
                  <Th>Sector</Th>
                  <Th>Email</Th>
                  <Th>Sinds</Th>
                  <Th>Status</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {employers.map((e) => {
                  const user = Array.isArray(e.users) ? e.users[0] : e.users;
                  return (
                    <tr
                      key={e.id}
                      className="border-b border-stone-100 hover:bg-stone-50"
                    >
                      <Td className="font-medium">{e.company_name}</Td>
                      <Td className="font-mono text-xs">
                        {e.kvk_number ?? "—"}
                      </Td>
                      <Td>{SECTOR_LABELS[e.sector] ?? e.sector}</Td>
                      <Td className="text-stone-600">{user?.email ?? "—"}</Td>
                      <Td className="text-stone-600">
                        {new Date(e.created_at).toLocaleDateString("nl-NL", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </Td>
                      <Td>
                        <StatusPill status={user?.status ?? "active"} />
                      </Td>
                      <Td>
                        <Link
                          href={`/admin/klanten/${e.id}`}
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
