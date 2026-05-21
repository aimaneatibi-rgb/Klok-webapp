"use client";

import { useState } from "react";

export default function ProspectActions({
  prospectId,
  type,
  email,
  phone,
  companyName,
  contactName,
  alreadyConverted,
}: {
  prospectId: string;
  type: "employer" | "employee";
  email: string | null;
  phone: string | null;
  companyName: string | null;
  contactName: string;
  alreadyConverted: boolean;
}) {
  const [copied, setCopied] = useState(false);

  // Bouw de invite-URL — werkt op localhost én productie via window.location
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://app.klok.works";
  const inviteUrl = `${origin}/signup?prospect=${prospectId}${
    email ? `&email=${encodeURIComponent(email)}` : ""
  }`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: tekstselectie
      window.prompt("Kopieer deze link:", inviteUrl);
    }
  }

  const subject = encodeURIComponent(
    `KLOK Works — uitnodiging voor ${companyName ?? contactName}`
  );
  const body = encodeURIComponent(
    `Hoi ${contactName.split(" ")[0]},\n\nLeuk je te spreken. Hier is je persoonlijke link om snel een KLOK Works ${type === "employer" ? "werkgever-" : "werknemer-"}account aan te maken:\n\n${inviteUrl}\n\nLaat het weten als je vragen hebt.\n\nGr,\nKLOK Works team`
  );
  const mailtoHref = email
    ? `mailto:${email}?subject=${subject}&body=${body}`
    : null;

  return (
    <div className="bg-paper border border-stone-200 rounded-lg p-5">
      <span className="eyebrow">Acties</span>

      {alreadyConverted ? (
        <div className="mt-3 bg-lime/10 border border-lime rounded-md p-3 text-sm">
          ✓ Deze prospect is al geconverteerd naar een echt account.
        </div>
      ) : (
        <>
          <p className="text-xs text-stone-500 mt-2 mb-3">
            Stuur deze prospect een persoonlijke link. Bij signup wordt de
            prospect automatisch gemarkeerd als &lsquo;converted&rsquo; en
            gekoppeld aan het nieuwe account.
          </p>

          <div className="space-y-2">
            <div className="bg-cream border border-stone-200 rounded-md p-2 flex items-center gap-2">
              <code className="text-xs flex-1 truncate font-mono text-stone-700">
                {inviteUrl}
              </code>
              <button
                type="button"
                onClick={copy}
                className="text-xs bg-ink text-paper px-2 py-1 rounded font-semibold hover:bg-ink-soft whitespace-nowrap"
              >
                {copied ? "✓ Gekopieerd" : "Kopieer"}
              </button>
            </div>

            <div className="flex gap-2 flex-wrap">
              {mailtoHref && (
                <a
                  href={mailtoHref}
                  className="bg-lime text-ink px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-lime-dark transition-colors"
                >
                  ✉️ Stuur uitnodiging via mail
                </a>
              )}
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="bg-cream border border-stone-200 hover:border-ink text-ink px-3 py-1.5 rounded-md text-sm font-semibold transition-colors"
                >
                  📞 Bel {phone}
                </a>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
