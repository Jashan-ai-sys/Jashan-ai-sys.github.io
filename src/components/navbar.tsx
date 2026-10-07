import { NAV_LINKS } from "../constants";

// Navbar
export const Navbar = () => (
  <nav className="fixed top-0 inset-x-0 z-20 bg-paper/85 backdrop-blur-sm border-b border-line">
    <div className="max-w-7xl mx-auto px-6 sm:px-12 h-14 flex items-center justify-between">
      <a href="#" className="font-hand font-bold text-[30px] leading-none">
        Jashanprit.
      </a>

      <ul className="flex gap-5 sm:gap-9 font-mono text-[13px] sm:text-[14px]">
        {NAV_LINKS.map((link) => (
          <li key={link.id} className={link.id === "contact" ? "" : "hidden sm:block"}>
            <a
              href={`#${link.id}`}
              className="text-mute hover:text-teal transition-colors duration-200"
            >
              {link.title}
            </a>
          </li>
        ))}
      </ul>
    </div>
  </nav>
);
