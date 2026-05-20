import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Briefcase,
  Users,
  Receipt,
  Settings,
  LogOut,
} from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Fetch employer info for sidebar
  const { data: employer } = await supabase
    .from("employers")
    .select("company_name")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      {/* Sidebar */}
      <aside className="bg-ink text-paper sticky top-0 h-screen flex flex-col p-4 border-r border-stone-700/30">
        {/* Logo */}
        <Link href="/dashboard" className="logo-mark text-paper mb-2 px-3">
          KLOK<span className="dot"></span>
        </Link>
        <div className="eyebrow lime px-3 mb-8">— WERKGEVERS</div>

        {/* Nav */}
        <nav className="space-y-1 flex-1">
          <div className="eyebrow px-3 mb-2">Mijn werk</div>
          <NavLink href="/dashboard" icon={<LayoutDashboard size={16} />}>
            Overzicht
          </NavLink>
          <NavLink href="/dashboard/shifts" icon={<Clock size={16} />}>
            Shifts
          </NavLink>
          <NavLink href="/dashboard/vacatures" icon={<Briefcase size={16} />}>
            Vacatures
          </NavLink>
          <NavLink href="/dashboard/pool" icon={<Users size={16} />}>
            Mijn pool
          </NavLink>

          <div className="eyebrow px-3 mb-2 mt-6">Bedrijf</div>
          <NavLink href="/dashboard/instellingen" icon={<Settings size={16} />}>
            Instellingen
          </NavLink>
        </nav>

        {/* User profile */}
        <div className="border-t border-stone-700/30 pt-4">
          <div className="px-3 py-2 text-sm">
            <div className="font-medium text-paper truncate">
              {employer?.company_name || "Mijn bedrijf"}
            </div>
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

      {/* Main */}
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
