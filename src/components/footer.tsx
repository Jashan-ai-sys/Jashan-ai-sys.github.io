import { PROFILE_LINKS } from "../constants";
import { CONTACT_EMAIL } from "../lib/contact";

// Footer
const Footer = () => (
  <footer className="border-t border-line">
    <div className="max-w-7xl mx-auto px-6 sm:px-12 py-7 flex flex-wrap justify-between gap-x-8 gap-y-3 font-mono text-[13px] text-mute">
      <p>&copy; {new Date().getFullYear()} Jashanprit Singh</p>
      <ul className="flex flex-wrap gap-x-7 gap-y-2">
        <li>
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-teal transition-colors duration-200">
            {CONTACT_EMAIL}
          </a>
        </li>
        {PROFILE_LINKS.map((link) => (
          <li key={link.title}>
            <a
              href={link.href}
              target="_blank"
              rel="noreferrer noopener"
              className="hover:text-teal transition-colors duration-200"
            >
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </footer>
);

export default Footer;
