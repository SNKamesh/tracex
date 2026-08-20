import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

interface TraceXIntroProps {
  onComplete: () => void;
}

type Point = { x: number; y: number };
type Phase = "boot" | "trace" | "orbit" | "impact" | "lock" | "exit";

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function easeInOutCubic(t: number) {
  return t < 0.5
    ? 4 * t * t * t
    : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

function getPointAtPathLength(path: SVGPathElement | null, progress: number): Point | null {
  if (!path) return null;
  const length = path.getTotalLength();
  const point = path.getPointAtLength(clamp(progress, 0, 1) * length);
  return { x: point.x, y: point.y };
}

export default function TraceXIntro({ onComplete }: TraceXIntroProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const traceRef = useRef<HTMLSpanElement | null>(null);
  const xMeasureRef = useRef<HTMLSpanElement | null>(null);
  const pathRef = useRef<SVGPathElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const targetPointRef = useRef<Point>({ x: 61.5, y: 51.5 });

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, []);

  const [phase, setPhase] = useState<Phase>(reducedMotion ? "lock" : "boot");
  const [targetPoint, setTargetPoint] = useState<Point>(targetPointRef.current);
  const [xPoint, setXPoint] = useState<Point>(targetPointRef.current);

  // Measure the actual rendered Trace and final-sized X. The path endpoint is
  // then moved to that measured anchor, so the X docks cleanly on every screen.
  useLayoutEffect(() => {
    const updateTarget = () => {
      const stage = stageRef.current;
      const trace = traceRef.current;
      const xMeasure = xMeasureRef.current;
      if (!stage || !trace || !xMeasure) return;

      const stageRect = stage.getBoundingClientRect();
      const traceRect = trace.getBoundingClientRect();
      const xRect = xMeasure.getBoundingClientRect();

      const gap = -1;
      const centerX = traceRect.right - stageRect.left + gap + xRect.width / 2;
      const centerY = traceRect.top - stageRect.top + traceRect.height * 0.53 + xRect.height * 0.01;

      const next = {
        x: clamp((centerX / stageRect.width) * 100, 0, 100),
        y: clamp((centerY / stageRect.height) * 100, 0, 100),
      };

      targetPointRef.current = next;
      setTargetPoint(next);
    };

    updateTarget();
    window.addEventListener("resize", updateTarget);
    return () => window.removeEventListener("resize", updateTarget);
  }, []);

  useEffect(() => {
    if (reducedMotion) {
      const timer = window.setTimeout(onComplete, 380);
      return () => window.clearTimeout(timer);
    }

    const startedAt = performance.now();
    const total = 3000;

    const tick = (now: number) => {
      const elapsed = now - startedAt;
      const t = clamp(elapsed / total, 0, 1);

      if (t < 0.15) setPhase("boot");
      else if (t < 0.29) setPhase("trace");
      else if (t < 0.79) setPhase("orbit");
      else if (t < 0.86) setPhase("impact");
      else if (t < 0.94) setPhase("lock");
      else setPhase("exit");

      if (t >= 0.25 && t < 0.80) {
        const motionProgress = easeInOutCubic(clamp((t - 0.25) / 0.55, 0, 1));
        const point = getPointAtPathLength(pathRef.current, motionProgress);
        if (point) setXPoint(point);
      } else if (t >= 0.80) {
        setXPoint(targetPointRef.current);
      }

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

  const traceOpacity = phase === "boot" ? 0 : 1;
  const movingOpacity = phase === "boot" || phase === "trace" ? 0 : 1;
  const xScale = phase === "impact" ? 1.035 : phase === "lock" || phase === "exit" ? 0.84 : 1;
  const backgroundOpacity = phase === "exit" ? 0.78 : 1;

  return (
    <main className={`tracex-intro tracex-intro--${phase}`} aria-label="TraceX loading">
      <style jsx>{`
        .tracex-intro {
          position: fixed;
          inset: 0;
          z-index: 9999;
          overflow: hidden;
          color: #f7faff;
          background:
            radial-gradient(circle at 70% 28%, rgba(0,216,255,.052), transparent 24%),
            radial-gradient(circle at 20% 30%, rgba(88,86,255,.042), transparent 26%),
            #020304;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          isolation: isolate;
        }

        .ambient {
          position: absolute;
          inset: 0;
          pointer-events: none;
          opacity: ${backgroundOpacity};
          transition: opacity 650ms ease;
        }

        .ambient::before {
          content: "";
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(circle at 72% 28%, rgba(0,216,255,.045), transparent 18%),
            radial-gradient(circle at 24% 74%, rgba(94,95,255,.035), transparent 18%);
          filter: blur(34px);
          animation: drift 14s ease-in-out infinite alternate;
        }

        .grid {
          position: absolute;
          inset: 0;
          opacity: .075;
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
          opacity: .075;
          filter: blur(12px) saturate(.68);
        }

        .browser {
          border: 1px solid rgba(255,255,255,.052);
          border-radius: 28px;
          background: linear-gradient(180deg, rgba(18,21,29,.72), rgba(8,10,14,.80));
          box-shadow: 0 40px 120px rgba(0,0,0,.56);
          overflow: hidden;
        }

        .browser-bar {
          display: flex;
          align-items: center;
          gap: 7px;
          height: 42px;
          padding: 0 16px;
          border-bottom: 1px solid rgba(255,255,255,.035);
        }

        .dot { width: 8px; height: 8px; border-radius: 999px; background: rgba(255,255,255,.11); }
        .address { flex: 1; max-width: 340px; height: 22px; margin: 0 auto; border-radius: 999px; background: rgba(255,255,255,.025); }
        .browser-body { display: grid; grid-template-columns: 165px 1fr; min-height: 360px; }
        .ghost-sidebar { padding: 22px 14px; border-right: 1px solid rgba(255,255,255,.03); }
        .ghost-brand { width: 86px; height: 15px; border-radius: 5px; background: linear-gradient(90deg, rgba(255,255,255,.16), rgba(0,216,255,.12)); margin: 0 0 32px 12px; }
        .ghost-nav { height: 38px; border-radius: 11px; background: rgba(255,255,255,.024); margin-bottom: 8px; }
        .ghost-nav.active { background: rgba(100,110,255,.045); border: 1px solid rgba(100,110,255,.05); }
        .ghost-main { padding: 24px 26px 28px; }
        .ghost-title { width: 44%; height: 17px; border-radius: 6px; background: rgba(255,255,255,.11); margin-bottom: 10px; }
        .ghost-subtitle { width: 34%; height: 10px; border-radius: 5px; background: rgba(255,255,255,.045); margin-bottom: 28px; }
        .stat-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .stat { height: 88px; border-radius: 16px; border: 1px solid rgba(255,255,255,.035); background: rgba(255,255,255,.014); padding: 16px; }
        .stat-label { width: 54%; height: 9px; border-radius: 5px; background: rgba(255,255,255,.045); margin-bottom: 16px; }
        .stat-value { width: 64%; height: 20px; border-radius: 6px; background: linear-gradient(90deg, rgba(255,255,255,.10), rgba(0,216,255,.06)); }
        .ghost-panel { margin-top: 16px; height: 138px; border-radius: 18px; border: 1px solid rgba(255,255,255,.035); background: rgba(255,255,255,.014); }

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

        .trace {
          position: absolute;
          left: 50%;
          top: 51.5%;
          transform: translate(-50%, -50%);
          opacity: ${traceOpacity};
          transition: opacity 460ms ease;
          font-size: clamp(66px, 8.6vw, 118px);
          line-height: .90;
          letter-spacing: -.068em;
          font-weight: 850;
          white-space: nowrap;
          color: #f7faff;
          text-shadow: 0 0 28px rgba(255,255,255,.028);
        }

        .moving-x {
          position: absolute;
          left: ${xPoint.x}%;
          top: ${xPoint.y}%;
          transform: translate(-50%, -50%) scale(${xScale});
          opacity: ${movingOpacity};
          color: #00d8ff;
          font-size: clamp(72px, 8.1vw, 112px);
          line-height: .78;
          font-weight: 900;
          letter-spacing: -.08em;
          text-shadow:
            0 0 10px rgba(0,216,255,.55),
            0 0 30px rgba(0,216,255,.20);
          will-change: left, top, transform;
          transition: opacity 240ms ease, transform 240ms cubic-bezier(.17,.89,.32,1.18);
          transform-origin: center center;
        }

        .x-measure {
          position: absolute;
          visibility: hidden;
          pointer-events: none;
          font-size: clamp(72px, 8.1vw, 112px);
          line-height: .78;
          font-weight: 900;
          letter-spacing: -.08em;
        }

        .impact-flash {
          position: absolute;
          left: ${targetPoint.x}%;
          top: ${targetPoint.y}%;
          width: 120px;
          height: 3px;
          transform: translate(-50%, -50%) scaleX(${phase === "impact" ? 1 : 0.55});
          opacity: ${phase === "impact" ? .75 : 0};
          background: linear-gradient(90deg, transparent, rgba(0,216,255,.85), transparent);
          filter: blur(1px);
          transition: opacity 180ms ease, transform 220ms cubic-bezier(.16,1,.3,1);
        }

        .caption {
          position: absolute;
          left: 50%;
          top: calc(51.5% + 84px);
          transform: translateX(-50%);
          opacity: ${phase === "lock" || phase === "exit" ? .48 : 0};
          transition: opacity 500ms ease;
          color: rgba(219,230,241,.42);
          font-size: 11px;
          letter-spacing: .15em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        @keyframes drift {
          from { transform: translate3d(-1.5%, -1%, 0) scale(1); }
          to { transform: translate3d(2%, 1.5%, 0) scale(1.045); }
        }

        @media (max-width: 760px) {
          .dashboard { width: 1080px; opacity: .048; }
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
              d={`M 7 11 C 28 2, 70 4, 87 25 C 97 39, 95 61, 81 74 C 70 83, 64 74, ${targetPoint.x.toFixed(2)} ${targetPoint.y.toFixed(2)}`}
              fill="none"
              stroke="none"
            />
          </svg>

          <span className="trace" ref={traceRef}>Trace</span>
          <span className="moving-x">X</span>
          <span className="x-measure" ref={xMeasureRef}>X</span>
          <span className="impact-flash" aria-hidden="true" />
          <span className="caption">Learning command center</span>
        </div>
      </div>
    </main>
  );
}
