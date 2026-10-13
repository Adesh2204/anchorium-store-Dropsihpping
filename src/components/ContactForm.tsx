"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

const TOPICS = [
  { id: "general", label: "Product question" },
  { id: "order", label: "Order or delivery" },
  { id: "payment", label: "Payment or refund" },
  { id: "damaged", label: "Damaged or wrong item" },
  { id: "wholesale", label: "Bulk / corporate gifting" },
];

export default function ContactForm() {
  const params = useSearchParams();
  const [values, setValues] = useState({
    name: "",
    email: "",
    phone: "",
    orderNo: params.get("ref") ?? "",
    topic: TOPICS.some((t) => t.id === params.get("topic")) ? params.get("topic")! : "general",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [reference, setReference] = useState<string | null>(null);

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    setErrors((prev) => ({ ...prev, [k]: "" }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as { ok?: boolean; reference?: string; error?: string; fields?: Record<string, string> };
      if (!res.ok || !json.ok) {
        setErrors(json.fields ?? {});
        setState("error");
        return;
      }
      setReference(json.reference ?? null);
      setState("sent");
    } catch {
      setState("error");
      setErrors({ form: "Network problem — please try again or email us directly." });
    }
  }

  if (state === "sent") {
    return (
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="card p-8 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/12 text-gold-deep">
          <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" aria-hidden>
            <path d="m5 13 4 4 10-11" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          </svg>
        </span>
        <h2 className="mt-5 text-2xl text-charcoal">Message received</h2>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-charcoal/65">
          Your reference is <strong className="font-semibold text-charcoal">{reference}</strong>. Quote it if you write
          again, and include photos for any damage claim — it is the fastest way for us to confirm a remedy.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/faq" className="btn btn-outline px-5 py-2.5 text-[0.64rem]">Read the FAQ</Link>
          <Link href="/" className="btn btn-ink px-5 py-2.5 text-[0.64rem]">Back to the store</Link>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card p-6 md:p-8">
      <h2 className="text-[1.3rem] text-charcoal">Send us a message</h2>
      <p className="mt-2 text-sm leading-relaxed text-charcoal/60">
        This form writes to the store’s support inbox in our database. Most replies go out within one working day.
      </p>

      {state === "error" && errors.form ? (
        <p role="alert" className="mt-5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-800">
          {errors.form}
        </p>
      ) : null}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Input id="c-name" label="Your name" value={values.name} onChange={set("name")} error={errors.name} autoComplete="name" required />
        <Input id="c-email" label="Email" type="email" value={values.email} onChange={set("email")} error={errors.email} autoComplete="email" required />
        <Input id="c-phone" label="Mobile (optional)" value={values.phone} onChange={set("phone")} inputMode="tel" autoComplete="tel" />
        <Input id="c-order" label="Order reference (optional)" value={values.orderNo} onChange={set("orderNo")} placeholder="ANC-XXXXXX" />
        <label className="block sm:col-span-2">
          <span className="field-label">Topic</span>
          <select id="c-topic" className="field" value={values.topic} onChange={set("topic")}>
            {TOPICS.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </label>
        <label className="block sm:col-span-2">
          <span className="field-label">Message</span>
          <textarea id="c-message" rows={6} className="field resize-y" value={values.message} onChange={set("message")} aria-invalid={Boolean(errors.message)} placeholder="Tell us what you need — order number, photos of a crack, the PIN code you were quoted…" />
          {errors.message ? <span className="mt-1.5 block text-[0.72rem] font-medium text-red-700">{errors.message}</span> : null}
        </label>
      </div>

      <button type="submit" className="btn btn-gold mt-7 w-full sm:w-auto" disabled={state === "sending"}>
        {state === "sending" ? "Sending…" : "Send message"}
      </button>
      <p className="mt-3 text-[0.7rem] text-charcoal/45">
        We use these details only to answer you. See the <Link href="/privacy-policy" className="underline hover:text-gold-deep">privacy policy</Link>.
      </p>
    </form>
  );
}

function Input({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  ...rest
}: {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  type?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="field-label">{label}</span>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        aria-invalid={Boolean(error)}
        className="field"
        {...rest}
      />
      {error ? <span className="mt-1.5 block text-[0.72rem] font-medium text-red-700">{error}</span> : null}
    </label>
  );
}
