"use client";

import React from "react";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export default function Select(props: SelectProps) {
  return (
    <select
      {...props}
      className={`w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-200 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer ${props.className ?? ""}`}
    />
  );
}