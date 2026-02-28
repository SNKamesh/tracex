"use client";

export default function Input(props: any) {
  return (
    <input
      {...props}
      className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"
    />
  );
}