import Link from "next/link";
import MarketingScripts from "./scripts";

const LINKS = [
  { href: "/werknemers", label: "Voor werknemers" },
  { href: "/werkgevers", label: "Voor werkgevers" },
  { href: "/vacatures", label: "Vacatures" },
  { href: "/aanbrengen", label: "Aanbrengen" },
  { href: "/over-ons", label: "Over ons" },
  { href: "/help", label: "FAQ" },
];

export default function MarketingNav({ active }: { active?: string }) {
  return (
    <>
      <nav className="mkt-nav">
        <div className="mkt-nav-inner">
          <Link href="/" className="mkt-logo">
            KLOK<span className="dot"></span>
          </Link>
          <div className="mkt-nav-links">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={active === l.href ? "active" : ""}
              >
                {l.label}
              </Link>
            ))}
          </div>
          <div className="mkt-nav-cta">
            <Link href="/login" className="btn btn-ghost">
              Inloggen
            </Link>
            <Link href="/signup" className="btn btn-primary">
              Aanmelden
            </Link>
            <button
              type="button"
              className="menu-toggle"
              aria-label="Menu"
              data-mkt-menu-toggle
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </nav>
      <div className="mobile-menu" data-mkt-mobile-menu>
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <Link href="/help">Contact</Link>
        <div className="mobile-cta">
          <Link href="/signup" className="btn btn-primary btn-large">
            Aanmelden
          </Link>
          <Link href="/login" className="btn btn-ghost btn-large">
            Inloggen
          </Link>
        </div>
      </div>
      <MarketingScripts />
    </>
  );
}
