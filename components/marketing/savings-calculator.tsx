"use client";

import { useState } from "react";

export default function SavingsCalculator() {
  const [people, setPeople] = useState(5);
  const [hours, setHours] = useState(24);
  const [rate, setRate] = useState(14.5);

  const totalHours = people * hours * 52;
  const grossWage = totalHours * rate;
  const baseEmployerCost = grossWage * 1.22;
  const bureauCost = baseEmployerCost * 1.3;
  const klokCost = baseEmployerCost * 1.115;
  const savings = bureauCost - klokCost;

  const eur = (n: number) =>
    "€ " + Math.round(n).toLocaleString("nl-NL");

  return (
    <div className="card card-cream reveal" style={{ padding: "48px" }}>
      <div className="grid-2" style={{ gap: "48px" }}>
        <div>
          <div className="form-group mb-3">
            <label className="form-label">Aantal flex-medewerkers</label>
            <input
              type="range"
              className="calc-slider"
              min={1}
              max={50}
              value={people}
              onChange={(e) => setPeople(parseInt(e.target.value, 10))}
              style={{ margin: "8px 0" }}
            />
            <div
              className="flex"
              style={{
                justifyContent: "space-between",
                fontSize: "12px",
                color: "var(--stone-500)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              <span>1</span>
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                {people} medewerkers
              </span>
              <span>50</span>
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Gem. uren per week per persoon</label>
            <input
              type="range"
              className="calc-slider"
              min={4}
              max={40}
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value, 10))}
              style={{ margin: "8px 0" }}
            />
            <div
              className="flex"
              style={{
                justifyContent: "space-between",
                fontSize: "12px",
                color: "var(--stone-500)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              <span>4u</span>
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                {hours} uur
              </span>
              <span>40u</span>
            </div>
          </div>

          <div className="form-group mb-3">
            <label className="form-label">Gem. bruto uurloon</label>
            <input
              type="range"
              className="calc-slider"
              min={12}
              max={25}
              step={0.5}
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value))}
              style={{ margin: "8px 0" }}
            />
            <div
              className="flex"
              style={{
                justifyContent: "space-between",
                fontSize: "12px",
                color: "var(--stone-500)",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              <span>€ 12</span>
              <span style={{ color: "var(--ink)", fontWeight: 600 }}>
                € {rate.toFixed(2).replace(".", ",")}
              </span>
              <span>€ 25</span>
            </div>
          </div>

          <p
            style={{
              fontSize: "12px",
              color: "var(--stone-500)",
              marginTop: "16px",
            }}
          >
            Berekening op basis van 52 werkweken, 22% werkgeverslasten,
            vergeleken met 30% bureau-marge.
          </p>
        </div>

        <div>
          <div className="card" style={{ background: "var(--paper)" }}>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--stone-500)",
              }}
            >
              VIA UITZENDBUREAU PER JAAR
            </div>
            <div
              className="serif"
              style={{
                fontSize: "36px",
                fontWeight: 500,
                marginTop: "8px",
              }}
            >
              {eur(bureauCost)}
            </div>
          </div>

          <div className="card mt-2" style={{ background: "var(--lime)" }}>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--ink)",
              }}
            >
              VIA KLOK PER JAAR
            </div>
            <div
              className="serif"
              style={{
                fontSize: "36px",
                fontWeight: 500,
                marginTop: "8px",
              }}
            >
              {eur(klokCost)}
            </div>
          </div>

          <div
            className="card mt-2"
            style={{ background: "var(--ink)", color: "var(--paper)" }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: "var(--lime)",
              }}
            >
              JE BESPAART PER JAAR
            </div>
            <div
              className="serif"
              style={{
                fontSize: "36px",
                fontWeight: 500,
                marginTop: "8px",
                color: "var(--lime)",
              }}
            >
              {eur(savings)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
