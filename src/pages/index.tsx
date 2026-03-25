"use client";

import { useEffect } from "react";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();

  // FORCE DARK BACKGROUND IMMEDIATELY
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
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "12px" }}>
        <h1
          style={{
            fontSize: "4rem",
            fontWeight: 900,
            color: "white",
            margin: 0,
            fontStyle: "italic",
            letterSpacing: "-2px",
            lineHeight: "1",
            display: "flex",
            alignItems: "center",
          }}
        >
          Welcome to Trace
          
          {/* ─── INTEGRATED CARTOON X MASCOT ─── */}
          <span style={{ position: "relative", display: "inline-flex", alignItems: "baseline", marginLeft: "2px" }}>
            
            {/* 1. Body (The Anime X) */}
            <span style={{ fontSize: "4rem", fontWeight: 900, color: "#00d8ff", fontStyle: "italic", textShadow: "0 0 15px rgba(0, 216, 255, 0.5)" }}>
              X
            </span>
            
            {/* 2. Headset (Blue Arch) */}
            <div style={{ position: "absolute", top: "-5px", left: "calc(50% - 20px)", width: "40px", height: "30px", borderTop: "3px solid #00d8ff", borderLeft: "3px solid #00d8ff", borderRight: "3px solid #00d8ff", borderRadius: "20px 20px 0 0", boxShadow: "0 -4px 15px rgba(0, 216, 255, 0.3)" }} />
            
            {/* 3. Book, Hands, and Shoes (Sitting) */}
            <div style={{ position: "absolute", bottom: "-18px", left: "calc(50% - 28px)", width: "56px", height: "34px" }}>
              
              {/* Hands & Book Area */}
              <div style={{ position: "absolute", top: 0, width: "100%", height: "20px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                {/* Book (Actual Object, Not Emoji) */}
                <div style={{ width: "32px", height: "18px", backgroundColor: "#FFFFFF", border: "1px solid #cbd5e1", borderRadius: "3px", boxShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
                  <div style={{ position: "absolute", top: "4px", left: "10px", width: "1px", height: "10px", backgroundColor: "#e2e8f0" }} />
                  <div style={{ position: "absolute", top: "4px", left: "21px", width: "1px", height: "10px", backgroundColor: "#e2e8f0" }} />
                </div>
                {/* White Glove Hands */}
                <div style={{ position: "absolute", left: "0px", top: "4px", width: "8px", height: "12px", backgroundColor: "white", borderRadius: "2px", border: "1px solid #cbd5e1" }} />
                <div style={{ position: "absolute", right: "0px", top: "4px", width: "8px", height: "12px", backgroundColor: "white", borderRadius: "2px", border: "1px solid #cbd5e1" }} />
              </div>
              
              {/* Shoes/Feet */}
              <div style={{ position: "absolute", bottom: 0, width: "100%", display: "flex", justifyContent: "space-between", padding: "0 4px" }}>
                <div style={{ width: "18px", height: "10px", backgroundColor: "#00d8ff", borderRadius: "4px", borderBottom: "3px solid rgba(255,255,255,0.3)" }} />
                <div style={{ width: "18px", height: "10px", backgroundColor: "#00d8ff", borderRadius: "4px", borderBottom: "3px solid rgba(255,255,255,0.3)" }} />
              </div>
            </div>
            
          </span>
        </h1>
      </div>

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