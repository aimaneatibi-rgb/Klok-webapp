import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  LayoutDashboard,
  Clock,
  Briefcase,
  Users,
  Receipt,
  CreditCard,
  Settings,
  FileSignature,
  LifeBuoy,
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

  // Role gate: /dashboard is exclusief voor werkgevers. Andere types worden doorgestuurd.
  const { data: profile } = await supabase
    .from("users")
    .select("user_type")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");
  if (profile.user_type === "employee") redirect("/werknemer");
  if (profile.user_type === "admin") redirect("/admin");

  // Fetch employer info for sidebar
  const { data: employer } = await supabase
    .from("employers")
    .select("company_name, coop_agreement_signed_at")
    .eq("user_id", user.id)
    .single();

  const agreementSigned = !!employer?.coop_agreement_signed_at;

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

          <div className="eyebrow px-3 mb-2 mt-6">Financieel</div>
          <NavLink href="/dashboard/facturen" icon={<Receipt size={16} />}>
            Facturen
          </NavLink>
          <NavLink
            href="/dashboard/betaalmethodes"
            icon={<CreditCard size={16} />}
          >
            Betaalmethodes
          </NavLink>

          <div className="eyebrow px-3 mb-2 mt-6">Bedrijf</div>
          <NavLink href="/dashboard/instellingen" icon={<Settings size={16} />}>
            Instellingen
          </NavLink>
          <NavLink
            href="/dashboard/overeenkomst"
            icon={<FileSignature size={16} />}
          >
            <span className="flex items-center gap-1.5">
              Overeenkomst
              {!agreementSigned && (
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400" />
              )}
            </span>
          </NavLink>

          <div className="eyebrow px-3 mb-2 mt-6">Ondersteuning</div>
          <NavLink href="/help" icon={<LifeBuoy size={16} />}>
            Hulp & support
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
      <main className="bg-cream overflow-x-hidden">
        {!agreementSigned && (
          <div className="bg-amber-100 border-b border-amber-300 px-6 py-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-sm text-amber-900">
              <strong>📝 Onderteken eerst de samenwerkingsovereenkomst.</strong>{" "}
              Je kunt geen shifts of vacatures plaatsen tot dit gebeurd is.
            </div>
            <Link
              href="/dashboard/overeenkomst"
              className="bg-ink text-paper px-3 py-1.5 rounded-md text-xs font-semibold hover:bg-ink-soft transition-colors whitespace-nowrap"
            >
              Bekijken & ondertekenen →
            </Link>
          </div>
        )}
        {children}
      </main>
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
