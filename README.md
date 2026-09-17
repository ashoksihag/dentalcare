# Dental Health — Quality Healthcare

A single-page dental clinic landing page built with **React + Vite + TypeScript + Tailwind CSS**. No external UI libraries, no icon libraries — everything lives in one `App.tsx` file.

The page opens with a counting splash screen, then presents three full-screen sections (hero, smile gallery, implant dentistry) under a fixed glass navbar, all animated with staggered scroll reveals.

## Tech Stack

| Tool | Version | Notes |
|---|---|---|
| React | 18.3 | Functional components + hooks only |
| Vite | 5.4 | Dev server & production bundler |
| TypeScript | 5.6 | Strict mode |
| Tailwind CSS | 3.4 | Default theme, no plugins/extensions |
| Font | — | "Open Sauce One" via onlinewebfonts.com stylesheet links in `index.html` |

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install & Run

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server (http://localhost:5173)
npm run dev

# 3. Production build (type-checks with tsc, then bundles to /dist)
npm run build

# 4. Preview the production build locally
npm run preview
```

## Project Structure

```
dentalcare/
├── index.html              # Title + Open Sauce One font links + #root
├── package.json
├── postcss.config.js       # tailwindcss + autoprefixer
├── tailwind.config.js      # Default theme; content: index.html + src/**
├── tsconfig.json / tsconfig.node.json
├── vite.config.ts          # @vitejs/plugin-react
└── src/
    ├── main.tsx            # React root (StrictMode)
    ├── index.css           # Tailwind directives + base layer (font, height)
    ├── vite-env.d.ts
    └── App.tsx             # The entire page (all components & hooks)
```

## What's Inside `App.tsx`

### Data constants

- `featureBars` — the three hero feature bar labels
- `services` — 4 service cards (name, optional number badge, active flag)
- `HERO_IMAGE`, `SECTION2_IMAGE`, `SECTION3_IMG1`, `SECTION3_IMG2`, `SECTION3_BG` — shared image URLs

### Core technique: "Masked Cards" (Sections 1 & 2)

A single large background image is shared across multiple cards. Each card renders a different "window" into the same image, producing a cohesive mosaic:

- `useMaskPositions(sectionRef, cardsRef, count)` — a `ResizeObserver` (plus window resize) measures each card's offset relative to the section and returns `{ x, y, sw, sh }` per card
- `useImageWidth(src)` — preloads the image and returns its natural width; the card computes the on-screen width as `naturalWidth × (sectionHeight / naturalHeight)`
- `MaskedCard` — computes `overflow = max(imageWidth - sw, 0)` and `focalOffset = overflow × focalX`, then applies `background-size: auto {sh}px` / `background-position: -{x + focalOffset}px -{y}px`
- `focalX` values: 0.7 (mobile) / 0.8 (desktop) for the hero; 0.65 / 0.8 for the gallery
- `useIsMobile()` — `matchMedia('(max-width: 767px)')` listener driving the focal points

### Animations

- `useStaggeredReveal(count, threshold = 0.15)` — one-shot `IntersectionObserver` per section; `getAnimStyle(index)` fades/translates elements in with a 0.6s `cubic-bezier(0.16, 1, 0.3, 1)` transition and 120ms per-index stagger
- Section 1 & 2 cards, and all Section 3 cards, are wrapped with it

### Components

| Component | Purpose |
|---|---|
| `SplashScreen` | 0→100 counter (20ms interval, 2000ms total) at the bottom-left; after 100: 200ms pause → 700ms opacity fade → removed after 900ms |
| `Navbar` | Fixed `bg-white/80 backdrop-blur-md` bar; stacked "Dental / Health" logo + tagline; desktop Menu pill; animated 3-bar hamburger; slide-in mobile panel with staggered links, backdrop tap-to-close, and body scroll-lock |
| `HeroSection` | 3 feature bars + main hero card ("Dental Care" headline) from one shared image |
| `SmileGallerySection` | 2-column grid with a row-spanning card, "Smile makeover" headline, and 4 glass service sub-cards |
| `ImplantDentistrySection` | Solid-card column (`bg-stone-50` / `bg-zinc-200`) + plain `<img>` cards + two bottom overlay cards (white and glass) with rotating-arrow icons |

## Responsive Behavior

- Single breakpoint: **768px (`md:`)** — stacked single-column layouts on mobile, grids on desktop
- Headings use `clamp()` for fluid sizing (e.g. `clamp(3rem, 11vw, 11rem)` for "Dental Care")
- Cards use `rounded-xl md:rounded-2xl` with `overflow-hidden` throughout

## Design Rules

- Strict black/white palette with translucent whites (`bg-white/20`, `bg-white/90`, `backdrop-blur-md`/`xl`)
- CTA buttons scale on hover (`hover:scale-105 transition-transform`)
- Sections are separated only by 6–8px padding for a virtually seamless look

## Customization

- **Images / copy / services**: edit the constants at the top of `src/App.tsx`
- **Focal points**: adjust the `focalX` ternaries in `HeroSection` / `SmileGallerySection`
- **Reveal timing**: tune the threshold argument or the 120ms/600ms values in `useStaggeredReveal`
- **Splash speed**: change the `20` ms interval (steps × interval = total duration) in `SplashScreen`

## Notes

- The page intentionally has no routing, forms, or external state — it's a pure presentation landing page
- Nav links and CTA buttons are non-functional placeholders (visual only)

## Hosting on GitHub Pages

The repo deploys automatically via GitHub Actions (`.github/workflows/deploy.yml`).

**Live URL:** https://ashoksihag.github.io/dentalcare/

### One-time setup (required)

1. Open the repo on GitHub: https://github.com/ashoksihag/dentalcare
2. Go to **Settings → Pages** (under "Code and automation")
3. Under **Build and deployment → Source**, select **GitHub Actions**
4. Re-run the workflow if needed: **Actions → "Deploy to GitHub Pages" → Run workflow**

### How it works

- Every push to `main` triggers the workflow: install (`npm ci`) → build (`npm run build`) → publish `dist/` to Pages
- The site URL is `https://<user>.github.io/<repo>/`, so Vite must prefix asset URLs with `/dentalcare/`. This is handled automatically in `vite.config.ts`:
  - On GitHub Actions, `GITHUB_REPOSITORY` is always set, so `base` becomes `/<repo>/` (or `/` for `<user>.github.io` user-site repos)
  - Locally, no env var is present, so `base` is `/` — normal dev/preview behavior
- Requires the repo to be **public** (GitHub Pages is free only for public repos on free accounts)

## Troubleshooting

**`The token '&&' is not a valid statement separator in this version`**
Windows PowerShell 5.1 doesn't support `&&` (that's PowerShell 7+/cmd/bash syntax). Run the commands separately or join them with `;`:
```powershell
cd d:\Webpages\dentalcare; npm run build; npm run preview
```

**`Missing script: "build"` / `npm error code ENOENT` / `Could not read package.json`**
You're in the wrong directory. `npm` must run inside `d:\Webpages\dentalcare` — the workspace root (`d:\Webpages`) and sibling projects (`mainframe`, `oral-care-dental-clinic`) have no build script. Always `cd` first:
```powershell
cd d:\Webpages\dentalcare
npm run build
```

**`npm run preview` starts but the browser can't reach the page**
Preview serves the *production bundle* on **http://localhost:4173** — not `:5173` (that port belongs to `npm run dev`). Open exactly:
```
http://localhost:4173
```
Also remember `preview` serves the last `dist/` output — run `npm run build` first if you changed code.

**`esbuild ... has install scripts not yet covered by allowScripts` / esbuild binary errors**
This environment's npm blocks postinstall scripts by default. Approve and rebuild once:
```powershell
npm approve-scripts esbuild
npm rebuild esbuild
```

