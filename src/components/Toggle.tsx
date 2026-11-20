"use client";

import React from "react";

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label?: string;
  description?: string;
}

export default function Toggle({ checked, onChange, label, description }: ToggleProps) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-4 rounded-lg text-left focus-visible:outline-none">
      <span>
        {label && <span className="block text-[13px] font-medium" style={{ color: "var(--text)" }}>{label}</span>}
        {description && <span className="mt-1 block text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>{description}</span>}
      </span>
      <span className="relative flex h-[23px] w-10 shrink-0 items-center rounded-full border p-[2px] transition-colors" style={{ background: checked ? "var(--primary)" : "var(--surface-solid)", borderColor: checked ? "var(--primary)" : "var(--border)" }}>
        <span className={`h-[17px] w-[17px] rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? "translate-x-[17px]" : "translate-x-0"}`} />
      </span>
    </button>
  );
}
