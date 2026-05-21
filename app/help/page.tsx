import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import type { Metadata } from "next";
import ContactForm from "./contact-form";

export const metadata: Metadata = {
  title: "Hulp & support · KLOK Works",
  description:
    "Veelgestelde vragen en directe ondersteuning voor werkgevers en werknemers op KLOK Works.",
};

const FAQ_WERKGEVER = [
  {
    q: "Hoe plaats ik mijn eerste shift?",
    a: "Maak een account aan via 'Werkgever' op de signup-pagina, vul je bedrijfsgegevens en contactpersoon in, teken de samenwerkingsovereenkomst (eenmalig) en je kunt direct shifts plaatsen via Dashboard → Shifts → Nieuwe shift.",
  },
  {
    q: "Wat zijn de kosten?",
    a: "Voor shifts rekenen we 11,5% platformfee over het bruto-uurloon. Voor vacatures geldt een staffeltarief van €150–€235 per plaatsing, plus een maandelijkse fee zolang de vacature openstaat. Werknemers gebruiken het platform gratis.",
  },
  {
    q: "Wat is een payroll-partij?",
    a: "Per sector werken wij samen met een externe payroll-partij die het arbeidscontract en de loonadministratie van de werknemer afhandelt. KLOK Works is dus uitdrukkelijk geen uitzendbureau. Welke partij voor jouw sector geldt, zie je bij het plaatsen van een shift.",
  },
  {
    q: "Wanneer wordt mijn factuur betaald?",
    a: "Facturen aan werkgevers zijn betaalbaar binnen 14 dagen via iDEAL of bankoverschrijving (via Mollie). Te late betaling: wettelijke handelsrente.",
  },
  {
    q: "Kan ik een shift annuleren?",
    a: "Kosteloos tot 24 uur voor de starttijd. Daarna ben je de overeengekomen vergoeding aan de werknemer verschuldigd plus de KLOK platformfee.",
  },
  {
    q: "Hoe verwijder ik een account of vacature?",
    a: "Een vacature kun je sluiten via Dashboard → Vacatures → details. Voor het verwijderen van je account: stuur een mail naar hallo@klokworks.nl.",
  },
];

const FAQ_WERKNEMER = [
  {
    q: "Hoe vind ik shifts?",
    a: "Log in en ga naar 'Shifts zoeken'. We filteren op de sectoren die je in je profiel hebt aangegeven. Reageer met één klik — de werkgever ziet je profiel en kan accepteren.",
  },
  {
    q: "Waarom moet ik mijn profiel compleet maken?",
    a: "Werkgevers willen weten met wie ze werken. Zonder voornaam, telefoon, geboortedatum en sectoren kun je niet reageren op shifts of solliciteren op vacatures. Vul dit in via 'Mijn profiel'.",
  },
  {
    q: "Wanneer krijg ik mijn loon?",
    a: "Uitbetaling loopt via de payroll-partij die aan jouw sector is gekoppeld. Termijnen en uitbetaaldagen vind je in 'Uitbetalingen'. Vragen over een specifieke betaling: stuur een ticket via het formulier hieronder.",
  },
  {
    q: "Hoe werkt referrals?",
    a: "Voor elke door jou aangebrachte werknemer die wordt aangenomen krijg je €1/u referral-bonus op de eerste shifts (shifts) of een eenmalige €100 bij aanname op een vacature. Deel je referral-link via 'Referrals'.",
  },
  {
    q: "Wat als ik me ziek meld?",
    a: "Meld dit zo snel mogelijk bij de werkgever via de shift-pagina én bij de payroll-partij. Herhaalde no-shows zonder geldige reden kunnen leiden tot schorsing van je account.",
  },
  {
    q: "Hoe pas ik mijn IBAN aan?",
    a: "Via 'Mijn profiel' → bankgegevens. Wijzigingen worden automatisch doorgegeven aan de payroll-partij voor je volgende uitbetaling.",
  },
];

const FAQ_ALGEMEEN = [
  {
    q: "Is KLOK Works een uitzendbureau?",
    a: "Nee. KLOK is een platform dat werkgevers en werknemers direct koppelt. De arbeidsovereenkomst loopt via een sector-specifieke payroll-partij — niet via KLOK.",
  },
  {
    q: "Hoe veilig zijn mijn gegevens?",
    a: "Onze data staat in Supabase op een EU-server (Frankfurt). We gebruiken TLS-versleuteling en role-based access. Lees de details in onze privacy policy.",
  },
  {
    q: "Welke rechten heb ik onder de AVG?",
    a: "Inzage, correctie, verwijdering, dataportabiliteit, beperking, en bezwaar. Mail hallo@klokworks.nl voor een verzoek — we reageren binnen 30 dagen.",
  },
];

export default async function HelpPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let displayName: string | null = null;
  let userEmail: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("first_name, last_name, email")
      .eq("id", user.id)
      .single();
    displayName =
      [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") ||
      null;
    userEmail = profile?.email ?? user.email ?? null;
  }

  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link href="/" className="logo-mark mb-8 inline-flex">
          KLOK<span className="dot"></span>
        </Link>

        <div className="mb-10">
          <span className="eyebrow">— HULP & SUPPORT</span>
          <h1 className="font-serif text-4xl md:text-5xl font-medium tracking-tight mt-2">
            Hoe kunnen we je <em className="italic text-lime-dark">helpen?</em>
          </h1>
          <p className="text-stone-600 mt-3 max-w-2xl">
            Antwoord op de meest gestelde vragen. Staat jouw vraag er niet bij?
            Stuur ons een bericht hieronder — we reageren meestal binnen één
            werkdag.
          </p>
        </div>

        {/* FAQ-secties */}
        <FaqSection
          eyebrow="VOOR WERKGEVERS"
          title="Werk plaatsen & beheren"
          items={FAQ_WERKGEVER}
        />
        <FaqSection
          eyebrow="VOOR WERKNEMERS"
          title="Werk vinden & verdienen"
          items={FAQ_WERKNEMER}
        />
        <FaqSection
          eyebrow="ALGEMEEN"
          title="Over het platform"
          items={FAQ_ALGEMEEN}
        />

        {/* Contact */}
        <section id="contact" className="mt-12">
          <span className="eyebrow">— NOG VRAGEN?</span>
          <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mt-2 mb-4">
            Neem direct contact op.
          </h2>

          {user ? (
            <ContactForm
              userId={user.id}
              displayName={displayName}
              userEmail={userEmail}
            />
          ) : (
            <div className="bg-paper border border-stone-200 rounded-lg p-6">
              <p className="text-sm text-stone-700 mb-4">
                Log in om sneller geholpen te worden — dan koppelen we je
                ticket automatisch aan je account. Of stuur ons direct een mail.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link
                  href="/login"
                  className="bg-lime text-ink px-5 py-2.5 rounded-md font-semibold hover:bg-lime-dark transition-colors"
                >
                  Inloggen
                </Link>
                <a
                  href="mailto:hallo@klokworks.nl"
                  className="bg-cream border border-stone-200 hover:border-ink text-ink px-5 py-2.5 rounded-md font-semibold transition-colors"
                >
                  hallo@klokworks.nl
                </a>
              </div>
            </div>
          )}
        </section>

        <div className="mt-12 pt-8 border-t border-stone-200 text-sm text-stone-500 flex gap-4 flex-wrap">
          <Link href="/" className="underline hover:text-ink">
            ← Terug naar home
          </Link>
          <Link href="/voorwaarden" className="underline hover:text-ink">
            Voorwaarden
          </Link>
          <Link href="/privacy" className="underline hover:text-ink">
            Privacy
          </Link>
        </div>
      </div>
    </main>
  );
}

function FaqSection({
  eyebrow,
  title,
  items,
}: {
  eyebrow: string;
  title: string;
  items: { q: string; a: string }[];
}) {
  return (
    <section className="mb-10">
      <span className="eyebrow">— {eyebrow}</span>
      <h2 className="font-serif text-2xl md:text-3xl font-medium tracking-tight mt-2 mb-4">
        {title}
      </h2>
      <div className="space-y-2">
        {items.map((it, i) => (
          <details
            key={i}
            className="group bg-paper border border-stone-200 rounded-lg overflow-hidden"
          >
            <summary className="cursor-pointer list-none px-5 py-4 flex items-center justify-between gap-3 hover:bg-stone-50">
              <span className="font-medium text-ink">{it.q}</span>
              <span className="text-stone-400 group-open:rotate-45 transition-transform text-xl leading-none">
                +
              </span>
            </summary>
            <div className="px-5 pb-5 text-sm text-stone-700 leading-relaxed">
              {it.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
