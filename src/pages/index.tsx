"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  // 1. FORCE DARK BACKGROUND IMMEDIATELY
  useEffect(() => {
    document.documentElement.style.backgroundColor = "#030712";
    document.body.style.backgroundColor = "#030712";
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#030712",
        textAlign: "center",
        padding: "20px",
        color: "white",
      }}
    >
      {/* ─── 2. THE ANIME MASCOT (X with Headset, Gloves, Books, Shoes) ─── */}
      <div style={{ position: "relative", width: "100px", height: "100px", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "32px" }}>
        
        {/* Headset (Blue Arch) */}
        <div style={{ 
          position: "absolute", top: "-5px", width: "60px", height: "45px", 
          borderTop: "4px solid #00d8ff", borderLeft: "4px solid #00d8ff", 
          borderRight: "4px solid #00d8ff", borderRadius: "30px 30px 0 0",
          boxShadow: "0 -4px 20px rgba(0, 216, 255, 0.4)"
        }} />

        {/* Anime X (Body) */}
        <span style={{ 
          fontSize: "64px", fontWeight: 900, color: "#00d8ff", 
          fontStyle: "italic", zIndex: 10, textShadow: "0 0 15px rgba(0, 216, 255, 0.5)" 
        }}>X</span>

        {/* White Glove Hand Holding Book */}
        <div style={{ 
          position: "absolute", right: "-15px", bottom: "25px", zIndex: 20, 
          width: "32px", height: "24px", backgroundColor: "#FFFFFF", 
          border: "1px solid #cbd5e1", borderRadius: "6px", transform: "rotate(-12deg)",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 6px rgba(0,0,0,0.3)"
        }}>
          {/* Glove Stitches */}
          <div style={{ position: "absolute", top: "5px", left: "8px", width: "1px", height: "10px", backgroundColor: "#e2e8f0" }} />
          <div style={{ position: "absolute", top: "5px", left: "15px", width: "1px", height: "10px", backgroundColor: "#e2e8f0" }} />
          
          {/* The Study Book */}
          <span style={{ position: "absolute", top: "-15px", right: "-8px", fontSize: "24px" }}>📖</span>
        </div>

        {/* Chunky Sneakers (Feet) */}
        <div style={{ position: "absolute", bottom: "0", width: "100%", display: "flex", justifyContent: "space-between", padding: "0 12px" }}>
          <div style={{ width: "26px", height: "14px", backgroundColor: "#00d8ff", borderRadius: "8px", borderBottom: "4px solid rgba(255,255,255,0.4)" }} />
          <div style={{ width: "26px", height: "14px", backgroundColor: "#00d8ff", borderRadius: "8px", borderBottom: "4px solid rgba(255,255,255,0.4)" }} />
        </div>
      </div>

      <h1
        style={{
          fontSize: "4rem",
          fontWeight: 900,
          color: "white",
          marginBottom: "12px",
          fontStyle: "italic",
          letterSpacing: "-2px",
        }}
      >
        Welcome to <span style={{ color: "#00d8ff" }}>TraceX</span>
      </h1>

      <p
        style={{
          color: "#94a3b8",
          fontSize: "1.2rem",
          maxWidth: "600px",
          marginBottom: "44px",
          fontWeight: 500,
        }}
      >
        Where chaos turns into clarity.
      </p>

      <button
        onClick={() => router.push("/signup")}
        style={{
          background: "#00d8ff",
          padding: "16px 40px",
          borderRadius: "14px",
          color: "black",
          fontWeight: "800",
          fontSize: "1.2rem",
          border: "none",
          cursor: "pointer",
          transition: "0.2s transform ease-in-out",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        Get Started →
      </button>
    </div>
  );
}