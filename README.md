# Jashanprit Singh: portfolio

Single-page portfolio site (React, Tailwind), with an animated mascot.
Started from the MIT-licensed [sanidhyy/3d-portfolio](https://github.com/sanidhyy/3d-portfolio) template; see `LICENSE.md`.

The mascot is rendered by [`@bible-strong/avatar-react`](https://github.com/smontlouis/bible-strong-avatar-lab) by Stéphane Montlouis-Calixte, licensed AGPL-3.0-only. The built site bundles it, so the site as published is covered by the AGPL and this repository is its corresponding source. The licence text is in `LICENSE-AGPL-3.0.txt`; the site's own code stays under the MIT terms in `LICENSE.md`.

## Run
```bash
npm install
npm run dev      # local preview with live reload
npm run build    # static site in dist/
```

## Edit content
- Projects, services, process steps and the skills strip: `src/constants/index.ts`
- Contact email: `CONTACT_EMAIL` in `src/lib/contact.ts`; profile links: `PROFILE_LINKS` in `src/constants/index.ts`
- Hero text: `src/components/hero.tsx`
- 3D scenes: `src/components/canvas/` (models in `public/models/`)

## Deploy
The built site is the `dist/` folder: static files that work at a domain root or in any sub-folder.

- **GitHub Pages:** push this repo to GitHub, set Settings > Pages > Source to "GitHub Actions", and `.github/workflows/deploy.yml` builds and publishes on every push to the `site` branch.
- **Any other host (Hostinger, Netlify, etc.):** run `npm run build` and upload the contents of `dist/`.
