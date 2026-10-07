import { useRef, useState } from "react";

import { PROFILE_LINKS } from "../constants";
import {
  CONTACT_EMAIL,
  buildContactMailto,
  isValidContactEmail,
  isValidContactMessage,
  isValidContactName,
  type ContactFormFields,
} from "../lib/contact";

const FIELDS = [
  {
    name: "name",
    label: "Your name",
    type: "text",
    placeholder: "Your name",
    maxLength: 200,
    isValid: isValidContactName,
    error: "Enter your name (at least 3 characters).",
  },
  {
    name: "email",
    label: "Your email",
    type: "email",
    placeholder: "you@company.com",
    maxLength: 100,
    isValid: isValidContactEmail,
    error: "Enter a valid email address.",
  },
  {
    name: "message",
    label: "Your message",
    type: "textarea",
    placeholder: "What do you want automated, or which bot do you want tested?",
    maxLength: 500,
    isValid: isValidContactMessage,
    error: "Write a message of 5 to 500 characters.",
  },
] as const;

const INPUT_CLASS =
  "w-full bg-transparent border-b-[1.5px] border-ink py-3 placeholder:text-mute/70 outline-hidden focus:border-b-[3px]";

const ContactForm = () => {
  const hasAttemptedSubmit = useRef(false);
  const [form, setForm] = useState<ContactFormFields>({
    name: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    hasAttemptedSubmit.current = true;

    if (FIELDS.some((field) => !field.isValid(form[field.name]))) {
      // Re-render so the errors for the fields that failed become visible
      setForm({ ...form });
      return;
    }

    window.location.href = buildContactMailto(form);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-7">
      {FIELDS.map((field) => {
        const showError =
          hasAttemptedSubmit.current && !field.isValid(form[field.name]);
        const shared = {
          id: field.name,
          name: field.name,
          value: form[field.name],
          placeholder: field.placeholder,
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
              <span id={`${field.name}-error`} className="mt-2 text-[14px] font-medium">
                {field.error}
              </span>
            )}
          </label>
        );
      })}

      <div className="flex flex-wrap items-center gap-5">
        <button type="submit" className="button button-solid">
          Send message
        </button>
        <span className="font-mono text-[12px] text-mute">
          Opens your email app with this message filled in.
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
        <h2 className="text-[72px] sm:text-[104px]">
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
