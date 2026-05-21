import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import PreviewSwitcher from "./preview-switcher";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    { count: employersCount },
    { count: employeesCount },
    { count: openShiftsCount },
    { count: openVacanciesCount },
    { count: openAlertsCount },
    { count: openTicketsCount },
    { data: employersList },
    { data: employeesList },
  ] = await Promise.all([
    supabase.from("employers").select("*", { count: "exact", head: true }),
    supabase.from("employees").select("*", { count: "exact", head: true }),
    supabase
      .from("shifts")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("vacancies")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("fraud_alerts")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("support_tickets")
      .select("*", { count: "exact", head: true })
      .eq("status", "open"),
    supabase
      .from("employers")
      .select("id, company_name")
      .order("company_name")
      .limit(50),
    supabase
      .from("employees")
      .select("id, users (first_name, last_name, email)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  const employerOptions = (employersList ?? []).map((e) => ({
    id: e.id,
    label: e.company_name,
  }));
  const employeeOptions = (employeesList ?? []).map((e) => {
    const u = Array.isArray(e.users) ? e.users[0] : e.users;
    const name =
      [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
      u?.email ||
      "Onbekend";
    return { id: e.id, label: name };
  });

  const now = new Date().toLocaleString("nl-NL", {
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <span className="eyebrow">— LIVE · {now}</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Admin overzicht.
          </h1>
          <p className="text-stone-500 text-sm mt-1">
            Platform health, gebruikers, en operatie.
          </p>
        </div>
        <div className="w-full md:w-72">
          <PreviewSwitcher
            employers={employerOptions}
            employees={employeeOptions}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <StatCard
          label="Klanten"
          value={String(employersCount ?? 0)}
          href="/admin/klanten"
          dark
        />
        <StatCard
          label="Medewerkers"
          value={String(employeesCount ?? 0)}
          href="/admin/medewerkers"
        />
        <StatCard
          label="Open shifts"
          value={String(openShiftsCount ?? 0)}
          href="/admin/shifts?status=open"
        />
        <StatCard
          label="Open vacatures"
          value={String(openVacanciesCount ?? 0)}
          href="/admin/vacatures?status=open"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        <StatCard
          label="Open fraud alerts"
          value={String(openAlertsCount ?? 0)}
          href="/admin/fraud"
        />
        <StatCard
          label="Open support tickets"
          value={String(openTicketsCount ?? 0)}
          href="/admin/support"
        />
      </div>

      <div className="bg-paper border border-stone-200 rounded-lg p-6">
        <h2 className="font-serif text-xl font-medium mb-3">Snel naar</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          <QuickLink href="/admin/klanten">→ Alle klanten</QuickLink>
          <QuickLink href="/admin/medewerkers">→ Alle medewerkers</QuickLink>
          <QuickLink href="/admin/shifts">→ Alle shifts</QuickLink>
          <QuickLink href="/admin/vacatures">→ Alle vacatures</QuickLink>
          <QuickLink href="/admin/financien">→ Financiën (binnenkort)</QuickLink>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  dark = false,
}: {
  label: string;
  value: string;
  href?: string;
  dark?: boolean;
}) {
  const inner = (
    <>
      <div className={`eyebrow ${dark ? "text-stone-400" : ""}`}>{label}</div>
      <div
        className={`font-serif text-3xl font-medium tracking-tight mt-2 ${
          dark ? "text-lime" : "text-ink"
        }`}
      >
        {value}
      </div>
    </>
  );

  const className = `block p-5 rounded-lg border transition-colors ${
    dark
      ? "bg-ink text-paper border-ink hover:bg-ink-soft"
      : "bg-paper border-stone-200 hover:border-stone-400"
  }`;

  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

function QuickLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="px-3 py-2 rounded-md text-sm font-medium bg-cream border border-stone-200 hover:border-ink transition-colors"
    >
      {children}
    </Link>
  );
}

