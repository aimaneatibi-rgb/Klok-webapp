"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Stuur naar console — later vervangen door Sentry of vergelijkbaar
    console.error("Onverwachte fout:", error);
  }, [error]);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-ink text-paper relative overflow-hidden">
      <div
        className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-lime opacity-[0.06] rounded-full -translate-y-1/2 translate-x-1/4"
        style={{ filter: "blur(120px)" }}
      />

      <div className="max-w-lg text-center relative z-10">
        <Link
          href="/"
          className="logo-mark text-paper justify-center mb-8 inline-flex"
        >
          KLOK<span className="dot"></span>
        </Link>

        <span className="eyebrow lime">— ER GING IETS MIS</span>
        <h1 className="font-serif text-5xl md:text-6xl font-medium tracking-tight leading-none my-6">
          Onze excuses,<br />
          <em className="italic text-lime">probeer opnieuw.</em>
        </h1>
        <p className="text-stone-300 mb-10 leading-relaxed">
          Er trad een onverwachte fout op aan onze kant. We hebben de fout
          gelogd. Probeer het opnieuw, of ga terug naar de homepage.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={reset}
            className="bg-lime text-ink px-5 py-2.5 rounded-md font-semibold hover:bg-lime-dark transition-colors"
          >
            Probeer opnieuw
          </button>
          <Link
            href="/"
            className="bg-paper/10 text-paper px-5 py-2.5 rounded-md font-semibold hover:bg-paper/20 transition-colors"
          >
            Naar homepage
          </Link>
        </div>

        {error.digest && (
          <p className="mt-10 text-xs text-stone-500 font-mono">
            Foutcode: {error.digest}
          </p>
        )}

        <p className="mt-6 text-xs text-stone-500">
          Blijft het misgaan? Mail{" "}
          <a
            href="mailto:hallo@klokworks.nl"
            className="underline hover:text-stone-300"
          >
            hallo@klokworks.nl
          </a>
        </p>
      </div>
    </main>
  );
}
