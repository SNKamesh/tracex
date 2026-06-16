"use client";

import React from "react";


interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {

  variant?:
    | "primary"
    | "secondary"
    | "ghost";

}


export default function Button({
  variant = "primary",
  className = "",
  disabled,
  ...props
}: ButtonProps) {


  const base = `
    inline-flex
    items-center
    justify-center

    px-5
    py-2.5

    rounded-[var(--radius-md)]

    font-semibold
    text-sm

    transition-all
    duration-200

    select-none

    active:scale-[0.96]

    disabled:opacity-50
    disabled:pointer-events-none

    focus:outline-none
  `;



  const styles = {


    primary: `

      text-white

      shadow-lg

      hover:-translate-y-0.5

    `,


    secondary: `

      border

      hover:-translate-y-0.5

    `,


    ghost: `

      border

      hover:-translate-y-0.5

    `,


  };



  const inlineStyles = {


    primary: {

      background:
        "var(--gradient-primary)",

      boxShadow:
        "var(--shadow-sm)",

    },


    secondary: {

      background:
        "var(--surface)",

      color:
        "var(--text)",

      borderColor:
        "var(--border)",

    },


    ghost: {

      background:
        "transparent",

      color:
        "var(--text)",

      borderColor:
        "var(--border)",

    },


  };



  return (

    <button

      {...props}

      disabled={
        disabled
      }

      style={
        inlineStyles[
          variant
        ]
      }

      className={`
        ${base}
        ${styles[variant]}
        ${className}
      `}

    />

  );


}