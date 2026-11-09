# Ahmad Bhanvadiya — Portfolio

A scroll-driven, One Piece-themed developer portfolio built with **Next.js**, **React Three Fiber** and **GSAP**, deployed on **Cloudflare Workers**.

**Live:** https://new-portfolio.ahmadbhanvadiya.workers.dev/

---

## Highlights

- **Scroll-scrubbed background** — 101 pre-rendered frames play as you scroll and finish before the "Curiosity, set sail" section. Frames are WebP, only a small window is decoded at a time, and in-between positions are cross-blended for smooth motion.
- **Floating navbar** — glass bar with a scroll-spy highlight, a compass logo that rotates with scroll, a scroll-progress line, hide-on-scroll-down, and a mobile menu.
- **3D Jolly Roger** — an interactive skull sculpture (React Three Fiber) that follows the cursor and "recomposes" into different crew looks.
- **Kinetic lane** — a draggable marquee that speeds up and skews with your scroll speed, slows on hover, and floods each phrase with its own colour.
- **Skill poster carousel** and **project carousel** — swipe, drag, arrow keys and indicator controls.
- **Pirate ship finale** — in the contact section a ship bobs on animated waves and sets sail when you click it (or copy the email address).
- **Sound dock** and a small scroll-driven runner character.
- Responsive, keyboard-accessible, and respects `prefers-reduced-motion`.

## Tech stack

| Area | Tools |
| --- | --- |
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| 3D / motion | three.js, @react-three/fiber, @react-three/drei, GSAP |
| Styling | Hand-written CSS (`app/globals.css`) + Tailwind CSS 4 |
| Icons | lucide-react |
| Hosting | Cloudflare Workers via [`@opennextjs/cloudflare`](https://opennext.js.org/cloudflare) |

## Getting started

Requirements: **Node.js 20+** and npm.

```bash
git clone https://github.com/ahmadbhanvadiya-dot/New-Port.git
cd New-Port
npm install
npm run dev
```

Open http://localhost:3000.

> The 3D scene loads its lighting environment from a CDN, so it needs an internet connection in development.

### Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (`next build`) |
| `npm run lint` | Run ESLint |
| `npm run preview` | Build and preview on the Cloudflare runtime locally |
| `npm run deploy` | Build and deploy to Cloudflare Workers |
| `npm run upload` | Build and upload a version without promoting it |

## Deployment (Cloudflare Workers)

The site is deployed as a Worker named `new-portfolio` (see `wrangler.jsonc`).

**Option A — Git integration (automatic):** in the Cloudflare dashboard, connect this repo to the Worker and use:

- Build command: `npx opennextjs-cloudflare build`
- Deploy command: `npx opennextjs-cloudflare deploy`

Every push to `main` then builds and deploys.

**Option B — manual:**

```bash
npx wrangler login
npm run deploy
```

Local secrets, if you need any, go in `.dev.vars` (git-ignored).

## Project structure

```
app/
  layout.tsx            Metadata, fonts, root layout
  page.tsx              All page sections (hero, work, about, lab, contact)
  globals.css           All styling
components/
  SiteNav.tsx           Floating navbar
  ScrollBackground.tsx  Scroll-scrubbed frame background
  OrbScene.tsx          3D Jolly Roger skull (React Three Fiber)
  KineticLane.tsx       Draggable, scroll-reactive marquee
  ShipScene.tsx         Pirate ship + waves in the contact section
  ScrollLuffy.tsx       Scroll-driven runner character
  SoundDock.tsx         Ambient sound toggle
public/
  frames/               101 desktop frames (1920×1080 WebP)
  frames-m/             101 mobile frames (1280×720 WebP)
  posters/              Skill poster images (WebP)
  _headers              Cloudflare cache headers
```

## How the scroll animation works

`components/ScrollBackground.tsx` maps scroll position to a frame index:

- Desktop loads `public/frames/`, phones and touch devices load the lighter `public/frames-m/`.
- All compressed frames (about 6 MB desktop, 3 MB mobile) are fetched up front. Only the ~25 frames around the current position are decoded into bitmaps, which keeps memory low.
- The animation reaches its last frame just before the `#lab` section scrolls into view. Tune this with `END_BEFORE_LAB_VH` at the top of the file (a larger number finishes earlier).

### Replacing the animation

Export your clip, then regenerate both frame sets with [ffmpeg](https://ffmpeg.org/):

```bash
# Desktop frames (1920×1080)
ffmpeg -i input.mp4 -vsync 0 -start_number 0 -c:v libwebp -quality 88 public/frames/f%03d.webp

# Mobile frames (1280×720)
ffmpeg -i input.mp4 -vsync 0 -start_number 0 -vf scale=1280:720 -c:v libwebp -quality 85 public/frames-m/f%03d.webp
```

Then set `TOTAL_FRAMES` in `components/ScrollBackground.tsx` to the number of frames you exported. For a sharper result, start from the highest-quality source you have (4K if possible).

## Customising

- **Content** (text, projects, skills): edit `app/page.tsx`.
- **Colours and layout**: edit `app/globals.css`. The main palette is cream `#f1e8d2`, ink `#17202a`, red `#b52d32`, gold `#e9bf57`.
- **Navbar links**: edit the `LINKS` array in `components/SiteNav.tsx` (each `id` must match a section `id` on the page).
- **Poster images**: add a WebP to `public/posters/` and a matching entry in `posterSkills` in `app/page.tsx`.

## Performance notes

- Static assets under `/frames`, `/frames-m` and `/_next/static` are cached for a year (`public/_headers`), so use new filenames when you change them.
- Heavy work pauses off-screen (the kinetic lane stops when not visible).

## Credits and disclaimer

Designed and built by **Ahmad Bhanvadiya**. This is a personal, non-commercial portfolio. Some visual and written references are fan-inspired; all trademarks and characters belong to their respective owners, and no affiliation is implied.
