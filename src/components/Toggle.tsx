"use client";

import React from "react";


interface ToggleProps {

  checked: boolean;

  onChange: (value:boolean)=>void;

  label?: string;

  description?: string;

}



export default function Toggle({

  checked,

  onChange,

  label,

  description,

}: ToggleProps) {



  return (


    <button


      type="button"


      onClick={() =>

        onChange(

          !checked

        )

      }



      className="

        group

        flex

        w-full

        items-center

        justify-between

        gap-4

        rounded-[var(--radius-md)]

        transition-all

        duration-200

      "


    >




      <div

        className="text-left"

      >


        {label && (

          <p

            style={{

              color:

                "var(--text)",

            }}


            className="

              text-sm

              font-medium

            "

          >

            {label}

          </p>

        )}





        {description && (

          <p

            style={{

              color:

                "var(--muted)",

            }}


            className="

              text-xs

              mt-1

            "

          >

            {description}

          </p>

        )}



      </div>





      <span


        style={{


          background:

            checked

              ? "var(--gradient-primary)"

              : "var(--surface-solid)",


          borderColor:

            "var(--border)",


        }}



        className="


          relative

          flex

          h-7

          w-12

          shrink-0

          items-center


          rounded-full

          border


          transition-all

          duration-300


        "

      >



        <span


          className={`

            h-5

            w-5

            rounded-full

            bg-white


            shadow


            transition-transform

            duration-300


            ${

              checked

                ? "translate-x-6"

                : "translate-x-1"

            }


          `}


        />



      </span>



    </button>


  );

}