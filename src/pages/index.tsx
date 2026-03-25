"use client";

import React from "react";

export default function Home() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "black",
        textAlign: "center",
        padding: "20px",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <h1
        style={{
          fontSize: "4rem",
          fontWeight: "bold",
          color: "white",
          marginBottom: "20px",
        }}
      >
        Welcome to <span style={{ color: "#00d8ff" }}>TraceX</span>
      </h1>

      <p
        style={{
          color: "#94a3b8",
          fontSize: "1.2rem",
          maxWidth: "600px",
          marginBottom: "40px",
          lineHeight: "1.6",
        }}
      >
        Your ultimate study companion. Focus deeper, learn faster, achieve more.
      </p>

      <a
        href="/signup"
        style={{
          background: "#00d8ff",
          padding: "14px 30px",
          borderRadius: "10px",
          color: "black",
          fontWeight: "600",
          fontSize: "1.2rem",
          textDecoration: "none",
          transition: "0.2s opacity ease",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.9")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        Get Started →
      </a>
    </div>
  );
}