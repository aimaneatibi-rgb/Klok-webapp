import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  daysUntilWorkerUnlock,
  workerUnlockDate,
  isWorkerLocked,
  WORKER_ACCESS_LOCK_DAYS,
} from "@/lib/feature-flags";
import { Clock, CheckCircle, Briefcase, Sparkles } from "lucide-react";

export default async function WachtkamerPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("user_type, created_at, first_name")
    .eq("id", user.id)
    .single();
  if (!profile) redirect("/login");
  if (profile.user_type !== "employee") redirect("/");

  // Als de lock voorbij is: door naar overzicht.
  if (!isWorkerLocked(profile.created_at)) {
    redirect("/werknemer");
  }

  const daysLeft = daysUntilWorkerUnlock(profile.created_at);
  const unlockISO = workerUnlockDate(profile.created_at);
  const unlockDate = unlockISO
    ? new Date(unlockISO).toLocaleDateString("nl-NL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
    : null;
  const progress = Math.max(
    0,
    Math.min(100, ((WORKER_ACCESS_LOCK_DAYS - daysLeft) / WORKER_ACCESS_LOCK_DAYS) * 100)
  );

  // Check profiel-volledigheid
  const { data: worker } = await supabase
    .from("workers")
    .select("bio, phone")
    .eq("user_id", user.id)
    .maybeSingle();
  const profileComplete = !!(worker?.bio && worker?.phone);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="bg-paper border border-stone-200 rounded-3xl p-10 shadow-sm">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-orange-600 font-semibold mb-4">
          <Sparkles size={14} />
          Welkom bij Klok
        </div>

        <h1 className="text-4xl sm:text-5xl font-display font-black text-ink leading-tight mb-4">
          Nog{" "}
          <span className="text-orange-600">
            {daysLeft} {daysLeft === 1 ? "dag" : "dagen"}
          </span>{" "}
          en je bent live.
        </h1>

        <p className="text-stone-600 text-lg leading-relaxed mb-8">
          Hoi {profile.first_name || "daar"} 👋 — fijn dat je er bent. We zijn
          op dit moment hard bezig om werkgevers aan boord te halen in jouw
          regio, zodat er voor jou ook écht iets te kiezen valt zodra we
          openen. Tot die tijd kun je rustig je profiel afmaken.
        </p>

        {/* Progress bar */}
        <div className="mb-10">
          <div className="flex justify-between text-xs text-stone-500 mb-2">
            <span>Vandaag</span>
            {unlockDate && (
              <span className="font-semibold text-ink">
                Live op {unlockDate}
              </span>
            )}
          </div>
          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-orange-500 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Wat je nu kan doen */}
        <div className="space-y-3 mb-10">
          <h2 className="font-display font-black text-xl text-ink mb-4">
            Wat je nu al kan doen:
          </h2>

          <ChecklistItem
            done={profileComplete}
            title="Maak je profiel compleet"
            description="Een ingevuld profiel valt als eerste op zodra werkgevers binnen zijn."
            href="/werknemer/profiel"
            cta="Naar profiel"
          />
          <ChecklistItem
            done={false}
            title="Vul je CV in"
            description="Werkervaring, opleiding, beschikbaarheid — dit verhoogt je matches."
            href="/werknemer/cv"
            cta="Naar CV"
          />
          <ChecklistItem
            done={false}
            title="Verdien alvast €100/maand via referrals"
            description="Tip een vriend op een vacature; zodra die wordt aangenomen krijg jij €100/maand zolang ze daar werken."
            href="/werknemer/referrals"
            cta="Lees meer"
          />
        </div>

        <div className="bg-cream border border-stone-200 rounded-2xl p-6">
          <p className="text-sm text-stone-600 leading-relaxed">
            <strong className="text-ink">Waarom de wachttijd?</strong> We
            openen voor werknemers en werkgevers tegelijk in jouw regio. Als
            we nu al iedereen zouden toelaten, zouden je eerste shifts en
            sollicitaties tegen lege werkgever-pools aanlopen. We willen dat
            je vanaf dag 1 echt iets kan kiezen. Bedankt voor je geduld 🙏
          </p>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({
  done,
  title,
  description,
  href,
  cta,
}: {
  done: boolean;
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-start gap-4 p-5 rounded-2xl border border-stone-200 hover:border-orange-300 hover:bg-orange-50/30 transition-colors group"
    >
      <div
        className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
          done ? "bg-green-500" : "bg-stone-200"
        }`}
      >
        {done ? (
          <CheckCircle className="w-5 h-5 text-white" />
        ) : (
          <Briefcase className="w-3 h-3 text-stone-500" />
        )}
      </div>
      <div className="flex-1">
        <div className="font-semibold text-ink mb-1">{title}</div>
        <div className="text-sm text-stone-600">{description}</div>
      </div>
      <div className="text-sm font-semibold text-orange-600 group-hover:translate-x-1 transition-transform mt-1">
        {cta} →
      </div>
    </Link>
  );
}
