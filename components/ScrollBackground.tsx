"use client";

import { useEffect, useRef, useState } from "react";

const TOTAL_FRAMES = 300;

function getFrameSrc(index: number): string {
  const frameNum = String(index + 1).padStart(3, "0");
  return `/frames/ezgif-frame-${frameNum}.jpg`;
}

export default function ScrollBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Animation and frame tracking refs
  const currentFrameRef = useRef<number>(0);
  const targetFrameRef = useRef<number>(0);
  const lastRenderedIndexRef = useRef<number>(-1);
  const rafIdRef = useRef<number | null>(null);

  // Mouse parallax refs
  const mouseTargetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const mouseCurrentRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  // Images cache
  const imagesRef = useRef<(HTMLImageElement | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const [firstFrameLoaded, setFirstFrameLoaded] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    let isMounted = true;

    // 1. Resize handling for high-DPI crisp rendering
    const handleResize = () => {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      // Force redraw
      lastRenderedIndexRef.current = -1;
      renderCurrentFrame();
    };

    // 2. Helper to find closest available loaded frame to prevent any blank flickering
    const getBestAvailableFrame = (index: number): HTMLImageElement | null => {
      const clamped = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.round(index)));
      const direct = imagesRef.current[clamped];
      if (direct && direct.complete && direct.naturalWidth > 0) {
        return direct;
      }

      // Search outwardly for nearest loaded neighbor
      for (let offset = 1; offset < TOTAL_FRAMES; offset++) {
        const prev = clamped - offset;
        if (prev >= 0) {
          const img = imagesRef.current[prev];
          if (img && img.complete && img.naturalWidth > 0) return img;
        }
        const next = clamped + offset;
        if (next < TOTAL_FRAMES) {
          const img = imagesRef.current[next];
          if (img && img.complete && img.naturalWidth > 0) return img;
        }
      }
      return null;
    };

    // 3. Render frame to canvas with aspect cover math
    const renderCurrentFrame = () => {
      if (!canvas || !ctx) return;
      const img = getBestAvailableFrame(currentFrameRef.current);
      if (!img) return;

      const cw = canvas.width;
      const ch = canvas.height;
      const nw = img.naturalWidth || 1920;
      const nh = img.naturalHeight || 1080;

      // Cover calculation
      const scale = Math.max(cw / nw, ch / nh);
      const dw = nw * scale;
      const dh = nh * scale;
      const dx = (cw - dw) * 0.5;
      const dy = (ch - dh) * 0.5;

      ctx.drawImage(img, dx, dy, dw, dh);
      lastRenderedIndexRef.current = Math.round(currentFrameRef.current);
    };

    // 4. Preload strategy:
    // A: Load frame 0 immediately so background appears with zero delay
    const firstImg = new Image();
    firstImg.src = getFrameSrc(0);
    imagesRef.current[0] = firstImg;
    firstImg.onload = () => {
      if (!isMounted) return;
      setFirstFrameLoaded(true);
      handleResize();
    };

    // B: Progressively preload remaining frames
    // Priority: Next 30 frames, then sampled keyframes, then full collection
    const preloadSequentially = () => {
      // 1. Initial 30 frames for immediate smooth scrolling at top
      for (let i = 1; i < Math.min(30, TOTAL_FRAMES); i++) {
        const img = new Image();
        img.src = getFrameSrc(i);
        imagesRef.current[i] = img;
      }

      // 2. Keyframes every 6 frames across full page
      for (let i = 30; i < TOTAL_FRAMES; i += 6) {
        if (!imagesRef.current[i]) {
          const img = new Image();
          img.src = getFrameSrc(i);
          imagesRef.current[i] = img;
        }
      }

      // 3. Complete remaining frames in batches via requestIdleCallback / setTimeout
      const loadBatch = (startIndex: number, batchSize: number) => {
        if (!isMounted || startIndex >= TOTAL_FRAMES) return;
        const end = Math.min(startIndex + batchSize, TOTAL_FRAMES);
        for (let i = startIndex; i < end; i++) {
          if (!imagesRef.current[i]) {
            const img = new Image();
            img.src = getFrameSrc(i);
            imagesRef.current[i] = img;
          }
        }
        if (end < TOTAL_FRAMES) {
          setTimeout(() => loadBatch(end, batchSize), 35);
        }
      };

      setTimeout(() => loadBatch(1, 20), 100);
    };

    preloadSequentially();

    // 5. Scroll listener calculating exact target frame (0 to TOTAL_FRAMES - 1)
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset || 0;
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, scrollY / docHeight));
      targetFrameRef.current = progress * (TOTAL_FRAMES - 1);
    };

    // 6. Pointer move listener for interactive 3D parallax tilt & ambient glow
    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
      const ny = (e.clientY / window.innerHeight - 0.5) * 2; // -1 to 1
      mouseTargetRef.current = { x: nx, y: ny };
    };

    // 7. Core RAF loop for fluid lerp physics & continuous high-FPS smoothness
    let lastTime = performance.now();
    const updateLoop = (now: number) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Smooth scroll interpolation (momentum damping)
      const frameDiff = targetFrameRef.current - currentFrameRef.current;
      const frameStep = frameDiff * Math.min(1, 10.5 * dt); // ~0.09 lerp factor
      currentFrameRef.current += frameStep;

      // Mouse parallax smooth interpolation
      const mxDiff = mouseTargetRef.current.x - mouseCurrentRef.current.x;
      const myDiff = mouseTargetRef.current.y - mouseCurrentRef.current.y;
      mouseCurrentRef.current.x += mxDiff * Math.min(1, 6.0 * dt);
      mouseCurrentRef.current.y += myDiff * Math.min(1, 6.0 * dt);

      // Check if redraw is required
      const targetInt = Math.round(currentFrameRef.current);
      if (targetInt !== lastRenderedIndexRef.current) {
        renderCurrentFrame();
      }

      // Apply subtle parallax translation only — NO 3D perspective/rotate/scale
      // (those transforms cause the GPU to bilinear-resample the entire canvas texture,
      // making everything look blurry/soft)
      if (containerRef.current) {
        const shiftX = mouseCurrentRef.current.x * 6; // px — gentle parallax
        const shiftY = mouseCurrentRef.current.y * 6; // px
        const velocity = Math.min(1, Math.abs(frameDiff) * 0.05);

        // Pure translate3d — stays on the GPU pixel grid, no resampling
        containerRef.current.style.transform = `translate3d(${shiftX.toFixed(1)}px, ${shiftY.toFixed(1)}px, 0)`;

        // Ambient glow coordinates
        const glowX = ((mouseCurrentRef.current.x + 1) * 50).toFixed(1);
        const glowY = ((mouseCurrentRef.current.y + 1) * 50).toFixed(1);
        containerRef.current.style.setProperty("--glow-x", `${glowX}%`);
        containerRef.current.style.setProperty("--glow-y", `${glowY}%`);
        containerRef.current.style.setProperty("--glow-boost", `${0.45 + velocity * 0.55}`);
      }

      rafIdRef.current = requestAnimationFrame(updateLoop);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("resize", handleResize);

    // Initial setup
    handleResize();
    handleScroll();
    rafIdRef.current = requestAnimationFrame(updateLoop);

    return () => {
      isMounted = false;
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("resize", handleResize);
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`scroll-bg-container ${firstFrameLoaded ? "is-ready" : "is-loading"}`}
      aria-hidden="true"
    >
      <img
        src="/frames/ezgif-frame-001.jpg"
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
