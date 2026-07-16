"use client";

import { useState, type FormEvent } from "react";
import { contactSchema, CONTACT_FIELDS, type ContactInput } from "@/lib/contact-schema";
import { ArrowRight } from "@/components/ui/icons";

type Errors = Partial<Record<keyof ContactInput, string>>;
type Status = "idle" | "submitting" | "success" | "error";

const EMPTY: ContactInput = {
  name: "",
  email: "",
  telephone: "",
  company: "",
  enquiry: "",
  website: "",
};

export default function ContactForm() {
  const [values, setValues] = useState<ContactInput>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<Status>("idle");
  const [serverError, setServerError] = useState<string | null>(null);

  function setField<K extends keyof ContactInput>(key: K, value: string) {
    setValues((v) => ({ ...v, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  }

  function validateField(key: keyof ContactInput) {
    const single = contactSchema.safeParse(values);
    if (!single.success) {
      const fieldErr = single.error.flatten().fieldErrors[key]?.[0];
      if (fieldErr) setErrors((e) => ({ ...e, [key]: fieldErr }));
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setServerError(null);

    const result = contactSchema.safeParse(values);
    if (!result.success) {
      const fieldErrors = result.error.flatten().fieldErrors;
      const next: Errors = {};
      (Object.keys(fieldErrors) as Array<keyof ContactInput>).forEach((k) => {
        const msg = fieldErrors[k]?.[0];
        if (msg) next[k] = msg;
      });
      setErrors(next);
      // Focus the first invalid field.
      const first = Object.keys(next)[0];
      if (first) document.getElementById(`field-${first}`)?.focus();
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
    } catch {
      setStatus("error");
      setServerError("Something went wrong sending your enquiry. Please email us directly.");
    }
  }

  if (status === "success") {
    return (
      <div role="status" aria-live="polite" className="py-8">
        <p className="eyebrow text-(--color-accent-ink)">Thank you</p>
        <p className="mt-6 max-w-[34ch] text-h2 font-serif font-light leading-tight tracking-tight">
          Your enquiry is with us. We’ll be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-9">
      {/* Honeypot — visually hidden, off the a11y tree, never autocompleted */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden" hidden>
        <label htmlFor="field-website">Leave this field empty</label>
        <input
          id="field-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={values.website ?? ""}
          onChange={(e) => setField("website", e.target.value)}
        />
      </div>

      <div className="grid gap-9 sm:grid-cols-2">
        {CONTACT_FIELDS.map((f) => (
          <Field
            key={f.name}
            id={`field-${f.name}`}
            name={f.name}
            label={f.label}
            type={f.type}
            required={f.required}
            autoComplete={f.autoComplete}
            value={values[f.name] ?? ""}
            error={errors[f.name]}
            onChange={(v) => setField(f.name, v)}
            onBlur={() => validateField(f.name)}
          />
        ))}
      </div>

      <TextArea
        id="field-enquiry"
        label="Enquiry"
        required
        value={values.enquiry}
        error={errors.enquiry}
        onChange={(v) => setField("enquiry", v)}
        onBlur={() => validateField("enquiry")}
      />

      {serverError && (
        <p role="alert" className="text-sm text-(--color-accent-ink)">
          {serverError}
        </p>
      )}

      <div className="mt-2">
        <button
          type="submit"
          disabled={status === "submitting"}
          className="group inline-flex items-center gap-3 rounded-full bg-(--color-ink) px-8 py-4 text-sm font-medium tracking-tight text-(--color-paper-on-dark) transition-colors duration-500 hover:bg-(--color-accent) disabled:cursor-not-allowed disabled:opacity-50"
        >
          {status === "submitting" ? "Sending…" : "Send enquiry"}
          <ArrowRight className="size-4 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
        </button>
      </div>
    </form>
  );
}

type FieldProps = {
  id: string;
  name: string;
  label: string;
  type: string;
  required?: boolean;
  autoComplete?: string;
  value: string;
  error?: string;
  onChange: (v: string) => void;
  onBlur: () => void;
};

function Field({ id, name, label, type, required, autoComplete, value, error, onChange, onBlur }: FieldProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="eyebrow mb-3 text-(--color-ink)">
        {label}
        {required && <span className="text-(--color-accent-ink)"> *</span>}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-xl border border-(--color-ink)/15 bg-(--color-paper)/80 px-4 py-3.5 text-lg shadow-sm outline-none transition-[color,background-color,border-color,box-shadow] duration-300 focus:border-(--color-accent) focus:bg-(--color-paper) focus:shadow-[0_0_0_3px_rgba(168,107,114,0.18)] aria-[invalid=true]:border-(--color-accent)"
      />
      {error && (
        <span id={`${id}-error`} className="mt-2 text-sm text-(--color-accent-ink)">
          {error}
        </span>
      )}
    </div>
  );
}

function TextArea({
  id,
  label,
  required,
  value,
  error,
  onChange,
  onBlur,
}: Omit<FieldProps, "name" | "type" | "autoComplete">) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="eyebrow mb-3 text-(--color-ink)">
        {label}
        {required && <span className="text-(--color-accent-ink)"> *</span>}
      </label>
      <textarea
        id={id}
        name="enquiry"
        required={required}
        rows={5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full resize-none rounded-xl border border-(--color-ink)/15 bg-(--color-paper)/80 px-4 py-3.5 text-lg shadow-sm outline-none transition-[color,background-color,border-color,box-shadow] duration-300 focus:border-(--color-accent) focus:bg-(--color-paper) focus:shadow-[0_0_0_3px_rgba(168,107,114,0.18)] aria-[invalid=true]:border-(--color-accent)"
      />
      {error && (
        <span id={`${id}-error`} className="mt-2 text-sm text-(--color-accent-ink)">
          {error}
        </span>
      )}
    </div>
  );
}
