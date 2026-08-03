import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Briefcase,
  Clock,
  Star,
  Wallet,
  Gift,
  UserCircle,
  FileText,
  LifeBuoy,
  LogOut,
} from "lucide-react";

export default async function WerknemerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Verify user_type — only employees may access /werknemer/*
  const { data: profile } = await supabase
    .from("users")
    .select("user_type, first_name, last_name")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.user_type === "employer") redirect("/dashboard");
  if (profile.user_type === "admin") redirect("/admin");

  const displayName =
    [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
    "Mijn account";

  return (
    <div className="grid grid-cols-[240px_1fr] min-h-screen">
      <aside className="bg-ink text-paper sticky top-0 h-screen flex flex-col p-4 border-r border-stone-700/30">
        <Link href="/werknemer" className="logo-mark text-paper mb-2 px-3">
          KLOK<span className="dot"></span>
        </Link>
        <div className="eyebrow lime px-3 mb-8">— WERKNEMERS</div>

        <nav className="space-y-1 flex-1 overflow-y-auto">
          <NavLink href="/werknemer" icon={<LayoutDashboard size={16} />}>
            Overzicht
          </NavLink>

          <div className="eyebrow px-3 mb-2 mt-6">Mijn werk</div>
          <NavLink href="/werknemer/zoeken" icon={<Search size={16} />}>
            Shifts zoeken
          </NavLink>
          <NavLink href="/werknemer/vacatures" icon={<Briefcase size={16} />}>
            Vacatures
          </NavLink>
          <NavLink href="/werknemer/shifts" icon={<Clock size={16} />}>
            Mijn shifts
          </NavLink>
          <NavLink href="/werknemer/ratings" icon={<Star size={16} />}>
            Mijn ratings
          </NavLink>

          <div className="eyebrow px-3 mb-2 mt-6">Verdienen</div>
          <NavLink href="/werknemer/uitbetalingen" icon={<Wallet size={16} />}>
            Uitbetalingen
          </NavLink>
          <NavLink href="/werknemer/referrals" icon={<Gift size={16} />}>
            Referrals
          </NavLink>

          <div className="eyebrow px-3 mb-2 mt-6">Account</div>
          <NavLink href="/werknemer/profiel" icon={<UserCircle size={16} />}>
            Mijn profiel
          </NavLink>
          <NavLink href="/werknemer/cv" icon={<FileText size={16} />}>
            Mijn CV
          </NavLink>

          <div className="eyebrow px-3 mb-2 mt-6">Ondersteuning</div>
          <NavLink href="/help" icon={<LifeBuoy size={16} />}>
            Hulp & support
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

// Afgeschermd gebied: nooit indexeren, ook niet als er ooit een publieke
// link naartoe lekt. robots.txt sluit het pad al uit, dit is het vangnet.
export const metadata = { robots: { index: false, follow: false } };
