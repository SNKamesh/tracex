"use client";

export default function ThemePreview({ theme, selected }: any) {
  return (
    <div
      className={`rounded-xl p-4 border ${
        selected ? "border-tracex-400" : "border-slate-700"
      }`}
    >
      <div className={`h-20 rounded-lg ${theme.background}`}></div>
      <p className="mt-2 font-semibold">{theme.name}</p>
      <p className="text-xs text-slate-400">{theme.description}</p>
    </div>
  );
}