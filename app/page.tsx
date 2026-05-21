import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Route ingelogde users naar hun eigen dashboard op basis van user_type
    const { data: profile } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profile?.user_type === "employee") redirect("/werknemer");
    if (profile?.user_type === "admin") redirect("/admin");
    redirect("/dashboard"); // employer default
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-ink text-paper">
      <div className="max-w-2xl text-center">
        <div className="logo-mark text-paper mb-8 justify-center">
          KLOK<span className="dot"></span>
        </div>
        <span className="eyebrow lime">— HET WERK REGELT ZICHZELF</span>
        <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight leading-none my-6">
          Werk regelen<br />
          <em className="italic text-lime">zonder tussenpersoon.</em>
        </h1>
        <p className="text-lg text-stone-300 max-w-lg mx-auto mb-10 leading-relaxed">
          Direct werkgevers en werknemers koppelen — geen uitzendbureau-marges,
          geen wachttijden.
        </p>

        {/* Twee entry cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6 max-w-xl mx-auto">
          <RoleCard
            eyebrow="Werkgevers"
            title="Plaats shifts & vacatures"
            description="Bouw je werkpool, beheer reacties, betaal direct."
            ctaLabel="Account aanmaken"
            ctaHref="/signup"
            primary
          />
          <RoleCard
            eyebrow="Werknemers"
            title="Vind werk dat past"
            description="Browse shifts in jouw buurt, reageer in 1 tap."
            ctaLabel="Account aanmaken"
            ctaHref="/signup"
          />
        </div>

        <div className="flex gap-3 justify-center flex-wrap text-sm">
          <Link
            href="/login"
            className="text-stone-300 hover:text-paper underline underline-offset-4"
          >
            Al een account? Inloggen →
          </Link>
        </div>

        <div className="mt-16 pt-8 border-t border-paper/10 grid grid-cols-3 gap-4 max-w-md mx-auto">
          <div>
            <div className="font-serif text-2xl text-lime">11,5%</div>
            <div className="eyebrow mt-1">Platformfee</div>
          </div>
          <div>
            <div className="font-serif text-2xl text-lime">49%</div>
            <div className="eyebrow mt-1">Goedkoper</div>
          </div>
          <div>
            <div className="font-serif text-2xl text-lime">€1/u</div>
            <div className="eyebrow mt-1">Referrals</div>
          </div>
        </div>
      </div>

      {/* Discrete admin link */}
      <Link
        href="/login"
        className="mt-12 text-xs text-stone-600 hover:text-stone-400 transition-colors"
      >
        Admin login
      </Link>
    </main>
  );
}

function RoleCard({
  eyebrow,
  title,
  description,
  ctaLabel,
  ctaHref,
  primary = false,
}: {
  eyebrow: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  primary?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-5 text-left border ${
        primary
          ? "bg-lime/10 border-lime/30"
          : "bg-paper/5 border-paper/10 hover:bg-paper/10 transition-colors"
      }`}
    >
      <div className={`eyebrow ${primary ? "lime" : "text-stone-400"}`}>
        — {eyebrow}
      </div>
      <h3 className="font-serif text-xl font-medium tracking-tight mt-2 mb-2 text-paper">
        {title}
      </h3>
      <p className="text-sm text-stone-400 mb-4">{description}</p>
      <Link
        href={ctaHref}
        className={`inline-block px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
          primary
            ? "bg-lime text-ink hover:bg-lime-dark"
            : "bg-paper text-ink hover:bg-stone-200"
        }`}
      >
        {ctaLabel}
      </Link>
    </div>
  );
}
