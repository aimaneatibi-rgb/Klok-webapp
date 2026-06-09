import { daysUntilShiftsLive, SHIFTS_LIVE_AT } from "@/lib/feature-flags";
import Link from "next/link";
import { Clock, Briefcase, ArrowRight, Sparkles } from "lucide-react";

export default function ShiftsBinnenkortPage() {
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
          Strategische launch
        </div>

        <h1 className="text-4xl sm:text-5xl font-display font-black text-ink leading-tight mb-4">
          Shifts komen over{" "}
          <span className="text-orange-600">
            {days} {days === 1 ? "dag" : "dagen"}
          </span>
          .
        </h1>

        <p className="text-stone-600 text-lg leading-relaxed mb-8">
          We launchen shifts in fase 2 — vanaf <strong>{liveDate}</strong>. In
          de tussentijd richten we ons volledig op <strong>vacatures</strong>{" "}
          en het opbouwen van een sterke werknemer-pool in jouw regio. Zo zit
          je goed gevuld op dag 1.
        </p>

        <div className="bg-cream border border-stone-200 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
              <Briefcase className="text-paper" size={22} />
            </div>
            <div className="flex-1">
              <h2 className="font-display font-black text-xl text-ink mb-2">
                Wat je nu wél kan doen
              </h2>
              <ul className="space-y-2 text-stone-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">·</span>
                  <span>
                    <strong>Vacatures plaatsen</strong> voor vaste of
                    parttime krachten
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">·</span>
                  <span>
                    Je <strong>bedrijfsprofiel</strong> aanscherpen zodat
                    werknemers je makkelijk vinden
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">·</span>
                  <span>
                    Op <strong>sollicitaties</strong> reageren — die komen
                    binnen naarmate werknemers zich aanmelden
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600 font-bold">·</span>
                  <span>
                    Je <strong>pool</strong> bouwen: favoriete kandidaten
                    opslaan voor later
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/vacatures/new"
            className="flex-1 bg-ink hover:bg-ink-soft text-paper font-semibold rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-colors"
          >
            Vacature plaatsen
            <ArrowRight size={18} />
          </Link>
          <Link
            href="/dashboard"
            className="flex-1 bg-stone-100 hover:bg-stone-200 text-ink font-semibold rounded-xl px-6 py-4 flex items-center justify-center gap-2 transition-colors"
          >
            Naar overzicht
          </Link>
        </div>

        <div className="mt-10 pt-8 border-t border-stone-200">
          <p className="text-xs text-stone-500 leading-relaxed">
            <Clock size={12} className="inline -mt-0.5 mr-1" />
            Waarom de wachtmodus? We willen dat shifts vanaf moment 1 succesvol
            zijn. Lege werknemer-pools = teleurstelling. Eerst pool bouwen,
            dan shifts openzetten. Dit is een bewuste keuze om kwaliteit te
            garanderen.
          </p>
        </div>
      </div>
    </div>
  );
}
