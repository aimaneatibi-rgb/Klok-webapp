import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Users,
  Clock,
  Briefcase,
  Wallet,
  Network,
  ShieldAlert,
  LifeBuoy,
  Settings,
  LogOut,
} from "lucide-react";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("user_type, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.user_type === "employer") redirect("/dashboard");
  if (profile.user_type === "employee") redirect("/werknemer");

  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    "Admin";

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <aside className="bg-ink text-paper sticky top-0 h-screen flex flex-col p-4 border-r border-stone-700/30">
        <Link href="/admin" className="logo-mark text-paper mb-2 px-3">
          KLOK<span className="dot"></span>
        </Link>
        <div className="eyebrow lime px-3 mb-8">— ADMIN</div>

        <nav className="space-y-1 flex-1 overflow-y-auto">
          <NavLink href="/admin" icon={<LayoutDashboard size={16} />}>
            Overzicht
          </NavLink>

          <div className="eyebrow px-3 mb-2 mt-6">Gebruikers</div>
          <NavLink href="/admin/klanten" icon={<Building2 size={16} />}>
            Klanten
          </NavLink>
          <NavLink href="/admin/medewerkers" icon={<Users size={16} />}>
            Medewerkers
          </NavLink>

          <div className="eyebrow px-3 mb-2 mt-6">Aanbod</div>
          <NavLink href="/admin/shifts" icon={<Clock size={16} />}>
            Shifts
          </NavLink>
          <NavLink href="/admin/vacatures" icon={<Briefcase size={16} />}>
            Vacatures
          </NavLink>

          <div className="eyebrow px-3 mb-2 mt-6">Financieel</div>
          <NavLink href="/admin/kpi" icon={<TrendingUp size={16} />}>
            <span className="flex items-center gap-1.5">
              KPI · Groei
              <span className="text-[9px] bg-lime/30 text-lime-dark px-1 py-0.5 rounded font-bold">
                LIVE
              </span>
            </span>
          </NavLink>
          <NavLink href="/admin/financien" icon={<Wallet size={16} />}>
            Financiën
          </NavLink>
          <NavLink href="/admin/payroll" icon={<Network size={16} />}>
            Payroll partijen
          </NavLink>

          <div className="eyebrow px-3 mb-2 mt-6">Operatie</div>
          <NavLink href="/admin/fraud" icon={<ShieldAlert size={16} />}>
            Fraud alerts
          </NavLink>
          <NavLink href="/admin/support" icon={<LifeBuoy size={16} />}>
            Support tickets
          </NavLink>

          <div className="eyebrow px-3 mb-2 mt-6">Systeem</div>
          <NavLink href="/admin/instellingen" icon={<Settings size={16} />}>
            Instellingen
          </NavLink>
        </nav>

        <div className="border-t border-stone-700/30 pt-4">
          <div className="px-3 py-2 text-sm">
            <div className="font-medium text-paper truncate">{displayName}</div>
            <div className="text-stone-500 text-xs truncate">{user.email}</div>
          </div>
          <form action="/api/auth/logout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-stone-300 hover:bg-paper/5 hover:text-paper rounded-md w-full transition-colors"
            >
              <LogOut size={16} />
              Uitloggen
            </button>
          </form>
        </div>
      </aside>

      <main className="bg-cream overflow-x-hidden">{children}</main>
    </div>
  );
}

function NavLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 px-3 py-2 text-sm text-stone-300 hover:bg-paper/5 hover:text-paper rounded-md transition-colors font-medium"
    >
      {icon}
      <span>{children}</span>
    </Link>
  );
}
