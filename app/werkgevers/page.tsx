import Link from "next/link";
import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";
import SavingsCalculator from "@/components/marketing/savings-calculator";
import DemoRequestForm from "@/components/marketing/demo-request-form";

export const metadata: Metadata = {
  title: "Voor werkgevers — KLOK Works",
  description:
    "Slimmer dan een uitzendbureau, eerlijker geprijsd. Bespaar tot 49%.",
};

export default function WerkgeversPage() {
  return (
    <>
      <MarketingNav active="/werkgevers" />

      <header
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "100px 0 80px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "-150px",
            width: "500px",
            height: "500px",
            background: "var(--lime)",
            borderRadius: "50%",
            opacity: 0.08,
            filter: "blur(120px)",
            transform: "translateY(-50%)",
          }}
        />
        <div
          className="mkt-container"
          style={{ position: "relative", zIndex: 2 }}
        >
          <span className="eyebrow" style={{ color: "var(--lime-dark)" }}>
            — VOOR WERKGEVERS
          </span>
          <h1
            className="display section-title mt-2"
            style={{
              fontSize: "clamp(40px, 7vw, 80px)",
              color: "var(--paper)",
              lineHeight: 0.96,
            }}
          >
            Werk regelen
            <br />
            <em style={{ color: "var(--lime)" }}>zonder tussenpersoon.</em>
          </h1>
          <p
            className="section-lead mt-3"
            style={{ color: "var(--stone-300)", maxWidth: "640px" }}
          >
            Account aanmaken, vacature plaatsen, reacties ontvangen — binnen een
            paar minuten live. <strong style={{ color: "var(--paper)" }}>
            Elke vacature start met 14 dagen gratis</strong>. Geen
            tussenpersoon, geen gedoe.
          </p>

          <div className="flex gap-2 mt-4 flex-wrap">
            <Link
              href="/signup"
              className="btn btn-large"
              data-magnetic
              style={{
                background: "var(--lime)",
                color: "var(--ink)",
                padding: "14px 28px",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              Plaats gratis je eerste vacature →
            </Link>
            <Link
              href="#prijzen"
              className="btn btn-large"
              style={{
                background: "transparent",
                color: "var(--paper)",
                padding: "14px 28px",
                borderRadius: "8px",
                border: "2px solid rgba(255,255,255,0.2)",
                fontWeight: 600,
              }}
            >
              Bekijk prijzen
            </Link>
          </div>
          <p
            style={{
              fontSize: "13px",
              color: "var(--stone-500)",
              marginTop: "14px",
            }}
          >
            Gratis account · geen creditcard nodig · eerste 14 dagen geen
            incasso · stopt automatisch bij offline halen
          </p>

          <div
            className="grid-4 mt-5"
            style={{
              gap: "24px",
              paddingTop: "32px",
              borderTop: "1px solid rgba(255,255,255,0.1)",
              maxWidth: "800px",
            }}
          >
            <HeroStat num="11,5%" label="Platformfee · vs 30-40% UZB" />
            <HeroStat num="42 min" label="Tijd-tot-match · gemiddeld" />
            <HeroStat num="€0" label="Eerste 14 dagen · per vacature" />
            <HeroStat num="100%" label="Transparant · geen kleine letters" />
          </div>
        </div>
      </header>

      <section className="mkt-section" style={{ background: "var(--cream)" }}>
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Plug &amp; play</span>
            <h2 className="section-title">
              In een paar minuten
              <br />
              <em>live.</em>
            </h2>
            <p className="section-lead">
              Geen account-managers, geen lange onboarding. Je regelt het zelf —
              en elke vacature start met 14 dagen gratis.
            </p>
          </div>

          <div className="grid-3 reveal">
            <FeatureCard
              num="01"
              title="Maak een gratis account"
              text="In 2 minuten geregeld, geen creditcard nodig. Vul je bedrijfsprofiel in zodat werknemers je herkennen."
            />
            <FeatureCard
              num="02"
              title="Plaats je vacature"
              text="Titel, uren, salaris, contractvorm — klaar. De eerste 14 dagen gratis, daarna € 195/maand — of minder met staffelkorting."
            />
            <FeatureCard
              num="03"
              title="Ontvang reacties"
              text="Werknemers uit jouw regio reageren met een compleet CV. Jij kiest, wij regelen de match."
            />
          </div>

          <div className="text-center" style={{ marginTop: "40px" }}>
            <Link
              href="/signup"
              className="btn btn-primary btn-large"
              data-magnetic
            >
              Maak gratis account →
            </Link>
            <p
              style={{
                fontSize: "13px",
                color: "var(--stone-500)",
                marginTop: "12px",
              }}
            >
              14 dagen gratis · daarna v.a. € 149/mnd ex btw · stopt bij
              offline halen
            </p>
          </div>
        </div>
      </section>

      <section id="prijzen" className="mkt-section">
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Transparante prijzen</span>
            <h2 className="section-title">
              Wat het kost.
              <br />
              <em>Zonder verrassingen.</em>
            </h2>
            <p className="section-lead">
              Wij zijn een marktplaats. Onze contract-partners regelen het
              loonadministratieve deel. Hieronder zie je de all-in prijs én de
              exacte breakdown — radicale transparantie.
            </p>
          </div>

          <div className="grid-2" style={{ gap: "16px" }}>
            <div
              className="reveal"
              style={{
                background: "var(--ink)",
                color: "var(--paper)",
                borderColor: "var(--ink)",
                padding: "48px",
                border: "1px solid var(--ink)",
              }}
            >
              <div
                className="flex"
                style={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <span className="eyebrow lime">— Vacatures · Listing</span>
                <span className="badge live">14 dagen gratis</span>
              </div>
              <div
                className="serif mt-2"
                style={{
                  fontSize: "88px",
                  fontWeight: 500,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.95,
                  color: "var(--paper)",
                }}
              >
                € 195
                <span
                  style={{
                    display: "block",
                    fontSize: "15px",
                    fontWeight: 400,
                    letterSpacing: "0",
                    color: "var(--stone-300)",
                    marginTop: "8px",
                  }}
                >
                  per maand · ex. btw
                </span>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--stone-300)",
                  marginTop: "8px",
                }}
              >
                Per vacature, per maand. Elke vacature start met 14 dagen
                gratis; daarna betaal je automatisch via incasso of op factuur
                (7 dagen termijn). Meer vacatures = lager tarief.
              </p>
              <div
                style={{
                  marginTop: "20px",
                  border: "1px solid rgba(255,255,255,0.15)",
                  borderRadius: "12px",
                  overflow: "hidden",
                  fontSize: "13px",
                }}
              >
                <StaffelRow label="1 vacature" price="€ 195 /mnd" />
                <StaffelRow label="2–3 vacatures" price="€ 175 /mnd p/st" />
                <StaffelRow label="4+ vacatures" price="€ 149 /mnd p/st" last />
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  fontSize: "14px",
                  lineHeight: 2,
                  color: "var(--stone-300)",
                  marginTop: "20px",
                }}
              >
                <li>✓ Eerste 14 dagen gratis — per vacature</li>
                <li>✓ Staffeltarief geldt voor ál je actieve vacatures</li>
                <li>✓ Automatische incasso (Mollie) óf op factuur</li>
                <li>✓ Offline halen = betalen stopt automatisch</li>
                <li>✓ Onbeperkt sollicitanten ontvangen</li>
              </ul>
            </div>

            <div
              className="reveal reveal-delay-1"
              style={{
                background: "var(--lime)",
                borderColor: "var(--lime)",
                padding: "48px",
                border: "1px solid var(--lime)",
              }}
            >
              <span className="eyebrow">— Vacatures · Match</span>
              <div
                className="serif mt-2"
                style={{
                  fontSize: "88px",
                  fontWeight: 500,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.95,
                  color: "var(--ink)",
                }}
              >
                vanaf € 100
                <span style={{ fontSize: "0.3em", color: "var(--stone-700)" }}>
                  {" "}/maand
                </span>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--stone-700)",
                  marginTop: "8px",
                }}
              >
                Per maand contract bij succesvolle match. Vooraf betaald. Bedrag
                mag je verhogen voor schaarse profielen. Ex BTW.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  fontSize: "14px",
                  lineHeight: 2,
                  color: "var(--stone-700)",
                  marginTop: "24px",
                }}
              >
                <li>✓ 8-mnd contract = vanaf € 800</li>
                <li>✓ 12-mnd contract = vanaf € 1.200</li>
                <li>✓ 100% naar de aanbrenger</li>
                <li>✓ Vrij te verhogen als bonus</li>
                <li>✓ Gratis re-match &lt; 30 dagen</li>
              </ul>
            </div>
          </div>

          <div
            className="reveal mt-4"
            style={{
              background: "var(--paper)",
              padding: "48px",
              border: "1px solid var(--stone-200)",
            }}
          >
            <div className="grid-2" style={{ gap: "48px", alignItems: "start" }}>
              <div>
                <div
                  className="flex"
                  style={{
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span className="eyebrow">— Shifts (flex-werk)</span>
                  <span className="badge soon">Binnenkort</span>
                </div>
                <div
                  className="serif mt-2"
                  style={{
                    fontSize: "88px",
                    fontWeight: 500,
                    letterSpacing: "-0.04em",
                    lineHeight: 0.95,
                    color: "var(--ink)",
                  }}
                >
                  € 19,72
                  <span style={{ fontSize: "0.3em", color: "var(--stone-500)" }}>
                    {" "}/uur
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "var(--stone-500)",
                    marginTop: "8px",
                  }}
                >
                  All-in tarief bij zelf-aanmelding. Mét aanbrenger: €
                  20,72/uur (€1 referral-bonus). Shifts gaan later live; we
                  starten met vacatures.
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    fontSize: "14px",
                    lineHeight: 2,
                    color: "var(--stone-700)",
                    marginTop: "24px",
                  }}
                >
                  <li>✓ Bruto loon werknemer (cao-conform)</li>
                  <li>✓ Werkgeverslasten (cao, pensioen, vakantiegeld)</li>
                  <li>✓ KLOK platformfee (11,5%)</li>
                  <li>✓ + €1/uur referral als werknemer aanbrenger heeft</li>
                </ul>
              </div>
              <div>
                <PriceBreakdown />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--cream)" }}>
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Wat krijg je voor 11,5%</span>
            <h2 className="section-title">
              Goedkoper.
              <br />
              Sneller. <em>Schoner.</em>
            </h2>
          </div>

          <div className="grid-3 reveal">
            <FeatureCard num="01" title="11,5% i.p.v. 30%" text="Andere bureaus rekenen 25-30% marge. Wij 11,5%. Tussen € 1,00 en € 2,50 per uur die in jouw zak blijft i.p.v. die van een uitzendbureau." />
            <FeatureCard num="02" title="Cao automatisch" text="Onze contract-partners regelen cao-loon, vakantiegeld en pensioenopbouw automatisch — volledig conform Nederlandse wet- en regelgeving." />
            <FeatureCard num="03" title="Geen werknemer-administratie" text="KLOK is geen werkgever, contract-partner is. Geen contracten, geen ziekteverzuim-administratie, geen ontslagrecht." />
            <FeatureCard num="04" title="Live status" text="Zie in real-time wie aan het werk is, hoe laat shifts beginnen, wie nog te bevestigen is — alles in één dashboard." />
            <FeatureCard num="05" title="Snelle invulling" text="Last-minute uitval? Plaats opnieuw, gemiddeld binnen 1u ingevuld door een werknemer uit jouw vertrouwde KLOK-pool." />
            <FeatureCard num="06" title="Eén factuur per maand" text="Alle gewerkte uren, KLOK-platformfee, met dagelijkse breakdown indien gewenst, op te halen in Excel, Twinfield, e-Boekhouden." />
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Reken zelf na</span>
            <h2 className="section-title">
              Hoeveel scheelt
              <br />
              <em>het écht?</em>
            </h2>
            <p className="section-lead">
              Vul je situatie in. We laten zien wat je via een uitzendbureau
              kwijt bent versus wat het via KLOK zou kosten.
            </p>
          </div>
          <SavingsCalculator />
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--lime)" }}>
        <div className="mkt-container text-center">
          <div className="reveal" style={{ maxWidth: "720px", margin: "0 auto" }}>
            <h2 className="section-title" style={{ color: "var(--ink)" }}>
              Klaar om te starten?
              <br />
              <em>Zet vandaag je eerste vacature live.</em>
            </h2>
            <p
              className="section-lead"
              style={{ color: "var(--ink)", opacity: 0.8, margin: "20px auto 32px" }}
            >
              Gratis account, en elke vacature start met 14 dagen gratis.
              Liever eerst een rondleiding? Vraag hieronder een demo aan.
            </p>
            <div
              className="flex gap-2 flex-wrap"
              style={{ justifyContent: "center" }}
            >
              <Link
                href="/signup"
                className="btn btn-primary btn-large"
                data-magnetic
              >
                Maak gratis account →
              </Link>
              <Link
                href="#contact"
                className="btn btn-large"
                style={{
                  background: "transparent",
                  color: "var(--ink)",
                  border: "2px solid var(--ink)",
                  fontWeight: 600,
                }}
              >
                Liever een demo
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        id="contact"
        className="mkt-section"
        style={{ background: "var(--ink)", color: "var(--paper)" }}
      >
        <div className="mkt-container">
          <div className="grid-2" style={{ gap: "64px", alignItems: "center" }}>
            <div className="reveal">
              <span className="eyebrow lime">— Vraag een demo aan</span>
              <h2
                className="section-title mt-2"
                style={{ color: "var(--paper)" }}
              >
                15 minuten,
                <br />
                <em style={{ color: "var(--lime)" }}>geen verplichting.</em>
              </h2>
              <p
                className="section-lead"
                style={{ color: "var(--stone-300)" }}
              >
                We laten je zien hoe KLOK werkt voor jouw type bedrijf, en
                rekenen samen jouw besparing uit.
              </p>

              <div style={{ marginTop: "32px" }}>
                <DemoBullet text="Live demo van platform en dashboard" />
                <DemoBullet text="Berekening van jouw exacte besparing" />
                <DemoBullet text="Antwoorden op al je vragen over partners" last />
              </div>
            </div>

            <div className="reveal reveal-delay-1">
              <DemoRequestForm />
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}

function StaffelRow({
  label,
  price,
  last = false,
}: {
  label: string;
  price: string;
  last?: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 14px",
        borderBottom: last ? "none" : "1px solid rgba(255,255,255,0.1)",
        color: "var(--stone-300)",
      }}
    >
      <span>{label}</span>
      <span style={{ color: "var(--lime)", fontWeight: 600 }}>{price}</span>
    </div>
  );
}

function HeroStat({ num, label }: { num: string; label: string }) {
  return (
    <div>
      <div
        className="serif"
        style={{
          fontSize: "36px",
          fontWeight: 500,
          color: "var(--lime)",
          letterSpacing: "-0.02em",
          lineHeight: 1,
        }}
      >
        {num}
      </div>
      <div
        className="eyebrow mt-2"
        style={{ color: "var(--stone-500)", fontSize: "10px" }}
      >
        {label}
      </div>
    </div>
  );
}

function PriceBreakdown() {
  return (
    <div
      style={{
        background: "var(--cream)",
        padding: "24px",
        border: "1px solid var(--stone-200)",
        marginTop: 0,
      }}
    >
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "11px",
          textTransform: "uppercase",
          letterSpacing: "0.15em",
          color: "var(--stone-500)",
          marginBottom: "12px",
        }}
      >
        BREAKDOWN PER UUR
      </div>
      <PriceRow label="Bruto loon werknemer (cao)" value="€ 14,50" />
      <PriceRow label="Werkgeverslasten (~22%)" value="€ 3,19" />
      <PriceRow label="Subtotaal werkgeverskosten" value="€ 17,69" />
      <PriceRow label="KLOK platformfee (11,5%)" value="€ 2,03" />
      <div
        style={{
          background: "var(--lime)",
          padding: "12px 24px",
          margin: "4px -24px",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "14px",
        }}
      >
        <span style={{ color: "var(--ink)", fontWeight: 600 }}>
          Subtotaal (zelf-aanmelding)
        </span>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            color: "var(--ink)",
            fontWeight: 700,
          }}
        >
          € 19,72
        </span>
      </div>
      <PriceRow
        label="+ Referral-fee (mét aanbrenger)"
        value="€ 1,00"
        muted
        style={{ marginTop: "8px" }}
      />
      <div
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "12px 24px",
          margin: "4px -24px 0",
          display: "flex",
          justifyContent: "space-between",
          fontSize: "14px",
        }}
      >
        <span style={{ color: "var(--paper)", fontWeight: 600 }}>
          Totaal mét aanbrenger
        </span>
        <span
          style={{
            fontFamily: "JetBrains Mono, monospace",
            color: "var(--lime)",
            fontWeight: 700,
          }}
        >
          € 20,72
        </span>
      </div>
      <p
        style={{
          fontSize: "12px",
          color: "var(--stone-500)",
          marginTop: "16px",
          lineHeight: 1.5,
        }}
      >
        Loon en werkgeverslasten lopen via gekozen contract-partner. KLOK fee
        komt apart op factuur. Referral-fee alleen als werknemer een aanbrenger
        heeft.
      </p>
    </div>
  );
}

function PriceRow({
  label,
  value,
  muted = false,
  style = {},
}: {
  label: string;
  value: string;
  muted?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        fontSize: "14px",
        borderTop: "1px solid var(--stone-200)",
        ...style,
      }}
    >
      <span style={{ color: muted ? "var(--stone-500)" : "var(--stone-700)" }}>
        {label}
      </span>
      <span
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontWeight: 500,
          color: muted ? "var(--stone-500)" : undefined,
        }}
      >
        {value}
      </span>
    </div>
  );
}

function FeatureCard({
  num,
  title,
  text,
}: {
  num: string;
  title: string;
  text: string;
}) {
  return (
    <div className="card">
      <span className="card-num">{num}</span>
      <h3 className="card-title">{title}</h3>
      <p className="card-text">{text}</p>
    </div>
  );
}

function DemoBullet({ text, last = false }: { text: string; last?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "center",
        marginBottom: last ? 0 : "16px",
      }}
    >
      <div
        style={{
          width: "24px",
          height: "24px",
          background: "var(--lime)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--ink)",
          fontWeight: 700,
          flexShrink: 0,
        }}
      >
        ✓
      </div>
      <span style={{ fontSize: "14px", color: "var(--paper)" }}>{text}</span>
    </div>
  );
}
