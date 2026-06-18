import Link from "next/link";
import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "Over ons — KLOK Works",
  description:
    "Waarom we KLOK Works bouwen — een eerlijke marktplaats die werk en talent verbindt, met een referral-model voor legaal extra inkomen tegen schijnzelfstandigheid.",
};

export default function OverOnsPage() {
  return (
    <>
      <MarketingNav active="/over-ons" />

      <section
        className="mkt-section"
        style={{ padding: "80px 0 64px", background: "var(--cream)" }}
      >
        <div className="mkt-container">
          <span className="eyebrow">— Over KLOK Works</span>
          <h1
            className="display section-title mt-2"
            style={{ fontSize: "clamp(48px, 8vw, 110px)" }}
          >
            Een marktplaats,
            <br />
            <em>niet nog een uitzendbureau.</em>
          </h1>
          <p
            className="section-lead mt-3"
            style={{ maxWidth: "700px" }}
          >
            We zijn KLOK Works. Een Nederlands tech-platform dat werknemers en
            werkgevers direct met elkaar verbindt. Onze contract-partners
            regelen de juridische kant — wij regelen de match.
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="grid-2" style={{ gap: "64px", alignItems: "start" }}>
            <div className="reveal">
              <span className="eyebrow">— Waarom we begonnen</span>
              <h2 className="section-title mt-2">
                Werk verdient
                <br />
                <em>eerlijkere voorwaarden.</em>
              </h2>
            </div>
            <div className="reveal reveal-delay-1">
              <p
                style={{
                  fontSize: "17px",
                  color: "var(--stone-700)",
                  lineHeight: 1.7,
                  marginBottom: "16px",
                }}
              >
                In Nederland werkt 1 op de 3 mensen flexibel. Uitzendbureaus
                rekenen 25-40% marge en houden het meeste verdienmodel
                ondoorzichtig. Werknemers zien niet wat hun werk écht oplevert.
                Werkgevers betalen vooral voor tussenpersonen.
              </p>
              <p
                style={{
                  fontSize: "17px",
                  color: "var(--stone-700)",
                  lineHeight: 1.7,
                  marginBottom: "16px",
                }}
              >
                Bij KLOK draaien we het om: één transparante platformfee van
                11,5%, betaling binnen 4 dagen, en €1 per gewerkt uur naar de
                aanbrenger — levenslang. Geen marges in het midden.
              </p>
              <p
                style={{
                  fontSize: "17px",
                  color: "var(--stone-700)",
                  lineHeight: 1.7,
                }}
              >
                We zijn een marktplaats — geen uitzendbureau. Onze
                contract-partners regelen contracten, cao en loon. KLOK regelt
                de matching, de transparantie, en het platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mkt-section"
        style={{ background: "var(--ink)", color: "var(--paper)" }}
      >
        <div className="mkt-container">
          <div className="grid-2" style={{ gap: "64px", alignItems: "start" }}>
            <div className="reveal">
              <span className="eyebrow lime">— Ons doel met referral</span>
              <h2
                className="section-title mt-2"
                style={{ color: "var(--paper)" }}
              >
                Eerlijk extra inkomen,
                <br />
                <em style={{ color: "var(--lime)" }}>
                  geen schijnconstructies.
                </em>
              </h2>
            </div>
            <div className="reveal reveal-delay-1">
              <p
                style={{
                  fontSize: "17px",
                  color: "var(--stone-300)",
                  lineHeight: 1.7,
                  marginBottom: "16px",
                }}
              >
                Te veel mensen worden vandaag illegaal &lsquo;onderverhuurd&rsquo;
                — doorgeleend zonder dat loon, belasting en premies kloppen. Dat
                voedt schijnzelfstandigheid en uitbuiting.
              </p>
              <p
                style={{
                  fontSize: "17px",
                  color: "var(--stone-300)",
                  lineHeight: 1.7,
                  marginBottom: "16px",
                }}
              >
                Daarom geven we mensen een eerlijk, belastingtechnisch juist
                extra inkomen voor het aanbrengen van werk. Niemand hoeft meer
                het illegale circuit in: alles loopt legaal via onze
                contract-partners, met correcte afdracht.
              </p>
              <p
                style={{
                  fontSize: "17px",
                  color: "var(--paper)",
                  lineHeight: 1.7,
                }}
              >
                Breng je iemand aan voor een <strong>shift</strong>, dan verdien
                je <strong style={{ color: "var(--lime)" }}>levenslang €1
                per gewerkt uur</strong> — zolang die persoon jouw referral
                gebruikt. Breng je iemand aan voor een{" "}
                <strong>vacature</strong>, dan verdien je mee{" "}
                <strong style={{ color: "var(--lime)" }}>
                  zolang het contract loopt
                </strong>
                .
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--cream)" }}>
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Waar we voor staan</span>
            <h2 className="section-title">
              Vier
              <br />
              <em>principes.</em>
            </h2>
          </div>

          <div className="grid-2" style={{ gap: "16px" }}>
            <Principle
              num="01"
              title="Radicale transparantie"
              text="Geen kleine lettertjes, geen verborgen marges. Iedereen ziet wat KLOK kost, wat werkgever betaalt, en wat werknemer overhoudt."
            />
            <Principle
              num="02"
              title="Iedereen wint mee"
              text="Wie het platform vergroot, deelt in de waarde. €1/uur per aangebrachte werknemer. Levenslang. Geen MLM-piramide."
            />
            <Principle
              num="03"
              title="Geen uitzendbureau"
              text="We zijn een marktplaats. Contract-partners regelen het juridische — wij blijven onafhankelijk en focussen op de match."
            />
            <Principle
              num="04"
              title="Snel & eerlijk"
              text="Loon binnen 4 werkdagen. 30-dagen re-match garantie. Geen lange contracten of opzegtermijnen voor werkgevers."
            />
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="grid-3" style={{ gap: "24px" }}>
            <div className="reveal">
              <span className="eyebrow">— Gevestigd</span>
              <div
                className="serif mt-2"
                style={{
                  fontSize: "42px",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                Ede
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--stone-500)",
                  marginTop: "8px",
                }}
              >
                Gelderland, Nederland
              </p>
            </div>
            <div className="reveal reveal-delay-1">
              <span className="eyebrow">— Live sinds</span>
              <div
                className="serif mt-2"
                style={{
                  fontSize: "42px",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                2026
              </div>
            </div>
            <div className="reveal reveal-delay-2">
              <span className="eyebrow">— Status</span>
              <div
                className="serif mt-2"
                style={{
                  fontSize: "42px",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                Groeit
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--stone-500)",
                  marginTop: "8px",
                }}
              >
                Eerste werknemers en werkgevers actief
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mkt-section"
        style={{ background: "var(--ink)", color: "var(--paper)" }}
      >
        <div className="mkt-container text-center">
          <div className="reveal" style={{ maxWidth: "700px", margin: "0 auto" }}>
            <h2 className="section-title" style={{ color: "var(--paper)" }}>
              Vragen?
              <br />
              <em style={{ color: "var(--lime)" }}>We zijn bereikbaar.</em>
            </h2>
            <p
              className="section-lead"
              style={{ margin: "24px auto 40px", color: "var(--stone-300)" }}
            >
              Voor pers, partners of algemene vragen — mail{" "}
              <a
                href="mailto:hallo@klokworks.nl"
                style={{ color: "var(--lime)", textDecoration: "underline" }}
              >
                hallo@klokworks.nl
              </a>{" "}
              of bezoek onze help-pagina.
            </p>
            <div
              className="flex gap-2 flex-wrap"
              style={{ justifyContent: "center" }}
            >
              <Link href="/help" className="btn btn-lime btn-large">
                Naar /help
              </Link>
              <Link
                href="/signup"
                className="btn btn-ghost btn-large"
                style={{
                  color: "var(--paper)",
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                Account aanmaken
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}

function Principle({
  num,
  title,
  text,
}: {
  num: string;
  title: string;
  text: string;
}) {
  return (
    <div className="card reveal">
      <span className="card-num">{num}</span>
      <h3 className="card-title">{title}</h3>
      <p className="card-text">{text}</p>
    </div>
  );
}
