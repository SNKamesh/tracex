"use client";

import React from "react";
import { useRouter } from "next/router";

import {
  Home,
  LayoutDashboard,
  Timer,
  CalendarCheck,
  Users,
  FileStack,
  Bot,
  ShieldOff,
  Palette,
  Settings,
} from "lucide-react";


const navItems = [

  { name:"Home", href:"/home", icon:Home, anim:"home" },

  { name:"Dashboard", href:"/dashboard", icon:LayoutDashboard, anim:"dashboard" },

  { name:"Study Sessions", href:"/sessions", icon:Timer, anim:"clock" },

  { name:"Study Plans", href:"/study-plans", icon:CalendarCheck, anim:"plan" },

  { name:"Friends", href:"/friends", icon:Users, anim:"friends" },

  { name:"File Converter", href:"/converter", icon:FileStack, anim:"convert" },

  { name:"NoteX Bot", href:"/notex", icon:Bot, anim:"bot" },

  { name:"Blocker", href:"/blocker", icon:ShieldOff, anim:"shield" },

  { name:"Theme", href:"/theme", icon:Palette, anim:"paint" },

  { name:"Settings", href:"/settings", icon:Settings, anim:"gear" },

];



function animation(type:string){


  switch(type){


    case "clock":

      return `
      group-hover:rotate-[360deg]
      duration-700
      `;



    case "gear":

      return `
      group-hover:rotate-180
      duration-700
      `;



    case "bot":

      return `
      group-hover:scale-125
      group-hover:-translate-y-1
      duration-500
      `;



    case "paint":

      return `
      group-hover:-rotate-[25deg]
      group-hover:translate-y-1
      group-hover:scale-125
      duration-500
      `;



    case "dashboard":

      return `
      group-hover:scale-125
      group-hover:rotate-3
      duration-300
      `;



    case "friends":

      return `
      group-hover:scale-125
      duration-300
      `;



    case "convert":

      return `
      group-hover:translate-x-1
      group-hover:scale-110
      duration-300
      `;



    case "shield":

      return `
      group-hover:scale-110
      group-hover:-rotate-12
      duration-300
      `;



    case "plan":

      return `
      group-hover:-translate-y-1
      group-hover:scale-110
      duration-300
      `;



    default:

      return `
      group-hover:-translate-y-1
      group-hover:scale-110
      duration-300
      `;


  }


}




export default function Sidebar(){


const router =
useRouter();



return(


<aside


style={{


background:
"var(--surface)",


borderColor:
"var(--border)",


color:
"var(--text)",


boxShadow:
"var(--shadow-sm)",


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



<div className="group px-3 mb-8">


<h1

className="

text-2xl

font-black

tracking-tight

transition-all

duration-300

group-hover:scale-105

"

>

Trace

<span style={{color:"var(--primary)"}}>

X

</span>


</h1>



<p

style={{color:"var(--muted)"}}

className="text-xs mt-1"

>

Learning Command Center

</p>


</div>






<nav className="flex flex-col gap-1.5">


{navItems.map((item)=>{


const Icon =
item.icon;



const active =

router.pathname === item.href;



return(



<button


key={item.href}


onClick={()=>

router.push(item.href)

}



style={{


background:

active

?

"var(--surface-hover)"

:

"transparent",



color:

active

?

"var(--primary)"

:

"var(--text)",


}}



className="


group

relative

flex

items-center

gap-3

overflow-hidden


rounded-[var(--radius-md)]


px-3

py-2.5


text-sm

font-medium


transition-all

duration-300


hover:translate-x-1


"

>



<div

className="

absolute

inset-0

opacity-0

group-hover:opacity-10

transition-opacity

"

style={{

background:

"var(--gradient-primary)"

}}

/>




<span


className={`

relative

z-10

flex

h-8

w-8

items-center

justify-center


transition-all


${animation(item.anim)}


`}

>


<Icon size={18}/>


</span>




<span className="relative z-10">


{item.name}


</span>



</button>


);


})}



</nav>



</aside>


);


}