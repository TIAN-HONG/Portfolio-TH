import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";

type Project = {
  title: string;
  year: string;
  type: string;
  summary: string;
  colors: string[];
};

const projects: Project[] = [
  {
    title: "Portfolio System",
    year: "2026",
    type: "Web Experience",
    summary: "A personal site shaped around motion, clarity, and fast publishing.",
    colors: ["#21ffc0", "#f5f1e7", "#0a0a0a"],
  },
  {
    title: "Interactive Dashboard",
    year: "2026",
    type: "Interface Study",
    summary: "A focused interface concept for scanning status, work, and next steps.",
    colors: ["#ff6b4a", "#f8d24c", "#111827"],
  },
  {
    title: "Workflow Builder",
    year: "2025",
    type: "Product Prototype",
    summary: "A lightweight tool concept for translating fuzzy tasks into momentum.",
    colors: ["#79a7ff", "#ffffff", "#171717"],
  },
  {
    title: "Visual Lab",
    year: "2025",
    type: "Motion Sketches",
    summary: "Experiments with responsive motion, cursor feedback, and spatial rhythm.",
    colors: ["#c9ff5f", "#a78bfa", "#0f172a"],
  },
];

const navItems = ["work", "about", "contact"];

function useSound() {
  const contextRef = useRef<AudioContext | null>(null);
  const enabledRef = useRef(false);

  const ensureContext = () => {
    if (!contextRef.current) {
      contextRef.current = new AudioContext();
    }
    return contextRef.current;
  };

  const setEnabled = (enabled: boolean) => {
    enabledRef.current = enabled;
    if (enabled) {
      ensureContext().resume();
    }
  };

  const play = (kind: "hover" | "click" | "enter" | "switch") => {
    if (!enabledRef.current) return;
    const context = ensureContext();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    const settings = {
      hover: [420, 0.035, 0.025],
      click: [180, 0.08, 0.045],
      enter: [260, 0.22, 0.035],
      switch: [620, 0.06, 0.03],
    }[kind];

    oscillator.type = kind === "enter" ? "sine" : "triangle";
    oscillator.frequency.setValueAtTime(settings[0], now);
    oscillator.frequency.exponentialRampToValueAtTime(settings[0] * 1.35, now + settings[1]);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(settings[2], now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + settings[1]);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(now);
    oscillator.stop(now + settings[1] + 0.02);
  };

  return { setEnabled, play };
}

export default function PortfolioExperience() {
  const [entered, setEntered] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sound = useSound();

  const projectLabel = useMemo(() => activeProject?.title ?? "Hover a project", [activeProject]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const lenis = new Lenis({
      duration: 1.05,
      smoothWheel: true,
      wheelMultiplier: 0.85,
    });

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      ScrollTrigger.killAll();
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        ".motion-word",
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power4.out",
          stagger: 0.035,
          delay: entered ? 0.1 : 0.5,
        },
      );

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((item) => {
        gsap.fromTo(
          item,
          { y: 48, opacity: 0, scale: 0.98 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: item,
              start: "top 86%",
              once: true,
            },
          },
        );
      });
    }, root);

    return () => context.revert();
  }, [entered]);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;
    let targetX = window.innerWidth * 0.5;
    let targetY = window.innerHeight * 0.5;
    let currentX = targetX;
    let currentY = targetY;
    let frame = 0;

    const move = (event: MouseEvent) => {
      targetX = event.clientX;
      targetY = event.clientY;
    };

    const tick = () => {
      currentX += (targetX - currentX) * 0.14;
      currentY += (targetY - currentY) * 0.14;
      cursor.style.transform = `translate3d(${currentX}px, ${currentY}px, 0) translate(-28%, -74%)`;
      frame = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", move, { passive: true });
    tick();

    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dots = Array.from({ length: 42 }, (_, index) => ({
      angle: index * 0.58,
      radius: 80 + (index % 7) * 28,
      speed: 0.002 + (index % 5) * 0.0007,
      size: 2 + (index % 4),
    }));
    let frame = 0;

    const resize = () => {
      const ratio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const draw = (time: number) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = "rgba(10, 10, 10, 0.92)";
      ctx.fillRect(0, 0, width, height);

      const centerX = width * 0.5;
      const centerY = height * 0.48;
      dots.forEach((dot, index) => {
        const angle = dot.angle + time * dot.speed;
        const x = centerX + Math.cos(angle) * dot.radius * (1 + Math.sin(time * 0.0004) * 0.16);
        const y = centerY + Math.sin(angle * 1.24) * dot.radius * 0.72;
        ctx.beginPath();
        ctx.fillStyle = index % 3 === 0 ? "#21ffc0" : index % 3 === 1 ? "#fafafa" : "#ff6b4a";
        ctx.globalAlpha = 0.18 + (index % 5) * 0.045;
        ctx.arc(x, y, dot.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.globalAlpha = 0.22;
      ctx.strokeStyle = "#fafafa";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, width * 0.34, height * 0.18, Math.sin(time * 0.0002) * 0.18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      frame = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    frame = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(frame);
    };
  }, []);

  const enterSite = (withSound: boolean) => {
    setSoundOn(withSound);
    sound.setEnabled(withSound);
    sound.play("enter");
    setEntered(true);
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    sound.setEnabled(next);
    sound.play("switch");
  };

  return (
    <div ref={rootRef} className="site-shell">
      <canvas ref={canvasRef} className="ambient-canvas" aria-hidden="true" />

      <div className={`loader ${entered ? "loader--hidden" : ""}`} aria-hidden={entered}>
        <p className="loader-kicker">Interactive portfolio</p>
        <h1>TIAN-HONG</h1>
        <p className="loader-text">frontend craft / motion details / clear digital work</p>
        <button className="pill-button pill-button--light" onClick={() => enterSite(true)}>
          enter with sound
        </button>
        <button className="text-button" onClick={() => enterSite(false)}>
          enter without sound
        </button>
      </div>

      <header className="floating-header">
        <a className="logo-button" href="#top" onMouseEnter={() => sound.play("hover")}>
          TH
          <span>home</span>
        </a>
        <button
          className={`menu-button ${menuOpen ? "is-open" : ""}`}
          onClick={() => {
            sound.play(menuOpen ? "switch" : "click");
            setMenuOpen((value) => !value);
          }}
        >
          <span>{menuOpen ? "close" : "menu"}</span>
        </button>
      </header>

      <aside className={`menu-panel ${menuOpen ? "is-open" : ""}`}>
        <nav>
          {navItems.map((item) => (
            <a
              key={item}
              href={`#${item}`}
              onClick={() => setMenuOpen(false)}
              onMouseEnter={() => sound.play("hover")}
            >
              {item}
            </a>
          ))}
        </nav>
        <div className="menu-meta">
          <a href="https://github.com/TIAN-HONG" target="_blank" rel="noreferrer">
            GitHub
          </a>
          <a href="mailto:your.email@example.com">Email</a>
        </div>
      </aside>

      <button className="sound-toggle" onClick={toggleSound} aria-label="Toggle sound">
        {soundOn ? "sound on" : "sound off"}
      </button>

      <main id="top">
        <section className="hero-section">
          <div className="hero-copy">
            <p className="section-tag">portfolio / 2026</p>
            <h2 aria-label="TIAN-HONG frontend portfolio">
              {"TIAN-HONG frontend portfolio".split(" ").map((word) => (
                <span className="word-mask" key={word}>
                  <span className="motion-word">{word}</span>
                </span>
              ))}
            </h2>
            <p data-reveal>
              I design and build responsive web experiences with strong structure, expressive motion,
              and the kind of details that make a site feel alive.
            </p>
          </div>

          <a className="showreel-card" href="#work" onMouseEnter={() => sound.play("hover")}>
            <span>selected work</span>
            <strong>scroll</strong>
          </a>
        </section>

        <section className="work-section" id="work">
          <div className="section-heading" data-reveal>
            <p className="section-tag">selected projects</p>
            <h3>Hover the titles</h3>
          </div>

          <div
            ref={cursorRef}
            className={`project-cursor ${activeProject ? "is-visible" : ""}`}
            aria-hidden="true"
          >
            <div
              className="project-cursor-card"
              style={{
                background: activeProject
                  ? `linear-gradient(135deg, ${activeProject.colors[0]}, ${activeProject.colors[1]} 52%, ${activeProject.colors[2]})`
                  : undefined,
              }}
            >
              <span>{projectLabel}</span>
            </div>
          </div>

          <div className="project-list">
            {projects.map((project) => (
              <a
                key={project.title}
                className="project-row"
                href="#contact"
                data-reveal
                onMouseEnter={() => {
                  setActiveProject(project);
                  sound.play("hover");
                }}
                onMouseLeave={() => setActiveProject(null)}
                onClick={() => sound.play("click")}
              >
                <span>{project.title}</span>
                <small>{project.type}</small>
                <em>{project.year}</em>
                <p>{project.summary}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="about-section" id="about">
          <p className="about-text" data-reveal>
            This site is the first version of my personal studio space. The direction is sharp,
            dark, kinetic, and portfolio-first: fewer generic cards, more memorable interactions.
          </p>
          <div className="skill-marquee" aria-label="Skills">
            <div>
              <span>Astro</span>
              <span>React</span>
              <span>GSAP</span>
              <span>Lenis</span>
              <span>Tailwind</span>
              <span>TypeScript</span>
            </div>
            <div aria-hidden="true">
              <span>Astro</span>
              <span>React</span>
              <span>GSAP</span>
              <span>Lenis</span>
              <span>Tailwind</span>
              <span>TypeScript</span>
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <p className="section-tag">contact</p>
          <a href="mailto:your.email@example.com">your.email@example.com</a>
          <a href="https://github.com/TIAN-HONG" target="_blank" rel="noreferrer">
            github.com/TIAN-HONG
          </a>
        </section>
      </main>
    </div>
  );
}
