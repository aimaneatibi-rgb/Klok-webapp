"use client";

import { useState } from "react";

export default function ReferralCalculator() {
  const [people, setPeople] = useState(5);
  const [hours, setHours] = useState(12);

  const monthly = Math.round(people * hours * 4.33);
  const yearly = monthly * 12;
  const fiveYear = yearly * 5;

  const fmt = (n: number) => "€ " + n.toLocaleString("nl-NL");

  return (
    <div className="calc-widget reveal">
      <div className="calc-row">
        <div>
          <div className="calc-input-group">
            <div className="calc-label">
              <span>Aantal aangebrachte werknemers</span>
              <span className="calc-display">{people}</span>
            </div>
            <input
              type="range"
              className="calc-slider"
              min={1}
              max={50}
              value={people}
              onChange={(e) => setPeople(parseInt(e.target.value, 10))}
            />
          </div>

          <div className="calc-input-group">
            <div className="calc-label">
              <span>Gem. uren/week per persoon</span>
              <span className="calc-display">{hours} uur</span>
            </div>
            <input
              type="range"
              className="calc-slider"
              min={4}
              max={40}
              value={hours}
              onChange={(e) => setHours(parseInt(e.target.value, 10))}
            />
          </div>

          <p
            style={{
              fontSize: "13px",
              color: "var(--stone-500)",
              marginTop: "16px",
            }}
          >
            Op basis van € 1 per gewerkt uur. Cijfers zijn maandelijks gemiddeld
            over een jaar.
          </p>
        </div>

        <div>
          <div className="calc-result hero">
            <div className="label">Per maand passief</div>
            <div className="num">{fmt(monthly)}</div>
          </div>

          <div className="grid-2 mt-2">
            <div className="calc-result">
              <div className="label">Per jaar</div>
              <div className="num" style={{ fontSize: "36px" }}>
                {fmt(yearly)}
              </div>
            </div>
            <div className="calc-result">
              <div className="label">Over 5 jaar</div>
              <div className="num" style={{ fontSize: "36px" }}>
                {fmt(fiveYear)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .calc-widget {
          background: var(--ink);
          color: var(--paper);
          padding: 48px;
          border: 1px solid var(--stone-700);
        }
        .calc-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 48px;
          align-items: start;
        }
        @media (max-width: 768px) {
          .calc-row {
            grid-template-columns: 1fr;
          }
        }
        .calc-input-group {
          margin-bottom: 32px;
        }
        .calc-input-group:last-child {
          margin-bottom: 0;
        }
        .calc-label {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--stone-500);
          margin-bottom: 8px;
          display: flex;
          justify-content: space-between;
        }
        .calc-display {
          font-family: "JetBrains Mono", monospace;
          font-size: 13px;
          font-weight: 600;
          color: var(--lime);
        }
        .calc-slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: var(--stone-700);
          outline: none;
          border-radius: 2px;
        }
        .calc-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 22px;
          height: 22px;
          background: var(--lime);
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid var(--ink);
        }
        .calc-slider::-moz-range-thumb {
          width: 16px;
          height: 16px;
          background: var(--lime);
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid var(--ink);
        }
        :global(.calc-result) {
          background: var(--ink-soft);
          padding: 32px;
          border: 1px solid var(--stone-700);
        }
        :global(.calc-result .label) {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--stone-500);
          margin-bottom: 8px;
        }
        :global(.calc-result .num) {
          font-family: "Fraunces", serif;
          font-size: 64px;
          font-weight: 500;
          color: var(--lime);
          letter-spacing: -0.03em;
          line-height: 1;
        }
        :global(.calc-result.hero) {
          background: var(--lime);
          border-color: var(--lime);
          text-align: center;
          padding: 40px;
        }
        :global(.calc-result.hero .num) {
          font-size: 80px;
          color: var(--ink);
        }
        :global(.calc-result.hero .label) {
          color: var(--stone-700);
        }
      `}</style>
    </div>
  );
}
