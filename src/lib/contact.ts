export const CONTACT_EMAIL = "singhjashanprit86@gmail.com";

export const EMAIL_REGEX =
  /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export type ContactFormFields = {
  name: string;
  email: string;
  message: string;
};

export const isValidContactName = (name: string): boolean => {
  const trimmed = name.trim();
  return trimmed.length >= 3 && trimmed.length <= 200;
};

export const isValidContactEmail = (email: string): boolean => {
  const trimmed = email.trim();
  return trimmed.length <= 100 && Boolean(trimmed.toLowerCase().match(EMAIL_REGEX));
};

export const isValidContactMessage = (message: string): boolean => {
  const trimmed = message.trim();
  return trimmed.length >= 5 && trimmed.length <= 500;
};

// The site is static, so the form hands the message to the visitor's own mail app.
export const buildContactMailto = ({
  name,
  email,
  message,
}: ContactFormFields): string => {
  const subject = `Project enquiry from ${name.trim()}`;
  const body = `${message.trim()}\n\n${name.trim()}\n${email.trim()}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
