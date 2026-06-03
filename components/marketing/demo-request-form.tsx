"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useState } from "react";

export default function DemoRequestForm() {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sector, setSector] = useState("Horeca");
  const [employees, setEmployees] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    // Log direct als prospect — admin pakt op via /admin/prospects
    const { error: insErr } = await supabase.from("crm_prospects").insert({
      type: "employer",
      company_name: company.trim() || null,
      contact_name: name.trim(),
      email: email.trim() || null,
      phone: phone.trim() || null,
      sector: sector.trim() || null,
      source: "website-demo",
      notes: employees ? `Gem. flex-medewerkers: ${employees}` : null,
      status: "new",
    });

    if (insErr) {
      setError(
        "Er ging iets mis. Mail ons direct op hallo@klokworks.nl of probeer opnieuw."
      );
      setLoading(false);
      return;
    }

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div
        style={{
          background: "var(--lime)",
          color: "var(--ink)",
          padding: "32px",
          fontSize: "17px",
        }}
      >
        <div style={{ fontWeight: 700, fontSize: "20px", marginBottom: "8px" }}>
          ✓ Aanvraag ontvangen
        </div>
        <div>
          Top! Je krijgt binnen één werkdag een mail voor het inplannen van de
          demo. Of —{" "}
          <Link
            href="/signup"
            style={{ textDecoration: "underline", fontWeight: 600 }}
          >
            begin meteen gratis
          </Link>
          .
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      style={{
        background: "rgba(255,255,255,0.03)",
        padding: "32px",
        border: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <div className="grid-2 mb-3">
        <div className="form-group">
          <label className="form-label" style={{ color: "var(--paper)" }}>
            Naam
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="form-input"
            style={{ background: "var(--paper)" }}
          />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ color: "var(--paper)" }}>
            Bedrijf
          </label>
          <input
            type="text"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="form-input"
            style={{ background: "var(--paper)" }}
          />
        </div>
      </div>

      <div className="form-group mb-3">
        <label className="form-label" style={{ color: "var(--paper)" }}>
          Email
        </label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="form-input"
          style={{ background: "var(--paper)" }}
        />
      </div>

      <div className="grid-2 mb-3">
        <div className="form-group">
          <label className="form-label" style={{ color: "var(--paper)" }}>
            Telefoon
          </label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="06 ..."
            className="form-input"
            style={{ background: "var(--paper)" }}
          />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ color: "var(--paper)" }}>
            Sector
          </label>
          <select
            value={sector}
            onChange={(e) => setSector(e.target.value)}
            className="form-input"
            style={{ background: "var(--paper)" }}
          >
            <option>Horeca</option>
            <option>Retail</option>
            <option>Logistiek</option>
            <option>Bouw</option>
            <option>Bezorging</option>
            <option>Zorg</option>
            <option>Anders</option>
          </select>
        </div>
      </div>

      <div className="form-group mb-3">
        <label className="form-label" style={{ color: "var(--paper)" }}>
          Aantal flex-medewerkers (gem.)
        </label>
        <input
          type="text"
          value={employees}
          onChange={(e) => setEmployees(e.target.value)}
          placeholder="Bijv. 5-10 per week"
          className="form-input"
          style={{ background: "var(--paper)" }}
        />
      </div>

      {error && (
        <div
          style={{
            background: "rgba(255, 200, 200, 0.1)",
            color: "#FCA5A5",
            padding: "12px",
            marginBottom: "12px",
            fontSize: "13px",
          }}
        >
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="btn btn-lime btn-large"
        style={{ width: "100%", opacity: loading ? 0.6 : 1 }}
      >
        {loading ? "Versturen..." : "Demo aanvragen →"}
      </button>
      <p
        style={{
          marginTop: "12px",
          color: "var(--stone-300)",
          fontSize: "12px",
          textAlign: "center",
        }}
      >
        We nemen binnen één werkdag contact met je op.
      </p>
    </form>
  );
}
