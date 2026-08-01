// ============================================================
// Mollie-client — dependency-vrij (fetch), alleen server-side.
//
// Zonder MOLLIE_API_KEY draait alles in demo-mode: de billing-
// engine simuleert dan betalingen zodat de volledige flow lokaal
// te testen is. Met een test_/live_-key praat dit bestand echt
// met Mollie. Webhook-verificatie gebeurt door het payment-id
// opnieuw op te halen (Mollie-aanbeveling).
// ============================================================

const MOLLIE_API = "https://api.mollie.com/v2";

export function mollieEnabled(): boolean {
  return Boolean(process.env.MOLLIE_API_KEY);
}

type MollieAmount = { currency: "EUR"; value: string };

export type MolliePayment = {
  id: string;
  status:
    | "open"
    | "pending"
    | "paid"
    | "failed"
    | "canceled"
    | "expired"
    | "authorized";
  amount: MollieAmount;
  customerId?: string;
  mandateId?: string;
  sequenceType?: "oneoff" | "first" | "recurring";
  metadata?: Record<string, string> | null;
  _links?: { checkout?: { href: string } };
};

export function centsToMollie(cents: number): MollieAmount {
  return { currency: "EUR", value: (cents / 100).toFixed(2) };
}

async function mollieFetch<T>(
  path: string,
  init?: { method?: string; body?: Record<string, unknown> }
): Promise<T> {
  const key = process.env.MOLLIE_API_KEY;
  if (!key) throw new Error("MOLLIE_API_KEY ontbreekt (demo-mode actief)");

  const res = await fetch(`${MOLLIE_API}${path}`, {
    method: init?.method ?? "GET",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: init?.body ? JSON.stringify(init.body) : undefined,
  });

  const data = (await res.json()) as T & { detail?: string; title?: string };
  if (!res.ok) {
    throw new Error(
      `Mollie ${res.status}: ${data.title ?? ""} ${data.detail ?? ""}`.trim()
    );
  }
  return data;
}

/** Maak een Mollie-customer voor een werkgever. */
export async function createCustomer(params: {
  name: string;
  email: string;
  employerId: string;
}): Promise<{ id: string }> {
  return mollieFetch<{ id: string }>("/customers", {
    method: "POST",
    body: {
      name: params.name,
      email: params.email,
      metadata: { employer_id: params.employerId },
    },
  });
}

/**
 * Eerste betaling (sequenceType: first) — de klant rekent af via de
 * hosted checkout (iDEAL e.d.) en Mollie legt daarmee het SEPA-mandaat
 * vast voor toekomstige incasso's.
 */
export async function createFirstPayment(params: {
  customerId: string;
  amountCents: number;
  description: string;
  redirectUrl: string;
  webhookUrl: string;
  metadata?: Record<string, string>;
}): Promise<MolliePayment> {
  return mollieFetch<MolliePayment>(
    `/customers/${params.customerId}/payments`,
    {
      method: "POST",
      body: {
        amount: centsToMollie(params.amountCents),
        description: params.description,
        sequenceType: "first",
        redirectUrl: params.redirectUrl,
        webhookUrl: params.webhookUrl,
        metadata: params.metadata ?? {},
      },
    }
  );
}

/** Incasso op bestaand mandaat (sequenceType: recurring) — geen checkout. */
export async function createRecurringPayment(params: {
  customerId: string;
  amountCents: number;
  description: string;
  webhookUrl: string;
  metadata?: Record<string, string>;
}): Promise<MolliePayment> {
  return mollieFetch<MolliePayment>(
    `/customers/${params.customerId}/payments`,
    {
      method: "POST",
      body: {
        amount: centsToMollie(params.amountCents),
        description: params.description,
        sequenceType: "recurring",
        webhookUrl: params.webhookUrl,
        metadata: params.metadata ?? {},
      },
    }
  );
}

/** Payment ophalen — óók de webhook-verificatie (id her-ophalen). */
export async function getPayment(paymentId: string): Promise<MolliePayment> {
  return mollieFetch<MolliePayment>(`/payments/${paymentId}`);
}

/** Heeft deze customer een geldig incasso-mandaat? */
export async function hasValidMandate(customerId: string): Promise<boolean> {
  const res = await mollieFetch<{
    _embedded?: { mandates?: { status: string }[] };
  }>(`/customers/${customerId}/mandates`);
  return (res._embedded?.mandates ?? []).some((m) => m.status === "valid");
}
