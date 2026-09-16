"use client";

import { useState } from "react";
import { packages } from "@/data/packages";

type FormState = {
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  country: string;
  website: string;
  markets: string;
  packageInterest: string;
  message: string;
};

const initial: FormState = {
  companyName: "",
  contactName: "",
  email: "",
  phone: "",
  country: "",
  website: "",
  markets: "",
  packageInterest: "",
  message: "",
};

export function PartnerForm({
  defaultPackage = "",
}: {
  defaultPackage?: string;
}) {
  const [form, setForm] = useState<FormState>({
    ...initial,
    packageInterest: defaultPackage,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/partner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong. Please try again.");
        return;
      }
      setStatus("success");
      setForm({ ...initial, packageInterest: defaultPackage });
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  if (status === "success") {
    return (
      <div
        className="rounded-2xl border border-teal/30 bg-teal/5 p-8 text-center"
        role="status"
      >
        <h3 className="font-display text-2xl font-bold text-ink">
          Application received
        </h3>
        <p className="mt-3 text-ink/70">
          Asante — our partnerships team will review your details and follow up
          with next steps for catalog access and commercial terms.
        </p>
        <button
          type="button"
          className="mt-6 rounded-full bg-teal px-5 py-2 text-sm font-semibold text-cream"
          onClick={() => setStatus("idle")}
        >
          Submit another application
        </button>
      </div>
    );
  }

  const field =
    "mt-1 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-ink outline-none ring-teal/30 focus:ring-2";

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Company name *</span>
          <input
            required
            name="companyName"
            value={form.companyName}
            onChange={(e) => update("companyName", e.target.value)}
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Contact name *</span>
          <input
            required
            name="contactName"
            autoComplete="name"
            value={form.contactName}
            onChange={(e) => update("contactName", e.target.value)}
            className={field}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Work email *</span>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Phone (optional)</span>
          <input
            type="tel"
            name="phone"
            autoComplete="tel"
            value={form.phone}
            onChange={(e) => update("phone", e.target.value)}
            className={field}
          />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Country / HQ *</span>
          <input
            required
            name="country"
            value={form.country}
            onChange={(e) => update("country", e.target.value)}
            className={field}
            placeholder="e.g. Germany, India, USA"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Website (optional)</span>
          <input
            type="url"
            name="website"
            value={form.website}
            onChange={(e) => update("website", e.target.value)}
            className={field}
            placeholder="https://"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-ink">Source markets you sell *</span>
        <input
          required
          name="markets"
          value={form.markets}
          onChange={(e) => update("markets", e.target.value)}
          className={field}
          placeholder="e.g. Italy & France leisure, US adventure"
        />
      </label>

      <label className="block text-sm">
        <span className="font-medium text-ink">Package interest</span>
        <select
          name="packageInterest"
          value={form.packageInterest}
          onChange={(e) => update("packageInterest", e.target.value)}
          className={field}
        >
          <option value="">Browse full catalog after approval</option>
          {packages.map((pkg) => (
            <option key={pkg.slug} value={pkg.slug}>
              {pkg.name} ({pkg.duration})
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="font-medium text-ink">Tell us about your business *</span>
        <textarea
          required
          name="message"
          rows={5}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className={field}
          placeholder="Volume, product mix (safari / beach / climb), and how you’d like to resell…"
        />
      </label>

      {status === "error" && (
        <p className="text-sm text-red-700" role="alert">
          {errorMsg}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full rounded-full bg-teal px-6 py-3 text-sm font-semibold text-cream shadow hover:bg-teal-bright disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "Sending…" : "Submit partner application"}
      </button>
    </form>
  );
}
