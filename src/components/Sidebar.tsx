"use client";

import React from "react";
import { useRouter } from "next/router";


const navItems = [

  {
    name:"Home",
    href:"/home",
    icon:"⌂"
  },

  {
    name:"Dashboard",
    href:"/dashboard",
    icon:"▣"
  },

  {
    name:"Study Sessions",
    href:"/sessions",
    icon:"◴"
  },

  {
    name:"Study Plans",
    href:"/study-plans",
    icon:"☷"
  },

  {
    name:"Friends",
    href:"/friends",
    icon:"◇"
  },

  {
    name:"File Converter",
    href:"/converter",
    icon:"⇄"
  },

  {
    name:"NoteX Bot",
    href:"/notex",
    icon:"✦"
  },

  {
    name:"Blocker",
    href:"/blocker",
    icon:"⊘"
  },

  {
    name:"Theme",
    href:"/theme",
    icon:"◐"
  },

  {
    name:"Settings",
    href:"/settings",
    icon:"⚙"
  },

];



export default function Sidebar(){


  const router =
    useRouter();



  return (


    <aside


      style={{


        background:
          "var(--surface)",


        borderColor:
          "var(--border)",


        color:
          "var(--text)",


      }}


      className="

        sticky

        top-0

        h-screen

        w-[260px]

        shrink-0


        border-r


        px-4

        py-6


        backdrop-blur-xl


      "

    >



      <div

        className="

          px-3

          mb-8

        "

      >


        <h1

          className="

            text-2xl

            font-black

            tracking-tight

          "

        >

          Trace

          <span

            style={{

              color:
                "var(--primary)"

            }}

          >

            X

          </span>


        </h1>



        <p

          style={{

            color:
              "var(--muted)"

          }}

          className="text-xs mt-1"

        >

          Learning Command Center

        </p>


      </div>





      <nav

        className="

          flex

          flex-col

          gap-1

        "

      >


        {navItems.map(
          (item)=>{


            const active =
              router.pathname ===
              item.href;



            return (


              <button


                key={
                  item.href
                }


                onClick={()=>

                  router.push(
                    item.href
                  )

                }


                style={{


                  background:
                    active
                      ? "var(--surface-hover)"
                      : "transparent",


                  color:
                    active
                      ? "var(--primary)"
                      : "var(--text)",


                }}



                className="


                  flex

                  items-center

                  gap-3


                  rounded-[var(--radius-md)]


                  px-3

                  py-2.5


                  text-sm

                  font-medium


                  transition-all

                  duration-200


                  hover:translate-x-1


                "

              >


                <span>

                  {item.icon}

                </span>


                {item.name}



              </button>


            );

          }
        )}


      </nav>


    </aside>


  );


}