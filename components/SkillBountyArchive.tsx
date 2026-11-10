"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import type { MouseEvent as ReactMouseEvent, KeyboardEvent as ReactKeyboardEvent } from "react";

export interface SkillPosterData {
  id: string;
  name: string;
  src: string;
  bounty: string;
  code: string;
  category: string;
  epithet: string;
  classification: string;
  description: string;
  crewRole: string;
  tags: string[];
  stamp: string;
  coordinates: string;
  threatColor: string;
}

export const SKILL_POSTERS: SkillPosterData[] = [
  {
    id: "react",
    name: "React",
    src: "/posters/react.webp",
    bounty: "₿1,500,000,000",
    code: "GL-DOC // 01-RC",
    category: "SHIPWRIGHT ENGINEERING",
    epithet: "UI ARCHITECT",
    classification: "EMPEROR CLASS",
    description: "Component architecture, reactive client-side state engines, and modular design systems built for high-scale, fluid web applications.",
    crewRole: "Master Shipwright & Interface Artisan",
    tags: ["Fiber Architecture", "Custom Hooks", "State Machines", "Design Systems"],
    stamp: "VERIFIED · ALL-BLUE DECK",
    coordinates: "04° 12' N, 142° 08' E",
    threatColor: "#8b1e22",
  },
  {
    id: "typescript",
    name: "TypeScript",
    src: "/posters/typescript.webp",
    bounty: "₿1,000,000,000",
    code: "GL-DOC // 02-TS",
    category: "CIPHER POL INTELLIGENCE",
    epithet: "STRICT COMPILER",
    classification: "SUPREME CIPHER",
    description: "Strict compile-time guarantees, advanced type algebra, and resilient API contracts that eliminate runtime defects across complex codebases.",
    crewRole: "Supreme Navigator & Logic Guardian",
    tags: ["Type Algebra", "Generics", "Strict Null Checks", "AST Tooling"],
    stamp: "ZERO-FAULT // MARINE CIPHER",
    coordinates: "08° 30' S, 126° 44' E",
    threatColor: "#1d4ed8",
  },
  {
    id: "nextjs",
    name: "Next.js",
    src: "/posters/nextjs.webp",
    bounty: "₿1,200,000,000",
    code: "GL-DOC // 03-NX",
    category: "GRAND LINE NAVIGATION",
    epithet: "SPEED VESSEL",
    classification: "FLEET FLAGSHIP",
    description: "Full-stack hybrid rendering, edge-cached routing, Server Actions, and performant web architecture designed for instantaneous navigation.",
    crewRole: "Fleet Flagship & Route Master",
    tags: ["App Router", "SSR / SSG", "Edge Middleware", "Server Actions"],
    stamp: "LOG POSE CALIBRATED",
    coordinates: "12° 45' S, 089° 15' W",
    threatColor: "#8b1e22",
  },
  {
    id: "python",
    name: "Python",
    src: "/posters/python.webp",
    bounty: "₿900,000,000",
    code: "GL-DOC // 04-PY",
    category: "DEVIL FRUIT RESEARCH",
    epithet: "DATA MYSTIC",
    classification: "ANCIENT SECRET",
    description: "Computer vision analysis, machine learning workflows, and automated intelligence pipelines transforming raw visual signals into actionable insight.",
    crewRole: "Chief Alchemist & Research Officer",
    tags: ["Computer Vision", "FastAPI", "Data Modeling", "Automation"],
    stamp: "AWAKENED POWER // CLASS S",
    coordinates: "22° 18' N, 034° 50' W",
    threatColor: "#ca8a04",
  },
  {
    id: "supabase",
    name: "Supabase",
    src: "/posters/supabase.webp",
    bounty: "₿800,000,000",
    code: "GL-DOC // 05-SB",
    category: "OCEAN VAULT ARCHIVE",
    epithet: "DATA HARBOR",
    classification: "OCEAN FORTRESS",
    description: "Postgres database modeling, row-level security boundaries, real-time sync websockets, and durable cloud data infrastructure.",
    crewRole: "Vault Quartermaster & Harbor Keeper",
    tags: ["PostgreSQL", "Row-Level Sec", "Realtime WebSockets", "Auth & Storage"],
    stamp: "IMPERVIOUS VAULT",
    coordinates: "17° 02' S, 161° 22' E",
    threatColor: "#059669",
  },
  {
    id: "flutter",
    name: "Flutter",
    src: "/posters/flutter.webp",
    bounty: "₿750,000,000",
    code: "GL-DOC // 06-FL",
    category: "CREW EQUIPMENT RIGGING",
    epithet: "CANVAS SHAPER",
    classification: "ISLAND RUNNER",
    description: "Single-codebase mobile applications, 60fps custom painter rendering, reactive state management, and fluid platform-native interactions.",
    crewRole: "Expedition Scout & Island Runner",
    tags: ["Dart", "Custom Canvas", "Hardware Shaders", "Mobile Ergonomics"],
    stamp: "SEAWORTHY CANVAS",
    coordinates: "02° 55' N, 076° 40' E",
    threatColor: "#0284c7",
  },
];

export default function SkillBountyArchive() {
  const [activeIdx, setActiveIdx] = useState(0);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [transitionKey, setTransitionKey] = useState(0);

  const posterStageRef = useRef<HTMLDivElement | null>(null);
  const chamberRef = useRef<HTMLDivElement | null>(null);
  const touchStartXRef = useRef<number | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const rafIdRef = useRef<number | null>(null);
  const mapRafIdRef = useRef<number | null>(null);

  const activePoster = SKILL_POSTERS[activeIdx];
  const totalBounties = "₿6,150,000,000";

  // Change active poster with directional flip animation
  const goToPoster = useCallback((newIdx: number, dir?: "next" | "prev") => {
    const total = SKILL_POSTERS.length;
    const normalized = (newIdx + total) % total;
    if (dir) {
      setFlipDirection(dir);
    } else {
      setFlipDirection(normalized >= activeIdx ? "next" : "prev");
    }
    setActiveIdx(normalized);
    setTransitionKey((k) => k + 1);
  }, [activeIdx]);

  const handleNext = useCallback(() => {
    goToPoster(activeIdx + 1, "next");
  }, [activeIdx, goToPoster]);

  const handlePrev = useCallback(() => {
    goToPoster(activeIdx - 1, "prev");
  }, [activeIdx, goToPoster]);

  // Pointer move on poster stage for 3D physics tilt and gloss reflection
  const handlePointerMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!posterStageRef.current) return;
    const rect = posterStageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    mousePosRef.current = { x, y };

    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        rafIdRef.current = null;
        if (!posterStageRef.current) return;
        const { x: curX, y: curY } = mousePosRef.current;
        const tiltX = (0.5 - curY) * 18;
        const tiltY = (curX - 0.5) * 20;
        const shadowX = (0.5 - curX) * 32;
        const shadowY = (0.5 - curY) * 36 + 30;

        posterStageRef.current.style.setProperty("--tilt-x", `${tiltX.toFixed(2)}deg`);
        posterStageRef.current.style.setProperty("--tilt-y", `${tiltY.toFixed(2)}deg`);
        posterStageRef.current.style.setProperty("--glint-x", `${(curX * 100).toFixed(1)}%`);
        posterStageRef.current.style.setProperty("--glint-y", `${(curY * 100).toFixed(1)}%`);
        posterStageRef.current.style.setProperty("--shadow-x", `${shadowX.toFixed(1)}px`);
        posterStageRef.current.style.setProperty("--shadow-y", `${shadowY.toFixed(1)}px`);
      });
    }
  };

  // Subtle parallax on the background map when cursor moves inside the chamber
  const handleChamberMouseMove = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (!chamberRef.current) return;
    if (mapRafIdRef.current !== null) return;
    mapRafIdRef.current = requestAnimationFrame(() => {
      mapRafIdRef.current = null;
      if (!chamberRef.current) return;
      const rect = chamberRef.current.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      chamberRef.current.style.setProperty("--map-shift-x", `${(nx * -12).toFixed(1)}px`);
      chamberRef.current.style.setProperty("--map-shift-y", `${(ny * -8).toFixed(1)}px`);
    });
  };

  const handlePointerEnter = () => {
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    if (!posterStageRef.current) return;
    posterStageRef.current.style.setProperty("--tilt-x", "0deg");
    posterStageRef.current.style.setProperty("--tilt-y", "0deg");
    posterStageRef.current.style.setProperty("--glint-x", "50%");
    posterStageRef.current.style.setProperty("--glint-y", "35%");
    posterStageRef.current.style.setProperty("--shadow-x", "0px");
    posterStageRef.current.style.setProperty("--shadow-y", "30px");
  };

  // Keyboard navigation
  const handleKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      handleNext();
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      handlePrev();
    }
  };

  // Touch drag navigation
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartXRef.current = e.touches[0].clientX;
    setIsDragging(true);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartXRef.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartXRef.current;
    if (Math.abs(diff) > 40) {
      if (diff < 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartXRef.current = null;
    setIsDragging(false);
  };

  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (mapRafIdRef.current !== null) {
        cancelAnimationFrame(mapRafIdRef.current);
      }
    };
  }, []);

  return (
    <div
      className="bounty-archive-chamber"
      ref={chamberRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseMove={handleChamberMouseMove}
      role="region"
      aria-label="One Piece Grand Line Skill Bounty Archive"
    >
      {/* ── BACKGROUND: GRAND LINE NAUTICAL CHART & COMPASS ── */}
      <div className="bounty-map-backdrop" aria-hidden="true">
        {/* Ornate Nautical Chart SVG */}
        <svg
          className="bounty-map-svg"
          viewBox="0 0 1440 900"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="mapGlow" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#d4af37" stopOpacity="0.09" />
              <stop offset="45%" stopColor="#8b1e22" stopOpacity="0.04" />
              <stop offset="100%" stopColor="#f2f0eb" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="compassGold" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#e9bf57" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#8b1e22" stopOpacity="0.05" />
            </radialGradient>
            <radialGradient id="compassGoldenGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f7d26d" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#e9bf57" stopOpacity="0.08" />
              <stop offset="100%" stopColor="transparent" stopOpacity="0" />
            </radialGradient>
            {/* Marine Seal Pattern */}
            <pattern id="nauticalGrid" width="120" height="120" patternUnits="userSpaceOnUse">
              <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#8b1e22" strokeWidth="0.4" strokeOpacity="0.07" />
              <circle cx="60" cy="60" r="1" fill="#8b1e22" fillOpacity="0.15" />
            </pattern>
          </defs>

          {/* Grid base */}
          <rect width="100%" height="100%" fill="url(#mapGlow)" />
          <rect width="100%" height="100%" fill="url(#nauticalGrid)" />

          {/* Grand Line Latitude & Longitude Curved Lines */}
          <g className="map-meridians" stroke="#8b1e22" strokeWidth="0.6" strokeOpacity="0.12">
            <path d="M -100 240 Q 720 180 1540 240" strokeDasharray="6 4" />
            <path d="M -100 450 Q 720 400 1540 450" />
            <path d="M -100 660 Q 720 620 1540 660" strokeDasharray="6 4" />
            <path d="M 280 -50 Q 340 450 280 950" strokeDasharray="4 6" />
            <path d="M 720 -50 Q 720 450 720 950" />
            <path d="M 1160 -50 Q 1100 450 1160 950" strokeDasharray="4 6" />
          </g>

          {/* Ocean Current Contour Waves */}
          <g className="map-currents" stroke="#cba44c" strokeWidth="0.75" strokeOpacity="0.16" fill="none">
            <path d="M 120 780 C 320 740, 480 820, 680 770 C 880 720, 1080 800, 1320 760" strokeDasharray="12 8" />
            <path d="M 160 810 C 360 770, 520 850, 720 800 C 920 750, 1120 830, 1360 790" strokeDasharray="8 6" />
            <path d="M 80 180 C 260 140, 420 210, 600 165 C 780 120, 960 195, 1200 155" strokeDasharray="14 10" />
          </g>

          {/* Grand Line Nautical Route Dashes */}
          <path
            className="grand-line-voyage"
            d="M 140 520 Q 360 380 580 440 T 1020 410 T 1380 340"
            fill="none"
            stroke="#8b1e22"
            strokeWidth="1.2"
            strokeDasharray="4 8"
            strokeOpacity="0.25"
          />

          {/* Island Waypoints along the Grand Line */}
          <g className="map-waypoints" fill="#8b1e22" fillOpacity="0.35">
            <circle cx="140" cy="520" r="4" />
            <circle cx="360" cy="420" r="3" />
            <circle cx="580" cy="440" r="4.5" />
            <circle cx="820" cy="380" r="3.5" />
            <circle cx="1020" cy="410" r="4" />
            <circle cx="1380" cy="340" r="5" />
          </g>

          {/* Island Waypoint Labels */}
          <g className="map-labels" fill="#3d231e" fillOpacity="0.32" fontSize="9" fontFamily="var(--mono)" letterSpacing="0.15em">
            <text x="148" y="515">REVERSE MOUNTAIN</text>
            <text x="368" y="415">LOGUETOWN</text>
            <text x="588" y="435">WATER 7</text>
            <text x="828" y="375">SABAODY</text>
            <text x="1028" y="405">EGGHEAD</text>
            <text x="1310" y="332">LAUGH TALE ✦</text>
          </g>

          {/* Center Ornate Compass Rose */}
          <g className="bounty-compass-rose" transform="translate(720, 420)">
            {/* Golden Glow Circle */}
            <circle r="240" fill="url(#compassGoldenGlow)" className="compass-golden-aura" />
            {/* Outer Degrees Ring */}
            <circle r="220" fill="none" stroke="#8b1e22" strokeWidth="0.8" strokeOpacity="0.12" />
            <circle r="208" fill="none" stroke="#cba44c" strokeWidth="1" strokeOpacity="0.18" strokeDasharray="2 6" />
            <circle r="185" fill="none" stroke="#8b1e22" strokeWidth="0.5" strokeOpacity="0.1" />
            <circle r="90" fill="url(#compassGold)" stroke="#8b1e22" strokeWidth="0.6" strokeOpacity="0.15" />

            {/* Compass Star Points */}
            {/* North Point */}
            <polygon points="0,-185 10,-90 0,-70 -10,-90" fill="#8b1e22" fillOpacity="0.32" />
            <polygon points="0,-185 0,-70 -10,-90" fill="#8b1e22" fillOpacity="0.18" />
            {/* South Point */}
            <polygon points="0,185 10,90 0,70 -10,90" fill="#cba44c" fillOpacity="0.28" />
            <polygon points="0,185 0,70 -10,90" fill="#cba44c" fillOpacity="0.16" />
            {/* East Point */}
            <polygon points="185,0 90,10 70,0 90,-10" fill="#8b1e22" fillOpacity="0.25" />
            {/* West Point */}
            <polygon points="-185,0 -90,10 -70,0 -90,-10" fill="#cba44c" fillOpacity="0.25" />

            {/* Diagonal Secondary Points */}
            <polygon points="120,-120 70,-50 50,-50 50,-70" fill="#8b1e22" fillOpacity="0.15" />
            <polygon points="-120,-120 -70,-50 -50,-50 -50,-70" fill="#cba44c" fillOpacity="0.15" />
            <polygon points="120,120 70,50 50,50 50,70" fill="#cba44c" fillOpacity="0.15" />
            <polygon points="-120,120 -70,50 -50,50 -50,70" fill="#8b1e22" fillOpacity="0.15" />

            {/* Animated Compass Needle */}
            <g className="compass-needle-animated">
              <line x1="0" y1="-80" x2="0" y2="80" stroke="#8b1e22" strokeWidth="1.5" strokeOpacity="0.35" />
              <polygon points="0,-85 4,-60 -4,-60" fill="#b52d32" fillOpacity="0.7" />
              <polygon points="0,85 4,60 -4,60" fill="#cba44c" fillOpacity="0.5" />
              <circle r="5" fill="#231210" />
              <circle r="3" fill="#cba44c" fillOpacity="0.8" />
            </g>

            {/* Cardinal Letters */}
            <text x="0" y="-195" textAnchor="middle" fill="#8b1e22" fillOpacity="0.45" fontSize="13" fontFamily="var(--mono)" fontWeight="700">N</text>
            <text x="200" y="5" textAnchor="middle" fill="#8b1e22" fillOpacity="0.45" fontSize="13" fontFamily="var(--mono)" fontWeight="700">E</text>
            <text x="0" y="210" textAnchor="middle" fill="#8b1e22" fillOpacity="0.45" fontSize="13" fontFamily="var(--mono)" fontWeight="700">S</text>
            <text x="-202" y="5" textAnchor="middle" fill="#8b1e22" fillOpacity="0.45" fontSize="13" fontFamily="var(--mono)" fontWeight="700">W</text>
          </g>

          {/* Decorative Corner Marine Watermark Seal */}
          <g className="marine-watermark-seal" transform="translate(1320, 780)">
            <circle r="65" fill="none" stroke="#8b1e22" strokeWidth="1" strokeOpacity="0.14" strokeDasharray="3 3" />
            <circle r="56" fill="none" stroke="#8b1e22" strokeWidth="0.5" strokeOpacity="0.12" />
            <text x="0" y="-38" textAnchor="middle" fill="#8b1e22" fillOpacity="0.22" fontSize="7" fontFamily="var(--mono)" letterSpacing="0.2em">★ MARINE HQ ★</text>
            <text x="0" y="3" textAnchor="middle" fill="#8b1e22" fillOpacity="0.2" fontSize="15" fontFamily="Georgia,serif" fontWeight="700">NAVY</text>
            <text x="0" y="22" textAnchor="middle" fill="#8b1e22" fillOpacity="0.2" fontSize="6.5" fontFamily="var(--mono)" letterSpacing="0.18em">SECTION 03 ARCHIVE</text>
            <text x="0" y="44" textAnchor="middle" fill="#8b1e22" fillOpacity="0.22" fontSize="7" fontFamily="var(--mono)">CLASSIFIED</text>
          </g>
        </svg>

        {/* Ambient floating golden particles */}
        <div className="bounty-ambient-particles" aria-hidden="true">
          <span className="gold-particle p1" />
          <span className="gold-particle p2" />
          <span className="gold-particle p3" />
          <span className="gold-particle p4" />
          <span className="gold-particle p5" />
          <span className="gold-particle p6" />
        </div>
      </div>

      {/* ── ARCHIVE CONTROL TOPBAR ── */}
      <header className="bounty-archive-topbar">
        <div className="topbar-left">
          <span className="archive-live-signal">
            <span className="signal-ruby-beacon" />
            GRAND LINE BOUNTY ARCHIVE
          </span>
          <span className="topbar-divider">/</span>
          <span className="archive-sector-code">SECTOR 07 · {activePoster.coordinates}</span>
        </div>

        <div className="topbar-center">
          <span className="marine-file-badge">
            <span className="jolly-roger-mini">☠</span>
            STRAW HAT NAKAMA ROSTER
          </span>
        </div>

        <div className="topbar-right">
          <span className="bounty-tally-label">TOTAL FLEET VALUE</span>
          <span className="bounty-tally-number">{totalBounties}</span>
        </div>
      </header>

      {/* ── MAIN STAGE: CINEMATIC DUAL-PRESENCE LAYOUT ── */}
      <div className="bounty-stage-viewport">
        {/* Navigation Dial: PREVIOUS */}
        <button
          className="bounty-nav-dial dial-prev"
          type="button"
          onClick={handlePrev}
          aria-label="View previous skill bounty poster"
          title="Previous bounty poster (Left Arrow)"
        >
          <div className="dial-compass-housing">
            <svg className="dial-compass-svg" viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="22" cy="22" r="20" fill="none" stroke="#cba44c" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
              <circle cx="22" cy="22" r="16" fill="rgba(247,238,220,0.92)" stroke="#8b1e22" strokeWidth="1.2" />
              <g className="dial-needle needle-left">
                <polygon points="22,8 25,22 19,22" fill="#8b1e22" />
                <polygon points="22,36 25,22 19,22" fill="#cba44c" opacity="0.8" />
                <circle cx="22" cy="22" r="2.5" fill="#231210" />
              </g>
            </svg>
            <span className="dial-arrow-glyph">‹</span>
          </div>
          <span className="dial-sub-label">PREV FILE</span>
        </button>

        {/* ── CENTER: 3D WANTED POSTER OBJECT ── */}
        <div
          className="bounty-poster-container"
          ref={posterStageRef}
          onMouseMove={handlePointerMove}
          onMouseEnter={handlePointerEnter}
          onMouseLeave={handlePointerLeave}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Stacked physical papers underneath for realistic depth */}
          <div className="poster-stack-underlayer underlayer-3" aria-hidden="true" />
          <div className="poster-stack-underlayer underlayer-2" aria-hidden="true" />
          <div className="poster-stack-underlayer underlayer-1" aria-hidden="true" />

          {/* Active 3D Wanted Poster Card */}
          <div
            className={`bounty-poster-card flip-${flipDirection} ${isHovered ? "is-hovered" : ""} ${isDragging ? "is-dragging" : ""}`}
            key={activePoster.id}
          >
            {/* Glossy Specular Light Reflection Layer */}
            <div className="poster-gloss-sheen" aria-hidden="true" />

            {/* Vintage Aged Paper Texture & Border Matting */}
            <div className="poster-paper-frame">
              {/* Gold Corner Ornaments */}
              <span className="gold-corner-ornament corner-tl" aria-hidden="true" />
              <span className="gold-corner-ornament corner-tr" aria-hidden="true" />
              <span className="gold-corner-ornament corner-bl" aria-hidden="true" />
              <span className="gold-corner-ornament corner-br" aria-hidden="true" />

              {/* Corner Brass Rivets */}
              <span className="paper-rivet rivet-tl" aria-hidden="true" />
              <span className="paper-rivet rivet-tr" aria-hidden="true" />
              <span className="paper-rivet rivet-bl" aria-hidden="true" />
              <span className="paper-rivet rivet-br" aria-hidden="true" />

              {/* The Actual High-Quality Wanted Poster Artwork */}
              <div className="poster-artwork-mat">
                <img
                  className="bounty-poster-image"
                  src={activePoster.src}
                  alt={`${activePoster.name} Wanted Bounty Poster displaying berry reward of ${activePoster.bounty}`}
                  draggable={false}
                />
              </div>

              {/* Physical Embossed Marine Wax / Ink Stamp */}
              <div className="poster-marine-seal" aria-hidden="true">
                <div className="seal-outer-rim">
                  <span className="seal-text-arch">MARINE HQ · ARCHIVE</span>
                  <span className="seal-skull">☠</span>
                  <span className="seal-verified">WANTED</span>
                </div>
              </div>

              {/* Gold Foil Corner Seal */}
              <div className="poster-foil-tag" aria-hidden="true">
                <span>{activePoster.code}</span>
              </div>
            </div>

            {/* Bottom Paper Shadow Reflection on Deck */}
            <div className="poster-deck-reflection" aria-hidden="true" />
          </div>
        </div>

        {/* Navigation Dial: NEXT */}
        <button
          className="bounty-nav-dial dial-next"
          type="button"
          onClick={handleNext}
          aria-label="View next skill bounty poster"
          title="Next bounty poster (Right Arrow)"
        >
          <div className="dial-compass-housing">
            <svg className="dial-compass-svg" viewBox="0 0 44 44" aria-hidden="true">
              <circle cx="22" cy="22" r="20" fill="none" stroke="#cba44c" strokeWidth="1" strokeDasharray="2 3" opacity="0.6" />
              <circle cx="22" cy="22" r="16" fill="rgba(247,238,220,0.92)" stroke="#8b1e22" strokeWidth="1.2" />
              <g className="dial-needle needle-right">
                <polygon points="22,8 25,22 19,22" fill="#8b1e22" />
                <polygon points="22,36 25,22 19,22" fill="#cba44c" opacity="0.8" />
                <circle cx="22" cy="22" r="2.5" fill="#231210" />
              </g>
            </svg>
            <span className="dial-arrow-glyph">›</span>
          </div>
          <span className="dial-sub-label">NEXT FILE</span>
        </button>

        {/* ── RIGHT / ADJACENT: MARINE INTELLIGENCE DOSSIER ── */}
        <aside className="bounty-dossier-plate" key={`dossier-${activePoster.id}-${transitionKey}`} aria-labelledby="dossier-title">
          {/* Dossier Header Classification */}
          <div className="dossier-header">
            <div className="dossier-cipher-bar">
              <span className="dossier-badge-threat" style={{ borderColor: activePoster.threatColor, color: activePoster.threatColor }}>
                {activePoster.classification}
              </span>
              <span className="dossier-archive-ref">{activePoster.code}</span>
            </div>
            <div className="dossier-category-pill">{activePoster.category}</div>
          </div>

          {/* Title & Marine Epithet */}
          <div className="dossier-identity">
            <div className="dossier-epithet-tag">
              <span className="crosshair-anchor">⚓</span>
              <span>« {activePoster.epithet} »</span>
            </div>
            <h3 id="dossier-title" className="dossier-title">
              {activePoster.name}
            </h3>
            <p className="dossier-role-lede">{activePoster.crewRole}</p>
          </div>

          {/* Berry Bounty Banner */}
          <div className="dossier-bounty-plaque">
            <div className="bounty-plaque-label">
              <span>DEAD OR ALIVE // REWARD</span>
              <span className="bounty-plaque-currency">BERRY DENOMINATION</span>
            </div>
            <div className="bounty-plaque-value">
              <span className="berry-symbol">₿</span>
              <span className="bounty-digits">{activePoster.bounty.replace("₿", "")}</span>
              <span className="berry-stamp-icon">☠</span>
            </div>
            {/* Animated gold shimmer overlay */}
            <div className="bounty-plaque-shimmer" aria-hidden="true" />
          </div>

          {/* Tactical Description */}
          <div className="dossier-intel-body">
            <div className="intel-field-label">TACTICAL INTELLIGENCE / CAPABILITY RECORD</div>
            <p className="dossier-description">{activePoster.description}</p>
          </div>

          {/* Technical Specialization Tags */}
          <div className="dossier-tags-section">
            <div className="intel-field-label">SPECIALIZED DEVIL FRUIT / SHIPWRIGHT POWERS</div>
            <div className="dossier-tags-cluster">
              {activePoster.tags.map((tag) => (
                <span key={tag} className="dossier-chip">
                  <i className="chip-spark">✦</i>
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Animated verification seal */}
          <div className="dossier-verification-seal" aria-hidden="true">
            <span className="verification-ring" />
            <span className="verification-check">✓</span>
            <span className="verification-text">VERIFIED</span>
          </div>

          {/* Footer Marine Stamp & Coordinates */}
          <footer className="dossier-footer">
            <div className="dossier-stamp-seal">
              <span className="stamp-box-red">{activePoster.stamp}</span>
            </div>
            <div className="dossier-meta-footer">
              <span className="dossier-coordinates">COORDS: {activePoster.coordinates}</span>
              <span className="dossier-auth">AUTH: FLEET ADMIRAL LOG</span>
            </div>
          </footer>
        </aside>
      </div>

      {/* Light sweep effect */}
      <div className="archive-light-sweep" aria-hidden="true" />

      {/* ── BOTTOM: INTERACTIVE GRAND LINE ROUTE & LOG POSE PROGRESS ── */}
      <nav className="bounty-route-nav" aria-label="Grand Line Archive Route Navigation">
        <div className="route-meta-topline">
          <div className="route-current-status">
            <span className="route-marker-label">LOG POSE ROUTE POSITION</span>
            <span className="route-fraction">
              FILE <b>0{activeIdx + 1}</b> OF <b>0{SKILL_POSTERS.length}</b>
            </span>
          </div>

          <div className="route-hint-instruction">
            <span>FLIP POSTERS WITH ‹ › ARROW KEYS OR CLICK A LOG POSE ISLAND</span>
          </div>
        </div>

        {/* Interactive Voyage Track Line with 6 Waypoints */}
        <div className="route-track-line" role="tablist">
          <div
            className="route-progress-fill"
            style={{ width: `${(activeIdx / (SKILL_POSTERS.length - 1)) * 100}%` }}
          />

          {SKILL_POSTERS.map((poster, idx) => {
            const isActive = idx === activeIdx;
            const isPassed = idx < activeIdx;

            return (
              <button
                key={poster.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Jump to ${poster.name} Wanted Bounty file`}
                className={`route-waypoint ${isActive ? "is-active" : ""} ${isPassed ? "is-passed" : ""}`}
                onClick={() => goToPoster(idx)}
              >
                <div className="waypoint-pin">
                  <span className="waypoint-ring" />
                  <span className="waypoint-core">{String(idx + 1).padStart(2, "0")}</span>
                  {isActive && <span className="waypoint-pulse" />}
                </div>

                <div className="waypoint-popover">
                  <span className="waypoint-name">{poster.name}</span>
                  <span className="waypoint-bounty">{poster.bounty}</span>
                </div>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
