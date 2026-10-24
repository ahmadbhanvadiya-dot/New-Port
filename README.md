# Afterhours — One Piece Skill Poster Carousel (V30)

This version replaces the two-card Shipyard Lab layout with one swipeable gallery of the supplied One Piece-inspired Wanted skill posters.

## What's changed
- Removed both the animated artwork card and the toolkit chip card from the Lab section.
- Replaced them with one large, centered poster at a time, using the supplied poster artwork without redesigning the poster layout.
- Added touch swiping, mouse dragging, previous/next arrows, numbered poster controls, and keyboard arrow navigation.
- Added a subtle slide-in transition and restrained hover lift while keeping the poster art itself intact.
- Optimized the supplied images as WebP for faster loading while preserving their appearance.
- Included the six supplied poster designs: React, TypeScript, Next.js, Python, Supabase, and Flutter.

## Run locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Notes
The poster images are stored in `public/posters/`. To add another poster, place its image there and add an entry to `posterSkills` in `app/page.tsx`.


## V30.1 interaction pass
- Turned the projects section into a single featured-project carousel with drag/swipe, arrow controls, keyboard navigation, animated transitions, and project indicator controls. Existing category filters remain available.
- Added four kinetic lane color palettes with a dedicated color-shift control, independent from the chaos toggle.
- Reworked the 3D Jolly Roger recomposition button into three distinct crew looks: Straw Hat, Red Hair, and Heart Pirates.
- Added cinematic depth and slide-in motion to the skill-poster carousel, with responsive and reduced-motion handling.


## V30.2 interaction hotfix

- Restored pointer events over the hero's 3D scene and the Recompose button; the headline overlay no longer intercepts those interactions.
- The Jolly Roger now stays front-facing at rest and responds to pointer position instead of continuously spinning away from the viewer.
- Recompose updates the visible crew label as it cycles through Straw Hat, Red Hair, and Heart Pirates.
- The kinetic lane uses four explicitly distinct palette backgrounds and palette-driven glint colors.
- Reduced the dark mechanical appearance of the mouth by rendering the teeth in bone ivory with visible gaps.

If the dev server is already running, stop it and restart with `npm run dev`, then hard-refresh the browser (Ctrl+Shift+R) to clear any stale client bundle.


## Scroll-scrubbed Jolly Roger sequence

The three supplied Flow clips are included under `public/videos/jolly-rogers/`. The new `JollyRogerScroll` section pins its stage while scrolling through the sequence and seeks each muted video to match scroll progress. Scrolling upward reverses the clips. It respects `prefers-reduced-motion` and uses no audio.

Files:
- `components/JollyRogerScroll.tsx`
- `public/videos/jolly-rogers/straw-hat-assembly.mp4`
- `public/videos/jolly-rogers/red-hair-crossed-swords.mp4`
- `public/videos/jolly-rogers/heart-pirates-assembly.mp4`

Run with `npm install` and `npm run dev`. For deployment, ensure the hosting provider accepts the ~12 MB of added video assets. Video seeking depends on browser codec support and can vary by device; test on desktop and mobile.


## V30.3 adjustment — remove Flow scroll panel
- Removed the added scroll-scrubbed Google Flow emblem section and its video assets to avoid scroll lag.
- Restored the original interactive Three.js Jolly Roger hero and kept the rest of the V30.3 portfolio unchanged.


## V32 — Hero polish and scroll runner
- Keeps the original interactive Three.js Jolly Roger in the hero; no Google Flow video panel or scroll-scrubbed video assets are included.
- Red Hair Pirates now use swept crimson hair, three diagonal scars, and crossed sabres rather than the generic crossbones/hat silhouette.
- Heart Pirates retain crossed bones and use a more distinct spotted cap.
- Restored pointer events for the hero 3D scene and its crew-switch control.
- Added a small vector Luffy runner fixed beside the page edge. Its vertical position follows document scroll progress and its limbs animate while the visitor scrolls; no video or external image asset is needed.


## V33 — Horizontal scroll companion polish
- Rotated the vector Luffy into a horizontal running pose, with his feet aligned to the far-right scroll rail.
- Anchored the runner to the viewport edge and mapped its vertical position directly to document scroll progress.
- Refined the SVG silhouette, straw hat, red band, and limb animation; no external image or video is required.


## V34 — Remove stray top strip
- Removed the fixed “KEEP GOING” pill and its animation styles, which were rendering incorrectly as a wide dark strip at the top of the page.
- Kept the thin scroll-progress indicator and all portfolio sections intact.
