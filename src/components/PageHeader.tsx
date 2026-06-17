"use client";

import React from "react";


type PageHeaderProps = {

  title: string;

  subtitle?: string;

  rightSlot?: React.ReactNode;

};



export default function PageHeader({

  title,

  subtitle,

  rightSlot,

}: PageHeaderProps) {



  return (


    <header


      className="

        mb-8

        flex

        flex-col

        gap-4


        sm:flex-row

        sm:items-center

        sm:justify-between

      "

    >




      <div>



        <div

          className="

            flex

            items-center

            gap-3

          "

        >



          <div


            style={{

              background:

                "var(--gradient-primary)",

            }}


            className="

              h-3

              w-3

              rounded-full

              shadow-lg

            "

          />




          <h1


            style={{

              color:
                "var(--text)",

            }}


            className="

              text-3xl

              font-black

              tracking-tight

            "

          >


            {title}


          </h1>



        </div>





        {subtitle && (


          <p


            style={{

              color:
                "var(--muted)",

            }}


            className="

              mt-2

              text-sm

              leading-relaxed

            "

          >


            {subtitle}


          </p>


        )}



      </div>





      {rightSlot && (


        <div

          className="

            flex

            items-center

            gap-3

          "

        >


          {rightSlot}


        </div>


      )}



    </header>


  );

}