"use client";

import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from "react";
import dynamic from "next/dynamic";
import { ArrowDownRight, ArrowUpRight, Github, Linkedin, Menu, X, MoveUpRight, Music } from "lucide-react";
import ScrollLuffy from "@/components/ScrollLuffy";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const OrbScene = dynamic(() => import("@/components/OrbScene"), {
  ssr: false,
  loading: () => <div className="scene-fallback" aria-hidden="true" />,
});

const projects = [
  {
    number: "01",
    name: "NarcoLens",
    type: "AI / COMPUTER VISION · DIGITAL FORENSICS",
    year: "2026",
    description: "An AI-powered digital companion for field-test documentation and image analysis, built to make test records more traceable.",
    stack: ["Next.js", "TypeScript", "FastAPI", "Image Analysis"],
    theme: "narco",
    mark: "N/",
    href: "https://github.com/ahmadbhanvadiya-dot/narcolens",
    live: "https://narcolens.vercel.app",
    featured: true,
  },
  {
    number: "02",
    name: "SmartCommute AI",
    type: "MOBILITY · ROUTE INTELLIGENCE",
    year: "2026",
    description: "A smarter commuting platform combining transit route planning, real-world GTFS data, map-based discovery, and logistics tools.",
    stack: ["Next.js", "TypeScript", "FastAPI", "GTFS", "Leaflet"],
    theme: "commute",
    mark: "SC",
    href: "https://github.com/ahmadbhanvadiya-dot/Smartcommute-web",
    live: "https://smartcommute-web-three.vercel.app/dashboard",
    featured: true,
  },
  {
    number: "03",
    name: "ForeSight",
    type: "AI · OPERATIONAL RISK & WORKFORCE ROUTING",
    year: "2026",
    description: "A risk-aware work routing platform designed to score delays, evaluate team capacity, and direct requests to suitable employees.",
    stack: ["Next.js", "TypeScript", "Supabase", "Framer Motion"],
    theme: "foresight",
    mark: "FS",
    href: "https://github.com/ahmadbhanvadiya-dot/ForeSight",
    live: "https://spih-133.vercel.app",
    featured: true,
  },
  {
    number: "04",
    name: "Freshlify",
    type: "MOBILE · PRODUCT TRACKING",
    year: "2026",
    description: "QR-powered product freshness and expiry tracking, with inventory tools that help make everyday product information easier to manage.",
    stack: ["Flutter", "Dart", "SQLite", "QR"],
    theme: "fresh",
    mark: "F.",
    href: "https://github.com/ahmadbhanvadiya-dot/freshlifyv3",
    live: "https://github.com/ahmadbhanvadiya-dot/Freshlify",
    featured: true,
  },
  {
    number: "05",
    name: "Code Atlas",
    type: "DEVELOPER TOOLS · WEB",
    year: "2026",
    description: "A developer-focused web project built with TypeScript, exploring ways to make code and project information easier to navigate.",
    stack: ["Next.js", "TypeScript"],
    theme: "atlas",
    mark: "CA",
    href: "https://github.com/ahmadbhanvadiya-dot/code-atlas",
    live: "https://code-atlas-delta.vercel.app",
    featured: false,
  },
  {
    number: "06",
    name: "Meridian Restro",
    type: "WEB DESIGN · HOSPITALITY",
    year: "2025",
    description: "A responsive restaurant website focused on menu discovery, digital presence, and a polished browsing experience.",
    stack: ["HTML", "CSS", "JavaScript"],
    theme: "meridian",
    mark: "MR",
    href: "https://github.com/ahmadbhanvadiya-dot/MeridianRestro",
    live: "https://themeridianrestro.netlify.app/",
    featured: false,
  },
];

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [time, setTime] = useState("--:--");
  const [copied, setCopied] = useState(false);
  const [workFilter, setWorkFilter] = useState("All work");
  const [projectIndex, setProjectIndex] = useState(0);
  const [lanePalette, setLanePalette] = useState(0);
  const [activeCrew, setActiveCrew] = useState("STRAW HAT PIRATES");
  const [chaosMode, setChaosMode] = useState(false);
  const [signalMode, setSignalMode] = useState(0);
  const [labPhase, setLabPhase] = useState(0);
  const [quipIndex, setQuipIndex] = useState(0);
  const signalLines = [
    { first: "I make", second: "the complex", third: "feel simple", accent: "complex", label: "01 / CLARITY" },
    { first: "I turn", second: "what if", third: "into what is", accent: "what if", label: "02 / POSSIBILITY" },
    { first: "I build", second: "useful things", third: "with a pulse", accent: "useful things", label: "03 / FEELING" },
  ];
  const activeSignal = signalLines[signalMode];
  const visibleProjects = projects.filter((project) => {
    if (workFilter === "All work") return true;
    if (workFilter === "AI / Systems") return ["NarcoLens", "SmartCommute AI", "ForeSight"].includes(project.name);
    if (workFilter === "Web") return ["Code Atlas", "Meridian Restro"].includes(project.name);
    return ["Freshlify"].includes(project.name);
  });
  const activeProject = visibleProjects[projectIndex % visibleProjects.length] ?? projects[0];
  const changeProject = (direction: number) => {
    setProjectIndex((index) => (index + direction + visibleProjects.length) % visibleProjects.length);
  };
  // Original generated Wanted posters are used as-is; the carousel only changes slides.
  const posterSkills = [
    { name: "React", src: "/posters/react.webp", bounty: "฿1,500,000,000" },
    { name: "TypeScript", src: "/posters/typescript.webp", bounty: "฿1,000,000,000" },
    { name: "Next.js", src: "/posters/nextjs.webp", bounty: "฿1,200,000,000" },
    { name: "Python", src: "/posters/python.webp", bounty: "฿900,000,000" },
    { name: "Supabase", src: "/posters/supabase.webp", bounty: "฿800,000,000" },
    { name: "Flutter", src: "/posters/flutter.webp", bounty: "฿750,000,000" },
  ];
  const posterTouchStart = useRef<number | null>(null);
  const projectTouchStart = useRef<number | null>(null);
  const activePoster = posterSkills[labPhase % posterSkills.length];
  const visitorQuips = [
    "Take a chill pill. I’m just a person who likes building things.",
    "No world domination plan here. Just a few tabs and a lot of curiosity.",
    "Thanks for visiting. Your attention is already a pretty big deal.",
    "Built with care, caffeine-free enthusiasm, and occasional Stack Overflow.",
    "Please enjoy the pixels. They were emotionally supported by CSS.",
    "If something breaks, it’s an interactive feature. (Kidding. Mostly.)",
  ];

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(".hero-kicker, .hero-title-line, .hero-copy, .hero-actions", {
        y: 34, opacity: 0, filter: "blur(8px)"
      }, {
        y: 0, opacity: 1, filter: "blur(0px)", duration: 1.05,
        stagger: 0.12, ease: "power3.out", delay: 0.18
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(element, { y: 44, opacity: 0 }, {
          y: 0, opacity: 1, duration: 0.85, ease: "power3.out",
          scrollTrigger: { trigger: element, start: "top 86%", once: true }
        });
      });

      gsap.utils.toArray<HTMLElement>(".project-row").forEach((row) => {
        const art = row.querySelector(".art-symbol");
        if (art) {
          gsap.fromTo(art, { scale: 0.92, rotate: -1.5 }, {
            scale: 1, rotate: 0, ease: "none",
            scrollTrigger: { trigger: row, start: "top bottom", end: "bottom top", scrub: 0.6 }
          });
        }
      });

      gsap.to(".scroll-progress span", {
        scaleX: 1, ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.25 }
      });
      gsap.utils.toArray<HTMLElement>(".section-heading, .about-statement").forEach((element) => {
        gsap.fromTo(element, { y: 24, rotateX: 2 }, {
          y: -12, rotateX: 0, ease: "none",
          scrollTrigger: { trigger: element, start: "top bottom", end: "bottom top", scrub: 0.7 }
        });
      });

      gsap.to(".marquee-track", {
        xPercent: -50, duration: 22, ease: "none", repeat: -1
      });
      gsap.to(".orbit-ring", {
        rotate: 360, duration: 32, ease: "none", repeat: -1
      });
    }, root);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", hour12: false
    }).format(new Date()));
    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText("bhanvadiyaahmad@gmail.com");
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      window.location.href = "mailto:bhanvadiyaahmad@gmail.com";
    }
  };

  const closeMenu = () => setMenuOpen(false);

  const moveSpotlight = (event: ReactPointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse") return;
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${event.clientX}px`);
    event.currentTarget.style.setProperty("--pointer-y", `${event.clientY}px`);
    event.currentTarget.style.setProperty("--pointer-local-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--pointer-local-y", `${event.clientY - rect.top}px`);
  };

  const tiltArtwork = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    event.currentTarget.style.setProperty("--tilt-x", `${(0.5 - y) * 10}deg`);
    event.currentTarget.style.setProperty("--tilt-y", `${(x - 0.5) * 12}deg`);
    event.currentTarget.style.setProperty("--shine-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--shine-y", `${y * 100}%`);
    event.currentTarget.style.setProperty("--card-x", `${x * 100}%`);
    event.currentTarget.style.setProperty("--card-y", `${y * 100}%`);
    event.currentTarget.style.setProperty("--depth-x", `${(x - 0.5) * 18}px`);
    event.currentTarget.style.setProperty("--depth-y", `${(y - 0.5) * 18}px`);
    const row = event.currentTarget.closest(".project-row") as HTMLElement | null;
    if (row) {
      row.style.setProperty("--info-shift-x", `${(x - 0.5) * -10}px`);
      row.style.setProperty("--info-shift-y", `${(y - 0.5) * -8}px`);
    }
  };

  const resetArtwork = (event: ReactMouseEvent<HTMLAnchorElement>) => {
    event.currentTarget.style.setProperty("--tilt-x", "0deg");
    event.currentTarget.style.setProperty("--tilt-y", "0deg");
    event.currentTarget.style.setProperty("--card-x", "50%");
    event.currentTarget.style.setProperty("--card-y", "50%");
    event.currentTarget.style.setProperty("--depth-x", "0px");
    event.currentTarget.style.setProperty("--depth-y", "0px");
    const row = event.currentTarget.closest(".project-row") as HTMLElement | null;
    if (row) { row.style.setProperty("--info-shift-x", "0px"); row.style.setProperty("--info-shift-y", "0px"); }
  };

  return (
    <main ref={root} className={`site-shell signal-${signalMode}`} data-signal={signalMode} onPointerMove={moveSpotlight}>
      <div className="scroll-progress" aria-hidden="true"><span /></div>
      <div className="ambient-cursor-glow" aria-hidden="true" />
      <aside className="sound-dock" aria-label="Soundtrack player">
        <iframe title="Play or pause in the pool on Spotify" src="https://open.spotify.com/embed/track/7bUyB6btwXllCHQhNBWZ2C?utm_source=generator&si=ce3b03d78e5d4d4d&theme=0" width="100%" height="80" frameBorder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" />
      </aside>
      <div className="cursor-ghost" aria-hidden="true" /><div className="cursor-word" aria-hidden="true">LOOK CLOSER <span>↗</span></div>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <header className="site-header">
        <a href="#top" className="brand" aria-label="Ahmad Bhanvadiya home">
          <span className="brand-mark">a<span>.</span></span>
          <span className="brand-name">AHMAD BHANVADIYA</span>
        </a>
        <nav className={`nav-links ${menuOpen ? "nav-open" : ""}`} aria-label="Main navigation">
          <a href="#work" onClick={closeMenu}>Work <span>06</span></a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#lab" onClick={closeMenu}>The lab</a>
          <a href="#contact" onClick={closeMenu}>Contact</a>
        </nav>
        <div className="header-right">
          <span className="availability"><i /> OPEN TO NEW ADVENTURES</span>
          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen}>
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      <section className="hero" id="top" aria-labelledby="hero-heading">
        <div className="hero-grid" aria-hidden="true" />
        <div className="hero-topline">
          <span className="hero-kicker"><span className="crosshair">✳</span> CAPTAIN OF CODE / CREATIVE ENGINEER</span>
          <span className="hero-index">LOGBOOK ENTRY&nbsp; — &nbsp;{time} IST</span>
        </div>
        <div className="hero-main" id="main-content">
          <div className="hero-heading-wrap">
            <h1 id="hero-heading" className="hero-title">
              <span className="hero-title-line">{activeSignal.first}</span>
              <span className="hero-title-line title-second">{activeSignal.second === "the complex" ? <>the <em>complex</em></> : <em>{activeSignal.second}</em>}</span>
              <span className="hero-title-line">{activeSignal.third === "feel simple" ? <>feel <span className="simple-word">simple<span className="title-period">.</span></span></> : <span className="simple-word">{activeSignal.third}<span className="title-period">.</span></span>}</span>
            </h1>
            <div className="hero-aside hero-copy">
              <span className="aside-rule" />
              <p>Ideas into interfaces.<br />Problems into products.<br /><strong>Pixels with a purpose.</strong></p>
              <span className="aside-caption">CODE × CURIOSITY × CRAFT</span>
              <button className="signal-switch" type="button" onClick={() => setSignalMode((mode) => (mode + 1) % signalLines.length)} aria-label="Change the hero statement">
                <span>{activeSignal.label}</span><b>RECOMPOSE ↗</b>
              </button>
            </div>
          </div>
          <div className="hero-visual" aria-label="Interactive Jolly Roger with a Grand Line compass">
            <div className="visual-label visual-label-top"><span>GRAND LINE / 001</span><span>JOLLY ROGER FIELD NOTES</span></div>
            <OrbScene onCrewChange={setActiveCrew} />
            <div className="visual-coordinates">LOG POSE: ACTIVE<br />CREW: {activeCrew}</div>
            <div className="visual-label visual-label-bottom"><span>THE GRAND LINE<br />CALLS</span><span className="visual-plus">↗</span></div>
          </div>
        </div>
        <div className="hero-bottom">
          <a className="scroll-cue" href="#work"><span className="scroll-icon"><ArrowDownRight size={17} /></span> SCROLL TO EXPLORE</a>
          <p>DESIGN-MINDED ENGINEERING<br />FROM HYDERABAD, INDIA.</p>
          <span className="hero-bottom-index">001 — 005</span>
        </div>
        <div className="visitor-note" aria-live="polite">
          <span className="visitor-note-label"><i /> A FRIENDLY REMINDER</span>
          <p key={quipIndex}>{visitorQuips[quipIndex]}</p>
          <button type="button" onClick={() => setQuipIndex((index) => (index + 1) % visitorQuips.length)} aria-label="Show another friendly note">ANOTHER ONE <span>↻</span></button>
        </div>
      </section>


      <section className={`ticker lane-palette-${lanePalette} ${chaosMode ? "ticker-chaos" : ""}`} aria-label="Ideas in motion">
        <div className="marquee-track">
          {[0, 1].map((set) => (
            <div className="ticker-set" key={set} aria-hidden={set === 1 ? "true" : undefined}>
              <span className="ticker-item"><small>01</small> CHASE THE DREAM <b>✳</b></span>
              <span className="ticker-item ticker-item-outline"><small>02</small> SAIL BEYOND THE MAP <b>✳</b></span>
              <span className="ticker-item"><small>03</small> STAY HUMBLE, NAKAMA <b>☻</b></span>
              <span className="ticker-item ticker-item-outline"><small>04</small> FIND YOUR ALL BLUE <b>✳</b></span>
              <span className="ticker-item ticker-item-sticker">JUST A HUMAN WITH A KEYBOARD & A DREAM <b>↗</b></span>
            </div>
          ))}
        </div>
        <div className="ticker-controls">
          <button className="ticker-palette" type="button" onClick={() => setLanePalette((palette) => (palette + 1) % 4)} aria-label="Change kinetic lane color palette" title="Change lane color">
            <span className={`palette-dots palette-${lanePalette}`}><i /><i /><i /></span><small>COLOR SHIFT</small>
          </button>
          <button className="ticker-flash" type="button" aria-label={chaosMode ? "Turn off chaos mode" : "Turn on chaos mode"} aria-pressed={chaosMode} onClick={() => setChaosMode((value) => !value)} title={chaosMode ? "Tame the chaos" : "Turn up the chaos"}>
            <span>{chaosMode ? "−" : "✳"}</span><small>{chaosMode ? "TAME IT" : "MORE CHAOS"}</small>
          </button>
        </div>
      </section>

      <section className="work-section section-pad" id="work">
        <div className="section-heading" data-reveal>
          <div><span className="eyebrow">01 / THE GRAND LINE</span><h2>The crew’s <em>logbook.</em></h2></div>
          <p>Six islands explored.<br />Useful things built along the way.</p>
        </div>

        <div className="work-filter-bar" aria-label="Filter projects">
          {["All work", "AI / Systems", "Web", "Mobile"].map((filter) => (
            <button key={filter} className={workFilter === filter ? "filter-active" : ""} onClick={() => { setWorkFilter(filter); setProjectIndex(0); }}>
              {filter}<span>{filter === "All work" ? "06" : filter === "AI / Systems" ? "03" : filter === "Web" ? "02" : "01"}</span>
            </button>
          ))}
        </div>
        <div className="project-carousel-shell" data-reveal>
          <div className="project-carousel-topline">
            <span><i className="lab-live-dot" /> ISLAND SELECTOR / INTERACTIVE LOGBOOK</span>
            <span>{String(projectIndex + 1).padStart(2, "0")} <b>/</b> {String(visibleProjects.length).padStart(2, "0")}</span>
          </div>
          <div
            className="project-carousel-viewport"
            role="region"
            aria-roledescription="carousel"
            aria-label="Featured project carousel"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") changeProject(1);
              if (event.key === "ArrowLeft") changeProject(-1);
            }}
            onPointerDown={(event) => { projectTouchStart.current = event.clientX; }}
            onPointerUp={(event) => {
              if (projectTouchStart.current === null) return;
              const delta = event.clientX - projectTouchStart.current;
              if (Math.abs(delta) > 45) changeProject(delta < 0 ? 1 : -1);
              projectTouchStart.current = null;
            }}
            onPointerCancel={() => { projectTouchStart.current = null; }}
          >
            <div className="project-ghost project-ghost-prev" aria-hidden="true">{visibleProjects[(projectIndex - 1 + visibleProjects.length) % visibleProjects.length]?.number}</div>
            <div className="project-ghost project-ghost-next" aria-hidden="true">{visibleProjects[(projectIndex + 1) % visibleProjects.length]?.number}</div>
            <button className="project-carousel-arrow project-carousel-prev" type="button" aria-label="Previous project" onClick={() => changeProject(-1)}>←</button>
            <div className="project-list project-list-carousel" key={`${workFilter}-${activeProject.name}`}>
              <article className="project-row project-row-active" key={activeProject.name}>
              <a className={`project-art art-${activeProject.theme}`} href={activeProject.href} target="_blank" rel="noreferrer" aria-label={`Open ${activeProject.name} project link`} onMouseMove={tiltArtwork} onMouseLeave={resetArtwork}>
                <div className="art-grain" />
                <div className="art-top"><span>{activeProject.number} / CASE FILE</span><span>{activeProject.year}</span></div>
                <div className={`art-symbol symbol-${activeProject.theme}`} aria-hidden="true">
                  {activeProject.theme === "narco" && <><div className="scan-ring ring-one" /><div className="scan-ring ring-two" /><div className="scan-core">N<span>/</span></div><div className="scan-cross">+</div></>}
                  {activeProject.theme === "commute" && <><div className="route-line route-a" /><div className="route-line route-b" /><div className="route-node node-a" /><div className="route-node node-b" /><div className="route-node node-c" /><div className="route-center">SC</div></>}
                  {activeProject.theme === "fresh" && <><div className="fresh-orbit orbit-a" /><div className="fresh-orbit orbit-b" /><div className="fresh-core">F.</div><span className="fresh-leaf">✳</span></>}
                  {activeProject.theme === "foresight" && <><div className="fs-grid">{Array.from({length:25}).map((_,i)=><i key={i} />)}</div><div className="fs-core">FS<span>◎</span></div><div className="fs-scan">RISK SIGNAL / 03</div></>}
                  {activeProject.theme === "atlas" && <><div className="atlas-orbit atlas-a"/><div className="atlas-orbit atlas-b"/><div className="atlas-core">{"{}"}</div><span className="atlas-node node-1">TS</span><span className="atlas-node node-2">JS</span><span className="atlas-node node-3">UI</span></>}
                  {activeProject.theme === "meridian" && <><div className="meridian-disc"/><div className="meridian-type">M<br/><span>R</span></div><span className="meridian-label">THE TABLE IS SET</span></>}
                </div>
                <span className="art-monogram">{activeProject.mark}</span>
                <span className="art-hover-label"><span>GRAND LINE DOSSIER</span><b>EXPLORE {activeProject.name.toUpperCase()} ↗</b></span>
                <div className="art-bottom"><span>MOVE YOUR CURSOR / DISCOVER THE ISLAND</span><span className="art-arrow"><ArrowUpRight size={18} /></span></div>
              </a>
              <div className="activeProject-info">
                <div className="activeProject-meta"><span>{activeProject.type}</span><span>{activeProject.number}</span></div>
                <h3>{activeProject.name}</h3>
                <p>{activeProject.description}</p>
                <div className="stack-list">{activeProject.stack.map((tech) => <span key={tech}>{tech}</span>)}</div>
                <div className="activeProject-links">
                  <a href={activeProject.href} target="_blank" rel="noreferrer" className="text-link">SOURCE CODE <MoveUpRight size={14} /></a>
                  {activeProject.live && <a href={activeProject.live} target="_blank" rel="noreferrer" className="text-link secondary-link">LIVE / DETAILS <ArrowUpRight size={13} /></a>}
                </div>
              </div>
            </article>
            </div>
            <button className="project-carousel-arrow project-carousel-next" type="button" aria-label="Next project" onClick={() => changeProject(1)}>→</button>
          </div>
          <div className="project-carousel-footer">
            <div className="project-carousel-caption"><span>NOW EXPLORING</span><strong>{activeProject.name}</strong><small>DRAG / SWIPE / ARROW KEYS TO NAVIGATE</small></div>
            <div className="project-carousel-dots" aria-label="Choose a project">
              {visibleProjects.map((project, index) => <button key={project.name} type="button" className={index === projectIndex ? "is-active" : ""} aria-label={`Show ${project.name}`} aria-current={index === projectIndex ? "true" : undefined} onClick={() => setProjectIndex(index)}><span>{project.number}</span></button>)}
            </div>
          </div>
        </div>
        <div className="work-footnote"><span>MORE TREASURES LIVE IN THE VAULT.</span><a href="https://github.com/ahmadbhanvadiya-dot" target="_blank" rel="noreferrer">VISIT THE TREASURE VAULT <ArrowUpRight size={14} /></a></div>
      </section>

      <section className="about-section" id="about">
        <div className="about-top section-pad" data-reveal>
          <span className="eyebrow">02 / THE CAPTAIN’S LOG</span>
          <span className="about-stamp">NAKAMA<br />IN PROGRESS <b>☠</b></span>
        </div>
        <div className="about-content section-pad" data-reveal>
          <h2>A good crew<br />makes the <em>journey</em><br />worth it.</h2>
          <div className="about-description">
            <p className="about-lede">Every great adventure starts with a curious mind, a rough map, and the courage to build the first thing.</p>
            <p>I’m Ahmad — a developer who likes turning ambitious ideas into useful things. I explore interfaces, systems, and the little details that make a product feel alive. Still learning, still building, and always looking for the next island worth exploring.</p>
            <a className="dark-link" href="https://portfolio-ahmadbhanvadiya.vercel.app/" target="_blank" rel="noreferrer">VISIT MY EARLIER PORTFOLIO <ArrowUpRight size={15} /></a>
          </div>
        </div>
        <div className="about-bottom section-pad">
          <span>CHART A COURSE.</span><span>BUILD WITH HEART.</span><span>KEEP SAILING.</span>
        </div>
      </section>

      <section className="lab-section section-pad" id="lab">
        <div className="section-heading lab-heading" data-reveal>
          <div><span className="eyebrow">03 / SHIPYARD LAB <i className="lab-live-dot" /> EXPERIMENT 001—026</span><h2>Curiosity, <em>set sail.</em></h2></div>
          <p>Every tool is part of the crew.<br />The magic is what you build together.</p>
        </div>
        <div className="lab-manifesto" aria-label="Lab motto"><span>THE SEA IS FULL OF WHAT-IFS.</span><b>Sometimes all you need is a little curiosity.</b><span className="manifesto-spark">✳</span></div>
        <div className="poster-carousel-wrap" data-reveal>
          <div className="poster-carousel-meta"><span><i className="lab-live-dot" /> SKILL BOUNTY ARCHIVE</span><span>{String(labPhase + 1).padStart(2, "0")} / {String(posterSkills.length).padStart(2, "0")}</span></div>
          <div
            className="poster-carousel"
            role="region"
            aria-roledescription="carousel"
            aria-label="Swipe through skill wanted posters"
            tabIndex={0}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") setLabPhase((phase) => (phase + 1) % posterSkills.length);
              if (event.key === "ArrowLeft") setLabPhase((phase) => (phase - 1 + posterSkills.length) % posterSkills.length);
            }}
            onPointerDown={(event) => { posterTouchStart.current = event.clientX; }}
            onPointerUp={(event) => {
              if (posterTouchStart.current === null) return;
              const delta = event.clientX - posterTouchStart.current;
              if (Math.abs(delta) > 45) setLabPhase((phase) => (phase + (delta < 0 ? 1 : -1) + posterSkills.length) % posterSkills.length);
              posterTouchStart.current = null;
            }}
            onPointerCancel={() => { posterTouchStart.current = null; }}
          >
            <button className="poster-arrow poster-arrow-prev" type="button" aria-label="Previous skill poster" onClick={() => setLabPhase((phase) => (phase - 1 + posterSkills.length) % posterSkills.length)}>←</button>
            <div className="poster-stage" key={activePoster.name}>
              <img className="skill-wanted-poster" src={activePoster.src} alt={`${activePoster.name} skill wanted poster with its original berry bounty design`} draggable={false} />
            </div>
            <button className="poster-arrow poster-arrow-next" type="button" aria-label="Next skill poster" onClick={() => setLabPhase((phase) => (phase + 1) % posterSkills.length)}>→</button>
          </div>
          <div className="poster-carousel-footer">
            <div><span className="poster-current-label">CURRENT BOUNTY FILE</span><h3>{activePoster.name}</h3><p>Swipe, drag, or use the arrows to browse the crew.</p></div>
            <div className="poster-carousel-controls" aria-label="Choose a skill poster">
              {posterSkills.map((poster, index) => <button key={poster.name} type="button" className={`poster-dot ${index === labPhase ? "is-active" : ""}`} aria-label={`Show ${poster.name} poster`} aria-current={index === labPhase ? "true" : undefined} onClick={() => setLabPhase(index)}><span>{String(index + 1).padStart(2, "0")}</span></button>)}
            </div>
          </div>
        </div>
      </section>


      <section className="contact-section section-pad" id="contact">
        <div className="contact-orbit orbit-ring" aria-hidden="true"><span>THE NEXT ADVENTURE STARTS HERE ✳ THE NEXT ADVENTURE STARTS HERE ✳</span></div>
        <div className="contact-content" data-reveal>
          <span className="eyebrow">04 / YOUR NEXT ADVENTURE</span>
          <h2>Ready for a<br /><em>new adventure?</em></h2>
          <p>Got a project, a curious idea, or a problem worth solving? Pull up a seat at the table. Let’s build something useful.</p>
          <button className="contact-button" onClick={copyEmail}><span>{copied ? "EMAIL COPIED" : "BHANVADIYAAHMAD@GMAIL.COM"}</span><ArrowUpRight size={21} /></button>
          <div className="social-links">
            <a href="https://github.com/ahmadbhanvadiya-dot" target="_blank" rel="noreferrer"><Github size={16} /> GITHUB <ArrowUpRight size={12} /></a>
            <a href="https://linkedin.com/in/ahmad-bhanvadia-dot" target="_blank" rel="noreferrer"><Linkedin size={16} /> LINKEDIN <ArrowUpRight size={12} /></a>
          </div>
        </div>
        <div className="contact-bottom"><span>AHMAD BHANVADIYA · CREW LOG 2026</span><span>CHARTED & BUILT BY AHMAD.</span><a href="#top">BACK TO THE SHIP ↑</a></div>
      </section>
      <ScrollLuffy />
    </main>
  );
}
