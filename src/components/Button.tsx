"use client";

export default function Button({
  children,
  variant = "primary",
  ...props
}: any) {
  const base =
    "px-4 py-2 rounded-xl text-sm font-medium transition active:scale-95";

  const styles =
    variant === "secondary"
      ? "bg-slate-700 hover:bg-slate-600"
      : "bg-tracex-500 hover:bg-tracex-400";

  return (
    <button className={`${base} ${styles}`} {...props}>
      {children}
    </button>
  );
}