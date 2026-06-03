import Link from "next/link";
import type { Metadata } from "next";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";

export const metadata: Metadata = {
  title: "App downloaden — KLOK Works",
  description:
    "Download de KLOK app voor iOS en Android. Beschikbaar binnenkort.",
};

export default function DownloadPage() {
  return (
    <>
      <MarketingNav />

      <section
        className="mkt-section"
        style={{
          background: "var(--ink)",
          color: "var(--paper)",
          padding: "120px 0 100px",
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
          className="mkt-container text-center"
          style={{ position: "relative", zIndex: 2 }}
        >
          <span className="eyebrow lime">— APP DOWNLOADEN</span>
          <h1
            className="display section-title mt-2"
            style={{
              fontSize: "clamp(48px, 8vw, 110px)",
              color: "var(--paper)",
              lineHeight: 0.96,
            }}
          >
            KLOK in
            <br />
            <em style={{ color: "var(--lime)" }}>je broekzak.</em>
          </h1>
          <p
            className="section-lead mt-3"
            style={{
              color: "var(--stone-300)",
              maxWidth: "560px",
              margin: "24px auto 0",
            }}
          >
            De mobiele app komt eraan. Werk reageren, uren goedkeuren en
            uitbetalingen volgen — vanaf je telefoon.
          </p>

          <div
            className="flex gap-3 flex-wrap mt-5"
            style={{ justifyContent: "center" }}
          >
            <AppStoreBadge
              eyebrow="Binnenkort op"
              store="App Store"
              icon="iOS"
            />
            <AppStoreBadge
              eyebrow="Binnenkort op"
              store="Google Play"
              icon="Android"
            />
          </div>

          <p
            style={{
              marginTop: "32px",
              fontSize: "14px",
              color: "var(--stone-500)",
            }}
          >
            Voor nu werkt alles via{" "}
            <Link
              href="/"
              style={{ color: "var(--lime)", textDecoration: "underline" }}
            >
              de webapp
            </Link>{" "}
            — ook prima op je mobiele browser.
          </p>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="grid-3 reveal">
            <DownloadFeature
              num="01"
              title="Push-notificaties"
              text="Direct melding van nieuwe shifts, sollicitaties en uitbetalingen."
            />
            <DownloadFeature
              num="02"
              title="Snel inchecken"
              text="Een tap om je shift te starten. Geolocatie-bevestiging als de werkgever dat vraagt."
            />
            <DownloadFeature
              num="03"
              title="Offline modus"
              text="Bekijk je rooster en details ook zonder verbinding. Sync bij weer online."
            />
          </div>
        </div>
      </section>

      <section
        className="mkt-section"
        style={{ background: "var(--cream)" }}
      >
        <div className="mkt-container text-center">
          <div className="reveal" style={{ maxWidth: "700px", margin: "0 auto" }}>
            <span className="eyebrow">— Of begin nu meteen</span>
            <h2 className="section-title mt-2">
              Geen app nodig
              <br />
              <em>om te starten.</em>
            </h2>
            <p className="section-lead" style={{ margin: "24px auto 40px" }}>
              De webapp werkt op elk apparaat. Maak vandaag een account aan en
              begin direct.
            </p>
            <div
              className="flex gap-2 flex-wrap"
              style={{ justifyContent: "center" }}
            >
              <Link href="/signup" className="btn btn-primary btn-large">
                Aanmelden →
              </Link>
              <Link href="/werknemers" className="btn btn-ghost btn-large">
                Voor werknemers
              </Link>
            </div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </>
  );
}

function AppStoreBadge({
  eyebrow,
  store,
  icon,
}: {
  eyebrow: string;
  store: string;
  icon: string;
}) {
  return (
    <div
      style={{
        background: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.15)",
        padding: "16px 28px",
        borderRadius: "8px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: "200px",
      }}
    >
      <div
        style={{
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "10px",
          color: "var(--lime)",
          fontWeight: 600,
        }}
      >
        {icon}
      </div>
      <div style={{ textAlign: "left" }}>
        <div
          style={{
            fontSize: "11px",
            color: "var(--stone-500)",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {eyebrow}
        </div>
        <div
          className="serif"
          style={{ fontSize: "18px", fontWeight: 500, color: "var(--paper)" }}
        >
          {store}
        </div>
      </div>
    </div>
  );
}

function DownloadFeature({
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
