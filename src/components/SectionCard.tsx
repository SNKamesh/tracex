"use client";

export default function SectionCard({ title, description, children }: any) {
  return (
    <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-slate-400 text-sm mb-3">{description}</p>
      {children}
    </div>
  );
}