import { daysUntilShiftsLive, SHIFTS_LIVE_AT } from "@/lib/feature-flags";
import Link from "next/link";
import { Clock, Briefcase, ArrowRight, Sparkles } from "lucide-react";

export default function WerknemerShiftsBinnenkortPage() {
  const days = daysUntilShiftsLive();
  const liveDate = new Date(SHIFTS_LIVE_AT).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <div className="bg-paper border border-stone-200 rounded-3xl p-10 shadow-sm">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-orange-600 font-semibold mb-4">
          <Sparkles size={14} />
          Bijna live
        </div>

        <h1 className="text-4xl sm:text-5xl font-display font-black text-ink leading-tight mb-4">
          Shifts gaan live in{" "}
          <span className="text-orange-600">
            {days} {days === 1 ? "dag" : "dagen"}
          </span>
          .
        </h1>

        <p className="text-stone-600 text-lg leading-relaxed mb-8">
          Losse shifts (flex-werk per dag) lanceren we op{" "}
          <strong>{liveDate}</strong>. Tot die tijd kan je al wél reageren op{" "}
          <strong>vacatures</strong> voor vaste banen — werkgevers in jouw
          regio plaatsen die al actief.
        </p>

        <div className="bg-cream border border-stone-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Briefcase className="text-paper" size={22} />
            </div>
            <div className="flex-1">
              <h2 className="font-display font-black text-xl text-ink mb-2">
                Pak nu de vaste banen
              </h2>
              <ul className="space-y-2 text-stone-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">·</span>
                  <span>
                    Vaste contracten in <strong>horeca, zorg, retail</strong>
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">·</span>
                  <span>
                    Tarieven van <strong>€16 – €28 per uur</strong>, vooraf
                    zichtbaar
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">·</span>
                  <span>
                    Reageer met je <strong>complete profiel + CV</strong> —
                    maakt indruk
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">·</span>
                  <span>
                    Tip vrienden &amp; verdien <strong>€100/maand</strong> per
                    succesvolle aanbreng
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/werknemer/vacatures"
            className="flex-1 bg-ink hover:bg-ink-soft text-paper font-semibold rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-colors"
          >
            Vacatures bekijken
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/werknemer/referrals"
            className="flex-1 bg-stone-100 hover:bg-stone-200 text-ink font-semibold rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-colors"
          >
            Mijn referrals
          </Link>
        </div>
      </div>
    </div>
  );
}
