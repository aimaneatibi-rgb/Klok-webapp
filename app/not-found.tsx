import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pagina niet gevonden · KLOK Works",
};

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-ink text-paper relative overflow-hidden">
      <div
        className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-lime opacity-[0.06] rounded-full -translate-y-1/2 translate-x-1/4"
        style={{ filter: "blur(120px)" }}
      />

      <div className="max-w-lg text-center relative z-10">
        <Link href="/" className="logo-mark text-paper justify-center mb-8 inline-flex">
          KLOK<span className="dot"></span>
        </Link>

        <span className="eyebrow lime">— 404 · NIET GEVONDEN</span>
        <h1 className="font-serif text-5xl md:text-6xl font-medium tracking-tight leading-none my-6">
          Deze pagina<br />
          <em className="italic text-lime">bestaat niet.</em>
        </h1>
        <p className="text-stone-300 mb-10 leading-relaxed">
          De link die je volgde klopt niet meer, of de pagina is verplaatst.
          Geen zorgen — ga terug naar de homepage of log in op je dashboard.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <Link
            href="/"
            className="bg-lime text-ink px-5 py-2.5 rounded-md font-semibold hover:bg-lime-dark transition-colors"
          >
            Naar homepage
          </Link>
          <Link
            href="/login"
            className="bg-paper/10 text-paper px-5 py-2.5 rounded-md font-semibold hover:bg-paper/20 transition-colors"
          >
            Inloggen
          </Link>
        </div>

        <p className="mt-12 text-xs text-stone-500">
          Iets vreemds aan de hand? Mail{" "}
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
