"use client";

import { useEffect, useRef, useState } from "react";
import { prefersReducedMotion } from "@/lib/motion";

/**
 * Scroll-scrubbed background.
 *
 * - 101 WebP frames (every frame of the source video), ~6 MB total on desktop.
 * - A lighter 1280x720 set is used on phones / touch devices.
 * - Frames near the current scroll position are downloaded first. The rest of the set is
 *   fetched once the page has finished loading (and never with Data Saver on), so the
 *   frames don't compete with the page's own resources on first load.
 * - Only a small window of frames around the current scroll position is decoded into
 *   GPU-friendly bitmaps, so memory stays low and drawing is cheap.
 * - Fractional frames are cross-blended, so motion stays smooth between frames.
 * - The animation finishes BEFORE the "Curiosity, set sail" (#lab) section appears.
 */

const TOTAL_FRAMES = 101;
const DESKTOP_DIR = "/frames";
const MOBILE_DIR = "/frames-m";
const DECODE_WINDOW_DESKTOP = 8; // 2560x1440 frames are ~15 MB each once decoded, so keep fewer
const DECODE_WINDOW_MOBILE = 12; // decoded bitmaps kept on each side of the current frame
const EVICT_MARGIN = 4; // extra distance before a decoded bitmap is released
const MAX_CONCURRENT_FETCHES = 8;
const INITIAL_PRIORITY_FRAMES = 16;
const PREFETCH_AHEAD = 24; // before the page has loaded, only fetch frames this close to the scroll position
const MAX_RETRIES = 3;
const MOBILE_QUERY = "(max-width: 820px), (pointer: coarse)";
const END_BEFORE_LAB_VH = 1.2; // finish when #lab is still 0.2 screens below the fold
const LERP_SPEED = 18; // higher = snappier
const MAX_CANVAS_WIDTH = 2560;

const pad = (n: number) => String(n).padStart(3, "0");

export default function ScrollBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const useMobileSet = window.matchMedia(MOBILE_QUERY).matches;
    const dir = useMobileSet ? MOBILE_DIR : DESKTOP_DIR;
    const DECODE_WINDOW = useMobileSet ? DECODE_WINDOW_MOBILE : DECODE_WINDOW_DESKTOP;
    const frameUrl = (i: number) => `${dir}/f${pad(i)}.webp`;

    let isMounted = true;
    const abort = new AbortController();

    const blobs: (Blob | null)[] = new Array(TOTAL_FRAMES).fill(null);
    const bitmaps: (ImageBitmap | null)[] = new Array(TOTAL_FRAMES).fill(null);
    const fetching = new Set<number>();
    const decoding = new Set<number>();
    const failures = new Array<number>(TOTAL_FRAMES).fill(0);
    const gaveUp = new Set<number>();
    const saveData = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true;
    let fullPrefetch = false;

    let current = 0;
    let target = 0;
    let lastKey = "";
    let rafId: number | null = null;
    let lastTime = performance.now();
    let endY = 1;
    let firstReported = false;
    let lite = false; // auto "lite mode" on slow machines
    let slow = 0;
    const mouseTarget = { x: 0, y: 0 };
    const mouseCurrent = { x: 0, y: 0 };

    // Redraw only when the frame position or the whole-pixel parallax shift actually changes.
    const drawKey = () => {
      const dpr = canvas.width / Math.max(1, canvas.clientWidth || canvas.width);
      return `${Math.round(current * 8)}|${Math.round(mouseCurrent.x * 6 * dpr)}|${Math.round(mouseCurrent.y * 6 * dpr)}`;
    };

    const configureCtx = () => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "medium";
    };
    configureCtx();

    /* ---------- frame lookup ---------- */

    const nearestBitmap = (index: number): ImageBitmap | null => {
      const c = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(index)));
      if (bitmaps[c]) return bitmaps[c];
      for (let o = 1; o < TOTAL_FRAMES; o++) {
        if (c - o >= 0 && bitmaps[c - o]) return bitmaps[c - o];
        if (c + o < TOTAL_FRAMES && bitmaps[c + o]) return bitmaps[c + o];
      }
      return null;
    };

    /* ---------- drawing ---------- */

    const drawCover = (img: ImageBitmap) => {
      const cw = canvas.width;
      const ch = canvas.height;
      const baseScale = Math.max(cw / img.width, ch / img.height);
      const scale = baseScale * 1.02; // small margin for mouse parallax
      const dw = Math.round(img.width * scale);
      const dh = Math.round(img.height * scale);

      const dpr = cw / Math.max(1, canvas.clientWidth || cw);
      const maxShiftX = Math.max(0, (dw - cw) * 0.5);
      const maxShiftY = Math.max(0, (dh - ch) * 0.5);
      const shiftX = Math.round(Math.max(-maxShiftX, Math.min(maxShiftX, mouseCurrent.x * 6 * dpr)));
      const shiftY = Math.round(Math.max(-maxShiftY, Math.min(maxShiftY, mouseCurrent.y * 6 * dpr)));

      ctx.drawImage(
        img,
        Math.round((cw - dw) * 0.5) + shiftX,
        Math.round((ch - dh) * 0.5) + shiftY,
        dw,
        dh
      );
    };

    const render = () => {
      if (canvas.width === 0 || canvas.height === 0) return;
      const lo = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(current)));
      const hi = Math.min(TOTAL_FRAMES - 1, lo + 1);
      const t = current - lo;

      const base = nearestBitmap(lo);
      if (!base) return;
      drawCover(base);
      if (!firstReported) {
        // Any frame counts (the page may be restored mid-scroll, far from frame 0).
        firstReported = true;
        setFirstFrameLoaded(true);
      }

      // Cross-blend toward the next frame for smooth in-between motion
      const next = bitmaps[hi];
      if (!lite && Math.abs(target - current) < 2.5 && t > 0.04 && next && base === bitmaps[lo] && next !== base) {
        ctx.globalAlpha = t;
        drawCover(next);
        ctx.globalAlpha = 1;
      }
      lastKey = drawKey();
    };

    /* ---------- decoding window ---------- */

    const decodeFrame = (i: number) => {
      const blob = blobs[i];
      if (!blob || bitmaps[i] || decoding.has(i)) return;
      decoding.add(i);
      createImageBitmap(blob)
        .then((bmp) => {
          decoding.delete(i);
          const stillWanted = Math.abs(i - Math.round(target)) <= DECODE_WINDOW + EVICT_MARGIN;
          if (!isMounted || !stillWanted) {
            bmp.close();
            return;
          }
          bitmaps[i] = bmp;
          if (!firstReported || Math.abs(current - i) <= 1.5) {
            lastKey = "";
            render();
          }
        })
        .catch(() => decoding.delete(i));
    };

    const updateDecodeWindow = () => {
      const center = Math.round(target);
      const start = Math.max(0, center - DECODE_WINDOW);
      const end = Math.min(TOTAL_FRAMES - 1, center + DECODE_WINDOW);
      // decode nearest-first so the frames you need next are ready soonest
      for (let o = 0; o <= DECODE_WINDOW; o++) {
        if (center + o <= end) decodeFrame(center + o);
        if (o > 0 && center - o >= start) decodeFrame(center - o);
      }
      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (bitmaps[i] && Math.abs(i - center) > DECODE_WINDOW + EVICT_MARGIN) {
          bitmaps[i]!.close();
          bitmaps[i] = null;
        }
      }
    };

    /* ---------- downloading (compressed files are small, keep them all) ---------- */

    let pump = () => {};

    const fetchFrame = (i: number) => {
      if (i < 0 || i >= TOTAL_FRAMES || blobs[i] || fetching.has(i) || gaveUp.has(i)) return;
      fetching.add(i);
      fetch(frameUrl(i), { signal: abort.signal })
        .then((r) => (r.ok ? r.blob() : Promise.reject(new Error("bad frame"))))
        .then((blob) => {
          fetching.delete(i);
          if (!isMounted) return;
          blobs[i] = blob;
          if (Math.abs(i - Math.round(target)) <= DECODE_WINDOW) decodeFrame(i);
          pump();
        })
        .catch(() => {
          fetching.delete(i);
          if (!isMounted) return;
          // Back off, and stop retrying a frame that keeps failing (offline, missing file).
          failures[i] += 1;
          if (failures[i] > MAX_RETRIES) gaveUp.add(i);
          setTimeout(pump, 400 * 2 ** Math.min(failures[i], MAX_RETRIES));
        });
    };

    pump = () => {
      if (!isMounted) return;
      while (fetching.size < MAX_CONCURRENT_FETCHES) {
        const center = Math.round(target);
        let next = -1;
        for (let o = 0; o < TOTAL_FRAMES; o++) {
          const ahead = center + o;
          const behind = center - o;
          if (ahead < TOTAL_FRAMES && !blobs[ahead] && !fetching.has(ahead) && !gaveUp.has(ahead)) {
            next = ahead;
            break;
          }
          if (behind >= 0 && !blobs[behind] && !fetching.has(behind) && !gaveUp.has(behind)) {
            next = behind;
            break;
          }
        }
        if (next === -1) break;
        if (!fullPrefetch && Math.abs(next - center) > PREFETCH_AHEAD) break;
        fetchFrame(next);
      }
    };

    /* ---------- sizing & scroll range ---------- */

    const resizeCanvas = (): boolean => {
      const rect = container.getBoundingClientRect();
      let dpr = Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.5);
      const maxWidth = lite ? 1600 : MAX_CANVAS_WIDTH;
      if (rect.width * dpr > maxWidth) dpr = maxWidth / rect.width;
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        configureCtx();
        return true;
      }
      return false;
    };

    // Last frame is reached before the "Curiosity, set sail" (#lab) section comes into view.
    const computeEndY = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const lab = document.getElementById("lab");
      if (lab) {
        const labTop = lab.getBoundingClientRect().top + window.scrollY;
        endY = Math.max(1, Math.min(maxScroll, labTop - window.innerHeight * END_BEFORE_LAB_VH));
      } else {
        endY = Math.max(1, maxScroll * 0.48);
      }
    };

    /* ---------- animation loop ---------- */

    const loop = (now: number) => {
      rafId = null;
      if (!isMounted) return;
      const rawDt = (now - lastTime) / 1000;
      const dt = Math.min(rawDt, 0.1);
      lastTime = now;

      // If scrolling keeps running below ~30 fps, drop to a lighter rendering mode automatically.
      if (!lite && rawDt < 0.5 && Math.abs(target - current) > 0.05) {
        slow = Math.max(0, slow + (rawDt > 0.034 ? 1 : -1));
        if (slow > 45) {
          lite = true;
          document.documentElement.dataset.perf = "lite";
          if (resizeCanvas()) {
            lastKey = "";
            render();
          }
        }
      }

      const diff = target - current;
      current += diff * Math.min(1, LERP_SPEED * dt);
      if (Math.abs(target - current) < 0.01) current = target;

      const mx = mouseTarget.x - mouseCurrent.x;
      const my = mouseTarget.y - mouseCurrent.y;
      mouseCurrent.x += mx * Math.min(1, 6 * dt);
      mouseCurrent.y += my * Math.min(1, 6 * dt);

      if (drawKey() !== lastKey) {
        render();
      }

      if (
        Math.abs(target - current) > 0.01 ||
        Math.abs(mouseTarget.x - mouseCurrent.x) > 0.005 ||
        Math.abs(mouseTarget.y - mouseCurrent.y) > 0.005
      ) {
        rafId = requestAnimationFrame(loop);
      }
    };

    const schedule = () => {
      if (rafId === null) {
        lastTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    };

    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset || 0;
      target = Math.min(1, Math.max(0, y / endY)) * (TOTAL_FRAMES - 1);
      updateDecodeWindow();
      pump();
      schedule();
    };

    const reduceMotion = prefersReducedMotion();
    const onPointerMove = (e: PointerEvent) => {
      // Mouse parallax is decorative; scroll scrubbing stays (it follows the visitor's own scroll).
      if (e.pointerType !== "mouse" || reduceMotion) return;
      mouseTarget.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseTarget.y = (e.clientY / window.innerHeight - 0.5) * 2;
      schedule();
    };

    const onResize = () => {
      computeEndY();
      if (resizeCanvas()) {
        lastKey = "";
        render();
      }
      onScroll();
    };

    // Fetch the rest of the frames only after the page itself has loaded, when idle.
    let idleHandle: number | null = null;
    const enableFullPrefetch = () => {
      idleHandle = null;
      if (!isMounted || saveData) return;
      fullPrefetch = true;
      pump();
    };
    const onPageLoaded = () => {
      idleHandle =
        typeof window.requestIdleCallback === "function"
          ? window.requestIdleCallback(enableFullPrefetch, { timeout: 3000 })
          : window.setTimeout(enableFullPrefetch, 1500);
    };

    /* ---------- start ---------- */

    for (let i = 0; i < INITIAL_PRIORITY_FRAMES; i++) fetchFrame(i);
    fetchFrame(TOTAL_FRAMES - 1);
    const startTimer = setTimeout(pump, 100);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("resize", onResize);
    window.addEventListener("load", onResize);
    if (document.readyState === "complete") onPageLoaded();
    else window.addEventListener("load", onPageLoaded, { once: true });

    // Page height changes as fonts/images/sections settle; keep the end point accurate.
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        computeEndY();
        onScroll();
      });
      resizeObserver.observe(document.body);
    }

    computeEndY();
    resizeCanvas();
    onScroll();

    return () => {
      isMounted = false;
      abort.abort();
      clearTimeout(startTimer);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("load", onResize);
      window.removeEventListener("load", onPageLoaded);
      if (idleHandle !== null) {
        if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idleHandle);
        window.clearTimeout(idleHandle);
      }
      if (lite) delete document.documentElement.dataset.perf;
      resizeObserver?.disconnect();
      if (rafId !== null) cancelAnimationFrame(rafId);
      bitmaps.forEach((b) => b?.close());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`scroll-bg-container ${firstFrameLoaded ? "is-ready" : "is-loading"}`}
      aria-hidden="true"
    >
      {/* Phones and touch devices get the small first frame, matching the frame set they use. */}
      <picture>
        <source media={MOBILE_QUERY} srcSet="/frames-m/f000.webp" />
        <img
          src="/frames/f000.webp"
          alt=""
          className="scroll-bg-initial-poster"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: firstFrameLoaded ? 0 : 1,
            transition: "opacity 0.4s ease",
            pointerEvents: "none",
          }}
        />
      </picture>
      <canvas ref={canvasRef} className="scroll-bg-canvas" />
      <div className="scroll-bg-vignette" />
    </div>
  );
}
