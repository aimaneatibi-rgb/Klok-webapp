/**
 * CSS-telefoonmockup met een mini-versie van de KLOK-app erin.
 * Puur presentationeel — gedeeld door de homepage-app-sectie en /download.
 */
export default function PhoneMockup() {
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="phone-notch" />
        <div className="phone-app">
          <div className="pa-head">
            <span className="pa-logo">
              KLOK<span className="dot" />
            </span>
            <span style={{ fontSize: "15px" }}>👤</span>
          </div>
          <div className="pa-search">🔍 Zoek vacatures &amp; shifts…</div>
          <div className="pa-chiprow">
            <span className="pa-chip on">Alles</span>
            <span className="pa-chip">🍽️ Horeca</span>
            <span className="pa-chip">⚕️ Zorg</span>
            <span className="pa-chip">🚚 Logistiek</span>
          </div>
          <div className="pa-push">
            <span className="pp-dot" />
            <span>
              <strong>Nieuwe match!</strong> Brasserie Centro zoekt een kok — 1,2
              km van jou.
            </span>
          </div>
          <div className="pa-card">
            <span className="pa-emoji tint-lime">🍽️</span>
            <span>
              <span className="pa-t">Zelfstandig werkend kok</span>
              <span className="pa-s" style={{ display: "block" }}>
                Brasserie Centro · Amsterdam
              </span>
            </span>
            <span className="pa-sal">€ 3.400</span>
          </div>
          <div className="pa-card">
            <span className="pa-emoji tint-sky">⚕️</span>
            <span>
              <span className="pa-t">Verzorgende IG (nacht)</span>
              <span className="pa-s" style={{ display: "block" }}>
                ZorgVitaal · Rotterdam
              </span>
            </span>
            <span className="pa-sal">€ 3.250</span>
          </div>
          <div className="pa-card">
            <span className="pa-emoji tint-peach">🚚</span>
            <span>
              <span className="pa-t">Heftruckchauffeur</span>
              <span className="pa-s" style={{ display: "block" }}>
                FastLane · Eindhoven
              </span>
            </span>
            <span className="pa-sal">€ 2.950</span>
          </div>
          <div className="pa-tabbar">
            <span className="on">🏠</span>
            <span>🔍</span>
            <span>♥</span>
            <span>💶</span>
            <span>👤</span>
          </div>
        </div>
      </div>
    </div>
  );
}
