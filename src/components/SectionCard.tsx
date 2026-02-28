"use client";
export default function SectionCard({ title, description, children }: any) {
  return (
    <div className="w-full rounded-xl p-6 bg-slate-800 border border-slate-700 mt-4">
      {title && <h2 className="text-xl font-semibold mb-1">{title}</h2>}
      {description && <p className="text-sm text-slate-400 mb-4">{description}</p>}
      {children}
    </div>
  );
}