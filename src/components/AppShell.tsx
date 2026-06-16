"use client";

import React from "react";
import Sidebar from "./Sidebar";


export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {


  return (

    <div

      style={{

        background:
          "var(--background)",

        color:
          "var(--text)",

      }}


      className="

        min-h-screen

        flex

        transition-colors

        duration-300

      "

    >


      <Sidebar />



      <main

        className="

          flex-1

          min-h-screen

          px-8

          py-8

          overflow-x-hidden

        "

      >


        <div

          className="

            mx-auto

            w-full

            max-w-[1500px]

          "

        >

          {children}

        </div>


      </main>



    </div>

  );

}