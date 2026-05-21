// Contract template generator op basis van shift/vacature contract_partner
// 'platform' = via admin-aangewezen payroll partij (provider naam komt uit sector_payroll_providers)
// 'direct'   = werkgever heeft eigen contract (alleen vacatures)
// 'tentoo' / 'persoonlijk_bv' / 'other' = legacy, alleen voor backward compat

import { getSectorLabel } from "@/lib/sectors";

export type ContractPartner =
  | "platform"
  | "direct"
  | "tentoo"
  | "persoonlijk_bv"
  | "other";

export type ContractInput = {
  partner: ContractPartner;
  providerName?: string; // verplicht voor 'platform' — naam van payroll partij
  shift: {
    title: string;
    description: string | null;
    starts_at: string;
    ends_at: string;
    hourly_rate_cents: number;
    dress_code: string | null;
  };
  employer: {
    company_name: string;
    legal_name: string | null;
    kvk_number: string | null;
    sector: string;
    address: Record<string, string> | null;
  };
  employee: {
    fullName: string;
    email: string;
    date_of_birth: string | null;
    iban: string | null;
  };
};

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleString("nl-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function fmtEur(cents: number): string {
  return `€ ${(cents / 100).toFixed(2)}`;
}

function fmtAddress(addr: Record<string, string> | null): string {
  if (!addr) return "—";
  const parts = [
    addr.street && addr.house_number
      ? `${addr.street} ${addr.house_number}`
      : addr.street ?? null,
    addr.postcode && addr.city ? `${addr.postcode} ${addr.city}` : addr.city,
  ].filter(Boolean);
  return parts.join(", ") || "—";
}

export function generateContract(input: ContractInput): {
  title: string;
  body: string;
  partnerLabel: string;
} {
  const { partner, providerName, shift, employer, employee } = input;
  const start = new Date(shift.starts_at);
  const end = new Date(shift.ends_at);
  const hours = (end.getTime() - start.getTime()) / 3_600_000;
  const grossCents = Math.round(hours * shift.hourly_rate_cents);

  const c = {
    werkgever: employer.legal_name ?? employer.company_name,
    werkgeverShort: employer.company_name,
    werknemer: employee.fullName,
    kvk: employer.kvk_number ?? "—",
    sector: getSectorLabel(employer.sector),
    address: fmtAddress(employer.address),
    starts: fmtDate(shift.starts_at),
    ends: fmtDate(shift.ends_at),
    hours: hours.toFixed(2),
    rate: fmtEur(shift.hourly_rate_cents),
    gross: fmtEur(grossCents),
    dressCode: shift.dress_code ?? "n.v.t.",
    today: new Date().toLocaleDateString("nl-NL", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
    shiftTitle: shift.title,
    shiftDesc: shift.description ?? "",
    iban: employee.iban ?? "—",
    email: employee.email,
    dob: employee.date_of_birth
      ? new Date(employee.date_of_birth).toLocaleDateString("nl-NL")
      : "—",
  };

  // 'platform' (en legacy 'tentoo') gebruiken dezelfde template — alleen partner naam verschilt
  if (partner === "platform" || partner === "tentoo") {
    const partyName = providerName ?? (partner === "tentoo" ? "Tentoo Payroll" : "KLOK Works payroll partij");
    return {
      partnerLabel: partyName,
      title: `Arbeidsovereenkomst via ${partyName}`,
      body: `KLOK WORKS · ARBEIDSOVEREENKOMST VIA ${partyName.toUpperCase()}

Datum: ${c.today}

PARTIJEN
- ${partyName} ("Formele werkgever / payroll partij")
  optreedt voor ${c.werkgever} (opdrachtgever, KvK ${c.kvk})
- ${c.werknemer} ("Werknemer"), geboren ${c.dob}, IBAN ${c.iban}

ARTIKEL 1 — AARD VAN HET WERK
Werknemer voert de volgende shift uit voor ${c.werkgeverShort}:
- Functie: ${c.shiftTitle}
- Locatie: ${c.address}
- Aanvang: ${c.starts}
- Einde: ${c.ends}
- Geschatte duur: ${c.hours} uur
- Dresscode: ${c.dressCode}
${c.shiftDesc ? `- Toelichting: ${c.shiftDesc}\n` : ""}
ARTIKEL 2 — LOON & UITBETALING
- Uurloon: ${c.rate} bruto
- Geschat totaal bruto: ${c.gross}
- Uitbetaling: wekelijks per SEPA naar ${c.iban}
- ${partyName} houdt loonbelasting, sociale lasten en pensioenbijdrage in
- Vakantiegeld en vakantiedagen conform sector CAO

ARTIKEL 3 — TOEPASSELIJKE REGELGEVING
- Sector CAO: ${c.sector}
- Nederlandse arbeidswetgeving (Boek 7 BW)
- AVG / GDPR voor persoonsgegevens
- Algemene voorwaarden ${partyName}

ARTIKEL 4 — ROLLEN
- KLOK Works fungeert UITSLUITEND als marktplaats en is GEEN partij in deze
  arbeidsovereenkomst.
- ${partyName} is de formele werkgever en draagt verantwoordelijkheid voor
  loonadministratie, sociale lasten en arbeidsvoorwaarden.
- ${c.werkgeverShort} is de feitelijke opdrachtgever (klant van ${partyName}).

ARTIKEL 5 — VERPLICHTINGEN WERKNEMER
- Op tijd aanwezig, in correcte werkkleding
- Veiligheid- en huisregels van ${c.werkgeverShort} respecteren
- In- en uitklokken via KLOK Works platform
- Geheimhouding bedrijfsgevoelige informatie

ARTIKEL 6 — ANNULERING & NO-SHOW
- No-show zonder geldige reden: tarief vervalt + waarschuwing in KLOK profiel
- Annulering 24u van tevoren: geen kosten
- Werkgever annulering < 24u: 50% loon uitbetaling werknemer

ARTIKEL 7 — ONDERTEKENING
Door dit contract elektronisch te ondertekenen verklaart Werknemer:
- akkoord te zijn met bovenstaande voorwaarden
- akkoord te zijn met algemene voorwaarden ${partyName}
- bekend te zijn met de KLOK Works gedragscode
- dat de verstrekte persoonsgegevens (BSN, IBAN, geboortedatum) correct zijn`,
    };
  }

  if (partner === "direct") {
    return {
      partnerLabel: "Directe overeenkomst",
      title: "Directe arbeidsovereenkomst",
      body: `KLOK WORKS · DIRECTE ARBEIDSOVEREENKOMST

Datum: ${c.today}

PARTIJEN
- ${c.werkgever} ("Werkgever", KvK ${c.kvk}), ${c.address}
- ${c.werknemer} ("Werknemer"), geboren ${c.dob}, IBAN ${c.iban}

ARTIKEL 1 — AARD VAN HET WERK
- Functie: ${c.shiftTitle}
- Aanvang: ${c.starts}
- Einde: ${c.ends}
- Duur: ${c.hours} uur
- Dresscode: ${c.dressCode}
${c.shiftDesc ? `- Toelichting: ${c.shiftDesc}\n` : ""}
ARTIKEL 2 — LOON
- Uurloon: ${c.rate} bruto
- Geschat totaal: ${c.gross} bruto
- Uitbetaling per SEPA naar ${c.iban} binnen 5 werkdagen na afloop
- Werkgever draagt loonbelasting + sociale lasten af conform Nederlandse wet

ARTIKEL 3 — TOEPASSELIJKE REGELGEVING
- Sector CAO: ${c.sector}
- Nederlandse arbeidswetgeving (Boek 7 BW)
- AVG / GDPR

ARTIKEL 4 — ROL KLOK WORKS
KLOK Works fungeert UITSLUITEND als marktplaats en is GEEN partij in deze
arbeidsovereenkomst. KLOK Works is geen werkgever, geen uitzendonderneming
en draagt geen verantwoordelijkheid voor de uitvoering van deze overeenkomst.

ARTIKEL 5 — VERPLICHTINGEN
- Werknemer: op tijd, in werkkleding, veiligheid + huisregels respecteren
- Werkgever: veilige werkomgeving, tijdige uitbetaling, BSN-registratie

ARTIKEL 6 — ANNULERING
- No-show werknemer: tarief vervalt + KLOK profiel waarschuwing
- Annulering werknemer >24u: geen kosten
- Annulering werkgever <24u: 50% loon uitbetaling

ARTIKEL 7 — ONDERTEKENING
Door dit contract elektronisch te ondertekenen verklaart Werknemer akkoord te
zijn met bovenstaande voorwaarden en de KLOK Works gedragscode.`,
    };
  }

  // Legacy fallback (persoonlijk_bv, other) — toon generiek
  return {
    partnerLabel: "Aangepaste overeenkomst",
    title: "Werkovereenkomst",
    body: `KLOK WORKS · WERKOVEREENKOMST

Datum: ${c.today}

Tussen ${c.werkgever} en ${c.werknemer} is overeengekomen:

- Werkzaamheden: ${c.shiftTitle}
- Locatie: ${c.address}
- Datum/tijd: ${c.starts} – ${c.ends} (${c.hours} uur)
- Tarief: ${c.rate} per uur
- Geschat totaal: ${c.gross}

Specifieke voorwaarden worden tussen partijen apart vastgelegd. KLOK Works
fungeert uitsluitend als marktplaats en is geen partij in deze overeenkomst.

Door ondertekening verklaart de werknemer akkoord met bovenstaande en de
KLOK Works gedragscode.`,
  };
}
