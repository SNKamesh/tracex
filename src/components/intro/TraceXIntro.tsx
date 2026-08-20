import React, { useEffect, useMemo, useRef, useState } from "react";

interface TraceXIntroProps {
  onComplete: () => void;
}

type Point = { x: number; y: number };

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const easeOutQuint = (t: number) => 1 - Math.pow(1 - t, 5);

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function pointOnPath(path: SVGPathElement | null, progress: number): Point | null {
  if (!path) return null;
  const length = path.getTotalLength();
  const p = path.getPointAtLength(clamp(progress, 0, 1) * length);
  return { x: p.x, y: p.y };
}

export default function TraceXIntro({ onComplete }: TraceXIntroProps) {
  const pathRef = useRef<SVGPathElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const [phase, setPhase] = useState<"intro" | "fly" | "impact" | "exit">(
    reducedMotion ? "impact" : "intro",
  );
  const [progress, setProgress] = useState(0);
  const [xPoint, setXPoint] = useState<Point>({ x: 46, y: 74 });

  useEffect(() => {
    if (reducedMotion) {
      const timer = window.setTimeout(onComplete, 700);
      return () => window.clearTimeout(timer);
    }

    const start = performance.now();
    const duration = 2700;

    const tick = (now: number) => {
      const elapsed = now - start;
      const t = clamp(elapsed / duration, 0, 1);

      if (t < 0.18) setPhase("intro");
      else if (t < 0.82) setPhase("fly");
      else if (t < 0.91) setPhase("impact");
      else setPhase("exit");

      if (t >= 0.18 && t < 0.83) {
        const raw = clamp((t - 0.18) / 0.65, 0, 1);
        const motion = easeInOutCubic(raw);
        const p = pointOnPath(pathRef.current, motion);
        if (p) setXPoint(p);
        setProgress(motion);
      } else if (t >= 0.83) {
        setProgress(1);
        const p = pointOnPath(pathRef.current, 1);
        if (p) setXPoint(p);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (!completedRef.current) {
        completedRef.current = true;
        onComplete();
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [onComplete, reducedMotion]);

  const traceOpacity = reducedMotion || phase !== "intro" ? 1 : 0;
  const movingXOpacity = reducedMotion || phase !== "intro" ? 1 : 0;
  const impactScale = phase === "impact" ? 1.12 : 1;
  const fade = phase === "exit" ? 0.18 : 1;

  return (
    <main className="tracex-intro" aria-label="TraceX intro">
      <style jsx>{`
        .tracex-intro {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
          background:
            radial-gradient(circle at 50% 46%, rgba(0, 216, 255, 0.08), transparent 28%),
            radial-gradient(circle at 14% 20%, rgba(83, 75, 255, 0.055), transparent 28%),
            linear-gradient(135deg, #010204 0%, #03050a 50%, #020305 100%);
          color: #f7fbff;
          isolation: isolate;
        }

        .intro-bg {
          position: absolute;
          inset: 0;
          opacity: ${fade};
          transition: opacity 600ms ease;
        }

        .grid {
          position: absolute;
          inset: -8%;
          background-image:
            linear-gradient(rgba(255, 255, 255, 0.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.028) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(circle at 50% 48%, black 0%, rgba(0,0,0,.75) 50%, transparent 88%);
          animation: drift 16s ease-in-out infinite alternate;
        }

        .aurora {
          position: absolute;
          inset: -30%;
          background:
            radial-gradient(circle at 66% 40%, rgba(0,216,255,.075), transparent 18%),
            radial-gradient(circle at 31% 69%, rgba(93, 85, 255, .055), transparent 19%);
          filter: blur(42px);
          animation: aurora 12s ease-in-out infinite alternate;
        }

        .ghost-dashboard {
          position: absolute;
          width: min(980px, 82vw);
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%) scale(1.045);
          opacity: 0.105;
          filter: blur(10px) saturate(.8);
          pointer-events: none;
        }

        .browser {
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 26px;
          background: rgba(13, 16, 23, .75);
          box-shadow: 0 45px 120px rgba(0,0,0,.55);
          overflow: hidden;
        }

        .browser-top {
          height: 42px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 16px;
          border-bottom: 1px solid rgba(255,255,255,.05);
        }

        .window-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,.15);
        }

        .browser-pill {
          width: 320px;
          height: 22px;
          margin: 0 auto;
          border-radius: 999px;
          background: rgba(255,255,255,.03);
        }

        .browser-body {
          display: grid;
          grid-template-columns: 150px 1fr;
          min-height: 340px;
        }

        .sidebar {
          padding: 22px 14px;
          border-right: 1px solid rgba(255,255,255,.04);
        }

        .brand-bar {
          width: 84px;
          height: 14px;
          margin: 0 0 28px 12px;
          border-radius: 5px;
          background: linear-gradient(90deg, rgba(255,255,255,.28), rgba(0,216,255,.19));
        }

        .nav-bar {
          height: 36px;
          margin-bottom: 8px;
          border-radius: 10px;
          background: rgba(255,255,255,.038);
        }

        .nav-bar.active {
          background: rgba(110, 114, 255, .09);
          border: 1px solid rgba(110, 114, 255, .10);
        }

        .dashboard-main { padding: 24px; }
        .ghost-line { height: 14px; border-radius: 6px; background: rgba(255,255,255,.15); }
        .ghost-line.large { width: 48%; margin-bottom: 10px; }
        .ghost-line.small { width: 32%; height: 9px; margin-bottom: 26px; background: rgba(255,255,255,.07); }

        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .stat-card {
          height: 86px;
          padding: 15px;
          border-radius: 15px;
          border: 1px solid rgba(255,255,255,.045);
          background: rgba(255,255,255,.022);
        }

        .stat-caption { width: 48%; height: 8px; border-radius: 5px; background: rgba(255,255,255,.07); margin-bottom: 15px; }
        .stat-value { width: 62%; height: 19px; border-radius: 6px; background: linear-gradient(90deg, rgba(255,255,255,.20), rgba(0,216,255,.11)); }
        .ghost-panel { height: 132px; margin-top: 14px; border-radius: 17px; border: 1px solid rgba(255,255,255,.045); background: rgba(255,255,255,.02); }

        .status {
          position: absolute;
          top: 24px;
          right: 28px;
          display: flex;
          align-items: center;
          gap: 8px;
          color: rgba(255,255,255,.34);
          font-size: 10px;
          letter-spacing: .14em;
          text-transform: uppercase;
        }

        .status-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #00d8ff;
          box-shadow: 0 0 14px rgba(0,216,255,.85);
          animation: pulse 1.6s ease-in-out infinite;
        }

        .stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stage-inner {
          position: relative;
          width: min(920px, 92vw);
          height: min(620px, 80vh);
        }

        .motion-path {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: visible;
          pointer-events: none;
        }

        .motion-path-ghost {
          opacity: .10;
        }

        .trace {
          position: absolute;
          left: 50%;
          top: 52%;
          transform: translate(-50%, -50%);
          opacity: ${traceOpacity};
          transition: opacity 450ms ease;
          font-size: clamp(64px, 8.4vw, 116px);
          font-weight: 850;
          line-height: .92;
          letter-spacing: -.07em;
          white-space: nowrap;
          text-shadow: 0 0 34px rgba(255,255,255,.05);
        }

        .moving-x {
          position: absolute;
          left: 0;
          top: 0;
          transform: translate(${xPoint.x}px, ${xPoint.y}px) translate(-50%, -50%) scale(${impactScale});
          opacity: ${movingXOpacity};
          color: #00d8ff;
          font-size: clamp(68px, 8.2vw, 114px);
          font-weight: 900;
          line-height: .9;
          letter-spacing: -.08em;
          text-shadow:
            0 0 12px rgba(0,216,255,.72),
            0 0 36px rgba(0,216,255,.48),
            0 0 84px rgba(0,216,255,.16);
          will-change: transform;
          transition: opacity 260ms ease, transform 130ms cubic-bezier(.15,.9,.25,1.15);
        }

        .moving-x::before {
          content: "";
          position: absolute;
          left: 50%;
          top: 50%;
          width: 150px;
          height: 150px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(0,216,255,.18), transparent 64%);
          filter: blur(10px);
          z-index: -1;
        }

        .lock-glow {
          position: absolute;
          left: 50%;
          top: 52%;
          width: min(560px, 65vw);
          height: 150px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(ellipse, rgba(0,216,255,.12), transparent 68%);
          filter: blur(28px);
          opacity: ${phase === "impact" ? 1 : .35};
          transition: opacity 500ms ease;
        }

        .impact-ring {
          position: absolute;
          left: 50%;
          top: 52%;
          width: 80px;
          height: 80px;
          transform: translate(-50%, -50%) scale(${phase === "impact" ? 2.25 : .6});
          opacity: ${phase === "impact" ? .9 : 0};
          border: 1px solid rgba(0,216,255,.72);
          border-radius: 50%;
          box-shadow: 0 0 48px rgba(0,216,255,.16), inset 0 0 22px rgba(0,216,255,.08);
          transition: transform 430ms cubic-bezier(.16,1,.3,1), opacity 220ms ease;
        }

        .caption {
          position: absolute;
          left: 50%;
          top: calc(52% + 98px);
          transform: translateX(-50%);
          color: rgba(226,236,245,.42);
          opacity: ${phase === "impact" || phase === "exit" ? 1 : 0};
          transition: opacity 550ms ease;
          font-size: 11px;
          letter-spacing: .18em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        @keyframes drift {
          from { transform: translate3d(-1%, -1%, 0); }
          to { transform: translate3d(2%, 2%, 0); }
        }

        @keyframes aurora {
          from { transform: scale(1) translate3d(-1%, 0, 0); }
          to { transform: scale(1.08) translate3d(2%, 1%, 0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: .35; transform: scale(.85); }
          50% { opacity: 1; transform: scale(1.1); }
        }

        @media (max-width: 760px) {
          .ghost-dashboard { width: 980px; opacity: .055; }
          .status { right: 16px; top: 16px; }
          .stage-inner { width: 100vw; height: 76vh; }
        }

        @media (prefers-reduced-motion: reduce) {
          .grid, .aurora, .status-dot { animation: none; }
          .moving-x { transition: none; }
        }
      `}</style>

      <div className="intro-bg" aria-hidden="true">
        <div className="aurora" />
        <div className="grid" />
        <div className="ghost-dashboard">
          <div className="browser">
            <div className="browser-top">
              <span className="window-dot" />
              <span className="window-dot" />
              <span className="window-dot" />
              <div className="browser-pill" />
            </div>
            <div className="browser-body">
              <aside className="sidebar">
                <div className="brand-bar" />
                <div className="nav-bar active" />
                <div className="nav-bar" />
                <div className="nav-bar" />
                <div className="nav-bar" />
                <div className="nav-bar" />
              </aside>
              <section className="dashboard-main">
                <div className="ghost-line large" />
                <div className="ghost-line small" />
                <div className="stats">
                  {[1, 2, 3].map((item) => (
                    <div className="stat-card" key={item}>
                      <div className="stat-caption" />
                      <div className="stat-value" />
                    </div>
                  ))}
                </div>
                <div className="ghost-panel" />
              </section>
            </div>
          </div>
        </div>
        <div className="status"><span className="status-dot" /> TraceX system ready</div>
      </div>

      <div className="stage">
        <div className="stage-inner">
          <svg className="motion-path" viewBox="0 0 920 620" aria-hidden="true">
            <path
              ref={pathRef}
              d="M 42 72 C 245 -5, 600 20, 790 190 C 900 290, 865 430, 730 500 C 680 526, 635 480, 620 430 C 609 393, 610 355, 628 320"
              fill="none"
              stroke="none"
            />
            <path
              className="motion-path-ghost"
              d="M 42 72 C 245 -5, 600 20, 790 190 C 900 290, 865 430, 730 500 C 680 526, 635 480, 620 430 C 609 393, 610 355, 628 320"
              fill="none"
              stroke="#00d8ff"
              strokeWidth="1"
              strokeDasharray="2 16"
              strokeLinecap="round"
            />
          </svg>

          <div className="lock-glow" />
          <div className="trace">Trace</div>
          <div className="moving-x">X</div>
          <div className="impact-ring" />
          <div className="caption">Learning command center</div>
        </div>
      </div>
    </main>
  );
}
