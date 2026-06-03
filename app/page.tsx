import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Ingelogde users gaan direct naar hun eigen dashboard
  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("user_type")
      .eq("id", user.id)
      .single();

    if (profile?.user_type === "employee") redirect("/werknemer");
    if (profile?.user_type === "admin") redirect("/admin");
    redirect("/dashboard");
  }

  return (
    <>
      <MarketingNav active="/" />

      <header className="hero">
        <div className="mkt-container hero-content">
          <span className="eyebrow paper">— Recent gelanceerd in Utrecht</span>
          <h1>
            De marktplaats
            <br />
            voor flex-werk.
            <br />
            <em>Niets meer.</em>
          </h1>
          <p className="lead">
            KLOK is geen uitzendbureau. Wij verbinden werknemers met werk en
            werkgevers met talent. Twee soorten werk, één app, transparant.
          </p>
          <div className="hero-cta">
            <Link href="/signup" className="btn btn-lime btn-large">
              Aanmelden als werknemer →
            </Link>
            <Link
              href="/werkgevers"
              className="btn btn-ghost btn-large"
              style={{
                color: "var(--paper)",
                borderColor: "rgba(255,255,255,0.2)",
              }}
            >
              Voor werkgevers
            </Link>
          </div>

          <div className="hero-stats">
            <div className="hero-stat">
              <div className="num">2</div>
              <div className="label">Soorten werk</div>
            </div>
            <div className="hero-stat">
              <div className="num">
                € 1<span style={{ fontSize: "0.5em" }}>/u</span>
              </div>
              <div className="label">Levenslange referral</div>
            </div>
            <div className="hero-stat">
              <div className="num">
                11,5<span style={{ fontSize: "0.6em" }}>%</span>
              </div>
              <div className="label">Platformfee shifts</div>
            </div>
            <div className="hero-stat">
              <div className="num">€ 0</div>
              <div className="label">Voor werknemers</div>
            </div>
          </div>
        </div>
      </header>

      <div className="marquee">
        <div className="marquee-track">
          <span>Marktplaats voor flex-werk.</span>
          <span>€ 1 per uur referral.</span>
          <span>Twee soorten werk.</span>
          <span>Eerlijke prijzen.</span>
          <span>Levenslang passief inkomen.</span>
          <span>Marktplaats voor flex-werk.</span>
          <span>€ 1 per uur referral.</span>
          <span>Twee soorten werk.</span>
          <span>Eerlijke prijzen.</span>
          <span>Levenslang passief inkomen.</span>
        </div>
      </div>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Twee manieren om geld te verdienen</span>
            <h2 className="section-title">
              Eén platform.
              <br />
              <em>Twee werk-types.</em>
            </h2>
            <p className="section-lead">
              Flex-werk wanneer het uitkomt, of een vast contract voor
              stabiliteit. Beide via dezelfde KLOK-app, met eerlijke fees en
              transparant verdienmodel.
            </p>
          </div>

          <div className="grid-2">
            <div
              className="card reveal reveal-delay-1"
              style={{ padding: "48px" }}
            >
              <span className="card-num">01</span>
              <h3 className="card-title">Shifts</h3>
              <p className="card-text mb-3">
                Losse diensten bij werkgevers in de horeca, retail, logistiek,
                bouw, zorg of bezorging. Werkgever kiest zelf de
                contract-partner voor het arbeidscontract.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="badge dark">11,5% platformfee</span>
                <span className="badge outline">+ €1/u referral</span>
              </div>
            </div>

            <div
              className="card card-ink reveal reveal-delay-2"
              style={{ padding: "48px" }}
            >
              <span className="card-num">02</span>
              <h3 className="card-title">Vacatures</h3>
              <p className="card-text mb-3">
                Langdurige posities bij werkgevers. Werkgever kiest zelf
                contract-vorm via onze contract-partners — uitzendbureau,
                payroll-bedrijf of direct dienstverband.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="badge">€ 350 / 4 weken</span>
                <span
                  className="badge"
                  style={{ background: "var(--lime)", color: "var(--ink)" }}
                >
                  + €100/mnd referral
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mkt-section"
        style={{ background: "var(--cream)" }}
      >
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Het verschil</span>
            <h2 className="section-title">
              Wij zijn een
              <br />
              <em>marktplaats.</em>
              <br />
              Geen uitzendbureau.
            </h2>
            <p className="section-lead">
              KLOK heeft geen mensen in dienst. Wij regelen geen contracten
              zelf. Wij brengen vraag en aanbod samen — net zoals Booking.com
              voor hotels of Funda voor woningen. Onze contract-partners regelen
              het loonadministratieve deel.
            </p>
          </div>

          <div className="compare-table reveal">
            <div className="compare-row header">
              <div className="compare-cell">Vergelijking</div>
              <div className="compare-cell">Uitzendbureaus</div>
              <div className="compare-cell us">KLOK</div>
            </div>
            <div className="compare-row">
              <div className="compare-cell">Type bedrijf</div>
              <div className="compare-cell">Uitzendbureau</div>
              <div className="compare-cell us">Marktplaats</div>
            </div>
            <div className="compare-row">
              <div className="compare-cell">Marge werkgever</div>
              <div className="compare-cell">25-30%</div>
              <div className="compare-cell us">11,5%</div>
            </div>
            <div className="compare-row">
              <div className="compare-cell">Contract via</div>
              <div className="compare-cell">Uitzendbureau zelf</div>
              <div className="compare-cell us">Onze partners</div>
            </div>
            <div className="compare-row">
              <div className="compare-cell">Kosten werknemer</div>
              <div className="compare-cell">€ 0</div>
              <div className="compare-cell us">€ 0</div>
            </div>
            <div className="compare-row">
              <div className="compare-cell">Referral-economie</div>
              <div className="compare-cell">
                <span className="x">✗</span>
              </div>
              <div className="compare-cell us">
                <span className="check">✓</span> € 1/uur levenslang
              </div>
            </div>
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
              <em>Geen verrassingen.</em>
            </h2>
            <p className="section-lead">
              Wij geloven in radicale transparantie. Dit zijn onze prijzen —
              vandaag, morgen, voor iedereen hetzelfde.
            </p>
          </div>

          <div className="grid-3 reveal">
            <div
              className="card"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <span className="eyebrow">— Shifts</span>
              <div
                className="serif"
                style={{
                  fontSize: "56px",
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  margin: "16px 0 8px",
                }}
              >
                11,5<span style={{ fontSize: "0.5em" }}>%</span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--stone-500)",
                  marginBottom: "24px",
                }}
              >
                Platformfee + €1/uur referral apart voor aanbrenger. Werkgever
                betaalt beide.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  fontSize: "14px",
                  lineHeight: 2,
                  color: "var(--stone-700)",
                  flex: 1,
                }}
              >
                <li>✓ 11,5% over werkgeverskosten</li>
                <li>✓ + €1/uur extra naar aanbrenger</li>
                <li>✓ Werkgever kiest contract-partner</li>
                <li>✓ Werknemer krijgt loon binnen 4 dagen</li>
              </ul>
              <Link href="/werkgevers" className="btn btn-ghost mt-3">
                Meer info werkgever →
              </Link>
            </div>

            <div
              className="card card-ink"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <span className="eyebrow lime">— Vaste vacatures</span>
              <div
                className="serif"
                style={{
                  fontSize: "56px",
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  margin: "16px 0 8px",
                  color: "var(--paper)",
                }}
              >
                € 350<span style={{ fontSize: "0.4em", opacity: 0.7 }}>/4w</span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--stone-300)",
                  marginBottom: "24px",
                }}
              >
                Listing-fee per vacature. Plus minimaal €100/maand contract bij
                succesvolle match — naar aanbrenger.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  fontSize: "14px",
                  lineHeight: 2,
                  color: "var(--stone-300)",
                  flex: 1,
                }}
              >
                <li>✓ Toegang tot werknemer-pool</li>
                <li>✓ Match-fee gaat naar aanbrenger</li>
                <li>✓ Re-match gratis bij vertrek &lt; 30 dagen</li>
                <li>✓ Geen succes-fee, geen recruitment-marges</li>
              </ul>
              <Link href="/werkgevers" className="btn btn-lime mt-3">
                Plaats een vacature →
              </Link>
            </div>

            <div
              className="card card-cream"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <span className="eyebrow">— Werknemers</span>
              <div
                className="serif"
                style={{
                  fontSize: "56px",
                  fontWeight: 500,
                  letterSpacing: "-0.03em",
                  lineHeight: 1,
                  margin: "16px 0 8px",
                }}
              >
                € 0
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--stone-500)",
                  marginBottom: "24px",
                }}
              >
                Voor altijd gratis. Plus levenslang €1/uur shifts of €100/maand
                vaste contracten per aangebrachte vriend.
              </p>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  fontSize: "14px",
                  lineHeight: 2,
                  color: "var(--stone-700)",
                  flex: 1,
                }}
              >
                <li>✓ Beide werk-types</li>
                <li>✓ Geen verborgen kosten</li>
                <li>✓ Levenslang referral-bonus</li>
                <li>✓ Cash uitbetaling of credits</li>
              </ul>
              <Link href="/signup" className="btn btn-primary mt-3">
                Maak account →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mkt-section"
        style={{ background: "var(--cream)" }}
      >
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— In 4 stappen</span>
            <h2 className="section-title">
              Hoe het
              <br />
              <em>echt werkt.</em>
            </h2>
          </div>

          <div className="step-list reveal">
            <Step
              num="01 / Aanmelden"
              title="Maak een account"
              text="Werknemer of werkgever — aanmelden in een paar minuten. Werknemer-aanmelding is gratis. Werkgever betaalt alleen wanneer er gewerkt wordt of een vacature actief staat."
            />
            <Step
              num="02 / Match"
              title="Vind elkaar"
              text="Werknemers zoeken shifts of vacatures in hun buurt. Werkgevers plaatsen werk en zien wie er reageert. KLOK matcht slim op locatie, ervaring en beschikbaarheid."
            />
            <Step
              num="03 / Contract"
              title="Kies een contract-partner"
              text="Bij shifts en vacatures kiest werkgever uit onze contract-partners voor de juridische en loonadministratie. KLOK regelt de matching, partner regelt het contract en loon."
            />
            <Step
              num="04 / Werken"
              title="Aan de slag"
              text="Werknemer doet het werk. Werkgever keurt uren goed. Loon binnen 4 werkdagen via de gekozen contract-partner. Aanbrenger krijgt levenslang € 1 per gewerkt uur passief."
            />
          </div>
        </div>
      </section>

      <section
        className="mkt-section"
        style={{ background: "var(--ink)", color: "var(--paper)" }}
      >
        <div className="mkt-container">
          <div className="grid-2" style={{ gap: "64px", alignItems: "center" }}>
            <div className="reveal">
              <span className="eyebrow lime">— Onze grootste differentiator</span>
              <h2
                className="section-title mt-2"
                style={{ color: "var(--paper)" }}
              >
                Iedereen wint
                <br />
                <em style={{ color: "var(--lime)" }}>op het netwerk.</em>
              </h2>
              <p
                className="section-lead"
                style={{ color: "var(--stone-300)" }}
              >
                Bij KLOK is iedereen mede-eigenaar van het netwerk. Breng iemand
                aan, en zolang die werkt verdien jij € 1 per uur. Levenslang.
                Geen MLM-onzin. Gewoon eerlijk delen.
              </p>
              <Link
                href="/aanbrengen"
                className="btn btn-lime btn-large mt-4"
              >
                Bereken jouw passief inkomen →
              </Link>
            </div>

            <div className="reveal reveal-delay-2">
              <div
                className="stat-block dark"
                style={{ border: "1px solid rgba(255,255,255,0.1)" }}
              >
                <span className="num">
                  € 1
                  <span style={{ fontSize: "0.5em", color: "var(--stone-300)" }}>
                    {" "}
                    /uur
                  </span>
                </span>
                <div className="label">
                  Voor elk uur dat jouw aangebrachte werknemer werkt
                </div>
              </div>
              <div className="grid-2 mt-2">
                <div
                  className="stat-block"
                  style={{
                    background: "var(--ink-soft)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span
                    className="num"
                    style={{ color: "var(--paper)", fontSize: "48px" }}
                  >
                    € 218
                  </span>
                  <div className="label">
                    Bij 5 actieve aangebrachten gem./mnd
                  </div>
                </div>
                <div
                  className="stat-block"
                  style={{
                    background: "var(--ink-soft)",
                    border: "1px solid rgba(255,255,255,0.1)",
                  }}
                >
                  <span
                    className="num"
                    style={{ color: "var(--paper)", fontSize: "48px" }}
                  >
                    ∞
                  </span>
                  <div className="label">Levenslang zolang ze actief zijn</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mkt-section">
        <div className="mkt-container">
          <div className="section-header reveal">
            <span className="eyebrow">— Onze contract-partners</span>
            <h2 className="section-title">
              Wij regelen
              <br />
              de match.
              <br />
              <em>Onze partners regelen het contract.</em>
            </h2>
            <p className="section-lead">
              KLOK is een marktplaats — geen uitzendbureau. Voor de juridische
              kant (contract, loon, cao, pensioen) werken we samen met
              betrouwbare contract-partners. Werkgever kiest zelf welke partij
              past bij hun situatie.
            </p>
          </div>

          <div className="grid-3 reveal">
            <div className="card card-cream">
              <span className="card-num">01</span>
              <h3 className="card-title">Uitzend-partners</h3>
              <p className="card-text">
                Erkende uitzendbureaus die het arbeidscontract verzorgen voor
                flex-werk. ABU-cao van toepassing.
              </p>
            </div>
            <div className="card card-cream">
              <span className="card-num">02</span>
              <h3 className="card-title">Payroll-partners</h3>
              <p className="card-text">
                Specialistische payroll-bedrijven voor loonadministratie bij
                vaste contracten.
              </p>
            </div>
            <div className="card card-cream">
              <span className="card-num">03</span>
              <h3 className="card-title">Direct dienstverband</h3>
              <p className="card-text">
                Bij vacatures kan werkgever er ook voor kiezen om werknemer
                rechtstreeks in dienst te nemen.
              </p>
            </div>
          </div>

          <p
            className="text-center reveal"
            style={{
              marginTop: "48px",
              color: "var(--stone-500)",
              fontSize: "14px",
            }}
          >
            Werkgever kiest per match welke contract-vorm past. KLOK pakt alleen
            de matching-fee.
          </p>
        </div>
      </section>

      <section
        style={{ padding: "80px 0", background: "var(--paper)" }}
      >
        <div className="mkt-container">
          <div
            className="text-center"
            style={{ maxWidth: "720px", margin: "0 auto 48px" }}
          >
            <span className="eyebrow">— UNIEK · LEVENSLANG VERDIENEN</span>
            <h2 className="section-title mt-2">
              Ken jij iemand voor een vacature?
              <br />
              <em>Verdien levenslang mee.</em>
            </h2>
            <p className="section-lead mt-3">
              Breng iemand aan op KLOK en ontvang een bonus zolang die persoon
              werkt. Geen MLM. Geen einddatum. Gewoon eerlijk delen.
            </p>
          </div>

          <div className="grid-3" style={{ gap: "16px" }}>
            <BonusCard
              eyebrow="— SHIFTS"
              eyebrowColor="var(--lime-dark)"
              bg="var(--ink)"
              color="var(--paper)"
              amount="€1"
              suffix="/u"
              amountColor="var(--lime)"
              text="Per gewerkt uur dat jouw aangebrachte persoon werkt. Levenslang."
              textColor="var(--stone-300)"
            />
            <BonusCard
              eyebrow="— VASTE BANEN"
              eyebrowColor="var(--ink)"
              bg="var(--lime)"
              color="var(--ink)"
              amount="€100"
              suffix="+/mnd"
              amountColor="var(--ink)"
              text="Maandelijkse bonus zolang het contract loopt. Tot €7.200 per aanbrenging."
              textColor="var(--ink)"
            />
            <div
              style={{
                background: "var(--paper)",
                border: "1px solid var(--stone-200)",
                padding: "32px 28px",
                borderRadius: "12px",
              }}
            >
              <div className="eyebrow">— GEEN LIMIET</div>
              <div
                className="serif mt-2"
                style={{
                  fontSize: "42px",
                  fontWeight: 500,
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                  color: "var(--ink)",
                }}
              >
                ∞
              </div>
              <p
                className="mt-2"
                style={{
                  fontSize: "14px",
                  color: "var(--stone-700)",
                  lineHeight: 1.5,
                }}
              >
                Onbeperkt aanbrengen. Elke succesvolle plaatsing = aparte bonus.
              </p>
            </div>
          </div>

          <div className="text-center mt-4">
            <Link href="/aanbrengen" className="btn btn-primary btn-large">
              Meer over aanbrengen →
            </Link>
            <Link
              href="/vacatures"
              className="btn btn-ghost btn-large"
              style={{ marginLeft: "8px" }}
            >
              Bekijk vacatures
            </Link>
          </div>
        </div>
      </section>

      <section style={{ background: "var(--cream)" }} className="mkt-section">
        <div className="mkt-container text-center">
          <div
            className="reveal"
            style={{ maxWidth: "800px", margin: "0 auto" }}
          >
            <span className="eyebrow">— Recent gelanceerd</span>
            <h2 className="section-title mt-2">
              Wij zijn nieuw.
              <br />
              <em>Doe mee vanaf het begin.</em>
            </h2>
            <p
              className="section-lead"
              style={{ margin: "24px auto 40px" }}
            >
              Hoe eerder je instapt, hoe groter je voorsprong op het netwerk.
              Eerste werknemers verdienen levenslang aan iedereen die zij
              aanbrengen.
            </p>
            <div
              className="flex gap-2 flex-wrap"
              style={{ justifyContent: "center" }}
            >
              <Link href="/signup" className="btn btn-primary btn-large">
                Aanmelden als werknemer
              </Link>
              <Link href="/werkgevers" className="btn btn-lime btn-large">
                Plaats een vacature
              </Link>
            </div>
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

function BonusCard({
  eyebrow,
  eyebrowColor,
  bg,
  color,
  amount,
  suffix,
  amountColor,
  text,
  textColor,
}: {
  eyebrow: string;
  eyebrowColor: string;
  bg: string;
  color: string;
  amount: string;
  suffix: string;
  amountColor: string;
  text: string;
  textColor: string;
}) {
  return (
    <div
      style={{
        background: bg,
        color,
        padding: "32px 28px",
        borderRadius: "12px",
      }}
    >
      <div className="eyebrow" style={{ color: eyebrowColor }}>
        {eyebrow}
      </div>
      <div
        className="serif mt-2"
        style={{
          fontSize: "42px",
          fontWeight: 500,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: amountColor,
        }}
      >
        {amount}
        <span style={{ fontSize: "0.5em" }}>{suffix}</span>
      </div>
      <p
        className="mt-2"
        style={{ fontSize: "14px", color: textColor, lineHeight: 1.5 }}
      >
        {text}
      </p>
    </div>
  );
}
