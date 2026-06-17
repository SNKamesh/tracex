"use client";

import React from "react";


type StatCardProps = {

  label: string;

  value: string | number;

  icon?: React.ReactNode;

  hint?: string;

};



export default function StatCard({

  label,

  value,

  icon,

  hint,

}: StatCardProps) {



  return (


    <div


      style={{


        background:
          "var(--surface)",


        borderColor:
          "var(--border)",


        boxShadow:
          "var(--shadow-sm)",


      }}



      className="

        group

        relative

        overflow-hidden


        rounded-[var(--radius-lg)]


        border


        p-5


        backdrop-blur-xl


        transition-all

        duration-300


        hover:-translate-y-1


      "

    >



      <div

        className="

          absolute

          inset-0

          opacity-0

          group-hover:opacity-100

          transition-opacity

          duration-300

        "


        style={{


          background:

            "radial-gradient(circle at top right, var(--primary), transparent 45%)",


          opacity:
            undefined,


        }}


      />




      <div

        className="

          relative

          z-10

        "

      >



        <div

          className="

            flex

            items-center

            justify-between

            gap-4

          "

        >


          <p


            style={{

              color:
                "var(--muted)",

            }}


            className="

              text-sm

              font-medium

            "

          >

            {label}

          </p>




          {icon && (


            <div

              style={{

                color:
                  "var(--primary)",

              }}


              className="

                transition-transform

                duration-300

                group-hover:scale-125

                group-hover:rotate-6

              "

            >

              {icon}

            </div>


          )}


        </div>





        <p


          style={{

            color:
              "var(--text)",

          }}


          className="

            mt-3

            text-3xl

            font-black

            tracking-tight

          "

        >


          {value}


        </p>




        {hint && (


          <p


            style={{

              color:
                "var(--muted)",

            }}


            className="

              mt-2

              text-xs

            "

          >


            {hint}


          </p>


        )}




      </div>


    </div>


  );

}