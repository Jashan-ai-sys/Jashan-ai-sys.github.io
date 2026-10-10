export const CONTACT_EMAIL = "singhjashanprit86@gmail.com";

// Web3Forms delivers the form to the inbox this key was issued for. The key is a public form ID:
// it is sent from the browser and can do nothing except deliver a message there.
// If it is ever emptied, the form hands the message to the visitor's own mail app instead.
export const WEB3FORMS_KEY = "ca45ed37-2d79-4368-95e3-4e82ec364b85";
const WEB3FORMS_URL = "https://api.web3forms.com/submit";

export const MESSAGE_MAX_LENGTH = 2000;

const PREFILL_EVENT = "contact-prefill";

// Starts the contact message off with a line from elsewhere on the page (the hero's card)
export const prefillContact = (text: string) =>
  window.dispatchEvent(new CustomEvent<string>(PREFILL_EVENT, { detail: text }));

export const onContactPrefill = (handle: (text: string) => void) => {
  const listener = (e: Event) => handle((e as CustomEvent<string>).detail);
  window.addEventListener(PREFILL_EVENT, listener);
  return () => window.removeEventListener(PREFILL_EVENT, listener);
};

export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export type ContactFormFields = {
  name: string;
  email: string;
  message: string;
};

export const isValidContactName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 2 && trimmed.length <= 200;
};

export const isValidContactEmail = (email: string): boolean => {
  const trimmed = email.trim();
  return trimmed.length <= 100 && Boolean(trimmed.toLowerCase().match(EMAIL_REGEX));
};

export const isValidContactMessage = (message: string): boolean => {
  const trimmed = message.trim();
  return trimmed.length >= 5 && trimmed.length <= MESSAGE_MAX_LENGTH;
};

const contactSubject = (name: string) => `Project enquiry from ${name.trim()}`;

// Sends the message straight to the inbox. False means it did not go (no key yet, a blocked
// request, a rejected one), and the caller should fall back to the visitor's mail app.
export const sendContactMessage = async ({
  name,
  email,
  message,
}: ContactFormFields): Promise<boolean> => {
  if (!WEB3FORMS_KEY) return false;

  try {
    const response = await fetch(WEB3FORMS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_KEY,
        subject: contactSubject(name),
        name: name.trim(),
        email: email.trim(),
        message: message.trim(),
      }),
    });
    return response.ok && (await response.json()).success === true;
  } catch {
    return false;
  }
};

// The fallback: hand the message to the visitor's own mail app.
export const buildContactMailto = ({
  name,
  email,
  message,
}: ContactFormFields): string => {
  const subject = contactSubject(name);
  const body = `${message.trim()}\n\n${name.trim()}\n${email.trim()}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
