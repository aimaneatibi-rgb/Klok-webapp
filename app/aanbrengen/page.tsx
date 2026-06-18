import Link from "next/link";
import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";
import ReferralCalculator from "@/components/marketing/referral-calculator";

export const metadata: Metadata = {
  title: "Aanbrengen — KLOK Works",
  description:
    "Verdien €1 per gewerkt uur of €100+ per maand — levenslang — door iemand aan te brengen op KLOK.",
};

export default function AanbrengenPage() {
  return (
    <>
      <MarketingNav active="/aanbrengen" />

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
            opacity: 0.1,
            filter: "blur(120px)",
            transform: "translateY(-50%)",
          }}
        />
        <div
          className="mkt-container"
          style={{ position: "relative", zIndex: 2 }}
        >
          <span className="eyebrow lime">— LEVENSLANG VERDIENEN</span>
          <h1
            className="display section-title mt-2"
            style={{
              fontSize: "clamp(48px, 8vw, 110px)",
              color: "var(--paper)",
              lineHeight: 0.96,
            }}
          >
            Breng iemand aan.
            <br />
            <em style={{ color: "var(--lime)" }}>Verdien voor altijd mee.</em>
          </h1>
          <p
            className="section-lead mt-3"
            style={{ color: "var(--stone-300)", maxWidth: "640px" }}
          >
            Eén van Nederland&apos;s eerlijkste verdienmodellen. Voor elke
            werknemer die jij aanbrengt, krijg jij een bonus zolang die persoon
            via KLOK werkt. Geen MLM. Geen einddatum. Gewoon eerlijk delen.
          </p>

          <div className="flex gap-2 mt-4 flex-wrap">
            <Link
              href="/signup"
              className="btn btn-large"
              style={{
                background: "var(--lime)",
                color: "var(--ink)",
                padding: "14px 28px",
                borderRadius: "8px",
                fontWeight: 600,
              }}
            >
              Begin aanbrengen →
            </Link>
            <Link
              href="#calculator"
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
              Bereken inkomen
            </Link>
          </div>
        </div>
      </header>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Twee verdienmodellen</span>
            <h2 className="section-title">
              Bij shifts én
              <br />
              <em>vaste banen.</em>
            </h2>
            <p className="section-lead">
              Of jouw aangebrachte persoon nu losse shifts pakt of een vast
              contract krijgt — jij verdient mee. Verschillende bedragen,
              hetzelfde principe.
            </p>
          </div>

          <div className="grid-2" style={{ gap: "16px" }}>
            <div
              className="card reveal"
              style={{
                background: "var(--ink)",
                color: "var(--paper)",
                padding: "48px",
              }}
            >
              <span className="eyebrow lime">— SHIFTS</span>
              <div
                className="serif mt-2"
                style={{
                  fontSize: "88px",
                  fontWeight: 500,
                  letterSpacing: "-0.04em",
                  lineHeight: 0.95,
                  color: "var(--lime)",
                }}
              >
                €1
                <span
                  style={{ fontSize: "0.3em", color: "var(--stone-300)" }}
                >
                  {" "}/uur
                </span>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--stone-300)",
                  marginTop: "8px",
                }}
              >
                Per gewerkt uur. Levenslang. Werkgever betaalt de fee apart aan
                KLOK — jouw aangebrachte werknemer merkt er niks van.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  fontSize: "14px",
                  lineHeight: 2,
                  color: "var(--stone-300)",
                  marginTop: "24px",
                }}
              >
                <li>✓ Direct uitbetaald op je rekening</li>
                <li>✓ Levenslang — geen einddatum</li>
                <li>✓ Vanaf het eerste gewerkte uur</li>
                <li>✓ Stapelt voor elke aangebrachte werknemer</li>
              </ul>
            </div>

            <div
              className="card reveal reveal-delay-1"
              style={{
                background: "var(--lime)",
                color: "var(--ink)",
                padding: "48px",
              }}
            >
              <span className="eyebrow">— VASTE BANEN</span>
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
                €100
                <span
                  style={{ fontSize: "0.3em", color: "var(--stone-700)" }}
                >
                  {" "}+/mnd
                </span>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--stone-700)",
                  marginTop: "8px",
                }}
              >
                Maandelijkse bonus zolang het contract loopt. Werkgever mag het
                bedrag verhogen om schaarse profielen aan te trekken.
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
                <li>✓ Min. €100/maand, kan veel meer worden</li>
                <li>✓ Tot €7.200+ per aanbrenging</li>
                <li>✓ Voor de hele contract-duur</li>
                <li>✓ Vooraf uitbetaald per match-fee</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--cream)" }}>
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— In 3 stappen</span>
            <h2 className="section-title">
              Hoe het
              <br />
              <em>werkt.</em>
            </h2>
          </div>

          <div className="step-list reveal">
            <Step
              num="01 / Deel je link"
              title="Krijg je persoonlijke aanbreng-link"
              text="Zodra je een KLOK-account hebt, krijg je een unieke link. Deel die via WhatsApp, Instagram, e-mail of in een gesprek. Iedereen die via jouw link aanmeldt, is voor het leven aan jou gekoppeld."
            />
            <Step
              num="02 / Iemand meldt aan"
              title="Ze maken een KLOK-account"
              text="Wanneer iemand via jouw link aanmeldt — als werknemer of werkgever — registreren we dat als jouw aanbreng. Je ziet ze direct in je referral-dashboard."
            />
            <Step
              num="03 / Verdien levenslang"
              title="Bonus bij elke gewerkte uur of maandelijks contract"
              text="Zodra jouw aangebrachte persoon werkt, gaat de teller lopen. €1 per gewerkt uur bij shifts, €100+/mnd bij vaste contracten. Direct op je rekening, levenslang."
            />
          </div>
        </div>
      </section>

      <section
        id="calculator"
        className="mkt-section"
        style={{ paddingTop: "56px", paddingBottom: "56px" }}
      >
        <div className="mkt-container">
          <div
            className="section-header reveal"
            style={{ marginBottom: "32px" }}
          >
            <span className="eyebrow">— Reken zelf na</span>
            <h2 className="section-title">
              Wat verdien
              <br />
              <em>jij ermee?</em>
            </h2>
            <p className="section-lead">
              Een gemiddelde KLOK-werknemer brengt 4-7 mensen aan in het eerste
              jaar. Speel met de schuifjes om te zien wat dat betekent.
            </p>
          </div>

          <ReferralCalculator />
        </div>
      </section>

      <section className="mkt-section" style={{ background: "var(--cream)" }}>
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Veelgestelde vragen</span>
            <h2 className="section-title">
              Een paar
              <br />
              <em>concrete vragen.</em>
            </h2>
          </div>

          <div className="reveal">
            <FaqItem
              q="Is dit MLM? Verdien ik ook aan aanbrengingen van mijn aanbreng?"
              a="Nee — geen piramide. Je verdient alleen aan personen die jij rechtstreeks aanbrengt. Geen 'levels' eronder. Eerlijk, transparant, één laag."
            />
            <FaqItem
              q="Hoe weet KLOK dat ik degene was die aanbracht?"
              a="Via je persoonlijke link. Wanneer iemand via jouw link aanmeldt, leggen we dat vast in onze database. De koppeling blijft voor de levensduur van het account."
            />
            <FaqItem
              q="Wat als mijn aanbreng geen werk doet?"
              a="Dan verdien je niets — logisch, want werkgever betaalt de referral-fee per gewerkt uur. Zodra ze beginnen te werken, gaat de teller lopen."
            />
            <FaqItem
              q="Wanneer wordt het uitbetaald?"
              a="Bij shifts: maandelijks op je rekening. Bij vaste vacatures: vooraf, zodra het contract is getekend (per maand of in een keer)."
            />
            <FaqItem
              q="Kan ik dit combineren met mijn eigen werk?"
              a="Ja — sterker nog, de meeste aanbrengers werken zelf ook via KLOK. Eigen inkomen plus referral-inkomen tegelijk."
            />
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
              Klaar om
              <br />
              <em style={{ color: "var(--lime)" }}>te delen?</em>
            </h2>
            <p
              className="section-lead"
              style={{ margin: "24px auto 40px", color: "var(--stone-300)" }}
            >
              Maak een account aan, krijg je persoonlijke link, en begin
              vandaag met aanbrengen.
            </p>
            <Link href="/signup" className="btn btn-lime btn-large">
              Aanmelden →
            </Link>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}

function Step({
  num,
  title,
  text,
}: {
  num: string;
  title: string;
  text: string;
}) {
  return (
    <div className="step-item">
      <div className="step-num">{num}</div>
      <div className="step-content">
        <h3>{title}</h3>
      </div>
      <div>
        <p>{text}</p>
      </div>
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  return (
    <div className="faq-item">
      <div className="faq-question">
        <h3>{q}</h3>
        <div className="faq-toggle">+</div>
      </div>
      <div className="faq-answer">{a}</div>
    </div>
  );
}
