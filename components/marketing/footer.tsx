import Link from "next/link";

export default function MarketingFooter() {
  return (
    <footer className="mkt-footer">
      <div className="mkt-container">
        <div className="footer-mark">
          KLOK<span className="dot"></span>
          <br />
          <em>Works.</em>
        </div>

        <div className="footer-grid">
          <div className="footer-col">
            <h5>De marktplaats voor flex-werk</h5>
            <p>
              Eén platform voor shifts en vacatures. Wij zijn een platform —
              geen uitzendbureau. Onze contract-partners regelen het
              loonadministratieve deel.
            </p>
          </div>
          <div className="footer-col">
            <h5>Werknemer</h5>
            <Link href="/werknemers">Voor werknemers</Link>
            <Link href="/signup">Aanmelden</Link>
            <Link href="/vacatures">Open vacatures</Link>
          </div>
          <div className="footer-col">
            <h5>Werkgever</h5>
            <Link href="/werkgevers">Voor werkgevers</Link>
            <Link href="/werkgevers#prijzen">Prijzen</Link>
            <Link href="/help">Contact opnemen</Link>
          </div>
          <div className="footer-col">
            <h5>Bedrijf</h5>
            <Link href="/over-ons">Over ons</Link>
            <Link href="/help">Hulp & contact</Link>
            <Link href="/help">FAQ</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <div>© 2026 KLOK Works · AVG-compliant</div>
          <div className="flex gap-3">
            <Link href="/privacy" style={{ color: "var(--stone-500)" }}>
              Privacy
            </Link>
            <Link href="/voorwaarden" style={{ color: "var(--stone-500)" }}>
              Voorwaarden
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
