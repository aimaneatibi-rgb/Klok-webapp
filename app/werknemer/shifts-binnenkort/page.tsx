import { daysUntilShiftsLive, SHIFTS_LIVE_AT } from "@/lib/feature-flags";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function WerknemerShiftsBinnenkortPage() {
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
        Shifts gaan live over {days} {days === 1 ? "dag" : "dagen"}.
      </h1>
      <p className="text-stone-500 text-sm mb-8">
        Losse shifts (flex-werk per dag) lanceren we op{" "}
        <strong>{liveDate}</strong>. Tot die tijd kan je al wél reageren op
        vacatures voor vaste banen — werkgevers in jouw regio plaatsen die al
        actief.
      </p>

      <div className="bg-paper border border-stone-200 rounded-lg p-6 mb-6">
        <h2 className="font-serif text-xl font-medium mb-4">
          Pak nu de vaste banen
        </h2>
        <ul className="space-y-2 text-sm text-stone-700">
          <li className="flex items-start gap-2">
            <span className="text-lime-dark font-bold">·</span>
            <span>
              Vaste contracten in <strong>horeca, zorg, retail</strong>
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lime-dark font-bold">·</span>
            <span>
              Tarieven van <strong>€16 – €28 per uur</strong>, vooraf zichtbaar
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lime-dark font-bold">·</span>
            <span>
              Reageer met je <strong>complete profiel + CV</strong> — maakt
              indruk
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-lime-dark font-bold">·</span>
            <span>
              Tip vrienden &amp; verdien <strong>€100/maand</strong> per
              succesvolle aanbreng
            </span>
          </li>
        </ul>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/werknemer/vacatures"
          className="flex-1 bg-lime text-ink px-6 py-2.5 rounded-md font-semibold hover:bg-lime-dark transition-colors flex items-center justify-center gap-2"
        >
          Vacatures bekijken
          <ArrowRight size={16} />
        </Link>
        <Link
          href="/werknemer/referrals"
          className="flex-1 bg-paper border border-stone-200 text-ink px-6 py-2.5 rounded-md font-semibold hover:border-ink transition-colors flex items-center justify-center"
        >
          Mijn referrals
        </Link>
      </div>
    </div>
  );
}
