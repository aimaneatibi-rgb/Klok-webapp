import { daysUntilShiftsLive, SHIFTS_LIVE_AT } from "@/lib/feature-flags";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";

export default function ShiftsBinnenkortPage() {
  const days = daysUntilShiftsLive();
  const liveDate = new Date(SHIFTS_LIVE_AT).toLocaleDateString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <span className="eyebrow">— FLEX-WERK</span>
      <h1 className="font-serif text-4xl font-medium tracking-tight mt-2 mb-2">
        Shifts komen over {days} {days === 1 ? "dag" : "dagen"}.
      </h1>
      <p className="text-stone-500 text-sm mb-8">
        We launchen shifts in fase 2 — vanaf <strong>{liveDate}</strong>. In de
        tussentijd richten we ons volledig op vacatures en het opbouwen van een
        sterke werknemer-pool in jouw regio. Zo zit je goed gevuld op dag 1.
      </p>

      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <h2 className="font-serif text-xl font-medium mb-4">
          Wat je nu wél kan doen
        </h2>
        <ul className="space-y-2 text-sm text-stone-700">
          <li className="flex items-start gap-2">
            <span className="text-lime-dark font-bold">·</span>
            <span>
              <strong>Vacatures plaatsen</strong> voor vaste of parttime
              krachten
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lime-dark font-bold">·</span>
            <span>
              Je <strong>bedrijfsprofiel</strong> aanscherpen zodat werknemers
              je makkelijk vinden
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lime-dark font-bold">·</span>
            <span>
              Op <strong>sollicitaties</strong> reageren — die komen binnen
              naarmate werknemers zich aanmelden
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lime-dark font-bold">·</span>
            <span>
              Je <strong>pool</strong> bouwen: favoriete kandidaten opslaan
              voor later
            </span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/dashboard/vacatures/new"
          className="flex-1 bg-lime text-ink px-6 py-2.5 rounded-md font-semibold hover:bg-lime-dark transition-colors flex items-center justify-center gap-2"
        >
          Vacature plaatsen
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/dashboard"
          className="flex-1 bg-paper border border-stone-200 text-ink px-6 py-2.5 rounded-md font-semibold hover:border-ink transition-colors flex items-center justify-center"
        >
          Naar overzicht
        </Link>
      </div>

      <div className="bg-cream border border-stone-200 rounded-lg p-5 mt-6">
        <p className="text-xs text-stone-500 leading-relaxed">
          <Clock size={12} className="inline -mt-0.5 mr-1" />
          Waarom de wachtmodus? We willen dat shifts vanaf moment 1 succesvol
          zijn. Lege werknemer-pools = teleurstelling. Eerst pool bouwen, dan
          shifts openzetten. Dit is een bewuste keuze om kwaliteit te
          garanderen.
        </p>
      </div>
    </div>
  );
}
