"use client";

import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input({ className = "", ...props }: InputProps) {
  return (
    <input
      {...props}
      style={{ background: "var(--surface-solid)", color: "var(--text)", borderColor: "var(--border)", ...props.style }}
      className={\`w-full rounded-[11px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors placeholder:opacity-70 focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/20 \${className}\`}
    />
  );
}
