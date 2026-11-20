"use client";

import React from "react";

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  rightSlot?: React.ReactNode;
};

export default function PageHeader({ title, subtitle, rightSlot }: PageHeaderProps) {
  return (
    <header className="mb-7 flex flex-col gap-4 border-b pb-6 sm:flex-row sm:items-end sm:justify-between" style={{ borderColor: "var(--border)" }}>
      <div className="min-w-0">
        <h1 className="text-[27px] font-semibold leading-tight tracking-[-.045em] sm:text-[32px]">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-[13px] leading-relaxed sm:text-sm" style={{ color: "var(--muted)" }}>{subtitle}</p>}
      </div>
      {rightSlot && <div className="flex flex-wrap items-center gap-3">{rightSlot}</div>}
    </header>
  );
}
