"use client";

import { useEffect, useRef, useState } from "react";

// Exact 60 frames sorted numerically, handling the gaps at frame_057 and frame_060 safely
const FRAME_FILES: readonly string[] = [
  "frame_001.webp",
  "frame_002.webp",
  "frame_003.webp",
  "frame_004.webp",
  "frame_005.webp",
  "frame_006.webp",
  "frame_007.webp",
  "frame_008.webp",
  "frame_009.webp",
  "frame_010.webp",
  "frame_011.webp",
  "frame_012.webp",
  "frame_013.webp",
  "frame_014.webp",
  "frame_015.webp",
  "frame_016.webp",
  "frame_017.webp",
  "frame_018.webp",
  "frame_019.webp",
  "frame_020.webp",
  "frame_021.webp",
  "frame_022.webp",
  "frame_023.webp",
  "frame_024.webp",
  "frame_025.webp",
  "frame_026.webp",
  "frame_027.webp",
  "frame_028.webp",
  "frame_029.webp",
  "frame_030.webp",
  "frame_031.webp",
  "frame_032.webp",
  "frame_033.webp",
  "frame_034.webp",
  "frame_035.webp",
  "frame_036.webp",
  "frame_037.webp",
  "frame_038.webp",
  "frame_039.webp",
  "frame_040.webp",
  "frame_041.webp",
  "frame_042.webp",
  "frame_043.webp",
  "frame_044.webp",
  "frame_045.webp",
  "frame_046.webp",
  "frame_047.webp",
  "frame_048.webp",
  "frame_049.webp",
  "frame_050.webp",
  "frame_051.webp",
  "frame_052.webp",
  "frame_053.webp",
  "frame_054.webp",
  "frame_055.webp",
  "frame_056.webp",
  "frame_058.webp",
  "frame_059.webp",
  "frame_061.webp",
  "frame_062.webp",
];

const TOTAL_FRAMES = FRAME_FILES.length; // 60
const INITIAL_PRELOAD_COUNT = 12;
const MAX_CONCURRENT_LOADS = 8;

function getFrameSrc(index: number): string {
  const safeIndex = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(index)));
  return `/frames/${FRAME_FILES[safeIndex]}`;
}

export default function ScrollBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const currentFrameRef = useRef(0);
  const targetFrameRef = useRef(0);
  const lastRenderedIndexRef = useRef(-1);
  const rafIdRef = useRef<number | null>(null);
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const mouseCurrentRef = useRef({ x: 0, y: 0 });
  // Persistent image cache: once loaded, frames stay cached in memory
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const loadingSetRef = useRef<Set<number>>(new Set());
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let isMounted = true;
    let lastTime = performance.now();
    let idlePreloadTimer: ReturnType<typeof setTimeout> | null = null;

    const configureSmoothing = () => {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
    };

    configureSmoothing();

    // Find the closest loaded frame to avoid blank canvas or flickering
    const getBestAvailableFrame = (index: number): HTMLImageElement | null => {
      const clamped = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(index)));
      const direct = imagesRef.current[clamped];
      if (direct?.complete && direct.naturalWidth > 0) return direct;

      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = clamped - offset;
        if (prev >= 0) {
          const img = imagesRef.current[prev];
          if (img?.complete && img.naturalWidth > 0) return img;
        }
        const next = clamped + offset;
        if (next < TOTAL_FRAMES) {
          const img = imagesRef.current[next];
          if (img?.complete && img.naturalWidth > 0) return img;
        }
      }
      return null;
    };

    const renderCurrentFrame = () => {
      const image = getBestAvailableFrame(currentFrameRef.current);
      if (!image) return;

      const cw = canvas.width;
      const ch = canvas.height;
      if (cw === 0 || ch === 0) return;

      const nw = image.naturalWidth || 1920;
      const nh = image.naturalHeight || 1080;

      // Cover calculation with modest 1.5% margin for crisp mouse parallax
      const baseScale = Math.max(cw / nw, ch / nh);
      const scale = baseScale * 1.015;
      const dw = Math.round(nw * scale);
      const dh = Math.round(nh * scale);

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const maxShiftX = Math.max(0, (dw - cw) * 0.5);
      const maxShiftY = Math.max(0, (dh - ch) * 0.5);
      const rawShiftX = mouseCurrentRef.current.x * 6 * dpr;
      const rawShiftY = mouseCurrentRef.current.y * 6 * dpr;
      const shiftX = Math.round(Math.max(-maxShiftX, Math.min(maxShiftX, rawShiftX)));
      const shiftY = Math.round(Math.max(-maxShiftY, Math.min(maxShiftY, rawShiftY)));

      const dx = Math.round((cw - dw) * 0.5) + shiftX;
      const dy = Math.round((ch - dh) * 0.5) + shiftY;

      configureSmoothing();
      ctx.drawImage(image, dx, dy, dw, dh);
      lastRenderedIndexRef.current = Math.round(currentFrameRef.current);
    };

    // Forward declaration of pumpQueue
    let pumpQueue = () => {};

    // Load a single frame if not already cached or loading
    const loadFrame = (index: number, onLoaded?: () => void) => {
      if (index < 0 || index >= TOTAL_FRAMES) return;
      if (imagesRef.current[index]?.complete && imagesRef.current[index]?.naturalWidth! > 0) {
        onLoaded?.();
        return;
      }
      if (loadingSetRef.current.has(index)) return;

      loadingSetRef.current.add(index);
      const img = new Image();
      img.decoding = "async";

      const markReady = () => {
        loadingSetRef.current.delete(index);
        if (!isMounted) return;
        imagesRef.current[index] = img;
        if (index === 0) setFirstFrameLoaded(true);

        // If close to the target view, render immediately without waiting for next scroll
        if (Math.abs(targetFrameRef.current - index) <= 1.5) {
          renderCurrentFrame();
        }
        onLoaded?.();
        pumpQueue();
      };

      img.onload = () => {
        if ("decode" in img) {
          img.decode().then(markReady).catch(markReady);
        } else {
          markReady();
        }
      };

      img.onerror = () => {
        loadingSetRef.current.delete(index);
        imagesRef.current[index] = null;
        pumpQueue();
      };

      img.src = getFrameSrc(index);
    };

    // Queue loader that bounds network concurrency and prioritizes frames near current scroll
    pumpQueue = () => {
      if (!isMounted) return;
      while (loadingSetRef.current.size < MAX_CONCURRENT_LOADS) {
        let nextIndex = -1;
        const center = Math.round(targetFrameRef.current);

        // Search outward from current scroll target
        for (let offset = 0; offset < TOTAL_FRAMES; offset++) {
          const ahead = center + offset;
          if (ahead < TOTAL_FRAMES && !imagesRef.current[ahead] && !loadingSetRef.current.has(ahead)) {
            nextIndex = ahead;
            break;
          }
          const behind = center - offset;
          if (behind >= 0 && !imagesRef.current[behind] && !loadingSetRef.current.has(behind)) {
            nextIndex = behind;
            break;
          }
        }

        if (nextIndex === -1) break;
        loadFrame(nextIndex);
      }
    };

    // Prioritize frames around current scrub target
    const prioritizeFramesAround = (centerIndex: number) => {
      const center = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(centerIndex)));
      const start = Math.max(0, center - 2);
      const end = Math.min(TOTAL_FRAMES - 1, center + 4);

      for (let i = start; i <= end; i++) {
        loadFrame(i);
      }
    };

    const resizeCanvasToDisplaySize = (): boolean => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const targetWidth = Math.max(1, Math.round(rect.width * dpr));
      const targetHeight = Math.max(1, Math.round(rect.height * dpr));

      if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
        canvas.width = targetWidth;
        canvas.height = targetHeight;
        configureSmoothing();
        return true;
      }
      return false;
    };

    const handleResize = () => {
      if (resizeCanvasToDisplaySize()) {
        lastRenderedIndexRef.current = -1;
        renderCurrentFrame();
      }
    };

    // Finish the animation BEFORE the "Curiosity, set sail" (#lab) section appears:
    // the last frame is reached when the section's top edge is still ~10% of a
    // screen below the bottom of the viewport, so it is fully done (with a little
    // room for the smoothing to catch up) before the section scrolls into view.
    const getAnimationEndY = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const lab = document.getElementById("lab");

      if (lab) {
        const labTop = lab.getBoundingClientRect().top + window.scrollY;
        return Math.max(1, Math.min(maxScroll, labTop - window.innerHeight * 1.1));
      }

      return Math.max(1, maxScroll * 0.48);
    };

    const updateLoop = (now: number) => {
      rafIdRef.current = null;
      if (!isMounted) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth lerp physics for scroll scrubbing
      const frameDiff = targetFrameRef.current - currentFrameRef.current;
      currentFrameRef.current += frameDiff * Math.min(1, 14 * dt);
      if (Math.abs(targetFrameRef.current - currentFrameRef.current) < 0.02) {
        currentFrameRef.current = targetFrameRef.current;
      }

      // Parallax smooth interpolation
      const mxDiff = mouseTargetRef.current.x - mouseCurrentRef.current.x;
      const myDiff = mouseTargetRef.current.y - mouseCurrentRef.current.y;
      mouseCurrentRef.current.x += mxDiff * Math.min(1, 6 * dt);
      mouseCurrentRef.current.y += myDiff * Math.min(1, 6 * dt);

      const targetInt = Math.round(currentFrameRef.current);
      if (
        targetInt !== lastRenderedIndexRef.current ||
        Math.abs(mxDiff) > 0.005 ||
        Math.abs(myDiff) > 0.005
      ) {
        renderCurrentFrame();
      }

      container.style.setProperty("--glow-x", `${((mouseCurrentRef.current.x + 1) * 50).toFixed(1)}%`);
      container.style.setProperty("--glow-y", `${((mouseCurrentRef.current.y + 1) * 50).toFixed(1)}%`);
      const velocity = Math.min(1, Math.abs(frameDiff) * 0.05);
      container.style.setProperty("--glow-boost", `${0.45 + velocity * 0.35}`);

      const stillMoving =
        Math.abs(targetFrameRef.current - currentFrameRef.current) > 0.02 ||
        Math.abs(mouseTargetRef.current.x - mouseCurrentRef.current.x) > 0.005 ||
        Math.abs(mouseTargetRef.current.y - mouseCurrentRef.current.y) > 0.005;

      if (stillMoving) {
        rafIdRef.current = requestAnimationFrame(updateLoop);
      }
    };

    const scheduleLoop = () => {
      if (rafIdRef.current === null) {
        lastTime = performance.now();
        rafIdRef.current = requestAnimationFrame(updateLoop);
      }
    };

    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const endY = getAnimationEndY();
      const progress = Math.min(1, Math.max(0, scrollY / endY));
      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);

      prioritizeFramesAround(targetFrameRef.current);
      scheduleLoop();
    };

    const handlePointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      mouseTargetRef.current = {
        x: (event.clientX / window.innerWidth - 0.5) * 2,
        y: (event.clientY / window.innerHeight - 0.5) * 2,
      };
      scheduleLoop();
    };

    // Preload initial frames immediately, plus final frame to ensure bounds are ready
    for (let i = 0; i < INITIAL_PRELOAD_COUNT; i++) {
      loadFrame(i);
    }
    loadFrame(TOTAL_FRAMES - 1);

    // Start background progressive preload during idle time
    idlePreloadTimer = setTimeout(() => pumpQueue(), 150);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize);

    resizeCanvasToDisplaySize();
    renderCurrentFrame();
    handleScroll();

    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current !== null) cancelAnimationFrame(rafIdRef.current);
      if (idlePreloadTimer) clearTimeout(idlePreloadTimer);
      imagesRef.current.forEach((image) => {
        if (image) {
          image.onload = null;
          image.onerror = null;
        }
      });
      imagesRef.current = [];
      loadingSetRef.current.clear();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`scroll-bg-container ${firstFrameLoaded ? "is-ready" : "is-loading"}`}
      aria-hidden="true"
    >
      <img
        src="/frames/frame_001.webp"
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
      <canvas ref={canvasRef} className="scroll-bg-canvas" />
      <div className="scroll-bg-vignette" />
      <div className="scroll-bg-golden-aura" />
    </div>
  );
}
