"use client";

import { useEffect, useState } from "react";

export default function ReferralShareCard({
  referralCode,
  firstName,
}: {
  referralCode: string;
  firstName: string;
}) {
  const [origin, setOrigin] = useState("https://app.klok.works");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setOrigin(window.location.origin);
    }
  }, []);

  const fullUrl = `${origin}/signup?ref=${referralCode}`;
  const shareText = `Hi! Maak een account aan op KLOK Works via mijn link, dan krijg ik een kleine vergoeding als je shift werkt: ${fullUrl}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(fullUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select-element prompt
      window.prompt("Kopieer je link:", fullUrl);
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "KLOK Works",
          text: shareText,
          url: fullUrl,
        });
      } catch {
        // user cancelled
      }
    } else {
      copyLink();
    }
  }

  if (!referralCode) {
    return (
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 text-sm text-amber-900">
        Geen referral code gevonden. Vraag een admin om er één te genereren.
      </div>
    );
  }

  return (
    <div className="bg-ink text-paper rounded-lg p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-4 items-center">
        <div>
          <span className="eyebrow lime">— JOUW LINK</span>
          <div className="mt-2 mb-3 font-mono text-sm bg-stone-800 px-3 py-2 rounded-md break-all">
            {fullUrl}
          </div>
          <div className="text-xs text-stone-400">
            Code: <span className="font-mono text-paper">{referralCode}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={copyLink}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors ${
              copied
                ? "bg-lime-dark text-paper"
                : "bg-lime text-ink hover:bg-lime-dark"
            }`}
          >
            {copied ? "✓ Gekopieerd!" : "📋 Kopieer link"}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-paper text-ink px-4 py-2 rounded-md text-sm font-semibold hover:bg-stone-200 text-center transition-colors"
          >
            💬 WhatsApp
          </a>
          <a
            href={`mailto:?subject=${encodeURIComponent(
              "Doe mee met KLOK Works"
            )}&body=${encodeURIComponent(shareText)}`}
            className="bg-paper text-ink px-4 py-2 rounded-md text-sm font-semibold hover:bg-stone-200 text-center transition-colors"
          >
            📧 Email
          </a>
          <button
            onClick={nativeShare}
            className="bg-stone-700 text-paper px-4 py-2 rounded-md text-sm font-semibold hover:bg-stone-600 transition-colors"
          >
            ⤴ Meer delen
          </button>
        </div>
      </div>
      {/* Hint voor de naam — laat de groet persoonlijk voelen */}
      <div className="mt-4 pt-4 border-t border-stone-700 text-xs text-stone-400">
        Hi {firstName}! Hoe meer mensen je uitnodigt, hoe meer je verdient.
      </div>
    </div>
  );
}
