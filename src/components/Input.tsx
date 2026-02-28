"use client";

import React from "react";

interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

export default function Input(props: InputProps) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-lg px-4 py-2 bg-slate-900 border border-slate-700 text-white outline-none focus:border-blue-500 " +
        (props.className ?? "")
      }
    />
  );
}