"use client";

import { createClient } from "@/lib/supabase/client";
import { SECTORS, type SectorValue } from "@/lib/sectors";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type UserType = "employer" | "employee";

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupInner />
    </Suspense>
  );
}

function SignupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref") ?? "";
  const prospectId = searchParams.get("prospect") ?? "";
  const utmSource = searchParams.get("utm_source") ?? "";
  const utmMedium = searchParams.get("utm_medium") ?? "";
  const utmCampaign = searchParams.get("utm_campaign") ?? "";
  const presetEmail = searchParams.get("email") ?? "";

  // Bepaal de "bron" — referral wint van prospect-invite wint van utm wint van direct
  const source: string | null = referralCode
    ? `referral:${referralCode}`
    : prospectId
      ? "prospect_invite"
      : utmSource
        ? `utm:${utmSource}`
        : null;

  const [userType, setUserType] = useState<UserType>("employer");

  // Shared
  const [email, setEmail] = useState(presetEmail);
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Werkgever
  const [companyName, setCompanyName] = useState("");
  const [kvkNumber, setKvkNumber] = useState("");
  const [sector, setSector] = useState("horeca");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");

  // Werknemer
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

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

    // Stap 1: auth user aanmaken (handle_new_user trigger maakt users-row aan)
    const metadata: Record<string, string> = { user_type: userType };
    if (userType === "employee") {
      metadata.first_name = firstName;
      metadata.last_name = lastName;
    }
    if (referralCode) {
      metadata.referral_code = referralCode;
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (!authData.user) {
      setError("Account aanmaken mislukt — probeer opnieuw.");
      setLoading(false);
      return;
    }

    // Attributie-velden — gebruikt voor zowel werkgever als werknemer
    const attribution = {
      source,
      utm_source: utmSource || null,
      utm_medium: utmMedium || null,
      utm_campaign: utmCampaign || null,
    };

    // Stap 2: profielrecord aanmaken + phone op users updaten
    if (userType === "employer") {
      const { data: newEmployer, error: empError } = await supabase
        .from("employers")
        .insert({
          user_id: authData.user.id,
          company_name: companyName,
          kvk_number: kvkNumber,
          sector: sector as SectorValue,
          ...attribution,
        })
        .select("id")
        .single();

      if (empError || !newEmployer) {
        setError(
          `Account aangemaakt maar bedrijfsdata mislukt: ${empError?.message ?? "onbekende fout"}`
        );
        setLoading(false);
        return;
      }

      // Primaire contactpersoon vastleggen — zo hebben we altijd opvolg-gegevens
      // ook als de werkgever later afhaakt voordat-ie zijn eerste shift plaatst.
      const { error: contactError } = await supabase
        .from("employer_contacts")
        .insert({
          employer_id: newEmployer.id,
          name: contactName,
          role: contactRole || null,
          email,
          phone,
          is_primary: true,
        });

      if (contactError) {
        // Account + employer bestaan al, dus enkel waarschuwen — gebruiker kan
        // later contact toevoegen via instellingen, en de gate vangt het op.
        console.warn("employer_contacts insert mislukt:", contactError.message);
      }

      // Prospect-invite afhandelen: markeer als converted
      if (prospectId) {
        await supabase
          .from("crm_prospects")
          .update({
            status: "converted",
            converted_employer_id: newEmployer.id,
            converted_at: new Date().toISOString(),
          })
          .eq("id", prospectId);

        await supabase.from("crm_activities").insert({
          target_type: "prospect",
          target_id: prospectId,
          kind: "signup",
          summary: `Prospect geconverteerd naar werkgever-account: ${companyName}`,
        });
      }
    } else {
      // werknemer: maak leeg employees record (profiel completion komt later)
      const { data: newEmployee, error: empError } = await supabase
        .from("employees")
        .insert({ user_id: authData.user.id, ...attribution })
        .select("id")
        .single();

      if (empError || !newEmployee) {
        setError(
          `Account aangemaakt maar profiel mislukt: ${empError?.message ?? "onbekende fout"}`
        );
        setLoading(false);
        return;
      }

      // Prospect-invite afhandelen voor werknemer-conversie
      if (prospectId) {
        await supabase
          .from("crm_prospects")
          .update({
            status: "converted",
            converted_employee_id: newEmployee.id,
            converted_at: new Date().toISOString(),
          })
          .eq("id", prospectId);

        await supabase.from("crm_activities").insert({
          target_type: "prospect",
          target_id: prospectId,
          kind: "signup",
          summary: `Prospect geconverteerd naar werknemer-account: ${firstName} ${lastName}`,
        });
      }
    }

    await supabase
      .from("users")
      .update({ phone })
      .eq("id", authData.user.id);

    router.push(userType === "employer" ? "/dashboard" : "/werknemer");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-ink relative overflow-hidden py-12">
      <div
        className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-lime opacity-[0.08] rounded-full -translate-y-1/2 translate-x-1/4"
        style={{ filter: "blur(120px)" }}
      />

      <div className="bg-cream rounded-xl p-8 w-full max-w-md relative z-10 shadow-2xl">
        <Link href="/" className="logo-mark mb-6 inline-flex">
          KLOK<span className="dot"></span>
        </Link>

        {prospectId && (
          <div className="bg-lime/20 border border-lime rounded-md px-3 py-2 mb-4 text-sm">
            ✨ <strong>Je bent uitgenodigd door KLOK Works.</strong> Vul je
            gegevens aan om te starten.
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-stone-200 rounded-md mb-6">
          <TabButton
            active={userType === "employer"}
            onClick={() => setUserType("employer")}
          >
            Werkgever
          </TabButton>
          <TabButton
            active={userType === "employee"}
            onClick={() => setUserType("employee")}
          >
            Werknemer
          </TabButton>
        </div>

        {userType === "employer" ? (
          <>
            <span className="eyebrow">— WERKGEVER ACCOUNT</span>
            <h1 className="font-serif text-3xl font-medium tracking-tight my-3">
              Begin gratis.
            </h1>
            <p className="text-stone-700 text-sm mb-6">
              Plaats je eerste shift in 5 minuten. Geen creditcard nodig.
            </p>
          </>
        ) : (
          <>
            <span className="eyebrow">— WERKNEMER ACCOUNT</span>
            <h1 className="font-serif text-3xl font-medium tracking-tight my-3">
              Vind werk dat past.
            </h1>
            <p className="text-stone-700 text-sm mb-6">
              Maak gratis een account aan. Je profiel completeer je later om op
              shifts te reageren.
            </p>
          </>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {userType === "employer" ? (
            <>
              <Field label="Bedrijfsnaam">
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Restaurant Bocca"
                  className={inputClass}
                />
              </Field>

              <div className="grid grid-cols-2 gap-3">
                <Field label="KvK">
                  <input
                    type="text"
                    required
                    pattern="[0-9]{8}"
                    value={kvkNumber}
                    onChange={(e) => setKvkNumber(e.target.value)}
                    placeholder="12345678"
                    className={inputClass}
                  />
                </Field>
                <Field label="Sector">
                  <select
                    value={sector}
                    onChange={(e) => setSector(e.target.value)}
                    className={inputClass}
                  >
                    {SECTORS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Field label="Contactpersoon">
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="Jan Janssen"
                    className={inputClass}
                  />
                </Field>
                <Field label="Functie">
                  <input
                    type="text"
                    value={contactRole}
                    onChange={(e) => setContactRole(e.target.value)}
                    placeholder="bv. Eigenaar"
                    className={inputClass}
                  />
                </Field>
              </div>
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Voornaam">
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Voornaam"
                  className={inputClass}
                />
              </Field>
              <Field label="Achternaam">
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Achternaam"
                  className={inputClass}
                />
              </Field>
            </div>
          )}

          <Field label="Email">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={
                userType === "employer"
                  ? "info@bedrijf.nl"
                  : "naam@email.nl"
              }
              className={inputClass}
            />
          </Field>

          <Field label="Telefoon">
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+31 6 12345678"
              className={inputClass}
            />
          </Field>

          <Field label="Wachtwoord">
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimaal 8 tekens"
              className={inputClass}
            />
          </Field>

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

const inputClass =
  "w-full px-3 py-2.5 border border-stone-200 rounded-md bg-paper focus:outline-none focus:border-ink";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="eyebrow block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-2 rounded text-sm font-semibold transition-colors ${
        active
          ? "bg-paper text-ink shadow-sm"
          : "text-stone-600 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}
