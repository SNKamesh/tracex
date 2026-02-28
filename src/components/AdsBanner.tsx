"use client";

export default function AdsBanner({ visible = true }: { visible?: boolean }) {
  if (!visible) return null;

  return (
    <div className="my-4 rounded-xl border border-slate-800 bg-slate-900 px-4 py-3 text-center text-sm text-slate-300">
      <span className="opacity-75">
        🔔 Ads display only for Freemium users. Upgrade to remove ads.
      </span>
    </div>
  );
}