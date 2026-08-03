import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import type { ReactNode } from "react";
import MarketingNav from "@/components/marketing/nav";
import MarketingFooter from "@/components/marketing/footer";
import JobSearchBar from "@/components/marketing/job-search-bar";
import PhoneMockup from "@/components/marketing/phone-mockup";
import { BLOG_POSTS, formatBlogDate } from "@/lib/blog";
import { daysUntilShiftsLive } from "@/lib/feature-flags";
import { TRIAL_DAYS, VACANCY_PRICING_TIERS } from "@/lib/pricing";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  // Inclusief merknaam: het title-template uit de root layout raakt de
  // homepage niet, die zit in hetzelfde segment als de layout zelf.
  title: "Vacatures en personeel zonder uitzendbureau · KLOK Works",
  description:
    "De marktplaats voor werk: werkgevers plaatsen vacatures en shifts, werknemers reageren direct. Gratis voor werknemers, vanaf €149 per vacature voor werkgevers — en niemand pakt een marge over je uurloon.",
  path: "/",
});

const POPULAR_CHIPS = [
  { label: "🍽️ Horeca", sector: "horeca" },
  { label: "⚕️ Zorg", sector: "healthcare" },
  { label: "🚚 Logistiek", sector: "logistics" },
  { label: "🛍️ Retail", sector: "retail" },
  { label: "🔨 Bouw", sector: "construction" },
];

const CATEGORIES = [
  { emoji: "🍽️", tint: "tint-lime", name: "Horeca", sector: "horeca" },
  { emoji: "⚕️", tint: "tint-sky", name: "Zorg & Welzijn", sector: "healthcare" },
  { emoji: "🚚", tint: "tint-peach", name: "Logistiek", sector: "logistics" },
  { emoji: "🛍️", tint: "tint-lilac", name: "Retail", sector: "retail" },
  { emoji: "🔨", tint: "tint-mint", name: "Bouw", sector: "construction" },
  { emoji: "🎉", tint: "tint-sand", name: "Evenementen", sector: "events" },
  { emoji: "🛡️", tint: "tint-sky", name: "Beveiliging", sector: "security" },
  { emoji: "🚲", tint: "tint-peach", name: "Bezorging", sector: "delivery" },
];

export default async function Home() {
  const daysToShifts = daysUntilShiftsLive();
  const vacaturePrijs = VACANCY_PRICING_TIERS[0].monthlyCents / 100;
  const staffelLaagste =
    VACANCY_PRICING_TIERS[VACANCY_PRICING_TIERS.length - 1].monthlyCents / 100;
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

  const blogTeasers = BLOG_POSTS.slice(0, 3);

  return (
    <>
      <MarketingNav active="/" />

      {/* ============ HERO — zoeken staat centraal ============ */}
      <header className="hero-v2">
        <div className="mkt-container">
          <div className="hero-grid">
            <div>
              <span
                className="eyebrow pill on-dark"
                style={{ marginBottom: "4px" }}
              >
                <span className="live-dot" /> De marktplaats is open
              </span>
              <h1>
                De marktplaats
                <br />
                voor werk.
                <br />
                <em>Niets meer.</em>
              </h1>
              <p className="lead">
                Vacatures en shifts, direct tussen werkgever en werknemer. Geen
                uitzendmarges, geen tussenpersonen — en iedereen verdient mee
                aan het netwerk.
              </p>

              <JobSearchBar />

              <div className="search-chips">
                <span className="chip-label">Populair</span>
                {POPULAR_CHIPS.map((c) => (
                  <Link
                    key={c.sector}
                    href={`/vacatures?sector=${c.sector}`}
                    className="chip"
                  >
                    {c.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hero-cards" aria-hidden>
              <div className="float-card">
                <div className="fc-top">
                  <span className="fc-emoji tint-lime">🍽️</span>
                  <span>
                    <span className="fc-title">Zelfstandig werkend kok</span>
                    <span className="fc-sub" style={{ display: "block" }}>
                      Brasserie Centro · Amsterdam
                    </span>
                  </span>
                </div>
                <div className="fc-meta">
                  <span className="hl">€ 2.900 – 3.400</span>
                  <span>36u p/w</span>
                  <span>Vast</span>
                </div>
              </div>
              <div className="float-card">
                <div className="fc-top">
                  <span className="fc-emoji tint-sky">⚕️</span>
                  <span>
                    <span className="fc-title">Verzorgende IG (nacht)</span>
                    <span className="fc-sub" style={{ display: "block" }}>
                      ZorgVitaal · Rotterdam
                    </span>
                  </span>
                </div>
                <div className="fc-meta">
                  <span className="hl">€ 2.750 – 3.250</span>
                  <span>28u p/w</span>
                </div>
              </div>
              <div className="float-card">
                <div className="fc-top">
                  <span className="fc-emoji tint-peach">🚚</span>
                  <span>
                    <span className="fc-title">Heftruckchauffeur</span>
                    <span className="fc-sub" style={{ display: "block" }}>
                      FastLane · Eindhoven
                    </span>
                  </span>
                </div>
                <div className="fc-meta">
                  <span className="hl">€ 2.600 – 2.950</span>
                  <span>40u p/w</span>
                </div>
              </div>
              <span className="hero-badge-app">📱 App komt eraan</span>
            </div>
          </div>

          <div className="hero-stats" style={{ marginTop: "56px" }}>
            <div className="hero-stat">
              <div className="num">
                <span className="count-up" data-target="100" data-suffix="%">
                  0%
                </span>
              </div>
              <div className="label">Gratis voor werknemers</div>
            </div>
            <div className="hero-stat">
              <div className="num">
                € 1<span style={{ fontSize: "0.5em" }}>/u</span>
              </div>
              <div className="label">Levenslange referral</div>
            </div>
            <div className="hero-stat">
              <div className="num">
                €&nbsp;
                <span className="count-up" data-target={vacaturePrijs}>
                  0
                </span>
              </div>
              <div className="label">Per vacature / mnd · ex. btw</div>
            </div>
            <div className="hero-stat">
              <div className="num">
                <span className="count-up" data-target="25" data-suffix="+">
                  0
                </span>
              </div>
              <div className="label">Sectoren door heel NL</div>
            </div>
          </div>
        </div>
      </header>

      <div className="marquee">
        <div className="marquee-track">
          <span>Marktplaats voor werk.</span>
          <span>€ 1 per uur referral.</span>
          <span>Vacatures én shifts.</span>
          <span>App komt eraan.</span>
          <span>Eerlijke prijzen.</span>
          <span>Marktplaats voor werk.</span>
          <span>€ 1 per uur referral.</span>
          <span>Vacatures én shifts.</span>
          <span>App komt eraan.</span>
          <span>Eerlijke prijzen.</span>
        </div>
      </div>

      {/* ============ CATEGORIEËN ============ */}
      <section className="mkt-section tight">
        <div className="mkt-container">
          <div
            className="flex reveal"
            style={{
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div>
              <span className="eyebrow">— Ontdek per sector</span>
              <h2 className="section-title" style={{ fontSize: "clamp(32px, 4vw, 56px)" }}>
                Waar wil jij <em>werken?</em>
              </h2>
            </div>
            <Link href="/vacatures" className="btn btn-ghost">
              Alle vacatures →
            </Link>
          </div>
          <div className="cat-grid reveal">
            {CATEGORIES.map((c) => (
              <Link
                key={c.sector}
                href={`/vacatures?sector=${c.sector}`}
                className="cat-tile"
              >
                <span className={`ct-emoji ${c.tint}`}>{c.emoji}</span>
                <span>
                  <span className="ct-name" style={{ display: "block" }}>
                    {c.name}
                  </span>
                  <span className="ct-count">Vacatures & shifts</span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ LIVE MARKTPLAATS ============ */}
      <section
        id="marktplaats"
        className="mkt-section"
        style={{ background: "var(--cream)" }}
      >
        <div className="mkt-container">
          <div className="section-header reveal">
            <span
              className="eyebrow pill"
              style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}
            >
              <span className="live-dot" /> Live op de marktplaats
            </span>
            <h2 className="section-title">
              Vraag en aanbod,
              <br />
              <em>realtime bij elkaar.</em>
            </h2>
            <p className="section-lead">
              Net als op elke marktplaats draait het om volume. Werkgevers
              plaatsen vacatures, werknemers melden zich aan met een compleet
              profiel. Hoe voller de markt, hoe sneller de match.
            </p>
          </div>

          <div className="grid-2" style={{ gap: "48px", alignItems: "start" }}>
            <div className="reveal reveal-scale">
              <div className="live-board">
                <div className="live-board-head">
                  <span className="title">
                    <span className="live-dot" /> Marktplaats-activiteit
                  </span>
                  <span className="ping">● LIVE</span>
                </div>
                <div className="live-feed" data-live-feed>
                  <FeedItem
                    kind="vac"
                    initials="BC"
                    avatar="lime"
                    line={
                      <>
                        <strong>Brasserie Centro</strong> plaatste een vacature
                      </>
                    }
                    meta="Amsterdam · Horeca · zojuist"
                    tag="Vacature"
                  />
                  <FeedItem
                    kind="werk"
                    initials="SK"
                    avatar="paper"
                    line={
                      <>
                        <strong>Sanne K.</strong> maakte haar profiel compleet
                      </>
                    }
                    meta="Utrecht · CV compleet · 1 min"
                    tag="Werknemer"
                  />
                  <FeedItem
                    kind="vac"
                    initials="ZV"
                    avatar="lime"
                    line={
                      <>
                        <strong>ZorgVitaal</strong> zoekt 3 verzorgenden
                      </>
                    }
                    meta="Rotterdam · Zorg · 2 min"
                    tag="Vacature"
                  />
                  <FeedItem
                    kind="werk"
                    initials="MD"
                    avatar="paper"
                    line={
                      <>
                        <strong>Mehmet D.</strong> bewaarde 3 vacatures
                      </>
                    }
                    meta="Den Haag · CV compleet · 4 min"
                    tag="Werknemer"
                  />
                  <FeedItem
                    kind="vac"
                    initials="FL"
                    avatar="lime"
                    line={
                      <>
                        <strong>FastLane Logistics</strong> plaatste 2 vacatures
                      </>
                    }
                    meta="Eindhoven · Logistiek · 6 min"
                    tag="Vacature"
                  />
                  <FeedItem
                    kind="werk"
                    initials="LV"
                    avatar="paper"
                    line={
                      <>
                        <strong>Lisa V.</strong> meldde zich aan
                      </>
                    }
                    meta="Groningen · CV compleet · 8 min"
                    tag="Werknemer"
                  />
                </div>
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--stone-500)",
                  marginTop: "12px",
                  textAlign: "center",
                }}
              >
                Voorbeeld van de activiteit zodra de markt vult.
              </p>
            </div>

            <div className="reveal reveal-delay-2">
              <div className="market-stats">
                <div className="market-stat">
                  <div className="ms-num">
                    <span
                      className="count-up"
                      data-target={vacaturePrijs}
                      data-prefix="€ "
                    >
                      € 0
                    </span>
                  </div>
                  <div className="ms-label">Per vacature / maand · ex. btw</div>
                  <div className="ms-sub">
                    Eerste {TRIAL_DAYS} dagen gratis · staffel tot €{" "}
                    {staffelLaagste}
                  </div>
                </div>
                <div className="market-stat">
                  <div className="ms-num">
                    <span className="count-up" data-target="4" data-suffix=" dagen">
                      0
                    </span>
                  </div>
                  <div className="ms-label">Tot loon na goedgekeurde uren</div>
                  <div className="ms-sub">Via onze contract-partners</div>
                </div>
                <div className="market-stat">
                  <div className="ms-num">
                    <span className="count-up" data-target="25" data-suffix="+">
                      0
                    </span>
                  </div>
                  <div className="ms-label">Sectoren door heel NL</div>
                  <div className="ms-sub">Van horeca tot zorg</div>
                </div>
                <div className="market-stat">
                  <div className="ms-num">
                    € 0<span style={{ fontSize: "0.45em" }}> /werknemer</span>
                  </div>
                  <div className="ms-label">Aanmelden + solliciteren</div>
                  <div className="ms-sub">Voor altijd gratis</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap" style={{ marginTop: "20px" }}>
                <Link href="/signup" className="btn btn-primary" data-magnetic>
                  Maak gratis profiel →
                </Link>
                <Link href="/werkgevers" className="btn btn-ghost" data-magnetic>
                  Plaats een vacature
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ TWEE WERK-TYPES ============ */}
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
              stabiliteit. Beide via hetzelfde KLOK-profiel, met eerlijke fees
              en een transparant verdienmodel.
            </p>
          </div>

          <div className="grid-2">
            <div
              className="card card-ink reveal reveal-delay-1"
              style={{ padding: "48px" }}
              data-tilt="5"
            >
              <span className="card-num">01</span>
              <div className="flex gap-2 flex-wrap" style={{ marginBottom: "16px" }}>
                <span className="badge live">
                  <span
                    className="live-dot"
                    style={{ width: "6px", height: "6px" }}
                  />{" "}
                  Nu live
                </span>
              </div>
              <h3 className="card-title">Vacatures</h3>
              <p className="card-text mb-3">
                Vaste en langdurige posities bij werkgevers. Dit is waar we nú
                op draaien — werkgevers plaatsen, werknemers reageren met een
                compleet CV. Elke vacature start met {TRIAL_DAYS} dagen gratis.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="badge live">{TRIAL_DAYS} dagen gratis</span>
                <span className="badge dark">€ {vacaturePrijs} p/m · ex. btw</span>
                <span
                  className="badge"
                  style={{ background: "var(--lime)", color: "var(--ink)" }}
                >
                  Staffel tot € {staffelLaagste}
                </span>
              </div>
            </div>

            <div
              className="card reveal reveal-delay-2 soon-lock"
              style={{ padding: "48px" }}
              data-tilt="5"
            >
              <span className="card-num">02</span>
              <div className="flex gap-2 flex-wrap" style={{ marginBottom: "16px" }}>
                <span className="badge soon">Binnenkort</span>
                <span className="countdown-pill">
                  <span className="cd-num">{daysToShifts}</span> dagen
                </span>
              </div>
              <h3 className="card-title">Shifts</h3>
              <p className="card-text mb-3">
                Losse diensten per dag in horeca, retail, logistiek, bouw, zorg
                of bezorging. We zetten shifts pas live als de marktplaats vol
                genoeg is — zo is er vanaf dag 1 echt werk én genoeg mensen.
              </p>
              <div className="flex gap-2 flex-wrap">
                <span className="badge outline">11,5% platformfee</span>
                <span className="badge outline">+ €1/u referral</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ APP-SECTIE ============ */}
      <section className="mkt-section" style={{ background: "var(--cream)" }}>
        <div className="mkt-container">
          <div className="app-section reveal">
            <div className="app-grid">
              <div>
                <span className="eyebrow pill on-dark">
                  📱 Binnenkort — de KLOK-app
                </span>
                <h2
                  className="section-title mt-2"
                  style={{ color: "var(--paper)", fontSize: "clamp(32px, 4.5vw, 60px)" }}
                >
                  De hele marktplaats.
                  <br />
                  <em style={{ color: "var(--lime)" }}>In je broekzak.</em>
                </h2>
                <p
                  className="section-lead"
                  style={{ color: "var(--stone-300)", fontSize: "17px" }}
                >
                  Push-notificaties bij nieuwe matches, solliciteren met één tik
                  en je verdiensten live in beeld. De app komt naar iOS en
                  Android — wie op de wachtlijst staat, krijgt als eerste
                  toegang.
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
                <div className="flex gap-2" style={{ marginTop: "28px", flexWrap: "wrap" }}>
                  <Link href="/download" className="btn btn-lime" data-magnetic>
                    Meer over de app →
                  </Link>
                  <Link
                    href="/signup"
                    className="btn btn-ghost"
                    style={{
                      color: "var(--paper)",
                      borderColor: "rgba(255,255,255,0.25)",
                    }}
                  >
                    Op de wachtlijst
                  </Link>
                </div>
              </div>
              <PhoneMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ============ MARKTPLAATS VS UITZENDBUREAU ============ */}
      <section className="mkt-section">
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

      {/* ============ PRIJZEN ============ */}
      <section
        id="prijzen"
        className="mkt-section"
        style={{ background: "var(--cream)" }}
      >
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
              className="card soon-lock"
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                className="flex"
                style={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <span className="eyebrow">— Shifts</span>
                <span className="badge soon">Binnenkort · {daysToShifts}d</span>
              </div>
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
              <div
                className="flex"
                style={{ justifyContent: "space-between", alignItems: "center" }}
              >
                <span className="eyebrow lime">— Vaste vacatures</span>
                <span className="badge live">{TRIAL_DAYS} dagen gratis</span>
              </div>
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
                € {vacaturePrijs}
                <span style={{ fontSize: "0.32em", opacity: 0.7 }}>
                  {" "}
                  /mnd · ex. btw
                </span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "var(--stone-300)",
                  marginBottom: "24px",
                }}
              >
                Per vacature, per maand. Elke vacature start met {TRIAL_DAYS}{" "}
                dagen gratis; daarna betaal je via automatische incasso of op
                factuur. Offline halen = betalen stopt.
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
                <li>✓ Eerste {TRIAL_DAYS} dagen gratis per vacature</li>
                <li>✓ Staffel: 2–3 vacatures € 175 · 4+ € {staffelLaagste} p/m</li>
                <li>✓ Automatische incasso óf op factuur</li>
                <li>✓ Stopt automatisch bij offline halen</li>
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

      {/* ============ HOE HET WERKT ============ */}
      <section className="mkt-section">
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
              text="Werknemer of werkgever — aanmelden in een paar minuten. Werknemer-aanmelding is altijd gratis. Werkgevers plaatsen elke vacature de eerste 14 dagen gratis; daarna €195 per vacature per maand (ex. btw) via automatische incasso of op factuur — met staffelkorting bij meerdere vacatures."
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

      {/* ============ REFERRAL ============ */}
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
              <p className="section-lead" style={{ color: "var(--stone-300)" }}>
                Bij KLOK is iedereen mede-eigenaar van het netwerk. Breng iemand
                aan, en zolang die werkt verdien jij € 1 per uur. Levenslang.
                Geen MLM-onzin. Gewoon eerlijk delen.
              </p>
              <Link href="/aanbrengen" className="btn btn-lime btn-large mt-4">
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

      {/* ============ BLOG-TEASER ============ */}
      <section className="mkt-section">
        <div className="mkt-container">
          <div
            className="flex reveal"
            style={{
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "32px",
            }}
          >
            <div>
              <span className="eyebrow">— Vers van het blog</span>
              <h2
                className="section-title"
                style={{ fontSize: "clamp(32px, 4vw, 56px)" }}
              >
                Kennis van de <em>werkvloer.</em>
              </h2>
            </div>
            <Link href="/blog" className="btn btn-ghost">
              Alle artikelen →
            </Link>
          </div>

          <div className="blog-grid reveal">
            {blogTeasers.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="blog-card"
              >
                <div className={`bc-visual tint-${post.tint}`}>
                  <span className="bc-cat">{post.category}</span>
                  <span aria-hidden>{post.emoji}</span>
                </div>
                <div className="bc-body">
                  <h3 className="bc-title">{post.title}</h3>
                  <p className="bc-excerpt">{post.excerpt}</p>
                  <div className="bc-meta">
                    <span>{formatBlogDate(post.date)}</span>
                    <span>{post.readingMinutes} min lezen</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SLOT-CTA ============ */}
      <section className="mkt-section" style={{ paddingTop: 0 }}>
        <div className="mkt-container">
          <div className="cta-banner reveal">
            <span className="eyebrow" style={{ color: "var(--ink)" }}>
              — De marktplaats staat open
            </span>
            <h2>Werk vinden of werk plaatsen?</h2>
            <p>
              Gratis voor werknemers, 50 dagen gratis voor werkgevers — en wie
              vrienden aanbrengt, verdient levenslang mee.
            </p>
            <div
              className="flex gap-2"
              style={{ justifyContent: "center", flexWrap: "wrap" }}
            >
              <Link href="/signup" className="btn btn-primary btn-large">
                Maak gratis profiel →
              </Link>
              <Link href="/werkgevers" className="btn btn-ghost btn-large">
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

function FeedItem({
  kind,
  initials,
  avatar,
  line,
  meta,
  tag,
}: {
  kind: "vac" | "werk";
  initials: string;
  avatar: "lime" | "paper";
  line: ReactNode;
  meta: string;
  tag: string;
}) {
  return (
    <div className="live-feed-item">
      <div className={`lf-avatar ${avatar}`}>{initials}</div>
      <div className="lf-body">
        <div className="lf-line">{line}</div>
        <div className="lf-meta">{meta}</div>
      </div>
      <span className={`lf-tag ${kind}`}>{tag}</span>
    </div>
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
