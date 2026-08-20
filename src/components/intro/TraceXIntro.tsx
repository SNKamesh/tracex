import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

interface TraceXIntroProps {
  onComplete: () => void;
}

type Point = { x: number; y: number };
type Phase = "boot" | "trace" | "orbit" | "impact" | "lock" | "exit";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

function pointOnPath(path: SVGPathElement | null, progress: number): Point | null {
  if (!path) return null;
  const length = path.getTotalLength();
  const point = path.getPointAtLength(clamp(progress, 0, 1) * length);
  return { x: point.x, y: point.y };
}

export default function TraceXIntro({ onComplete }: TraceXIntroProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const finalXRef = useRef<HTMLSpanElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const targetRef = useRef<Point>({ x: 62, y: 51.5 });

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const [phase, setPhase] = useState<Phase>(reducedMotion ? "lock" : "boot");
  const [target, setTarget] = useState<Point>(targetRef.current);
  const [xPoint, setXPoint] = useState<Point>(targetRef.current);

  // Measure the real final X in the real wordmark. This becomes the exact
  // docking point for the flying X, so the two states share one anchor.
  useLayoutEffect(() => {
    const measure = () => {
      const stage = stageRef.current;
      const finalX = finalXRef.current;
      if (!stage || !finalX) return;

      const stageRect = stage.getBoundingClientRect();
      const xRect = finalX.getBoundingClientRect();

      const next = {
        x: clamp(((xRect.left + xRect.width / 2 - stageRect.left) / stageRect.width) * 100, 0, 100),
        y: clamp(((xRect.top + xRect.height / 2 - stageRect.top) / stageRect.height) * 100, 0, 100),
      };

      targetRef.current = next;
      setTarget(next);
    };

    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      const timer = window.setTimeout(onComplete, 450);
      return () => window.clearTimeout(timer);
    }

    const animationDuration = 3000;
    const startedAt = performance.now();

    const tick = (now: number) => {
      const t = clamp((now - startedAt) / animationDuration, 0, 1);

      if (t < 0.15) setPhase("boot");
      else if (t < 0.30) setPhase("trace");
      else if (t < 0.79) setPhase("orbit");
      else if (t < 0.86) setPhase("impact");
      else if (t < 0.94) setPhase("lock");
      else setPhase("exit");

      if (t >= 0.30 && t < 0.80) {
        const motion = easeInOutCubic(clamp((t - 0.30) / 0.50, 0, 1));
        const point = pointOnPath(pathRef.current, motion);
        if (point) setXPoint(point);
      } else if (t >= 0.80) {
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

  const traceOpacity = phase === "boot" ? 0 : 1;
  const flyingOpacity = phase === "boot" || phase === "trace" ? 0 : phase === "impact" ? 1 : 0;
  const finalOpacity = phase === "lock" || phase === "exit" ? 1 : phase === "impact" ? 0.08 : 0;
  const flightScale = phase === "impact" ? 1.06 : 1;
  const exitOpacity = phase === "exit" ? 0.88 : 1;

  return (
    <main className="tracex-intro" aria-label="TraceX intro">
      <style jsx>{`
        .tracex-intro {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
          background:
            radial-gradient(circle at 70% 28%, rgba(0,216,255,.045), transparent 24%),
            radial-gradient(circle at 18% 30%, rgba(88,86,255,.035), transparent 26%),
            #020304;
          color: #f7faff;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          isolation: isolate;
        }

        .ambient {
          position: absolute;
          inset: 0;
          opacity: ${exitOpacity};
          transition: opacity 600ms ease;
          pointer-events: none;
        }

        .ambient::before {
          content: "";
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(circle at 72% 30%, rgba(0,216,255,.03), transparent 18%),
            radial-gradient(circle at 22% 72%, rgba(94,95,255,.025), transparent 18%);
          filter: blur(38px);
          animation: drift 14s ease-in-out infinite alternate;
        }

        .grid {
          position: absolute;
          inset: 0;
          opacity: .065;
          background-image:
            linear-gradient(rgba(255,255,255,.028) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.028) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(circle at center, black 0%, rgba(0,0,0,.65) 52%, transparent 90%);
        }

        .dashboard {
          position: absolute;
          left: 50%;
          top: 50%;
          width: min(1080px, 80vw);
          transform: translate(-50%, -50%) scale(1.045);
          opacity: .055;
          filter: blur(12px) saturate(.65);
        }

        .browser {
          border: 1px solid rgba(255,255,255,.045);
          border-radius: 28px;
          background: linear-gradient(180deg, rgba(18,21,29,.68), rgba(8,10,14,.76));
          overflow: hidden;
        }

        .browser-bar {
          height: 42px;
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 0 16px;
          border-bottom: 1px solid rgba(255,255,255,.03);
        }

        .dot { width: 8px; height: 8px; border-radius: 50%; background: rgba(255,255,255,.09); }
        .address { width: 320px; height: 22px; margin: 0 auto; border-radius: 999px; background: rgba(255,255,255,.022); }
        .browser-body { display: grid; grid-template-columns: 165px 1fr; min-height: 360px; }
        .ghost-sidebar { padding: 22px 14px; border-right: 1px solid rgba(255,255,255,.025); }
        .ghost-brand { width: 86px; height: 15px; border-radius: 5px; background: rgba(255,255,255,.11); margin: 0 0 32px 12px; }
        .ghost-nav { height: 38px; border-radius: 11px; background: rgba(255,255,255,.018); margin-bottom: 8px; }
        .ghost-main { padding: 24px 26px; }
        .ghost-title { width: 44%; height: 17px; border-radius: 6px; background: rgba(255,255,255,.07); margin-bottom: 10px; }
        .ghost-subtitle { width: 34%; height: 10px; border-radius: 5px; background: rgba(255,255,255,.035); margin-bottom: 28px; }
        .stats { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .stat { height: 88px; border-radius: 16px; border: 1px solid rgba(255,255,255,.025); background: rgba(255,255,255,.01); }
        .ghost-panel { margin-top: 16px; height: 138px; border-radius: 18px; border: 1px solid rgba(255,255,255,.025); background: rgba(255,255,255,.01); }

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

        .trace-only {
          position: absolute;
          left: 50%;
          top: 51.5%;
          transform: translate(-50%, -50%);
          opacity: ${traceOpacity};
          transition: opacity 500ms ease;
          font-size: clamp(68px, 8.5vw, 118px);
          font-weight: 850;
          line-height: .9;
          letter-spacing: -.068em;
          white-space: nowrap;
        }

        .trace-only span { display: inline-block; }

        .final-wordmark {
          position: absolute;
          left: 50%;
          top: 51.5%;
          transform: translate(-50%, -50%) scale(${finalOpacity ? 1 : .985});
          opacity: ${finalOpacity};
          display: inline-flex;
          align-items: baseline;
          white-space: nowrap;
          transition: opacity 300ms ease, transform 320ms cubic-bezier(.17,.89,.32,1.18);
          font-size: clamp(68px, 8.5vw, 118px);
          font-weight: 850;
          line-height: .9;
          letter-spacing: -.068em;
        }

        .final-trace { color: #f7faff; }

        .final-x {
          display: inline-block;
          margin-left: -0.035em;
          margin-bottom: 0.035em;
          font-size: .76em;
          line-height: 1;
          color: #00d8ff;
          letter-spacing: -.075em;
          text-shadow: 0 0 22px rgba(0,216,255,.28);
        }

        .flying-x {
          position: absolute;
          left: ${xPoint.x}%;
          top: ${xPoint.y}%;
          transform: translate(-50%, -50%) scale(${flightScale});
          opacity: ${flyingOpacity};
          color: #00d8ff;
          font-size: clamp(72px, 8.2vw, 114px);
          font-weight: 900;
          line-height: .8;
          letter-spacing: -.08em;
          text-shadow: 0 0 11px rgba(0,216,255,.52), 0 0 34px rgba(0,216,255,.20);
          transition: opacity 260ms ease, transform 180ms cubic-bezier(.16,.9,.24,1.14);
          will-change: left, top, transform;
        }

        .final-x-measure {
          position: absolute;
          visibility: hidden;
          pointer-events: none;
          left: 50%;
          top: 51.5%;
          transform: translate(-50%, -50%);
          display: inline-flex;
          align-items: baseline;
          font-size: clamp(68px, 8.5vw, 118px);
          font-weight: 850;
          line-height: .9;
          letter-spacing: -.068em;
          white-space: nowrap;
        }

        .final-x-measure .final-x {
          visibility: visible;
        }

        .impact-flash {
          position: absolute;
          left: ${target.x}%;
          top: ${target.y}%;
          width: 90px;
          height: 2px;
          transform: translate(-50%, -50%) scaleX(${phase === "impact" ? 1 : .4});
          opacity: ${phase === "impact" ? .48 : 0};
          background: rgba(0,216,255,.72);
          transition: opacity 180ms ease, transform 220ms ease;
        }

        .caption {
          position: absolute;
          left: 50%;
          top: calc(51.5% + 84px);
          transform: translateX(-50%);
          opacity: ${phase === "lock" || phase === "exit" ? .38 : 0};
          transition: opacity 500ms ease;
          color: rgba(219,230,241,.38);
          font-size: 11px;
          letter-spacing: .15em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        @keyframes drift {
          from { transform: translate3d(-1%, -1%, 0) scale(1); }
          to { transform: translate3d(2%, 1.5%, 0) scale(1.04); }
        }

        @media (max-width: 760px) {
          .dashboard { width: 1080px; opacity: .04; }
          .stage-inner { width: 100vw; height: 76vh; }
        }

        @media (prefers-reduced-motion: reduce) {
          .ambient::before { animation: none; }
          .flying-x, .final-wordmark { transition: none; }
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
                <div className="ghost-nav" /><div className="ghost-nav" /><div className="ghost-nav" /><div className="ghost-nav" />
              </aside>
              <section className="ghost-main">
                <div className="ghost-title" />
                <div className="ghost-subtitle" />
                <div className="stats"><div className="stat" /><div className="stat" /><div className="stat" /></div>
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
              d={`M 7 11 C 27 2, 69 4, 87 25 C 97 39, 95 61, 81 74 C 72 81, 66 77, ${target.x.toFixed(2)} ${target.y.toFixed(2)}`}
              fill="none"
              stroke="none"
            />
          </svg>

          <div className="trace-only"><span>Trace</span></div>

          <div className="final-x-measure" aria-hidden="true">
            <span className="final-trace">Trace</span><span className="final-x">X</span>
          </div>

          <div className="final-wordmark" aria-label="TraceX">
            <span className="final-trace">Trace</span><span className="final-x" ref={finalXRef}>X</span>
          </div>

          <div className="flying-x">X</div>
          <div className="impact-flash" />
          <div className="caption">Learning command center</div>
        </div>
      </div>
    </main>
  );
}
