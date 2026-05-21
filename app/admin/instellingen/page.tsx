import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminInstellingenPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("users")
    .select("first_name, last_name, email, created_at")
    .eq("id", user!.id)
    .single();

  const adminName =
    [profile?.first_name, profile?.last_name]
      .filter(Boolean)
      .join(" ") ||
    profile?.email?.split("@")[0] ||
    "Admin";

  // Platform-wide counts
  const [
    { count: employersCount },
    { count: employeesCount },
    { count: shiftsCount },
    { count: vacanciesCount },
    { count: adminsCount },
    { count: providersCount },
  ] = await Promise.all([
    supabase.from("employers").select("*", { count: "exact", head: true }),
    supabase.from("employees").select("*", { count: "exact", head: true }),
    supabase.from("shifts").select("*", { count: "exact", head: true }),
    supabase.from("vacancies").select("*", { count: "exact", head: true }),
    supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .eq("user_type", "admin"),
    supabase
      .from("sector_payroll_providers")
      .select("*", { count: "exact", head: true })
      .eq("active", true),
  ]);

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <span className="eyebrow">— ADMIN · INSTELLINGEN</span>
        <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
          Platform instellingen.
        </h1>
        <p className="text-stone-500 text-sm mt-1">
          Globale instellingen + jouw admin-account.
        </p>
      </div>

      {/* Jouw account */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-4">
        <h2 className="font-serif text-xl font-medium mb-4">Jouw account</h2>
        <div className="space-y-2 text-sm">
          <Row label="Naam">{adminName}</Row>
          <Row label="Email">{profile?.email ?? "—"}</Row>
          <Row label="Rol">
            <span className="bg-lime/20 text-lime-dark px-2 py-0.5 rounded text-xs font-semibold">
              Admin
            </span>
          </Row>
          <Row label="Sinds">
            {profile?.created_at
              ? new Date(profile.created_at).toLocaleDateString("nl-NL", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "—"}
          </Row>
        </div>
      </div>

      {/* Platform stats */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-4">
        <h2 className="font-serif text-xl font-medium mb-4">Platform stats</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <Stat label="Werkgevers" value={employersCount ?? 0} />
          <Stat label="Werknemers" value={employeesCount ?? 0} />
          <Stat label="Admins" value={adminsCount ?? 0} />
          <Stat label="Shifts (totaal)" value={shiftsCount ?? 0} />
          <Stat label="Vacatures (totaal)" value={vacanciesCount ?? 0} />
          <Stat label="Actieve payroll partijen" value={providersCount ?? 0} />
        </div>
      </div>

      {/* Wat hier nog komt */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6">
        <h2 className="font-serif text-xl font-medium mb-3">
          Komende instellingen
        </h2>
        <ul className="space-y-2 text-sm text-stone-700">
          <li>
            <strong>Platform fee aanpassen</strong> — wijzig de 11,5% shift fee
            of vacature staffel. Nu hardcoded in code.
          </li>
          <li>
            <strong>Coop agreement versie</strong> — push een nieuwe versie
            (alle werkgevers moeten dan opnieuw tekenen na 30 dagen melding).
          </li>
          <li>
            <strong>Email templates</strong> — pas wervings + welkomst-mails aan
            (komt bij email integratie).
          </li>
          <li>
            <strong>Fraud detection regels</strong> — drempelwaardes voor IP
            cluster, GPS mismatch, etc.
          </li>
          <li>
            <strong>Admin uitnodigen</strong> — voeg nieuwe admins toe (nu
            handmatig via SQL).
          </li>
        </ul>
      </div>

      <div className="mt-6 text-xs text-stone-500 flex items-center gap-2">
        <span>Snelle links:</span>
        <Link href="/admin/payroll" className="underline hover:text-ink">
          Payroll partijen
        </Link>
        <span>·</span>
        <Link href="/admin/financien" className="underline hover:text-ink">
          Financiën
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex justify-between border-b border-stone-100 pb-2">
      <span className="text-stone-500">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-cream rounded-md p-3">
      <div className="eyebrow text-[10px]">{label}</div>
      <div className="font-serif text-2xl font-medium mt-1">{value}</div>
    </div>
  );
}
