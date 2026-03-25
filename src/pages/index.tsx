"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/router";
// FIXED: Correct relative paths for your folder structure
import SectionCard from "../components/SectionCard";
import Button from "../components/Button";

export default function Home() {
  const router = useRouter();

  // Force dark mode background immediately to prevent white flash
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
        // Classic, clean sans-serif font stack
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      <div style={{ width: "100%", maxWidth: "450px" }}>
        
        {/* Title Section - No Mascot, Classic Font */}
        <h1
          style={{
            fontSize: "2.5rem",
            fontWeight: "800",
            color: "white",
            marginBottom: "8px",
            letterSpacing: "-0.025em",
          }}
        >
          Welcome to <span style={{ color: "#00d8ff" }}>TraceX</span>
        </h1>

        <p
          style={{
            color: "#94a3b8",
            fontSize: "1rem",
            marginBottom: "32px",
            fontStyle: "italic",
          }}
        >
          Where chaos turns into clarity
        </p>

        {/* Action Card */}
        <SectionCard title="Get Started" description="Sign in or create a new account to continue.">
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "16px" }}>
            <Button 
              onClick={() => router.push("/signup")}
              style={{ width: "100%", backgroundColor: "#2563eb" }}
            >
              Continue with Email
            </Button>
            
            <p 
              onClick={() => router.push("/signup")}
              style={{ 
                fontSize: "0.875rem", 
                color: "#94a3b8", 
                cursor: "pointer", 
                marginTop: "12px",
                textDecoration: "underline" 
              }}
            >
              Create a full TraceX account
            </p>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}