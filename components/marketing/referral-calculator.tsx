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
      <div className="calc-inputs">
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
      </div>

      <div className="calc-hero">
        <div className="label">Per maand passief</div>
        <div className="num">{fmt(monthly)}</div>
      </div>

      <div className="calc-sub">
        <div className="calc-sub-item">
          <div className="label">Per jaar</div>
          <div className="num">{fmt(yearly)}</div>
        </div>
        <div className="calc-sub-item">
          <div className="label">Over 5 jaar</div>
          <div className="num">{fmt(fiveYear)}</div>
        </div>
      </div>

      <p className="calc-note">
        Op basis van € 1 per gewerkt uur — maandgemiddelde.
      </p>

      <style jsx>{`
        .calc-widget {
          background: var(--ink);
          color: var(--paper);
          padding: 28px;
          border: 1px solid var(--stone-700);
          max-width: 540px;
          margin: 0 auto;
        }
        .calc-inputs {
          display: flex;
          flex-direction: column;
          gap: 18px;
          margin-bottom: 24px;
        }
        .calc-label {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--stone-500);
          margin-bottom: 10px;
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
          width: 18px;
          height: 18px;
          background: var(--lime);
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid var(--ink);
        }
        .calc-slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          background: var(--lime);
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid var(--ink);
        }
        .calc-hero {
          background: var(--lime);
          color: var(--ink);
          padding: 18px 24px;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 16px;
        }
        .calc-hero .label {
          font-family: "JetBrains Mono", monospace;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: var(--ink);
          opacity: 0.7;
        }
        .calc-hero .num {
          font-family: "Fraunces", serif;
          font-size: 44px;
          font-weight: 500;
          color: var(--ink);
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .calc-sub {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          margin-top: 8px;
        }
        .calc-sub-item {
          background: var(--ink-soft);
          border: 1px solid var(--stone-700);
          padding: 14px 16px;
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 8px;
        }
        .calc-sub-item .label {
          font-family: "JetBrains Mono", monospace;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--stone-500);
        }
        .calc-sub-item .num {
          font-family: "Fraunces", serif;
          font-size: 22px;
          font-weight: 500;
          color: var(--lime);
          letter-spacing: -0.03em;
          line-height: 1;
        }
        .calc-note {
          font-size: 12px;
          color: var(--stone-500);
          margin-top: 14px;
          text-align: center;
        }
      `}</style>
    </div>
  );
}
