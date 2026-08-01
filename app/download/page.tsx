import Link from "next/link";
import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";
import PhoneMockup from "@/components/marketing/phone-mockup";

export const metadata: Metadata = {
  title: "De KLOK-app — binnenkort voor iOS & Android",
  description:
    "De volledige marktplaats voor werk in je broekzak: vacatures, shifts, push-notificaties en je verdiensten live. Zet je op de wachtlijst voor vroege toegang.",
};

const FEATURES = [
  {
    emoji: "🔔",
    tint: "tint-lime",
    title: "Als eerste weten",
    text: "Push-notificatie zodra er een vacature of shift verschijnt die bij jouw profiel en buurt past.",
  },
  {
    emoji: "⚡",
    tint: "tint-sky",
    title: "Solliciteren met één tik",
    text: "Je profiel is je sollicitatie. Geen brieven, geen formulieren — reageren duurt letterlijk seconden.",
  },
  {
    emoji: "📍",
    tint: "tint-peach",
    title: "Werk in je buurt",
    text: "Zoek op afstand vanaf je huis en zie meteen hoe lang je onderweg bent naar elke dienst.",
  },
  {
    emoji: "💶",
    tint: "tint-mint",
    title: "Verdiensten live",
    text: "Uren, uitbetalingen en je referral-inkomsten realtime in beeld — tot op de euro.",
  },
  {
    emoji: "🗓️",
    tint: "tint-lilac",
    title: "Shifts in je agenda",
    text: "Geplande diensten synchroniseren met je telefoon-agenda. Nooit meer een dienst missen.",
  },
  {
    emoji: "🏢",
    tint: "tint-sand",
    title: "Ook voor werkgevers",
    text: "Reacties beoordelen, shifts vullen en uren goedkeuren — gewoon vanaf je telefoon.",
  },
];

export default function DownloadPage() {
  return (
    <>
      <MarketingNav active="/download" />

      <section className="hero-v2">
        <div className="mkt-container">
          <div className="hero-grid">
            <div>
              <span className="eyebrow pill on-dark">
                <span className="live-dot" /> In ontwikkeling — lancering na de
                webapp
              </span>
              <h1>
                De marktplaats.
                <br />
                <em>In je broekzak.</em>
              </h1>
              <p className="lead">
                Alles van KLOK — vacatures, shifts, solliciteren en je
                verdiensten — komt naar iOS en Android. Wie op de wachtlijst
                staat, krijgt als eerste toegang.
              </p>
              <div className="store-badges">
                <span className="store-badge">
                  <span className="sb-icon"></span>
                  <span>
                    <span className="sb-pre">Binnenkort in de</span>
                    <span className="sb-name">App Store</span>
                  </span>
                </span>
                <span className="store-badge">
                  <span className="sb-icon">▶</span>
                  <span>
                    <span className="sb-pre">Binnenkort op</span>
                    <span className="sb-name">Google Play</span>
                  </span>
                </span>
              </div>
              <div className="hero-cta" style={{ marginTop: "28px" }}>
                <Link href="/signup" className="btn btn-lime btn-large" data-magnetic>
                  Zet me op de wachtlijst →
                </Link>
              </div>
            </div>
            <div>
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Wat de app straks kan</span>
            <h2 className="section-title">
              Gebouwd voor mensen
              <br />
              <em>die niet achter een bureau zitten.</em>
            </h2>
          </div>
          <div className="grid-3">
            {FEATURES.map((f, i) => (
              <div
                key={f.title}
                className={`card reveal reveal-delay-${(i % 3) + 1}`}
              >
                <div
                  className={`ct-emoji ${f.tint}`}
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "26px",
                    marginBottom: "18px",
                  }}
                >
                  {f.emoji}
                </div>
                <h3 className="card-title" style={{ fontSize: "22px" }}>
                  {f.title}
                </h3>
                <p className="card-text">{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mkt-section" style={{ paddingTop: 0 }}>
        <div className="mkt-container">
          <div className="cta-banner">
            <span className="eyebrow" style={{ color: "var(--ink)" }}>
              — Web eerst, app daarna
            </span>
            <h2>Begin vandaag alvast op de webapp.</h2>
            <p>
              Je profiel, cv en favorieten nemen we straks automatisch mee naar
              de app. Wie nu een account maakt, staat vooraan bij de lancering.
            </p>
            <div
              className="flex gap-2"
              style={{ justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link href="/signup" className="btn btn-primary btn-large">
                Maak gratis account →
              </Link>
              <Link href="/vacatures" className="btn btn-ghost btn-large">
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
