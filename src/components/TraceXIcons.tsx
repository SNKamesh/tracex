"use client";

import React from "react";

type IconProps = {
  type: string;
};



export default function TraceXIcon({ type }: IconProps) {


  switch(type){



/* =========================
   HOME
========================= */

case "home":

return (

<svg
viewBox="0 0 24 24"
className="
w-[18px]
h-[18px]

transition-all
duration-300

group-hover:-translate-y-1
group-hover:scale-110
"
fill="none"
stroke="currentColor"
strokeWidth="2"
>

<path d="M3 11L12 4l9 7"/>

<path d="M5 10v10h14V10"/>

</svg>

);



/* =========================
   DASHBOARD
========================= */

case "dashboard":

return (

<svg
viewBox="0 0 24 24"
className="
w-[18px]
h-[18px]

transition-all
duration-300

group-hover:scale-110
"
fill="none"
stroke="currentColor"
strokeWidth="2"
>

<rect
x="4"
y="4"
width="6"
height="6"

className="
transition-all
duration-300

group-hover:-translate-x-[1px]
"
/>

<rect
x="14"
y="4"
width="6"
height="6"
/>

<rect
x="4"
y="14"
width="6"
height="6"
/>

<rect
x="14"
y="14"
width="6"
height="6"

className="
transition-all
duration-300

group-hover:translate-x-[1px]
"
/>

</svg>

);




/* =========================
   STUDY CLOCK
========================= */

case "clock":

return (

<svg
viewBox="0 0 24 24"
className="
w-[18px]
h-[18px]
"
fill="none"
stroke="currentColor"
strokeWidth="2"
>

<circle
cx="12"
cy="13"
r="8"
/>

<path
d="M12 13V8"

className="
origin-center

transition-transform

duration-700

group-hover:rotate-[360deg]
"
/>

<path d="M9 2h6"/>

</svg>

);




/* =========================
   STUDY PLAN
========================= */

case "plan":

return (

<svg
viewBox="0 0 24 24"
className="
w-[18px]
h-[18px]

transition-all
duration-300

group-hover:-translate-y-1
"
fill="none"
stroke="currentColor"
strokeWidth="2"
>

<rect
x="4"
y="5"
width="16"
height="15"
rx="2"
/>

<path d="M8 3v4M16 3v4M4 10h16"/>

</svg>

);





/* =========================
   FRIENDS
========================= */

case "friends":

return (

<svg
viewBox="0 0 24 24"
className="
w-[18px]
h-[18px]

transition-transform
duration-300

group-hover:scale-110
"
fill="none"
stroke="currentColor"
strokeWidth="2"
>

<circle cx="9" cy="8" r="3"/>

<circle cx="17" cy="9" r="2"/>

<path d="M3 20c1-5 11-5 12 0"/>

<path d="M14 18c1-3 6-3 7 0"/>

</svg>

);




/* =========================
   CONVERTER
========================= */

case "convert":

return (

<svg
viewBox="0 0 24 24"
className="
w-[18px]
h-[18px]

transition-all
duration-300

group-hover:translate-x-1
"
fill="none"
stroke="currentColor"
strokeWidth="2"
>

<path d="M7 7h10"/>

<path d="M14 4l3 3-3 3"/>

<path d="M17 17H7"/>

<path d="M10 14l-3 3 3 3"/>

</svg>

);





/* =========================
   NOTEX BOT
========================= */

case "bot":

return (

<svg
viewBox="0 0 24 24"
className="
w-[18px]
h-[18px]

transition-all
duration-500

group-hover:scale-125
"
fill="none"
stroke="currentColor"
strokeWidth="2"
>

<path
d="M12 6V3"

className="
transition-all
duration-500

group-hover:-translate-y-1
"
/>

<rect
x="5"
y="7"
width="14"
height="11"
rx="3"
/>

<circle
cx="9"
cy="12"
r="1"

className="
transition-all
duration-500

group-hover:scale-150
"
/>

<circle
cx="15"
cy="12"
r="1"

className="
transition-all
duration-500

group-hover:scale-150
"
/>

</svg>

);





/* =========================
   BLOCKER
========================= */

case "block":

return (

<svg
viewBox="0 0 24 24"
className="
w-[18px]
h-[18px]

transition-all
duration-300

group-hover:-rotate-12
"
fill="none"
stroke="currentColor"
strokeWidth="2"
>

<path d="M12 3l8 4v5c0 5-3 8-8 9-5-1-8-4-8-9V7z"/>

<path d="M8 8l8 8"/>

</svg>

);





/* =========================
   THEME PAINT
========================= */

case "paint":

return (

<svg
viewBox="0 0 24 24"
className="
w-[18px]
h-[18px]
"
fill="none"
stroke="currentColor"
strokeWidth="2"
>


<path
d="M16 3l5 5"

className="
transition-all
duration-500

group-hover:translate-y-2
group-hover:-rotate-12
"
/>


<path d="M4 14a8 8 0 1016 0"/>

<circle cx="9" cy="13" r="1"/>

</svg>

);





/* =========================
   SETTINGS
========================= */

case "settings":

return (

<svg
viewBox="0 0 24 24"
className="
w-[18px]
h-[18px]

transition-transform

duration-700

group-hover:rotate-180
"
fill="none"
stroke="currentColor"
strokeWidth="2"
>

<circle cx="12" cy="12" r="3"/>

<path d="M12 2v3M12 19v3M2 12h3M19 12h3"/>

</svg>

);



default:

return null;


}


}