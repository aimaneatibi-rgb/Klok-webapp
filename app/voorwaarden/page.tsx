import Link from "next/link";
import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Algemene voorwaarden · KLOK Works",
  description: "Algemene voorwaarden voor gebruik van het KLOK Works platform.",
};

export default function VoorwaardenPage() {
  return (
    <>
      <MarketingNav />
      <main className="bg-cream text-ink">
        <div className="max-w-3xl mx-auto px-6 py-16">
          <div className="mb-8">
          <span className="eyebrow">— JURIDISCH</span>
          <h1 className="font-serif text-4xl font-medium tracking-tight mt-2">
            Algemene voorwaarden
          </h1>
          <p className="text-stone-500 text-sm mt-2">
            Versie 1.0 · Laatst bijgewerkt: 22 mei 2026
          </p>
        </div>

        <article className="prose-klok space-y-8 text-stone-800 text-[15px] leading-relaxed">
          <Section heading="1. Definities">
            <p>
              <strong>KLOK Works</strong> (hierna: &ldquo;KLOK&rdquo;, &ldquo;wij&rdquo;) is
              het online platform dat werkgevers en werknemers direct met elkaar
              in contact brengt voor shifts en vacatures.
            </p>
            <p>
              <strong>Werkgever</strong>: een organisatie die via KLOK shifts of
              vacatures plaatst.
            </p>
            <p>
              <strong>Werknemer</strong>: een natuurlijk persoon die via KLOK op
              shifts of vacatures reageert en werk uitvoert.
            </p>
            <p>
              <strong>Payroll-partij</strong>: de door KLOK aangewezen externe
              partij die per sector verantwoordelijk is voor het arbeidscontract
              en de loonadministratie van de werknemer.
            </p>
          </Section>

          <Section heading="2. Rol van het platform">
            <p>
              KLOK is uitsluitend een bemiddelingsplatform. Wij zijn geen
              werkgever, geen uitzendbureau en geen partij bij de
              arbeidsovereenkomst tussen werkgever en werknemer. De
              arbeidsrelatie loopt formeel via de payroll-partij.
            </p>
            <p>
              KLOK is niet verantwoordelijk voor de inhoud van shifts of
              vacatures, voor de uitvoering van het werk, of voor de kwaliteit
              van de werknemer of de werkomgeving.
            </p>
          </Section>

          <Section heading="3. Account en gebruik">
            <p>
              Een account is persoonlijk. Je bent zelf verantwoordelijk voor de
              juistheid van je gegevens en het geheimhouden van je wachtwoord.
              Je mag het platform niet gebruiken voor frauduleuze, misleidende
              of onwettige doeleinden.
            </p>
            <p>
              KLOK behoudt zich het recht voor accounts te schorsen of te
              verwijderen bij misbruik, fraude, of schending van deze
              voorwaarden.
            </p>
          </Section>

          <Section heading="4. Tarieven en betaling">
            <p>
              <strong>Werkgever:</strong> KLOK rekent een platformfee van 11,5%
              over het bruto-uurloon per shift. Voor vacatures geldt een
              staffeltarief tussen €150 en €235 per geplaatste vacature, plus
              een maandelijkse abonnementsfee zolang de vacature open staat.
              Actuele tarieven staan in het dashboard.
            </p>
            <p>
              <strong>Werknemer:</strong> gebruik van het platform is gratis.
              Uitbetaling van loon loopt via de payroll-partij volgens diens
              eigen voorwaarden en uitbetaaltermijn.
            </p>
            <p>
              Facturen aan werkgevers zijn betaalbaar binnen 14 dagen. Bij te
              late betaling geldt de wettelijke handelsrente.
            </p>
          </Section>

          <Section heading="5. Annulering">
            <p>
              Een werkgever kan een geplaatste shift kosteloos annuleren tot 24
              uur voor de starttijd. Daarna is de werkgever de overeengekomen
              vergoeding aan de werknemer verschuldigd, plus de KLOK
              platformfee.
            </p>
            <p>
              Een werknemer die zich na bevestiging niet kan houden aan de
              gemaakte afspraak dient dit zo snel mogelijk te melden. Herhaalde
              no-shows kunnen leiden tot schorsing van het account.
            </p>
          </Section>

          <Section heading="6. Beoordelingen en ratings">
            <p>
              Werkgevers en werknemers kunnen elkaar na afloop van een shift
              beoordelen. Ratings dienen eerlijk en feitelijk te zijn. KLOK
              behoudt zich het recht voor om ratings te verwijderen die in
              strijd zijn met de wet, beledigend zijn, of aantoonbaar onjuist.
            </p>
          </Section>

          <Section heading="7. Aansprakelijkheid">
            <p>
              KLOK spant zich in voor een betrouwbaar platform maar geeft geen
              garantie op ononderbroken beschikbaarheid. Onze aansprakelijkheid
              is beperkt tot directe schade en tot maximaal de in de afgelopen
              drie maanden door de werkgever aan KLOK betaalde bedragen.
            </p>
            <p>
              KLOK is niet aansprakelijk voor schade die voortvloeit uit het
              handelen of nalaten van werkgever, werknemer of payroll-partij.
            </p>
          </Section>

          <Section heading="8. Privacy">
            <p>
              Op het gebruik van KLOK is onze{" "}
              <Link href="/privacy" className="underline font-semibold">
                privacy policy
              </Link>{" "}
              van toepassing.
            </p>
          </Section>

          <Section heading="9. Beëindiging">
            <p>
              Je kunt je account op elk moment opzeggen via je instellingen of
              door een verzoek aan{" "}
              <a href="mailto:hallo@klokworks.nl" className="underline">
                hallo@klokworks.nl
              </a>
              . Openstaande verplichtingen blijven van kracht na opzegging.
            </p>
          </Section>

          <Section heading="10. Wijzigingen">
            <p>
              KLOK mag deze voorwaarden van tijd tot tijd wijzigen. Bij
              wezenlijke wijzigingen word je vooraf per email geïnformeerd. Door
              voortgezet gebruik na een wijziging accepteer je de nieuwe versie.
            </p>
          </Section>

          <Section heading="11. Toepasselijk recht">
            <p>
              Op deze voorwaarden is Nederlands recht van toepassing. Geschillen
              worden voorgelegd aan de bevoegde rechter in het arrondissement
              waar KLOK statutair is gevestigd.
            </p>
          </Section>

          <Section heading="12. Contact">
            <p>
              Vragen over deze voorwaarden? Mail{" "}
              <a href="mailto:hallo@klokworks.nl" className="underline">
                hallo@klokworks.nl
              </a>
              .
            </p>
          </Section>
        </article>

        </div>
      </main>
      <MarketingFooter />
    </>
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
