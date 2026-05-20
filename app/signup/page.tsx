"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SECTORS = [
  { value: "horeca", label: "Horeca" },
  { value: "retail", label: "Retail" },
  { value: "logistics", label: "Logistiek" },
  { value: "construction", label: "Bouw" },
  { value: "healthcare", label: "Zorg" },
  { value: "delivery", label: "Bezorging" },
];

export default function SignupPage() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [kvkNumber, setKvkNumber] = useState("");
  const [sector, setSector] = useState("horeca");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!agreed) {
      setError("Je moet akkoord gaan met de voorwaarden.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // Stap 1: maak auth user aan
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: "employer",
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    // Stap 2: maak employer record aan (database trigger maakt al users record)
    if (authData.user) {
      const { error: empError } = await supabase.from("employers").insert({
        user_id: authData.user.id,
        company_name: companyName,
        kvk_number: kvkNumber,
        sector: sector as
          | "horeca"
          | "retail"
          | "logistics"
          | "construction"
          | "healthcare"
          | "delivery",
      });

      if (empError) {
        setError(`Account aangemaakt maar bedrijfsdata mislukt: ${empError.message}`);
        setLoading(false);
        return;
      }

      // Stap 3: update phone op users tabel
      await supabase
        .from("users")
        .update({ phone })
        .eq("id", authData.user.id);
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-ink relative overflow-hidden py-12">
      <div
        className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-lime opacity-[0.08] rounded-full -translate-y-1/2 translate-x-1/4"
        style={{ filter: "blur(120px)" }}
      />

      <div className="bg-cream rounded-xl p-8 w-full max-w-md relative z-10 shadow-2xl">
        <Link href="/" className="logo-mark mb-8 inline-flex">
          KLOK<span className="dot"></span>
        </Link>

        <span className="eyebrow">— WERKGEVER ACCOUNT</span>
        <h1 className="font-serif text-3xl font-medium tracking-tight my-3">
          Begin gratis.
        </h1>
        <p className="text-stone-700 text-sm mb-6">
          Plaats je eerste shift in 5 minuten. Geen creditcard nodig.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="eyebrow block mb-1.5">Bedrijfsnaam</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Restaurant Bocca"
              className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="eyebrow block mb-1.5">KvK</label>
              <input
                type="text"
                required
                pattern="[0-9]{8}"
                value={kvkNumber}
                onChange={(e) => setKvkNumber(e.target.value)}
                placeholder="12345678"
                className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink"
              />
            </div>
            <div>
              <label className="eyebrow block mb-1.5">Sector</label>
              <select
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink"
              >
                {SECTORS.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="eyebrow block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aimane@bedrijf.nl"
              className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="eyebrow block mb-1.5">Telefoon</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+31 6 12345678"
              className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="eyebrow block mb-1.5">Wachtwoord</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimaal 8 tekens"
              className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink"
            />
          </div>

          <label className="flex gap-2 items-start text-sm text-stone-700">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
              className="mt-1"
            />
            <span>
              Ik ga akkoord met de{" "}
              <Link href="/voorwaarden" className="underline">
                voorwaarden
              </Link>{" "}
              en{" "}
              <Link href="/privacy" className="underline">
                privacy policy
              </Link>
              .
            </span>
          </label>

          {error && (
            <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-lime text-ink py-2.5 rounded-md font-semibold hover:bg-lime-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Bezig met aanmaken..." : "Account aanmaken"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-200 text-sm text-stone-700 text-center">
          Al een account?{" "}
          <Link href="/login" className="font-semibold underline">
            Inloggen
          </Link>
        </div>
      </div>
    </main>
  );
}
