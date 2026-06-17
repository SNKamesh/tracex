"use client";

import React from "react";


interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {}



export default function Select({

  className = "",

  children,

  ...props

}: SelectProps) {



  return (


    <select


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


        rounded-[var(--radius-md)]


        border


        px-4

        py-2.5



        text-sm


        outline-none


        cursor-pointer



        transition-all

        duration-200



        hover:shadow-sm



        focus:border-indigo-400


        focus:ring-2

        focus:ring-indigo-500/30



        ${className}


      `}


    >



      {children}



    </select>


  );


}