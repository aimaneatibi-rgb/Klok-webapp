"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Address = {
  street: string;
  house_number: string;
  postcode: string;
  city: string;
  country: string;
};

const emptyAddress: Address = {
  street: "",
  house_number: "",
  postcode: "",
  city: "",
  country: "Nederland",
};

function toAddress(input: Record<string, string> | null | undefined): Address {
  if (!input) return { ...emptyAddress };
  return {
    street: input.street ?? "",
    house_number: input.house_number ?? "",
    postcode: input.postcode ?? "",
    city: input.city ?? "",
    country: input.country ?? "Nederland",
  };
}

function isEmpty(a: Address) {
  return !a.street && !a.house_number && !a.postcode && !a.city;
}

function sameAddress(a: Address, b: Address) {
  return (
    a.street === b.street &&
    a.house_number === b.house_number &&
    a.postcode === b.postcode &&
    a.city === b.city &&
    a.country === b.country
  );
}

export default function AddressesForm({
  employerId,
  initialAddress,
  initialBillingAddress,
  initialBillingEmail,
}: {
  employerId: string;
  initialAddress: Record<string, string> | null;
  initialBillingAddress: Record<string, string> | null;
  initialBillingEmail: string;
}) {
  const router = useRouter();
  const [address, setAddress] = useState<Address>(toAddress(initialAddress));
  const [billingSame, setBillingSame] = useState<boolean>(
    !initialBillingAddress ||
      sameAddress(toAddress(initialAddress), toAddress(initialBillingAddress))
  );
  const [billingAddress, setBillingAddress] = useState<Address>(
    toAddress(initialBillingAddress ?? initialAddress)
  );
  const [billingEmail, setBillingEmail] = useState(initialBillingEmail);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  function updateAddress(
    setter: typeof setAddress,
    key: keyof Address,
    value: string
  ) {
    setter((prev) => ({ ...prev, [key]: value }));
    setSuccess(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    const billingToSave = billingSame ? address : billingAddress;
    const { error: updErr } = await supabase
      .from("employers")
      .update({
        address: isEmpty(address) ? null : address,
        billing_address: isEmpty(billingToSave) ? null : billingToSave,
        billing_email: billingEmail || null,
      })
      .eq("id", employerId);

    if (updErr) {
      setError(updErr.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Vestigingsadres */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6">
        <h2 className="font-serif text-xl font-medium mb-4">Vestigingsadres</h2>
        <AddressFields
          value={address}
          onChange={(k, v) => updateAddress(setAddress, k, v)}
        />
      </div>

      {/* Factuuradres */}
      <div className="bg-paper border border-stone-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <h2 className="font-serif text-xl font-medium">Factuuradres</h2>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={billingSame}
              onChange={(e) => {
                setBillingSame(e.target.checked);
                setSuccess(false);
                if (e.target.checked) setBillingAddress(address);
              }}
            />
            <span>Gelijk aan vestigingsadres</span>
          </label>
        </div>

        {!billingSame && (
          <AddressFields
            value={billingAddress}
            onChange={(k, v) => updateAddress(setBillingAddress, k, v)}
          />
        )}

        <div className="mt-4">
          <label className="eyebrow block mb-1.5">
            Email voor facturen (optioneel)
          </label>
          <input
            type="email"
            value={billingEmail}
            onChange={(e) => {
              setBillingEmail(e.target.value);
              setSuccess(false);
            }}
            placeholder="facturen@bedrijf.nl"
            className={inputClass}
          />
          <p className="text-xs text-stone-500 mt-1">
            Laat leeg om je hoofd-account email te gebruiken.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-800 text-sm px-3 py-2 rounded-md border border-red-200">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-lime/20 text-ink text-sm px-3 py-2 rounded-md border border-lime">
          ✓ Adressen opgeslagen.
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={loading}
          className="bg-lime text-ink px-5 py-2 rounded-md font-semibold hover:bg-lime-dark transition-colors disabled:opacity-50"
        >
          {loading ? "Opslaan..." : "Adressen opslaan"}
        </button>
      </div>
    </form>
  );
}

function AddressFields({
  value,
  onChange,
}: {
  value: Address;
  onChange: (key: keyof Address, val: string) => void;
}) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-[1fr_120px] gap-3">
        <Field label="Straat">
          <input
            type="text"
            value={value.street}
            onChange={(e) => onChange("street", e.target.value)}
            placeholder="Hoofdstraat"
            className={inputClass}
          />
        </Field>
        <Field label="Huisnr">
          <input
            type="text"
            value={value.house_number}
            onChange={(e) => onChange("house_number", e.target.value)}
            placeholder="12A"
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid grid-cols-[140px_1fr] gap-3">
        <Field label="Postcode">
          <input
            type="text"
            value={value.postcode}
            onChange={(e) => onChange("postcode", e.target.value.toUpperCase())}
            placeholder="1234 AB"
            className={inputClass}
          />
        </Field>
        <Field label="Stad">
          <input
            type="text"
            value={value.city}
            onChange={(e) => onChange("city", e.target.value)}
            placeholder="Amsterdam"
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Land">
        <input
          type="text"
          value={value.country}
          onChange={(e) => onChange("country", e.target.value)}
          className={inputClass}
        />
      </Field>
    </div>
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
