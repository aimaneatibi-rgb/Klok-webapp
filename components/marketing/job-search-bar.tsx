"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/**
 * Grote zoekbalk in de hero — stuurt door naar /vacatures?q=&plaats=
 * zodat de vacature-browser direct gefilterd opent.
 */
export default function JobSearchBar() {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [plaats, setPlaats] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (plaats.trim()) params.set("plaats", plaats.trim());
    router.push(`/vacatures${params.size ? `?${params}` : ""}`);
  }

  return (
    <form className="search-card" onSubmit={submit} role="search">
      <div className="search-field">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Functie, bedrijf of trefwoord"
          aria-label="Zoek op functie, bedrijf of trefwoord"
        />
      </div>
      <div className="search-field">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 21s-7-5.1-7-11a7 7 0 1 1 14 0c0 5.9-7 11-7 11z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="2" />
        </svg>
        <input
          type="text"
          value={plaats}
          onChange={(e) => setPlaats(e.target.value)}
          placeholder="Plaats of regio"
          aria-label="Zoek op plaats of regio"
        />
      </div>
      <button type="submit" className="btn btn-lime btn-large">
        Zoek werk →
      </button>
    </form>
  );
}
