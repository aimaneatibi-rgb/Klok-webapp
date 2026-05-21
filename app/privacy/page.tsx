import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy policy · KLOK Works",
  description:
    "Hoe KLOK Works persoonsgegevens verwerkt onder de AVG/GDPR.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-cream text-ink">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <Link href="/" className="logo-mark mb-8 inline-flex">
          KLOK<span className="dot"></span>
        </Link>

        <div className="mb-8">
          <span className="eyebrow">— JURIDISCH</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Privacy policy
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            Versie 1.0 · Laatst bijgewerkt: 22 mei 2026
          </p>
        </div>

        <article className="prose-klok space-y-8 text-stone-800 text-[15px] leading-relaxed">
          <Section heading="1. Wie zijn wij?">
            <p>
              KLOK Works is verwerkingsverantwoordelijke voor de persoonsgegevens
              die wij via dit platform verwerken. Onze contactgegevens:
            </p>
            <p>
              KLOK Works
              <br />
              Jaarsveld 6, 6715 GE Ede, Nederland
              <br />
              Email:{" "}
              <a href="mailto:hallo@klokworks.nl" className="underline">
                hallo@klokworks.nl
              </a>
            </p>
            <p className="text-stone-500 text-sm italic">
              KvK- en BTW-nummer volgen.
            </p>
          </Section>

          <Section heading="2. Welke gegevens verwerken wij?">
            <p>
              <strong>Van werkgevers:</strong> bedrijfsnaam, KvK-nummer, sector,
              adresgegevens, contactpersoon (naam, email, telefoon, functie),
              factuurgegevens en betaalmethode-informatie (via Mollie).
            </p>
            <p>
              <strong>Van werknemers:</strong> naam, contactgegevens
              (email/telefoon), geboortedatum, woonplaats, sector-voorkeuren,
              werkhistorie, CV-data, ratings, IBAN voor uitbetaling, en
              (waar van toepassing) BSN ten behoeve van de payroll-partij.
            </p>
            <p>
              <strong>Van alle bezoekers:</strong> IP-adres, browser-informatie,
              en gebruiksgegevens (welke pagina&apos;s bezocht, welke knoppen
              geklikt) ten behoeve van beveiliging en platformverbetering.
            </p>
          </Section>

          <Section heading="3. Met welk doel?">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                Werkgevers en werknemers met elkaar matchen voor shifts en
                vacatures.
              </li>
              <li>
                Het platform aanbieden, beheren en beveiligen (login,
                fraude-detectie, ratings).
              </li>
              <li>
                Facturen versturen en betalingen verwerken (werkgever) en
                payroll-data doorgeven (werknemer).
              </li>
              <li>
                Communicatie: bevestigingen, notificaties bij reacties, support.
              </li>
              <li>
                Voldoen aan wettelijke verplichtingen (boekhouding, fiscaal).
              </li>
            </ul>
          </Section>

          <Section heading="4. Op welke rechtsgrond?">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Uitvoering van de overeenkomst</strong> tussen jou en
                KLOK (account, bemiddeling, betaling).
              </li>
              <li>
                <strong>Wettelijke verplichting</strong> (fiscale bewaarplicht,
                identificatieplicht payroll).
              </li>
              <li>
                <strong>Gerechtvaardigd belang</strong> (fraude-preventie,
                platform-verbetering, beveiliging).
              </li>
              <li>
                <strong>Toestemming</strong> waar wettelijk vereist (bijv.
                marketing-emails).
              </li>
            </ul>
          </Section>

          <Section heading="5. Met wie delen wij gegevens?">
            <p>
              Wij delen alleen gegevens met derden als dat nodig is voor de
              werking van het platform of als wij daartoe wettelijk verplicht
              zijn. Belangrijkste ontvangers:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Supabase</strong> (database-hosting, EU-regio Frankfurt)
                — verwerker.
              </li>
              <li>
                <strong>Mollie</strong> (betaalverwerking) — zelfstandig
                verwerkingsverantwoordelijke voor betaaldata.
              </li>
              <li>
                <strong>Payroll-partij per sector</strong> (zoals aangewezen
                door KLOK) — werknemersgegevens voor contractering en
                loonadministratie.
              </li>
              <li>
                <strong>Vercel</strong> (hosting) en mogelijke email-provider
                (transactional mail).
              </li>
              <li>
                <strong>Werkgevers respectievelijk werknemers</strong>: relevante
                profielinformatie voor matching (zoals naam, sectoren, rating).
              </li>
            </ul>
            <p>
              Met alle verwerkers hebben wij een verwerkersovereenkomst (AVG
              art. 28). Gegevens worden niet doorgegeven buiten de EER tenzij
              met passende waarborgen.
            </p>
          </Section>

          <Section heading="6. Hoe lang bewaren wij gegevens?">
            <p>
              Accountgegevens bewaren wij zolang je account actief is. Na
              opzegging worden persoonsgegevens binnen 12 maanden verwijderd of
              geanonimiseerd, tenzij bewaring wettelijk verplicht is
              (boekhouding: 7 jaar; payroll-data conform wettelijke termijn).
            </p>
          </Section>

          <Section heading="7. Beveiliging">
            <p>
              Wij nemen passende technische en organisatorische maatregelen om
              jouw gegevens te beschermen: versleuteling in transit (TLS),
              versleuteling at-rest, role-based access, audit-logs, en
              EU-hosting. Werknemers en partners die toegang hebben tot data zijn
              gebonden aan geheimhouding.
            </p>
          </Section>

          <Section heading="8. Jouw rechten">
            <p>Onder de AVG heb je het recht om:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Inzage te krijgen in jouw persoonsgegevens.</li>
              <li>Correctie of aanvulling te vragen.</li>
              <li>
                Verwijdering te vragen (&ldquo;recht op vergetelheid&rdquo;).
              </li>
              <li>De verwerking te beperken of er bezwaar tegen te maken.</li>
              <li>
                Een kopie van jouw gegevens te ontvangen in een gangbaar formaat
                (dataportabiliteit).
              </li>
              <li>
                Toestemming in te trekken (waar de verwerking op toestemming
                berust).
              </li>
            </ul>
            <p>
              Stuur een verzoek naar{" "}
              <a href="mailto:hallo@klokworks.nl" className="underline">
                hallo@klokworks.nl
              </a>
              . Wij reageren binnen 30 dagen. Ben je het oneens met onze
              afhandeling? Dan kun je een klacht indienen bij de Autoriteit
              Persoonsgegevens via{" "}
              <a
                href="https://autoriteitpersoonsgegevens.nl"
                target="_blank"
                rel="noopener noreferrer"
                className="underline"
              >
                autoriteitpersoonsgegevens.nl
              </a>
              .
            </p>
          </Section>

          <Section heading="9. Cookies en tracking">
            <p>
              Wij gebruiken functionele cookies die noodzakelijk zijn voor login
              en sessiebeheer. Analytische cookies plaatsen wij pas na jouw
              toestemming via de cookie-banner. Wij gebruiken geen marketing-
              of tracking-cookies van derden zonder toestemming.
            </p>
          </Section>

          <Section heading="10. Wijzigingen">
            <p>
              Wij kunnen deze policy aanpassen. De meest actuele versie staat
              altijd op deze pagina, met de datum van laatste wijziging
              bovenaan.
            </p>
          </Section>
        </article>

        <div className="mt-12 pt-8 border-t border-stone-200 text-sm text-stone-500">
          <Link href="/" className="underline hover:text-ink">
            ← Terug naar home
          </Link>
        </div>
      </div>
    </main>
  );
}

function Section({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="font-serif text-xl font-medium tracking-tight mb-3">
        {heading}
      </h2>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
