"use client";

export default function PageHeader({ title, subtitle, rightSlot }: any) {
  return (
    <div className="mb-6 flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {subtitle && (
          <p className="text-sm text-slate-400">{subtitle}</p>
        )}
      </div>
      {rightSlot}
    </div>
  );
}