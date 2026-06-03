import Link from "next/link";
import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";
import ReferralCalculator from "@/components/marketing/referral-calculator";

export const metadata: Metadata = {
  title: "Voor werknemers — KLOK Works",
  description:
    "Werk wanneer je wilt, verdien aan je netwerk, één app voor alles.",
};

export default function WerknemersPage() {
  return (
    <>
      <MarketingNav active="/werknemers" />

      <section
        className="mkt-section"
        style={{ padding: "80px 0 64px", background: "var(--cream)" }}
      >
        <div className="mkt-container">
          <span className="eyebrow">— Voor werknemers</span>
          <h1
            className="display section-title mt-2"
            style={{ fontSize: "clamp(48px, 8vw, 110px)" }}
          >
            Werk wanneer
            <br />
            je wilt.{" "}
            <em>
              Verdien
              <br />
              óók als je
              <br />
              niet werkt.
            </em>
          </h1>
          <p className="section-lead mt-3">
            KLOK is een marktplaats voor werknemers die controle willen over hun
            eigen tijd én hun eigen verdienen. Geen baas die roostert. Geen
            platform dat 30% afroomt. Een app die met jou meedenkt.
          </p>
          <div className="flex gap-2 mt-4 flex-wrap">
            <Link href="/signup" className="btn btn-primary btn-large">
              Aanmelden in 5 min →
            </Link>
            <Link href="#referral" className="btn btn-ghost btn-large">
              Bereken passief inkomen
            </Link>
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Wat zit erin voor jou</span>
            <h2 className="section-title">
              5 dingen die andere
              <br />
              <em>platforms niet bieden.</em>
            </h2>
          </div>

          <div className="grid-2" style={{ gap: 0 }}>
            <BenefitCard
              num="01"
              title="Eén app voor 2 werk-types"
              text="Shifts (losse diensten met contract via partner) en Vacatures (vast werk). Niet verschillende apps voor verschillende soorten werk — alles in één KLOK-app."
              extraStyle={{ borderRight: "none" }}
            />
            <BenefitCard
              num="02"
              delay={1}
              title="€ 1 per uur passief"
              text="Breng vrienden aan. Zolang zij werken via KLOK, krijg jij € 1 per uur — door werkgever apart aan KLOK betaald, direct doorgestort naar jou. Levenslang. Geen MLM-piramide."
            />
            <BenefitCard
              num="03"
              delay={2}
              title="Werkgever kiest contract"
              text="Voor Shifts en Vacatures kiest werkgever een contract-partner. Jij ziet vooraf welk type contract je tekent en wie je juridische werkgever wordt."
              extraStyle={{ borderRight: "none", borderTop: "none" }}
            />
            <BenefitCard
              num="04"
              delay={3}
              title="Loon binnen 4 dagen"
              text="Loon wordt uitbetaald door de gekozen contract-partner — meestal binnen 4 werkdagen. Sommige partners bieden DirectPay (binnen 1 uur) tegen kleine vergoeding."
              extraStyle={{ borderTop: "none" }}
            />
          </div>

          <div
            className="card card-ink reveal mt-4"
            style={{ gridColumn: "1/-1" }}
          >
            <span className="card-num">05</span>
            <h3 className="card-title" style={{ color: "var(--paper)" }}>
              Volledige transparantie over je geld
            </h3>
            <p className="card-text mb-4">
              Bij elke shift zie je vóóraf: bruto loon, vakantiegeld,
              pensioenopbouw, en wat er netto op je rekening komt. Geen
              verrassingen, geen kleine lettertjes. Werkgever betaalt 11,5%
              platformfee aan KLOK plus €1/uur referral als je een aanbrenger
              hebt — jij merkt daar niets van.
            </p>
            <Link
              href="/help"
              className="btn-link"
              style={{ color: "var(--lime)" }}
            >
              Bekijk een voorbeeld-loonstrook →
            </Link>
          </div>
        </div>
      </section>

      {/* Aanbreng intro */}
      <section
        style={{
          padding: "64px 0",
          background: "var(--ink)",
          color: "var(--paper)",
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
          <div style={{ maxWidth: "720px", marginBottom: "32px" }}>
            <span className="eyebrow" style={{ color: "var(--lime-dark)" }}>
              — EXTRA INKOMEN
            </span>
            <h2 className="section-title mt-2" style={{ color: "var(--paper)" }}>
              Verdien meer.
              <br />
              <em style={{ color: "var(--lime)" }}>Ook zonder shifts.</em>
            </h2>
            <p
              className="section-lead mt-3"
              style={{ color: "var(--stone-300)" }}
            >
              Werk je via KLOK? Dan verdien je extra door iemand uit jouw
              netwerk aan te brengen. €1 per gewerkt uur bij shifts, €100+ per
              maand bij vaste banen — levenslang.
            </p>
          </div>

          <div
            className="grid-3"
            style={{ gap: "16px", marginBottom: "32px" }}
          >
            <RefStep num="01" title="Deel je link" text="Persoonlijke aanbreng-link voor WhatsApp, Instagram, of gewoon in een gesprek." />
            <RefStep num="02" title="Iemand registreert" text="Wanneer iemand via jouw link een KLOK account maakt, ben jij hun aanbrenger — voor het leven." />
            <div
              style={{
                background: "var(--lime)",
                color: "var(--ink)",
                padding: "24px",
                borderRadius: "12px",
              }}
            >
              <div
                className="serif"
                style={{
                  fontSize: "56px",
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                  lineHeight: 0.8,
                  marginBottom: "12px",
                }}
              >
                03
              </div>
              <h3
                className="serif"
                style={{
                  fontSize: "20px",
                  fontWeight: 500,
                  marginBottom: "8px",
                }}
              >
                Bonus elke maand
              </h3>
              <p style={{ fontSize: "14px", lineHeight: 1.5 }}>
                Krijgen ze een vaste baan? €100+/mnd op je rekening, zolang het
                contract loopt.
              </p>
            </div>
          </div>

          <Link
            href="/aanbrengen"
            className="btn btn-large"
            style={{
              background: "var(--lime)",
              color: "var(--ink)",
              padding: "14px 28px",
              borderRadius: "8px",
              fontWeight: 600,
              display: "inline-block",
            }}
          >
            Lees alles over aanbrengen →
          </Link>
        </div>
      </section>

      <section
        id="referral"
        className="mkt-section"
        style={{ background: "var(--cream)" }}
      >
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Reken zelf na</span>
            <h2 className="section-title">
              Jouw passief
              <br />
              <em>verdienmodel.</em>
            </h2>
            <p className="section-lead">
              Hoe meer mensen jij aanbrengt, hoe meer je passief verdient. Speel
              met de schuifjes hieronder.
            </p>
          </div>

          <ReferralCalculator />

          <div className="reveal mt-4">
            <p
              className="text-center"
              style={{
                color: "var(--stone-500)",
                fontSize: "14px",
                maxWidth: "600px",
                margin: "0 auto",
              }}
            >
              Een gemiddelde KLOK-werknemer brengt 4-7 mensen aan in het eerste
              jaar. Sommigen brengen er 30+. Dat ligt aan jou.
            </p>
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Drie levens, één app</span>
            <h2 className="section-title">
              Iemand zoals jij
              <br />
              <em>kan dit ook.</em>
            </h2>
          </div>

          <div className="grid-3">
            <Testimonial
              quote="Studeer fulltime, doe 4 avonden bediening. Verdien er € 1.290 per maand mee — waarvan een mooi extraatje passief van vrienden."
              name="Emma, 24 — student"
              role="Bediening · Utrecht"
              avatar="E"
            />
            <Testimonial
              quote="Twee kinderen, fulltime baan in logistiek. KLOK regelt mijn vaste contract via partner én extra weekend-shifts. Eén platform, alles overzichtelijk."
              name="Mo, 31 — gezin"
              role="Logistiek · Rotterdam"
              avatar="M"
              variant="ink"
              delay={1}
            />
            <Testimonial
              quote="Tussen studies door. Ik pak shifts wanneer ik wil. Geen vaste verplichtingen."
              name="Lars, 22 — flexibel"
              role="Diverse · Amsterdam"
              avatar="L"
              variant="lime"
              delay={2}
            />
          </div>

          <p
            className="text-center mt-4"
            style={{ color: "var(--stone-500)", fontSize: "13px" }}
          >
            Voorbeelden zijn realistische schetsen — werknemers in
            onboarding-fase.
          </p>
        </div>
      </section>

      <section
        className="mkt-section"
        style={{ background: "var(--ink)", color: "var(--paper)" }}
      >
        <div className="mkt-container text-center">
          <div className="reveal" style={{ maxWidth: "700px", margin: "0 auto" }}>
            <h2 className="section-title" style={{ color: "var(--paper)" }}>
              Begin met
              <br />
              <em style={{ color: "var(--lime)" }}>verdienen.</em>
            </h2>
            <p
              className="section-lead"
              style={{ margin: "24px auto 40px", color: "var(--stone-300)" }}
            >
              Aanmelden duurt 5 minuten. Werken kan al morgen.
            </p>
            <div
              className="flex gap-2 flex-wrap"
              style={{ justifyContent: "center" }}
            >
              <Link href="/signup" className="btn btn-lime btn-large">
                Aanmelden
              </Link>
              <Link
                href="/vacatures"
                className="btn btn-ghost btn-large"
                style={{
                  color: "var(--paper)",
                  borderColor: "rgba(255,255,255,0.2)",
                }}
              >
                Bekijk vacatures
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}

function BenefitCard({
  num,
  title,
  text,
  delay = 0,
  extraStyle = {},
}: {
  num: string;
  title: string;
  text: string;
  delay?: number;
  extraStyle?: React.CSSProperties;
}) {
  return (
    <div
      className={`card reveal${delay ? ` reveal-delay-${delay}` : ""}`}
      style={extraStyle}
    >
      <span className="card-num">{num}</span>
      <h3 className="card-title">{title}</h3>
      <p className="card-text">{text}</p>
    </div>
  );
}

function RefStep({
  num,
  title,
  text,
}: {
  num: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        padding: "24px",
        borderRadius: "12px",
      }}
    >
      <div
        className="serif"
        style={{
          fontSize: "56px",
          fontWeight: 500,
          color: "var(--lime)",
          letterSpacing: "-0.03em",
          lineHeight: 0.8,
          marginBottom: "12px",
        }}
      >
        {num}
      </div>
      <h3
        className="serif"
        style={{ fontSize: "20px", fontWeight: 500, marginBottom: "8px" }}
      >
        {title}
      </h3>
      <p
        style={{
          fontSize: "14px",
          color: "var(--stone-300)",
          lineHeight: 1.5,
        }}
      >
        {text}
      </p>
    </div>
  );
}

function Testimonial({
  quote,
  name,
  role,
  avatar,
  variant,
  delay = 0,
}: {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  variant?: "ink" | "lime";
  delay?: number;
}) {
  const bg =
    variant === "ink"
      ? "var(--ink)"
      : variant === "lime"
        ? "var(--lime)"
        : undefined;
  const color = variant === "ink" ? "var(--paper)" : undefined;
  return (
    <div
      className={`testimonial reveal${delay ? ` reveal-delay-${delay}` : ""}`}
      style={{ background: bg, color }}
    >
      <p
        className="testimonial-quote"
        style={variant === "ink" ? { color: "var(--paper)" } : undefined}
      >
        {quote}
      </p>
      <div className="testimonial-author">
        <div
          className="testimonial-avatar"
          style={
            variant === "lime"
              ? { background: "var(--ink)", color: "var(--lime)" }
              : undefined
          }
        >
          {avatar}
        </div>
        <div className="testimonial-meta">
          <div
            className="name"
            style={variant === "ink" ? { color: "var(--paper)" } : undefined}
          >
            {name}
          </div>
          <div className="role">{role}</div>
        </div>
      </div>
    </div>
  );
}
