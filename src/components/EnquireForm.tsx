"use client";

import { useMemo, useState } from "react";
import { packages } from "@/data/packages";
import { experiences } from "@/data/experiences";

type Props = {
  defaultPackage?: string;
  defaultInterests?: string[];
};

type FormState = {
  name: string;
  email: string;
  phone: string;
  travelDates: string;
  partySize: string;
  interests: string[];
  packageSlug: string;
  message: string;
};

const initial: FormState = {
  name: "",
  email: "",
  phone: "",
  travelDates: "",
  partySize: "2",
  interests: [],
  packageSlug: "",
  message: "",
};

export function EnquireForm({ defaultPackage = "", defaultInterests = [] }: Props) {
  const [form, setForm] = useState<FormState>({
    ...initial,
    packageSlug: defaultPackage,
    interests: defaultInterests,
  });
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [errorMsg, setErrorMsg] = useState("");

  const interestOptions = useMemo(
    () => experiences.map((e) => ({ value: e.slug, label: e.name })),
    [],
  );

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function toggleInterest(slug: string) {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.includes(slug)
        ? prev.interests.filter((i) => i !== slug)
        : [...prev.interests, slug],
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setErrorMsg("");
    try {
      const res = await fetch("/api/enquire", {
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
      setForm({ ...initial, packageSlug: defaultPackage, interests: defaultInterests });
    } catch {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  }

  const field =
    "mt-1 w-full rounded-xl border border-ink/15 bg-white px-3 py-2.5 text-ink outline-none ring-gold/40 focus:ring-2";

  if (status === "success") {
    return (
      <div
        className="rounded-2xl border border-teal/30 bg-teal/5 p-8 text-center"
        role="status"
      >
        <h3 className="font-display text-2xl font-bold text-ink">
          Asante — enquiry received
        </h3>
        <p className="mt-3 text-ink/70">
          Thank you for your interest in Tanzania. Our travel team will review
          your details and reply with next steps. Karibu!
        </p>
        <button
          type="button"
          className="mt-6 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-cream"
          onClick={() => setStatus("idle")}
        >
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="font-medium text-ink">Full name *</span>
          <input
            required
            name="name"
            autoComplete="name"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            className={field}
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-ink">Email *</span>
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
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
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
        <label className="block text-sm">
          <span className="font-medium text-ink">Party size *</span>
          <input
            required
            type="number"
            name="partySize"
            min={1}
            max={30}
            value={form.partySize}
            onChange={(e) => update("partySize", e.target.value)}
            className={field}
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="font-medium text-ink">Travel dates *</span>
        <input
          required
          name="travelDates"
          placeholder="e.g. mid-July 2027, or 12–22 Sep 2027"
          value={form.travelDates}
          onChange={(e) => update("travelDates", e.target.value)}
          className={field}
        />
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-ink">Interests</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {interestOptions.map((opt) => {
            const checked = form.interests.includes(opt.value);
            return (
              <label
                key={opt.value}
                className={`cursor-pointer rounded-full border px-3 py-1.5 text-sm ${
                  checked
                    ? "border-ink bg-ink text-cream"
                    : "border-ink/20 bg-white text-ink/80"
                }`}
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={checked}
                  onChange={() => toggleInterest(opt.value)}
                />
                {opt.label}
              </label>
            );
          })}
        </div>
      </fieldset>

      <label className="block text-sm">
        <span className="font-medium text-ink">Package preference</span>
        <select
          name="packageSlug"
          value={form.packageSlug}
          onChange={(e) => update("packageSlug", e.target.value)}
          className={field}
        >
          <option value="">Not sure yet — help me choose</option>
          {packages.map((pkg) => (
            <option key={pkg.slug} value={pkg.slug}>
              {pkg.name} ({pkg.duration})
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="font-medium text-ink">Message *</span>
        <textarea
          required
          name="message"
          rows={5}
          placeholder="Tell us about your dream trip, budget range, or special occasions…"
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          className={field}
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
        className="w-full rounded-full bg-ink px-6 py-3 text-sm font-semibold text-cream shadow hover:bg-ink-soft disabled:opacity-60 sm:w-auto"
      >
        {status === "loading" ? "Sending…" : "Submit enquiry"}
      </button>
    </form>
  );
}
