import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin } from "vite";

import {
  HERO,
  OPEN_PROJECTS,
  PROCESS,
  PROFILE_LINKS,
  PROJECTS,
  SERVICES,
  SITE_URL,
} from "./src/constants";
import { CONTACT_EMAIL } from "./src/lib/contact";

const escapeHtml = (text: string) =>
  text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// The page is drawn by JavaScript, so search engines and link previews that do not run it would see
// an empty page. This writes the same text into index.html at build time; React replaces it on load.
const staticContent = (): Plugin => ({
  name: "static-content",
  transformIndexHtml(html) {
    const projects = [...PROJECTS, ...OPEN_PROJECTS]
      .map(
        (project) =>
          `<article><h3>${escapeHtml(project.name)}</h3><p>${escapeHtml(project.description)}</p></article>`,
      )
      .join("");
    const services = SERVICES.map(
      (service) =>
        `<h3>${escapeHtml(service.title)}</h3><ul>${service.items.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`,
    ).join("");
    const steps = PROCESS.map(
      (step) => `<li><h3>${escapeHtml(step.title)}</h3><p>${escapeHtml(step.description)}</p></li>`,
    ).join("");
    const links = PROFILE_LINKS.map(
      (link) => `<a href="${link.href}">${escapeHtml(link.title)}</a>`,
    ).join(" ");

    const content = [
      // Plain but tidy, for the moment before the script draws the real page
      `<main style="max-width:60ch;margin:0 auto;padding:5rem 1.5rem;font-family:system-ui,sans-serif;line-height:1.6">`,
      `<h1>${escapeHtml(`${HERO.headline} ${HERO.headlineAccent}`)}</h1><p>${escapeHtml(HERO.summary)}</p>`,
      `<section><h2>Selected work</h2>${projects}</section>`,
      `<section><h2>What I can build for you</h2>${services}</section>`,
      `<section><h2>How a project runs</h2><ol>${steps}</ol></section>`,
      `<section><h2>Contact</h2><p>Jashanprit Singh, AI Engineer. <a href="mailto:${CONTACT_EMAIL}">${CONTACT_EMAIL}</a> ${links}</p></section>`,
      `</main>`,
    ].join("");

    const person = {
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Jashanprit Singh",
      jobTitle: "AI Engineer",
      description: HERO.summary,
      url: SITE_URL,
      email: `mailto:${CONTACT_EMAIL}`,
      sameAs: PROFILE_LINKS.map((link) => link.href),
      knowsAbout: SERVICES.map((service) => service.title),
    };

    return html
      .replace("<!--static-content-->", content)
      .replace(
        "</head>",
        `  <script type="application/ld+json">${JSON.stringify(person)}</script>\n  </head>`,
      );
  },
});

// https://vitejs.dev/config/
export default defineConfig({
  // Relative asset paths, so the built folder works at a domain root or in any sub-folder
  base: "./",
  plugins: [tailwindcss(), react(), staticContent()],
});
