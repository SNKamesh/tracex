"use client";

import React from "react";


type SectionCardProps = {

  title?: string;

  description?: string;

  children: React.ReactNode;

  className?: string;

};



export default function SectionCard({

  title,

  description,

  children,

  className = "",

}: SectionCardProps) {



  return (

    <section


      style={{

        background:
          "var(--surface)",


        color:
          "var(--text)",


        borderColor:
          "var(--border)",


        boxShadow:
          "var(--shadow)",

      }}


      className={`

        relative

        w-full

        rounded-[var(--radius-lg)]

        border

        p-6

        mt-4


        backdrop-blur-xl


        transition-all

        duration-300


        hover:-translate-y-1


        ${className}

      `}

    >



      {title && (

        <h2

          className="

            text-xl

            font-bold

            tracking-tight

            mb-1

          "

        >

          {title}

        </h2>

      )}




      {description && (

        <p

          style={{

            color:

              "var(--muted)",

          }}


          className="

            text-sm

            mb-5

            leading-relaxed

          "

        >

          {description}

        </p>

      )}




      {children}



    </section>

  );

}