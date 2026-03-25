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
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        position: "relative",
        overflow: "hidden"
      }}
    >
      
      {/* ─── 2. CYBERPUNK BACKGROUND ENGINE ─── */}
      <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
        
        {/* Deep Circuit Lines (Grid) */}
        <div style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `
            linear-gradient(to right, rgba(59, 130, 246, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(59, 130, 246, 0.05) 1px, transparent 1px)
          `,
          backgroundSize: "60px 60px",
          maskImage: "radial-gradient(ellipse at center, black, transparent 90%)",
          WebkitMaskImage: "radial-gradient(ellipse at center, black, transparent 90%)",
        }} />

        {/* Ambient Blue Glow */}
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "150%",
          height: "150%",
          background: "radial-gradient(circle at center, rgba(59, 130, 246, 0.15) 0%, rgba(3, 7, 18, 0.05) 60%, transparent 100%)",
          filter: "blur(60px)", 
        }} />
      </div>

      {/* ─── 3. THE GIGANTIC CHI (χ) SYMBOL ─── */}
      <div 
        style={{ position: "relative", zIndex: 10, cursor: "pointer" }} 
        onClick={() => router.push("/signup")}
      >
        <h1
          style={{
            fontSize: "25vw", 
            fontWeight: 900,
            color: "white",
            margin: 0,
            lineHeight: 1,
            position: "relative",
            filter: "drop-shadow(0 0 40px rgba(59, 130, 246, 0.6))"
          }}
        >
          {/* Main Chi Symbol */}
          <span style={{ color: "#FFFFFF", zIndex: 10, display: "inline-block" }}>
            χ
          </span>

          {/* Glitch Overlay 1 */}
          <span 
            style={{ 
              position: "absolute",
              left: "-10px",
              top: 0,
              zIndex: 5, 
              color: "rgba(59, 130, 246, 0.4)",
              filter: "blur(2px)"
            }}
          >χ</span>

          {/* Glitch Overlay 2 */}
          <span 
            style={{ 
              position: "absolute",
              left: "10px",
              top: 0,
              zIndex: 5, 
              color: "rgba(255, 0, 255, 0.4)",
              filter: "blur(2px)"
            }}
          >χ</span>
        </h1>

        {/* UPDATED SLOGAN (No Full Stop) */}
        <p style={{ 
            marginTop: "20px", 
            fontSize: "0.9rem", 
            letterSpacing: "0.5rem", 
            color: "#3b82f6", 
            opacity: 0.8,
            textTransform: "uppercase",
            fontWeight: "bold",
            fontStyle: "italic"
        }}>
          Where chaos turns into clarity
        </p>
      </div>

      {/* ─── 4. RECURSIVE ANIMATIONS ─── */}
      <style jsx>{`
        div {
            animation: fadeIn 1.5s ease-in;
        }
        h1 {
            animation: breathe 6s ease-in-out infinite;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes breathe {
          0%, 100% { transform: scale(1); filter: brightness(1); }
          50% { transform: scale(1.03); filter: brightness(1.3); }
        }
      `}</style>
    </div>
  );
}