"use client";

import { createClient } from "@/lib/supabase/client";
import {
  METHOD_DESCRIPTIONS,
  METHOD_EMOJI,
  METHOD_LABELS,
  type PaymentMethodType,
} from "@/lib/payments";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { PaymentMethodRow } from "./page";

export default function MethodsManager({
  employerId,
  companyName,
  initial,
  demoMode,
}: {
  employerId: string;
  companyName: string;
  initial: PaymentMethodRow[];
  demoMode: boolean;
}) {
  const router = useRouter();
  const [methods, setMethods] = useState(initial);
  const [adding, setAdding] = useState<PaymentMethodType | null>(null);
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refresh from DB
  async function refresh() {
    const supabase = createClient();
    const { data } = await supabase
      .from("employer_payment_methods")
      .select("*")
      .eq("employer_id", employerId)
      .order("is_default", { ascending: false })
      .order("created_at", { ascending: false });
    setMethods((data ?? []) as PaymentMethodRow[]);
    router.refresh();
  }

  async function setDefault(id: string) {
    setLoading(id);
    setError(null);
    const supabase = createClient();
    // Atomic-ish: zet alle anderen op false, dan deze op true
    const others = methods.filter((m) => m.is_default).map((m) => m.id);
    if (others.length > 0) {
      await supabase
        .from("employer_payment_methods")
        .update({ is_default: false })
        .in("id", others);
    }
    const { error: e } = await supabase
      .from("employer_payment_methods")
      .update({ is_default: true })
      .eq("id", id);
    if (e) setError(e.message);
    setLoading(null);
    refresh();
  }

  async function deleteMethod(id: string) {
    if (!confirm("Verwijder deze betaalmethode?")) return;
    setLoading(id);
    setError(null);
    const supabase = createClient();
    const { error: e } = await supabase
      .from("employer_payment_methods")
      .delete()
      .eq("id", id);
    if (e) setError(e.message);
    setLoading(null);
    refresh();
  }

  return (
    <>
      {/* Lijst bestaande methodes */}
      <div className="space-y-3 mb-6">
        {methods.length === 0 ? (
          <div className="bg-paper border border-stone-200 rounded-lg p-8 text-center text-stone-500 text-sm">
            Nog geen betaalmethode geconfigureerd. Voeg er één toe hieronder.
          </div>
        ) : (
          methods.map((m) => (
            <div
              key={m.id}
              className={`border rounded-lg p-4 flex items-center justify-between gap-4 flex-wrap ${
                m.is_default
                  ? "bg-lime/10 border-lime"
                  : "bg-paper border-stone-200"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="text-3xl">{METHOD_EMOJI[m.type]}</div>
                <div className="min-w-0">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    {METHOD_LABELS[m.type]}
                    {m.is_default && (
                      <span className="text-xs bg-lime/30 text-lime-dark px-1.5 py-0.5 rounded font-semibold">
                        ⭐ Standaard
                      </span>
                    )}
                    <StatusBadge status={m.status} />
                  </div>
                  <div className="text-sm text-stone-600">
                    {m.type === "sepa_dd" && m.iban_last4 && (
                      <>
                        NL-rekening <span className="font-mono">···· {m.iban_last4}</span>
                      </>
                    )}
                    {m.type === "card" && (
                      <>
                        {m.card_brand ?? "Card"}{" "}
                        <span className="font-mono">···· {m.card_last4}</span>
                        {m.card_exp_month && m.card_exp_year && (
                          <>
                            {" "}
                            · vervalt{" "}
                            <span className="font-mono">
                              {String(m.card_exp_month).padStart(2, "0")}/
                              {String(m.card_exp_year).slice(-2)}
                            </span>
                          </>
                        )}
                      </>
                    )}
                    {m.type === "ideal" && "Per-factuur betaling via iDEAL"}
                    {m.type === "bank_transfer" && "Handmatige overschrijving"}
                  </div>
                </div>
              </div>
              <div className="flex gap-1 flex-wrap">
                {!m.is_default && m.status === "active" && (
                  <button
                    type="button"
                    onClick={() => setDefault(m.id)}
                    disabled={loading !== null}
                    className="text-xs px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 disabled:opacity-50"
                  >
                    Maak standaard
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteMethod(m.id)}
                  disabled={loading !== null}
                  className="text-xs px-2.5 py-1 rounded-md text-red-700 hover:bg-red-50 disabled:opacity-50"
                >
                  {loading === m.id ? "..." : "Verwijder"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200 mb-4">
          {error}
        </div>
      )}

      {/* Toevoegen */}
      <h2 className="font-serif text-xl font-medium mb-3">+ Methode toevoegen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {(["sepa_dd", "ideal", "card", "bank_transfer"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setAdding(t)}
            className="bg-paper border border-stone-200 rounded-lg p-4 text-left hover:border-ink transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="text-2xl">{METHOD_EMOJI[t]}</div>
              <div>
                <div className="font-semibold">{METHOD_LABELS[t]}</div>
                <div className="text-xs text-stone-500 mt-0.5">
                  {METHOD_DESCRIPTIONS[t]}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {adding && (
        <AddMethodModal
          type={adding}
          employerId={employerId}
          companyName={companyName}
          demoMode={demoMode}
          isFirst={methods.length === 0}
          onClose={() => setAdding(null)}
          onAdded={() => {
            setAdding(null);
            refresh();
          }}
        />
      )}
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    active: "bg-lime/20 text-lime-dark",
    pending: "bg-amber-100 text-amber-800",
    expired: "bg-stone-100 text-stone-500",
    failed: "bg-red-100 text-red-800",
    revoked: "bg-stone-200 text-stone-700",
  };
  const labels: Record<string, string> = {
    active: "Actief",
    pending: "In afwachting",
    expired: "Verlopen",
    failed: "Mislukt",
    revoked: "Ingetrokken",
  };
  return (
    <span
      className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
        styles[status] ?? "bg-stone-100"
      }`}
    >
      {labels[status] ?? status}
    </span>
  );
}

// === Add Method Modal ===

function AddMethodModal({
  type,
  employerId,
  companyName,
  demoMode,
  isFirst,
  onClose,
  onAdded,
}: {
  type: PaymentMethodType;
  employerId: string;
  companyName: string;
  demoMode: boolean;
  isFirst: boolean;
  onClose: () => void;
  onAdded: () => void;
}) {
  const [iban, setIban] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState(companyName);
  const [cardExp, setCardExp] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    if (type === "sepa_dd" && (!iban || !agreed)) {
      setError("Vul IBAN in en geef machtiging.");
      return;
    }
    if (type === "card" && (!cardNumber || !cardExp || !cardCvc)) {
      setError("Vul alle kaartgegevens in.");
      return;
    }
    if (type === "bank_transfer" && !agreed) {
      setError("Bevestig dat je facturen handmatig betaalt.");
      return;
    }

    setLoading(true);
    setError(null);

    const supabase = createClient();

    // In demo mode: maak direct een "active" rij. In productie zou je Mollie
    // checkout openen, de mandate setup laten doen, en daarna via webhook
    // de rij activeren.
    const ibanLast4 = iban ? iban.replace(/\s/g, "").slice(-4) : null;
    const cardLast4 = cardNumber ? cardNumber.replace(/\s/g, "").slice(-4) : null;
    const [expM, expY] = cardExp.split("/").map((s) => parseInt(s.trim(), 10));

    const insertData: Record<string, unknown> = {
      employer_id: employerId,
      type,
      provider: "mollie",
      status: demoMode ? "active" : "pending",
      is_default: isFirst,
      iban_last4: ibanLast4,
      card_last4: cardLast4,
      card_exp_month: expM || null,
      card_exp_year: expY ? 2000 + (expY % 100) : null,
      card_brand: type === "card" ? "Card" : null,
      label:
        type === "sepa_dd"
          ? `Auto-incasso ${ibanLast4 ? `···· ${ibanLast4}` : ""}`
          : type === "card"
            ? `Card ${cardLast4 ? `···· ${cardLast4}` : ""}`
            : type === "ideal"
              ? "iDEAL voorkeur"
              : "Bankoverschrijving",
      metadata: demoMode ? { demo: true } : null,
    };

    const { error: insErr } = await supabase
      .from("employer_payment_methods")
      .insert(insertData);

    if (insErr) {
      setError(insErr.message);
      setLoading(false);
      return;
    }

    setLoading(false);
    onAdded();
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-paper rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="px-6 py-4 border-b border-stone-200 flex items-start justify-between">
          <div>
            <span className="eyebrow">— METHODE TOEVOEGEN</span>
            <h2 className="font-serif text-2xl font-medium tracking-tight mt-1">
              {METHOD_EMOJI[type]} {METHOD_LABELS[type]}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => !loading && onClose()}
            className="text-stone-500 hover:text-ink text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          {demoMode && (
            <div className="bg-amber-50 border border-amber-300 rounded-md p-3 text-xs text-amber-900">
              🧪 <strong>Demo mode</strong> — methode wordt direct actief in DB
              zonder echte Mollie verificatie. In productie opent hier Mollie
              checkout en gaat de status naar &lsquo;active&rsquo; na bevestiging.
            </div>
          )}

          {type === "sepa_dd" && (
            <>
              <p className="text-sm text-stone-600">
                Door een SEPA-machtiging te tekenen geef je KLOK toestemming om
                openstaande facturen automatisch van deze rekening af te
                schrijven.
              </p>
              <Field label="IBAN *">
                <input
                  type="text"
                  value={iban}
                  onChange={(e) => setIban(e.target.value.toUpperCase())}
                  placeholder="NL00 BANK 0123 4567 89"
                  className={inputClass}
                />
              </Field>
              <Field label="Tenaamstelling">
                <input
                  type="text"
                  value={companyName}
                  disabled
                  className={`${inputClass} opacity-60`}
                />
              </Field>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  Ik machtig KLOK Works om bedragen voor openstaande facturen
                  van bovenstaande rekening te incasseren conform de SEPA
                  business-to-business voorwaarden.
                </span>
              </label>
            </>
          )}

          {type === "card" && (
            <>
              <Field label="Kaartnummer *">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4242 4242 4242 4242"
                  maxLength={19}
                  className={`${inputClass} font-mono`}
                />
              </Field>
              <Field label="Naam op kaart">
                <input
                  type="text"
                  value={cardName}
                  onChange={(e) => setCardName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Vervaldatum (MM/JJ)">
                  <input
                    type="text"
                    value={cardExp}
                    onChange={(e) => setCardExp(e.target.value)}
                    placeholder="12/27"
                    maxLength={5}
                    className={`${inputClass} font-mono`}
                  />
                </Field>
                <Field label="CVC">
                  <input
                    type="text"
                    value={cardCvc}
                    onChange={(e) => setCardCvc(e.target.value)}
                    placeholder="123"
                    maxLength={4}
                    className={`${inputClass} font-mono`}
                  />
                </Field>
              </div>
              <p className="text-xs text-stone-500">
                🔒 Kaartgegevens worden in productie nooit op onze server
                bewaard — alleen via Mollie Tokenization. In demo mode slaan we
                alleen laatste 4 cijfers op.
              </p>
            </>
          )}

          {type === "ideal" && (
            <>
              <p className="text-sm text-stone-600">
                iDEAL werkt per-factuur: er is geen mandaat. Door iDEAL als
                voorkeur in te stellen krijg je bij elke factuur een
                &lsquo;Direct betalen&rsquo; knop met iDEAL link.
              </p>
              <div className="bg-cream rounded-md p-3 text-sm">
                Geen verdere invoer nodig — iDEAL is een betaaloptie zonder
                opslaan van gegevens.
              </div>
            </>
          )}

          {type === "bank_transfer" && (
            <>
              <p className="text-sm text-stone-600">
                Bankoverschrijving: je ontvangt elke factuur per email + in het
                dashboard. Je maakt zelf het bedrag over binnen 7 dagen.
              </p>
              <label className="flex items-start gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  Ik ben me ervan bewust dat ik facturen binnen 7 dagen
                  handmatig moet overmaken. Bij verzuim worden incassokosten in
                  rekening gebracht (Wet Incassokosten).
                </span>
              </label>
            </>
          )}

          {error && (
            <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200">
              {error}
            </div>
          )}
        </div>

        <div className="px-6 py-4 border-t border-stone-200 bg-cream rounded-b-xl flex justify-end gap-2">
          <button
            type="button"
            onClick={() => !loading && onClose()}
            disabled={loading}
            className="px-4 py-2 text-sm text-stone-600 hover:text-ink"
          >
            Annuleer
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className="bg-lime text-ink px-5 py-2 rounded-md text-sm font-semibold hover:bg-lime-dark disabled:opacity-50 transition-colors"
          >
            {loading ? "Toevoegen..." : "✓ Bevestig & activeer"}
          </button>
        </div>
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-3 py-2 border border-stone-200 rounded-md bg-paper text-sm focus:outline-none focus:border-ink";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="eyebrow block mb-1">{label}</label>
      {children}
    </div>
  );
}
