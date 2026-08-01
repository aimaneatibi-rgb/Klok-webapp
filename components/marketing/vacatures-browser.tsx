"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { PublicVacancy } from "@/lib/demo-vacatures";
import { SECTOR_LABELS, getSectorEmoji } from "@/lib/sectors";

const FAV_KEY = "klok-favorieten";
const TINTS = ["tint-lime", "tint-sky", "tint-peach", "tint-lilac", "tint-mint", "tint-sand"];

function tintFor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return TINTS[h % TINTS.length];
}

function formatSalary(v: PublicVacancy): string {
  if (v.salaryMin && v.salaryMax)
    return `€ ${v.salaryMin.toLocaleString("nl-NL")} – ${v.salaryMax.toLocaleString("nl-NL")}`;
  if (v.salaryMax) return `tot € ${v.salaryMax.toLocaleString("nl-NL")}`;
  if (v.salaryMin) return `v.a. € ${v.salaryMin.toLocaleString("nl-NL")}`;
  return "In overleg";
}

type SortKey = "nieuwste" | "salaris" | "uren";

/**
 * Interactieve vacature-browser: zoeken, sector-pills, sorteren,
 * favorieten (localStorage) en een Zillow-achtige splitview met
 * detailpaneel (desktop) / bottom-sheet (mobiel).
 */
export default function VacaturesBrowser({
  vacancies,
  initialQuery = "",
  initialSector = "",
}: {
  vacancies: PublicVacancy[];
  initialQuery?: string;
  initialSector?: string;
}) {
  const [q, setQ] = useState(initialQuery);
  const [sector, setSector] = useState(initialSector);
  const [sort, setSort] = useState<SortKey>("nieuwste");
  const [onlyFavs, setOnlyFavs] = useState(false);
  const [favs, setFavs] = useState<Set<string>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FAV_KEY);
      if (raw) setFavs(new Set(JSON.parse(raw) as string[]));
    } catch {
      /* corrupt localStorage → gewoon leeg starten */
    }
  }, []);

  function toggleFav(id: string) {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(FAV_KEY, JSON.stringify([...next]));
      } catch {
        /* private mode → favorieten alleen in deze sessie */
      }
      return next;
    });
  }

  const sectorsInData = useMemo(() => {
    const counts = new Map<string, number>();
    vacancies.forEach((v) => counts.set(v.sector, (counts.get(v.sector) ?? 0) + 1));
    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [vacancies]);

  const filtered = useMemo(() => {
    // Elke zoekterm moet ergens matchen (titel/bedrijf/plaats/omschrijving/sector),
    // zodat "kok amsterdam" ook werkt als de termen in verschillende velden staan.
    const terms = q.trim().toLowerCase().split(/\s+/).filter(Boolean);
    let list = vacancies.filter((v) => {
      if (sector && v.sector !== sector) return false;
      if (onlyFavs && !favs.has(v.id)) return false;
      if (terms.length === 0) return true;
      const haystack = [
        v.title,
        v.companyName,
        v.city,
        v.description,
        SECTOR_LABELS[v.sector] ?? "",
      ]
        .join(" ")
        .toLowerCase();
      return terms.every((t) => haystack.includes(t));
    });
    if (sort === "salaris")
      list = [...list].sort(
        (a, b) => (b.salaryMax ?? b.salaryMin ?? 0) - (a.salaryMax ?? a.salaryMin ?? 0)
      );
    else if (sort === "uren")
      list = [...list].sort((a, b) => b.hoursPerWeek - a.hoursPerWeek);
    return list;
  }, [vacancies, q, sector, sort, onlyFavs, favs]);

  const selected =
    filtered.find((v) => v.id === selectedId) ?? filtered[0] ?? null;
  const hasDemo = vacancies.some((v) => v.isDemo);

  function selectCard(id: string) {
    setSelectedId(id);
    setSheetOpen(true);
  }

  return (
    <div>
      {hasDemo && (
        <div className="jb-demo-note">
          <span aria-hidden>👀</span>
          <span>
            Je kijkt naar <strong>voorbeeld-vacatures</strong> — zo ziet de
            marktplaats eruit zodra hij gevuld is. Werkgevers plaatsen nu de
            eerste echte vacatures.
          </span>
        </div>
      )}

      <div className="jb-toolbar">
        <div className="jb-search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
            <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Zoek op functie, bedrijf of plaats…"
            aria-label="Zoek vacatures"
          />
        </div>
        <select
          className="jb-select"
          value={sort}
          onChange={(e) => setSort(e.target.value as SortKey)}
          aria-label="Sorteren"
        >
          <option value="nieuwste">Nieuwste eerst</option>
          <option value="salaris">Hoogste salaris</option>
          <option value="uren">Meeste uren</option>
        </select>
      </div>

      <div className="jb-pills">
        <button
          type="button"
          className={`jb-pill ${!sector && !onlyFavs ? "active" : ""}`}
          onClick={() => {
            setSector("");
            setOnlyFavs(false);
          }}
        >
          Alles <span className="cnt">({vacancies.length})</span>
        </button>
        {sectorsInData.map(([s, count]) => (
          <button
            key={s}
            type="button"
            className={`jb-pill ${sector === s ? "active" : ""}`}
            onClick={() => {
              setSector(sector === s ? "" : s);
              setOnlyFavs(false);
            }}
          >
            {getSectorEmoji(s)} {SECTOR_LABELS[s] ?? s}{" "}
            <span className="cnt">({count})</span>
          </button>
        ))}
        <button
          type="button"
          className={`jb-pill fav-pill ${onlyFavs ? "active" : ""}`}
          onClick={() => setOnlyFavs((v) => !v)}
        >
          ♥ Bewaard <span className="cnt">({favs.size})</span>
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="jb-empty">
          <div
            className="serif"
            style={{ fontSize: "28px", fontWeight: 500, marginBottom: "8px" }}
          >
            {onlyFavs
              ? "Nog geen bewaarde vacatures."
              : "Niets gevonden voor deze zoekopdracht."}
          </div>
          <p style={{ color: "var(--stone-500)", fontSize: "15px" }}>
            {onlyFavs
              ? "Tik op het hartje bij een vacature om hem hier te bewaren."
              : "Probeer een andere zoekterm of haal een filter weg."}
          </p>
        </div>
      ) : (
        <div className="jb-layout">
          <div className="jb-list">
            {filtered.map((v) => (
              <div
                key={v.id}
                className={`jb-card ${selected?.id === v.id ? "selected" : ""}`}
                onClick={() => selectCard(v.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    selectCard(v.id);
                  }
                }}
              >
                <button
                  type="button"
                  className={`fav-btn ${favs.has(v.id) ? "active" : ""}`}
                  aria-label={
                    favs.has(v.id) ? "Verwijder uit bewaard" : "Bewaar vacature"
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFav(v.id);
                  }}
                >
                  {favs.has(v.id) ? "♥" : "♡"}
                </button>
                <span className="jc-ago">{v.postedAgo}</span>
                <div className="jc-head">
                  <div className={`jc-emoji ${tintFor(v.id)}`}>
                    {getSectorEmoji(v.sector)}
                  </div>
                  <div>
                    <div className="jc-company">
                      {v.companyName} · {v.city}
                      {v.isDemo && (
                        <>
                          {" "}
                          <span className="demo-tag">Voorbeeld</span>
                        </>
                      )}
                    </div>
                    <div className="jc-title">{v.title}</div>
                  </div>
                </div>
                <div className="jc-meta">
                  <span className="sal">{formatSalary(v)} /mnd</span>
                  <span>{v.hoursPerWeek}u p/w</span>
                  <span>{v.contractLabel}</span>
                  <span>{SECTOR_LABELS[v.sector] ?? v.sector}</span>
                </div>
              </div>
            ))}
          </div>

          <div
            className={`jb-backdrop ${sheetOpen ? "open" : ""}`}
            onClick={() => setSheetOpen(false)}
          />
          {selected && (
            <aside className={`jb-detail ${sheetOpen ? "open" : ""}`}>
              <button
                type="button"
                className="jb-close"
                aria-label="Sluiten"
                onClick={() => setSheetOpen(false)}
              >
                ×
              </button>
              <div className="jd-head">
                <div className={`jd-emoji ${tintFor(selected.id)}`}>
                  {getSectorEmoji(selected.sector)}
                </div>
                <div>
                  <div className="jd-company">
                    {selected.companyName} · {selected.city}
                    {selected.isDemo && (
                      <>
                        {" "}
                        <span className="demo-tag">Voorbeeld</span>
                      </>
                    )}
                  </div>
                  <h2 className="jd-title">{selected.title}</h2>
                </div>
              </div>

              <div className="jd-facts">
                <div className="jd-fact hl">
                  <div className="f-label">Salaris p/mnd</div>
                  <div className="f-value">{formatSalary(selected)}</div>
                </div>
                <div className="jd-fact">
                  <div className="f-label">Uren per week</div>
                  <div className="f-value">{selected.hoursPerWeek} uur</div>
                </div>
                <div className="jd-fact">
                  <div className="f-label">Contract</div>
                  <div className="f-value">{selected.contractLabel}</div>
                </div>
                <div className="jd-fact">
                  <div className="f-label">Sector</div>
                  <div className="f-value">
                    {SECTOR_LABELS[selected.sector] ?? selected.sector}
                  </div>
                </div>
              </div>

              <p className="jd-desc">{selected.description}</p>

              <div className="jd-cta">
                <Link href="/signup" className="btn btn-primary btn-large">
                  Solliciteer via KLOK →
                </Link>
                <button
                  type="button"
                  className={`btn btn-ghost btn-large`}
                  onClick={() => toggleFav(selected.id)}
                >
                  {favs.has(selected.id) ? "♥ Bewaard" : "♡ Bewaren"}
                </button>
              </div>
              <p
                style={{
                  fontSize: "12.5px",
                  color: "var(--stone-500)",
                  marginTop: "14px",
                }}
              >
                Gratis account nodig om te reageren — je profiel is je
                sollicitatie.
              </p>
            </aside>
          )}
        </div>
      )}
    </div>
  );
}
