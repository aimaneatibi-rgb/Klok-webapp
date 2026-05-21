"use client";

import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-ink relative overflow-hidden">
      {/* Lime gradient blob */}
      <div
        className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-lime opacity-[0.08] rounded-full -translate-y-1/2 translate-x-1/4"
        style={{ filter: "blur(120px)" }}
      />

      <div className="bg-cream rounded-xl p-8 w-full max-w-md relative z-10 shadow-2xl">
        <Link href="/" className="logo-mark mb-8 inline-flex">
          KLOK<span className="dot"></span>
        </Link>

        <span className="eyebrow">— INLOGGEN</span>
        <h1 className="font-serif text-3xl font-medium tracking-tight my-3">
          Welkom terug.
        </h1>
        <p className="text-stone-700 text-sm mb-6">
          Werkgever, werknemer of admin — log in met je email en wachtwoord.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="eyebrow block mb-1.5">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="naam@email.nl"
              className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink"
            />
          </div>

          <div>
            <label className="eyebrow block mb-1.5">Wachtwoord</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink"
            />
          </div>

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
            {loading ? "Bezig met inloggen..." : "Inloggen"}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-stone-200 text-sm text-stone-700 text-center">
          Nog geen account?{" "}
          <Link href="/signup" className="font-semibold underline">
            Registreer hier
          </Link>
        </div>
      </div>
    </main>
  );
}
