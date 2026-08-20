import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

interface TraceXIntroProps {
  onComplete: () => void;
}

type Point = { x: number; y: number };
type Phase = "intro" | "fly" | "impact" | "lock" | "exit";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function pointOnPath(path: SVGPathElement | null, progress: number): Point | null {
  if (!path) return null;
  const length = path.getTotalLength();
  const p = path.getPointAtLength(clamp(progress, 0, 1) * length);
  return { x: p.x, y: p.y };
}

export default function TraceXIntro({ onComplete }: TraceXIntroProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const traceRef = useRef<HTMLSpanElement | null>(null);
  const finalXRef = useRef<HTMLSpanElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const targetRef = useRef<Point>({ x: 61.5, y: 51.5 });

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const [phase, setPhase] = useState<Phase>(reducedMotion ? "lock" : "intro");
  const [target, setTarget] = useState<Point>(targetRef.current);
  const [xPoint, setXPoint] = useState<Point>(targetRef.current);

  // Measure the real final wordmark so the moving X docks at the exact same
  // baseline, height and horizontal position as the final TraceX lockup.
  useLayoutEffect(() => {
    let cancelled = false;

    const measure = () => {
      const stage = stageRef.current;
      const trace = traceRef.current;
      const finalX = finalXRef.current;
      if (!stage || !trace || !finalX) return;

      const stageRect = stage.getBoundingClientRect();
      const xRect = finalX.getBoundingClientRect();

      const next = {
        x: clamp(((xRect.left + xRect.width / 2 - stageRect.left) / stageRect.width) * 100, 0, 100),
        y: clamp(((xRect.top + xRect.height / 2 - stageRect.top) / stageRect.height) * 100, 0, 100),
      };

      if (!cancelled) {
        targetRef.current = next;
        setTarget(next);
        setXPoint(next);
      }
    };

    const run = async () => {
      try {
        if (document.fonts?.ready) await document.fonts.ready;
      } catch {}
      measure();
    };

    run();
    window.addEventListener("resize", measure);
    return () => {
      cancelled = true;
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      const timer = window.setTimeout(onComplete, 380);
      return () => window.clearTimeout(timer);
    }

    // The animation starts immediately. The 1.5s hold after the finished logo
    // is handled by the entry page before it routes to Signup/Home.
    const startedAt = performance.now();
    const total = 3000;

    const tick = (now: number) => {
      const t = clamp((now - startedAt) / total, 0, 1);

      if (t < 0.16) setPhase("intro");
      else if (t < 0.80) setPhase("fly");
      else if (t < 0.88) setPhase("impact");
      else if (t < 0.94) setPhase("lock");
      else setPhase("exit");

      if (t >= 0.14 && t < 0.82) {
        const p = easeInOutCubic(clamp((t - 0.14) / 0.68, 0, 1));
        const point = pointOnPath(pathRef.current, p);
        if (point) setXPoint(point);
      } else if (t >= 0.82) {
        setXPoint(targetRef.current);
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

  const traceOpacity = phase === "intro" ? 0 : 1;
  const movingOpacity = phase === "intro" ? 0 : 1;
  const movingScale = phase === "impact" ? 1.04 : phase === "lock" || phase === "exit" ? 0.82 : 1;
  const backgroundOpacity = phase === "exit" ? 0.78 : 1;

  return (
    <main className="tracex-intro" aria-label="TraceX intro">
      <style jsx>{`
        .tracex-intro {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
          color: #f7faff;
          background:
            radial-gradient(circle at 70% 28%, rgba(0,216,255,.045), transparent 24%),
            radial-gradient(circle at 20% 30%, rgba(88,86,255,.035), transparent 26%),
            #020304;
          isolation: isolate;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        }

        .ambient {
          position: absolute;
          inset: 0;
          opacity: ${backgroundOpacity};
          transition: opacity 650ms ease;
          pointer-events: none;
        }

        .ambient::before {
          content: "";
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(circle at 72% 28%, rgba(0,216,255,.035), transparent 18%),
            radial-gradient(circle at 24% 74%, rgba(94,95,255,.028), transparent 18%);
          filter: blur(34px);
          animation: drift 14s ease-in-out infinite alternate;
        }

        .grid {
          position: absolute;
          inset: 0;
          opacity: .065;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(circle at center, black 0%, rgba(0,0,0,.7) 48%, transparent 88%);
        }

        .dashboard {
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(1080px, 80vw);
          transform: translate(-50%, -50%) scale(1.045);
          opacity: .065;
          filter: blur(12px) saturate(.65);
        }

        .browser {
          border: 1px solid rgba(255,255,255,.05);
          border-radius: 28px;
          background: linear-gradient(180deg, rgba(18,21,29,.70), rgba(8,10,14,.78));
          box-shadow: 0 40px 120px rgba(0,0,0,.56);
          overflow: hidden;
        }

        .browser-bar {
          display: flex;
          align-items: center;
          gap: 7px;
          height: 42px;
          padding: 0 16px;
          border-bottom: 1px solid rgba(255,255,255,.03);
        }

        .dot { width: 8px; height: 8px; border-radius: 999px; background: rgba(255,255,255,.10); }
        .address { flex: 1; max-width: 340px; height: 22px; margin: 0 auto; border-radius: 999px; background: rgba(255,255,255,.022); }
        .browser-body { display: grid; grid-template-columns: 165px 1fr; min-height: 360px; }
        .ghost-sidebar { padding: 22px 14px; border-right: 1px solid rgba(255,255,255,.025); }
        .ghost-brand { width: 86px; height: 15px; border-radius: 5px; background: linear-gradient(90deg, rgba(255,255,255,.14), rgba(0,216,255,.10)); margin: 0 0 32px 12px; }
        .ghost-nav { height: 38px; border-radius: 11px; background: rgba(255,255,255,.02); margin-bottom: 8px; }
        .ghost-nav.active { background: rgba(100,110,255,.04); border: 1px solid rgba(100,110,255,.045); }
        .ghost-main { padding: 24px 26px 28px; }
        .ghost-title { width: 44%; height: 17px; border-radius: 6px; background: rgba(255,255,255,.10); margin-bottom: 10px; }
        .ghost-subtitle { width: 34%; height: 10px; border-radius: 5px; background: rgba(255,255,255,.04); margin-bottom: 28px; }
        .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .stat { height: 88px; border-radius: 16px; border: 1px solid rgba(255,255,255,.03); background: rgba(255,255,255,.012); padding: 16px; }
        .stat-label { width: 54%; height: 9px; border-radius: 5px; background: rgba(255,255,255,.04); margin-bottom: 16px; }
        .stat-value { width: 64%; height: 20px; border-radius: 6px; background: linear-gradient(90deg, rgba(255,255,255,.09), rgba(0,216,255,.05)); }
        .ghost-panel { margin-top: 16px; height: 138px; border-radius: 18px; border: 1px solid rgba(255,255,255,.03); background: rgba(255,255,255,.012); }

        .stage {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
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
        }

        /* One measured wordmark. It defines the exact final X position. */
        .wordmark-anchor {
          position: absolute;
          left: 50%;
          top: 51.5%;
          transform: translate(-50%, -50%);
          display: flex;
          align-items: baseline;
          white-space: nowrap;
          font-size: clamp(66px, 8.6vw, 118px);
          line-height: .9;
          letter-spacing: -.068em;
          font-weight: 850;
          visibility: hidden;
          pointer-events: none;
        }

        .wordmark-anchor-x {
          display: inline-block;
          color: #00d8ff;
          font-size: 1em;
          line-height: .9;
          transform: scale(.82) translateY(.015em);
          transform-origin: center bottom;
          margin-left: -.015em;
        }

        .trace {
          position: absolute;
          left: 50%;
          top: 51.5%;
          transform: translate(-50%, -50%);
          opacity: ${traceOpacity};
          font-size: clamp(66px, 8.6vw, 118px);
          line-height: .9;
          letter-spacing: -.068em;
          font-weight: 850;
          color: #f7faff;
          white-space: nowrap;
          transition: opacity 420ms ease;
        }

        .moving-x {
          position: absolute;
          left: ${xPoint.x}%;
          top: ${xPoint.y}%;
          transform: translate(-50%, -50%) scale(${movingScale});
          transform-origin: center bottom;
          opacity: ${movingOpacity};
          color: #00d8ff;
          font-size: clamp(66px, 8.6vw, 118px);
          line-height: .9;
          font-weight: 850;
          letter-spacing: -.068em;
          text-shadow: 0 0 11px rgba(0,216,255,.30), 0 0 28px rgba(0,216,255,.12);
          will-change: left, top, transform;
          transition: opacity 220ms ease, transform 220ms cubic-bezier(.17,.89,.32,1.18);
        }

        .impact-line {
          position: absolute;
          left: ${target.x}%;
          top: ${target.y}%;
          width: 72px;
          height: 1px;
          transform: translate(-50%, -50%) scaleX(${phase === "impact" ? 1 : 0.4});
          opacity: ${phase === "impact" ? .58 : 0};
          background: linear-gradient(90deg, transparent, rgba(0,216,255,.7), transparent);
          transition: opacity 160ms ease, transform 200ms cubic-bezier(.16,1,.3,1);
        }

        .caption {
          position: absolute;
          left: 50%;
          top: calc(51.5% + 84px);
          transform: translateX(-50%);
          opacity: ${phase === "lock" || phase === "exit" ? .42 : 0};
          color: rgba(219,230,241,.40);
          font-size: 11px;
          letter-spacing: .15em;
          text-transform: uppercase;
          white-space: nowrap;
          transition: opacity 500ms ease;
        }

        @keyframes drift {
          from { transform: translate3d(-1.5%, -1%, 0) scale(1); }
          to { transform: translate3d(2%, 1.5%, 0) scale(1.045); }
        }

        @media (max-width: 760px) {
          .dashboard { width: 1080px; opacity: .042; }
          .stage-inner { width: 100vw; height: 76vh; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ambient::before { animation: none; }
          .moving-x { transition: none; }
        }
      `}</style>

      <div className="ambient" aria-hidden="true">
        <div className="grid" />
        <div className="dashboard">
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
      </div>

      <div className="stage">
        <div className="stage-inner" ref={stageRef}>
          <svg className="motion-path" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <path
              ref={pathRef}
              d={`M 7 11 C 27 2, 70 4, 87 25 C 97 39, 95 61, 81 74 C 70 83, 63 75, ${target.x.toFixed(2)} ${target.y.toFixed(2)}`}
              fill="none"
              stroke="none"
            />
          </svg>

          <div className="wordmark-anchor" aria-hidden="true">
            <span>Trace</span>
            <span className="wordmark-anchor-x" ref={finalXRef}>X</span>
          </div>

          <span className="trace" ref={traceRef}>Trace</span>
          <span className="moving-x">X</span>
          <span className="impact-line" aria-hidden="true" />
          <span className="caption">Learning command center</span>
        </div>
      </div>
    </main>
  );
}
