"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  // 1. FORCE DARK THEME & HIDE OVERFLOW
  useEffect(() => {
    document.documentElement.style.backgroundColor = "#030712";
    document.body.style.backgroundColor = "#030712";
    document.body.style.overflow = "hidden"; 
    return () => { document.body.style.overflow = "auto"; };
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#030712",
        textAlign: "center",
        padding: "20px",
        color: "white",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        position: "relative",
        overflow: "hidden"
      }}
    >
      
      {/* ─── 2. CLEAN CYBERPUNK BACKGROUND ─── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        {/* Subtle Grid */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 80%)",
        }} />

        {/* Soft Center Glow */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "100%",
          height: "100%",
          background: "radial-gradient(circle at center, rgba(0, 216, 255, 0.08) 0%, transparent 70%)",
          filter: "blur(50px)", 
        }} />
      </div>

      {/* ─── 3. THE UNIFIED Traceχ LOGO ─── */}
      <div 
        style={{ position: "relative", zIndex: 10, cursor: "pointer" }} 
        onClick={() => router.push("/signup")}
      >
        <h1
          style={{
            fontSize: "4rem", 
            fontWeight: 900,
            color: "white",
            margin: 0,
            lineHeight: 1.1,
            display: "flex",
            alignItems: "baseline", // Ensures text and symbol sit on the same line
            justifyContent: "center",
            fontStyle: "italic",
            letterSpacing: "-2px",
            filter: "drop-shadow(0 0 20px rgba(0, 216, 255, 0.3))"
          }}
        >
          Welcome to Trace
          <span style={{ 
            color: "#00d8ff", 
            fontStyle: "normal", 
            fontSize: "1em", // Matches parent font size exactly
            marginLeft: "6px",
            display: "inline-block"
          }}>
            χ
          </span>
        </h1>

        <p style={{ 
            marginTop: "16px", 
            fontSize: "0.85rem", 
            letterSpacing: "0.5rem", 
            color: "#3b82f6", 
            opacity: 0.5,
            textTransform: "uppercase",
            fontWeight: "bold"
        }}>
          Where chaos turns into clarity
        </p>
      </div>

      {/* ─── 4. SMOOTH ANIMATIONS ─── */}
      <style jsx>{`
        div {
            animation: fadeIn 1s ease-in;
        }
        h1 {
            animation: softPulse 6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes softPulse {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 20px rgba(0, 216, 255, 0.3)); }
          50% { filter: brightness(1.2) drop-shadow(0 0 35px rgba(0, 216, 255, 0.5)); }
        }
      `}</style>
    </div>
  );
}