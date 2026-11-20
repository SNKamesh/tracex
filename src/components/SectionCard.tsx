"use client";

import React from "react";

type SectionCardProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
};

export default function SectionCard({ title, description, children, className = "" }: SectionCardProps) {
  return (
    <section className={\`tx-card mt-4 w-full p-4 sm:p-5 lg:p-6 \${className}\`}>
      {(title || description) && (
        <div className="mb-5">
          {title && <h2 className="text-[16px] font-semibold tracking-[-.02em] sm:text-[17px]">{title}</h2>}
          {description && <p className="mt-1.5 text-[12px] leading-relaxed sm:text-[13px]" style={{ color: "var(--muted)" }}>{description}</p>}
        </div>
      )}
      {children}
    </section>
  );
}
