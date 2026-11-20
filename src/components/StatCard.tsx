"use client";

import React from "react";

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  hint?: string;
};

export default function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <div className="tx-card relative min-w-0 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <p className="text-[12px] font-medium" style={{ color: "var(--muted)" }}>{label}</p>
        {icon && <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg" style={{ color: "var(--primary)", background: "color-mix(in srgb, var(--primary), transparent 90%)" }}>{icon}</div>}
      </div>
      <p className="mt-4 break-words text-[26px] font-semibold leading-none tracking-[-.045em] sm:text-[30px]">{value}</p>
      {hint && <p className="mt-2 text-[11px] leading-relaxed" style={{ color: "var(--muted)" }}>{hint}</p>}
      <div className="absolute bottom-0 left-4 right-4 h-px" style={{ background: "linear-gradient(90deg, var(--primary), transparent 70%)", opacity: .45 }} />
    </div>
  );
}
