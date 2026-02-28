"use client";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
}

export default function Button({ variant = "primary", className, ...props }: ButtonProps) {
  const base =
    "px-4 py-2 rounded-lg font-medium cursor-pointer transition active:scale-[0.97]";

  const styles = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-slate-800 hover:bg-slate-700 text-white",
    ghost: "bg-transparent hover:bg-slate-800 text-white border border-slate-700",
  };

  return (
    <button
      {...props}
      className={`${base} ${styles[variant]} ${className ?? ""}`}
    />
  );
}