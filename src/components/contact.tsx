import { useEffect, useRef, useState } from "react";

import { PROFILE_LINKS } from "../constants";
import {
  CONTACT_EMAIL,
  MESSAGE_MAX_LENGTH,
  WEB3FORMS_KEY,
  buildContactMailto,
  isValidContactEmail,
  isValidContactMessage,
  isValidContactName,
  onContactPrefill,
  sendContactMessage,
  type ContactFormFields,
} from "../lib/contact";
import { cueMascot } from "../lib/mascot";

const FIELDS = [
  {
    name: "name",
    label: "Your name",
    type: "text",
    placeholder: "Your name",
    autoComplete: "name",
    maxLength: 200,
    isValid: isValidContactName,
    error: "Enter your name (at least 3 characters).",
    hint: "Who am I talking to?",
  },
  {
    name: "email",
    label: "Your email",
    type: "email",
    placeholder: "you@company.com",
    autoComplete: "email",
    maxLength: 100,
    isValid: isValidContactEmail,
    error: "Enter a valid email address.",
    hint: "Where should the reply go?",
  },
  {
    name: "message",
    label: "Your message",
    type: "textarea",
    placeholder: "What do you want automated, or which bot do you want tested?",
    autoComplete: "off",
    maxLength: MESSAGE_MAX_LENGTH,
    isValid: isValidContactMessage,
    error: `Write a message of 5 to ${MESSAGE_MAX_LENGTH} characters.`,
    hint: "A line or two is plenty.",
  },
] as const;

const INPUT_CLASS =
  "w-full bg-transparent border-b-[1.5px] border-ink py-3 placeholder:text-mute outline-hidden focus:shadow-[0_1.5px_0_0_var(--color-ink)]";

const EMPTY_FORM: ContactFormFields = { name: "", email: "", message: "" };
const REPLY_PROMISE = "I reply within one working day.";

// What the line beside the button says at each stage of sending
const STATUS_NOTES = {
  idle: WEB3FORMS_KEY
    ? REPLY_PROMISE
    : `Opens your email app with this message filled in. ${REPLY_PROMISE}`,
  sending: "Sending your message.",
  sent: `Message sent. ${REPLY_PROMISE}`,
  handedOff: `That did not send from here, so your email app should open with the message filled in. ${REPLY_PROMISE}`,
};

const ContactForm = () => {
  const hasAttemptedSubmit = useRef(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [status, setStatus] = useState<keyof typeof STATUS_NOTES>("idle");

  // A visitor's own words are never overwritten
  useEffect(
    () =>
      onContactPrefill((text) => {
        setForm((current) => (current.message ? current : { ...current, message: text }));
        // After the link's own jump to #contact, which would otherwise take the focus back
        setTimeout(() => document.getElementById("message")?.focus({ preventScroll: true }));
      }),
    [],
  );

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === "sending") return;
    hasAttemptedSubmit.current = true;
    // A field people never see; only a script fills it in
    const isBot = new FormData(e.currentTarget).get("company_website");

    const invalid = FIELDS.find((field) => !field.isValid(form[field.name]));
    if (invalid) {
      // Re-render so the errors for the fields that failed become visible
      setForm({ ...form });
      document.getElementById(invalid.name)?.focus();
      cueMascot(
        "confused",
        invalid.error,
        document.getElementById(invalid.name)?.closest("label"),
      );
      return;
    }

    setStatus("sending");
    if (isBot || (await sendContactMessage(form))) {
      hasAttemptedSubmit.current = false;
      setForm(EMPTY_FORM);
      setStatus("sent");
      cueMascot("celebrate", "Sent. You'll hear back within one working day.");
      return;
    }

    setStatus(WEB3FORMS_KEY ? "handedOff" : "idle");
    cueMascot("celebrate", "Your email app should open with it filled in.");
    window.location.href = buildContactMailto(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      onFocus={(e) => {
        const field = FIELDS.find((f) => f.name === e.target.id);
        if (field) cueMascot("listening", field.hint, e.target.closest("label"));
      }}
      onInput={() => cueMascot("listening")}
      noValidate
      className="flex flex-col gap-7"
    >
      {FIELDS.map((field) => {
        const showError =
          hasAttemptedSubmit.current && !field.isValid(form[field.name]);
        const shared = {
          id: field.name,
          name: field.name,
          value: form[field.name],
          placeholder: field.placeholder,
          autoComplete: field.autoComplete,
          maxLength: field.maxLength,
          "aria-invalid": showError,
          "aria-describedby": showError ? `${field.name}-error` : undefined,
          className: INPUT_CLASS,
          onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
          ) => setForm({ ...form, [field.name]: e.target.value }),
        };

        return (
          <label key={field.name} htmlFor={field.name} className="flex flex-col">
            <span className="font-mono text-[13px] text-mute">{field.label}</span>
            {field.type === "textarea" ? (
              <textarea rows={4} {...shared} className={`${INPUT_CLASS} resize-none`} />
            ) : (
              <input type={field.type} {...shared} />
            )}
            {showError && (
              <span id={`${field.name}-error`} role="alert" className="mt-2 text-[14px] font-medium">
                {field.error}
              </span>
            )}
          </label>
        );
      })}

      <input
        type="text"
        name="company_website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden
        className="hidden"
      />

      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" disabled={status === "sending"} className="button button-solid">
          Send message
        </button>
        <span role="status" className="max-w-[44ch] font-mono text-[12px] text-mute">
          {STATUS_NOTES[status]}
        </span>
      </div>
    </form>
  );
};

// Contact
export const Contact = () => (
  <section id="contact" className="bg-panel border-t border-line">
    <div className="max-w-7xl mx-auto px-6 sm:px-12 py-24 sm:py-32 grid lg:grid-cols-2 gap-16">
      <div>
        <h2 className="text-[52px] sm:text-[88px]">
          Have something worth automating?
        </h2>
        <p className="mt-6 max-w-[46ch] leading-7 text-mute">
          Send a short description of your process, or the bot you want tested.
          I'll reply with an approach, a timeline and a fixed price.
        </p>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="mt-8 inline-block font-mono text-teal underline underline-offset-4 hover:no-underline"
        >
          {CONTACT_EMAIL}
        </a>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 font-mono text-[14px]">
          {PROFILE_LINKS.map((link) => (
            <li key={link.title}>
              <a
                href={link.href}
                target="_blank"
                rel="noreferrer noopener"
                className="underline underline-offset-4 hover:text-teal"
              >
                {link.title}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <ContactForm />
    </div>
  </section>
);
