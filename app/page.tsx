import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex items-center justify-center p-8 bg-ink text-paper">
      <div className="max-w-2xl text-center">
        <div className="logo-mark text-paper mb-8 justify-center">
          KLOK<span className="dot"></span>
        </div>
        <span className="eyebrow lime">— WERKGEVERS DASHBOARD</span>
        <h1 className="font-serif text-5xl md:text-7xl font-medium tracking-tight leading-none my-6">
          Werk regelen<br />
          <em className="italic text-lime">zonder tussenpersoon.</em>
        </h1>
        <p className="text-lg text-stone-300 max-w-lg mx-auto mb-8 leading-relaxed">
          Plaats shifts, beheer vacatures, bouw je werkpool — direct, zonder
          uitzendbureau-marges.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/login"
            className="bg-lime text-ink px-6 py-3 rounded-md font-semibold hover:bg-lime-dark transition-colors"
          >
            Inloggen
          </Link>
          <Link
            href="/signup"
            className="bg-transparent text-paper border border-paper/30 px-6 py-3 rounded-md font-medium hover:bg-paper/10 transition-colors"
          >
            Account aanmaken
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
    </main>
  );
}
