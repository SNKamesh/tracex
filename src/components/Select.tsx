"use client";

import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {}

export default function Select({ className = "", children, ...props }: SelectProps) {
  return (
    <select
      {...props}
      style={{ background: "var(--surface-solid)", color: "var(--text)", borderColor: "var(--border)", ...props.style }}
      className={`w-full cursor-pointer rounded-[11px] border px-3.5 py-2.5 text-[13px] outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[color:var(--primary)]/20 ${className}`}
    >
      {children}
    </select>
  );
}
