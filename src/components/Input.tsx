"use client";

import React from "react";


interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}



export default function Input({
  className = "",
  ...props
}: InputProps) {



  return (

    <input

      {...props}


      style={{

        background:
          "var(--surface-solid)",


        color:
          "var(--text)",


        borderColor:
          "var(--border)",

      }}


      className={`
      
        w-full

        px-4
        py-2.5

        rounded-[var(--radius-md)]

        border

        outline-none

        text-sm

        transition-all
        duration-200

        placeholder:text-slate-500


        focus:ring-2
        focus:ring-indigo-500/30

        focus:border-indigo-400


        hover:shadow-sm


        ${className}

      `}

    />

  );


}