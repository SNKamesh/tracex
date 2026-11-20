"use client";

import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({ variant = "primary", className = "", disabled, ...props }: ButtonProps) {
  const common = "inline-flex min-h-10 items-center justify-center gap-2 rounded-[11px] px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none";
  const styles = {
    primary: "border border-transparent text-white hover:brightness-105",
    secondary: "border hover:bg-[var(--surface-hover)]",
    ghost: "border border-transparent hover:bg-[var(--surface-hover)]",
  };
  const style: React.CSSProperties = variant === "primary"
    ? { background: "var(--primary)", color: "#fff", boxShadow: "var(--shadow-sm)" }
    : variant === "secondary"
      ? { background: "var(--surface)", color: "var(--text)", borderColor: "var(--border)" }
      : { background: "transparent", color: "var(--text)" };

  return <button {...props} disabled={disabled} style={{ ...style, ...props.style }} className={\`\${common} \${styles[variant]} \${className}\`} />;
}
