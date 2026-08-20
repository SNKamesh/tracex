import React, { useEffect, useMemo, useRef, useState } from "react";

interface TraceXIntroProps {
  onComplete: () => void;
}

type Point = { x: number; y: number };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInOutCubic(t: number) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}

function getPointAtPathLength(path: SVGPathElement | null, progress: number): Point | null {
  if (!path) return null;
  const length = path.getTotalLength();
  const point = path.getPointAtLength(clamp(progress, 0, 1) * length);
  return { x: point.x, y: point.y };
}

export default function TraceXIntro({ onComplete }: TraceXIntroProps) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<
    "boot" | "trace" | "orbit" | "impact" | "lock" | "exit"
  >(reducedMotion ? "lock" : "boot");
  const [xPoint, setXPoint] = useState<Point>({ x: 28, y: 68 });

  useEffect(() => {
    if (reducedMotion) {
      const timer = window.setTimeout(() => onComplete(), 450);
      return () => window.clearTimeout(timer);
    }

    const startedAt = performance.now();
    const total = 2950;

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const t = clamp(elapsed / total, 0, 1);

      if (t < 0.16) setPhase("boot");
      else if (t < 0.31) setPhase("trace");
      else if (t < 0.80) setPhase("orbit");
      else if (t < 0.88) setPhase("impact");
      else if (t < 0.94) setPhase("lock");
      else setPhase("exit");

      let motionProgress = 0;
      if (t >= 0.27 && t < 0.81) {
        motionProgress = easeInOutCubic(clamp((t - 0.27) / 0.54, 0, 1));
      } else if (t >= 0.81) {
        motionProgress = 1;
      }

      const point = getPointAtPathLength(pathRef.current, motionProgress);
      if (point) setXPoint(point);
      setProgress(motionProgress);

      if (t < 1) {
        animationRef.current = requestAnimationFrame(tick);
      } else if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    };

    animationRef.current = requestAnimationFrame(tick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [onComplete, reducedMotion]);

  const traceOpacity =
    phase === "boot"
      ? 0
      : phase === "trace"
        ? 1
        : 1;
  const backgroundOpacity = phase === "exit" ? 0.28 : 1;
  const logoOpacity = phase === "lock" || phase === "exit" ? 1 : 0;
  const impactScale = phase === "impact" ? 1.08 : 1;
  const xOpacity = phase === "boot" || phase === "trace" ? 0 : 1;

  return (
    <main className={`tracex-intro tracex-intro--${phase}`} aria-label="TraceX loading">
      <style jsx>{`
        .tracex-intro {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
          color: #f8fbff;
          background:
            radial-gradient(circle at 53% 43%, rgba(0,216,255,0.10), transparent 26%),
            radial-gradient(circle at 20% 20%, rgba(93,90,255,0.08), transparent 28%),
            #020305;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          isolation: isolate;
        }

        .ambient {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: ${backgroundOpacity};
          transition: opacity 600ms ease;
        }

        .ambient::before {
          content: "";
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(circle at 72% 28%, rgba(0,216,255,0.08), transparent 18%),
            radial-gradient(circle at 24% 75%, rgba(94,95,255,0.07), transparent 18%);
          filter: blur(28px);
          animation: drift 12s ease-in-out infinite alternate;
        }

        .grid {
          position: absolute;
          inset: 0;
          opacity: 0.14;
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 56px 56px;
          mask-image: radial-gradient(circle at center, black 0%, rgba(0,0,0,0.75) 46%, transparent 88%);
        }

        .dashboard {
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(1030px, 78vw);
          transform: translate(-50%, -50%) scale(1.035);
          opacity: 0.16;
          filter: blur(7px) saturate(0.85);
          transition: opacity 900ms ease, transform 1200ms cubic-bezier(.16,1,.3,1);
        }

        .browser {
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 26px;
          background: linear-gradient(180deg, rgba(18,21,29,.78), rgba(8,10,14,.82));
          box-shadow: 0 40px 120px rgba(0,0,0,.55), 0 0 100px rgba(0,216,255,.04);
        }

        .browser-bar {
          display: flex;
          align-items: center;
          gap: 7px;
          height: 42px;
          padding: 0 16px;
          border-bottom: 1px solid rgba(255,255,255,.055);
        }

        .dot { width: 8px; height: 8px; border-radius: 999px; background: rgba(255,255,255,.14); }
        .address {
          flex: 1;
          max-width: 340px;
          height: 22px;
          margin: 0 auto;
          border-radius: 999px;
          background: rgba(255,255,255,.035);
        }

        .browser-body {
          display: grid;
          grid-template-columns: 165px 1fr;
          min-height: 360px;
        }

        .ghost-sidebar {
          padding: 22px 14px;
          border-right: 1px solid rgba(255,255,255,.045);
        }

        .ghost-brand {
          width: 86px;
          height: 15px;
          border-radius: 5px;
          background: linear-gradient(90deg, rgba(255,255,255,.28), rgba(0,216,255,.25));
          margin: 0 0 32px 12px;
        }

        .ghost-nav { height: 38px; border-radius: 11px; background: rgba(255,255,255,.045); margin-bottom: 8px; }
        .ghost-nav.active { background: rgba(100,110,255,.10); border: 1px solid rgba(100,110,255,.10); }

        .ghost-main { padding: 24px 26px 28px; }
        .ghost-title { width: 44%; height: 17px; border-radius: 6px; background: rgba(255,255,255,.22); margin-bottom: 10px; }
        .ghost-subtitle { width: 34%; height: 10px; border-radius: 5px; background: rgba(255,255,255,.08); margin-bottom: 28px; }

        .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .stat { height: 88px; border-radius: 16px; border: 1px solid rgba(255,255,255,.05); background: rgba(255,255,255,.025); padding: 16px; }
        .stat-label { width: 54%; height: 9px; border-radius: 5px; background: rgba(255,255,255,.08); margin-bottom: 16px; }
        .stat-value { width: 64%; height: 20px; border-radius: 6px; background: linear-gradient(90deg, rgba(255,255,255,.22), rgba(0,216,255,.12)); }

        .ghost-panel { margin-top: 16px; height: 138px; border-radius: 18px; border: 1px solid rgba(255,255,255,.05); background: rgba(255,255,255,.025); }

        .center-stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .stage-shell {
          position: relative;
          width: min(920px, 88vw);
          height: min(620px, 72vh);
        }

        .path-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .wordmark {
          position: absolute;
          left: 50%;
          top: 53%;
          transform: translate(-50%, -50%) scale(${phase === "impact" ? 1.035 : 1});
          opacity: ${traceOpacity};
          transition: opacity 650ms ease, transform 300ms cubic-bezier(.17,.89,.32,1.26);
          letter-spacing: -0.065em;
          font-weight: 850;
          font-size: clamp(66px, 8.6vw, 118px);
          line-height: 0.95;
          white-space: nowrap;
          text-shadow: 0 0 34px rgba(255,255,255,.06);
        }

        .wordmark-x { color: #00d8ff; text-shadow: 0 0 30px rgba(0,216,255,.40); }

        .moving-x {
          position: absolute;
          left: 0;
          top: 0;
          transform: translate(${xPoint.x}px, ${xPoint.y}px) translate(-50%, -50%) scale(${impactScale});
          opacity: ${xOpacity};
          transition: opacity 280ms ease, filter 280ms ease, transform 140ms cubic-bezier(.2,.85,.25,1.18);
          font-size: clamp(66px, 8vw, 112px);
          font-weight: 900;
          color: #00d8ff;
          letter-spacing: -0.08em;
          text-shadow:
            0 0 12px rgba(0,216,255,.55),
            0 0 42px rgba(0,216,255,.42),
            0 0 90px rgba(0,216,255,.18);
          will-change: transform;
        }

        .moving-x::after {
          content: "";
          position: absolute;
          width: 130px;
          height: 130px;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,216,255,.15), transparent 66%);
          filter: blur(9px);
          z-index: -1;
        }

        .trace-light {
          position: absolute;
          left: 50%;
          top: 53%;
          width: min(540px, 62vw);
          height: 120px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(0,216,255,.12), transparent 67%);
          filter: blur(24px);
          opacity: ${phase === "impact" || phase === "lock" ? 1 : .3};
          transition: opacity 500ms ease;
        }

        .orbit-glow {
          position: absolute;
          width: 360px;
          height: 160px;
          border-radius: 50%;
          border: 1px solid rgba(0,216,255,.07);
          left: 55%;
          top: 46%;
          transform: translate(-50%, -50%) rotate(-10deg);
          filter: blur(1px);
          opacity: ${progress > 0 ? 1 : 0};
          transition: opacity 350ms ease;
        }

        .lock-logo {
          position: absolute;
          left: 50%;
          top: 53%;
          transform: translate(-50%, -50%) scale(${logoOpacity ? 1 : .98});
          opacity: ${logoOpacity};
          transition: opacity 420ms ease, transform 420ms cubic-bezier(.17,.89,.32,1.25);
          display: flex;
          align-items: baseline;
          font-size: clamp(66px, 8.6vw, 118px);
          font-weight: 850;
          letter-spacing: -0.065em;
          white-space: nowrap;
          text-shadow: 0 0 36px rgba(255,255,255,.06);
        }

        .lock-logo .x { color: #00d8ff; text-shadow: 0 0 35px rgba(0,216,255,.55); }

        .impact-ring {
          position: absolute;
          left: 50%;
          top: 53%;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(${phase === "impact" ? 2.2 : 0.6});
          opacity: ${phase === "impact" ? .9 : 0};
          border: 1px solid rgba(0,216,255,.58);
          box-shadow: 0 0 40px rgba(0,216,255,.18), inset 0 0 26px rgba(0,216,255,.08);
          transition: transform 420ms cubic-bezier(.16,1,.3,1), opacity 250ms ease;
        }

        .caption {
          position: absolute;
          left: 50%;
          top: calc(53% + 104px);
          transform: translateX(-50%);
          opacity: ${phase === "lock" || phase === "exit" ? .72 : 0};
          transition: opacity 600ms ease;
          color: rgba(219,230,241,.58);
          font-size: 12px;
          letter-spacing: .16em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .corner-status {
          position: absolute;
          right: 26px;
          top: 24px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          color: rgba(255,255,255,.38);
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00d8ff;
          box-shadow: 0 0 12px rgba(0,216,255,.75);
          animation: pulse 1.6s ease-in-out infinite;
        }

        @keyframes drift {
          from { transform: translate3d(-2%, -1%, 0) scale(1); }
          to { transform: translate3d(3%, 2%, 0) scale(1.06); }
        }

        @keyframes pulse {
          0%, 100% { opacity: .35; transform: scale(.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @media (max-width: 800px) {
          .dashboard { width: 1050px; opacity: .08; }
          .stage-shell { width: 100vw; height: 78vh; }
          .browser-body { grid-template-columns: 130px 1fr; }
          .caption { top: calc(53% + 88px); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ambient::before, .status-dot { animation: none; }
          .moving-x, .wordmark, .lock-logo, .impact-ring { transition-duration: 1ms; }
        }
      `}</style>

      <div className="ambient">
        <div className="grid" />
        <div className="dashboard" aria-hidden="true">
          <div className="browser">
            <div className="browser-bar">
              <span className="dot" /><span className="dot" /><span className="dot" />
              <div className="address" />
            </div>
            <div className="browser-body">
              <aside className="ghost-sidebar">
                <div className="ghost-brand" />
                <div className="ghost-nav active" />
                <div className="ghost-nav" />
                <div className="ghost-nav" />
                <div className="ghost-nav" />
                <div className="ghost-nav" />
              </aside>
              <section className="ghost-main">
                <div className="ghost-title" />
                <div className="ghost-subtitle" />
                <div className="stat-row">
                  {[1, 2, 3].map((item) => (
                    <div className="stat" key={item}>
                      <div className="stat-label" />
                      <div className="stat-value" />
                    </div>
                  ))}
                </div>
                <div className="ghost-panel" />
              </section>
            </div>
          </div>
        </div>

        <div className="corner-status"><span className="status-dot" /> TraceX system ready</div>
      </div>

      <div className="center-stage">
        <div className="stage-shell">
          <svg className="path-svg" viewBox="0 0 920 620" aria-hidden="true">
            <defs>
              <filter id="tracexPathGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="5" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="trailGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#00d8ff" stopOpacity="0" />
                <stop offset="100%" stopColor="#00d8ff" stopOpacity="0.6" />
              </linearGradient>
            </defs>
            <path
              ref={pathRef}
              d="M 48 76 C 230 10, 530 16, 756 152 C 884 229, 884 345, 744 432 C 635 500, 500 448, 430 356"
              fill="none"
              stroke="none"
            />
            <path
              d="M 48 76 C 230 10, 530 16, 756 152 C 884 229, 884 345, 744 432 C 635 500, 500 448, 430 356"
              fill="none"
              stroke="url(#trailGradient)"
              strokeWidth="1"
              strokeLinecap="round"
              opacity="0.14"
              strokeDasharray="2 14"
              filter="url(#tracexPathGlow)"
            />
          </svg>

          <div className="trace-light" />
          <div className="orbit-glow" />
          <div className="wordmark">Trace<span className="wordmark-x">X</span></div>
          <div className="moving-x">X</div>
          <div className="impact-ring" />
          <div className="lock-logo"><span>Trace</span><span className="x">X</span></div>
          <div className="caption">Learning command center</div>
        </div>
      </div>
    </main>
  );
}
