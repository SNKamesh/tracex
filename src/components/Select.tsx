"use client";

export default function Select(props: any) {
  return (
    <select
      {...props}
      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"
    />
  );
}