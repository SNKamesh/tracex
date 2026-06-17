"use client";

import {
  useState,
} from "react";


import {
  Brain,
  Maximize2,
  ShieldCheck,
  Camera,
  Clock3,
  Sparkles,
} from "lucide-react";


import CameraEngine from "./CameraEngine";
import MicroStrictRoom from "./MicroStrictRoom";






export default function MicroStrictTracker(){


const [running,setRunning] =
useState(false);





return(

<>


<section

className="
relative

overflow-hidden

rounded-[34px]

border

p-7

space-y-7
"

style={{

background:
`
linear-gradient(
135deg,
rgba(37,99,235,.12),
rgba(6,182,212,.08),
rgba(0,0,0,.05)
),
var(--surface)
`,

borderColor:
"var(--border)",

}}

>




{/* glow */}

<div

className="
absolute
-top-20
-right-20

h-56
w-56

rounded-full

bg-cyan-500/20

blur-[80px]

pointer-events-none
"

/>









{/* HEADER */}


<div className="relative z-10">


<div

className="
inline-flex

items-center

gap-2

rounded-full

border

px-4
py-2

text-xs

mb-5

bg-white/5

backdrop-blur
"

>


<Sparkles size={14}/>


AI Focus Guardian


</div>






<h2

className="
text-3xl

font-black

tracking-tight

flex
items-center
gap-3
"

>


<Brain size={30}/>


MicroStrict


</h2>





<p

className="
text-sm

opacity-60

mt-2

max-w-sm
"

>

Your private AI guardian verifies real focus time and protects your deep work sessions.


</p>



</div>











{/* STATS */}

<div

className="
relative

z-10

grid
grid-cols-3

gap-3
"

>


{[

{
icon:<ShieldCheck size={18}/>,
text:"Trust"
},

{
icon:<Camera size={18}/>,
text:"Vision"
},

{
icon:<Clock3 size={18}/>,
text:"Focus"
},

].map((item,i)=>(


<div

key={i}

className="
rounded-2xl

border

bg-white/5

backdrop-blur

p-4
"

>


{item.icon}


<p

className="
mt-3

text-xs

font-bold

opacity-70
"

>

{item.text}

</p>


</div>


))}


</div>












{/* CAMERA CHECK */}

<div

className="
relative
z-10

rounded-[26px]

border

bg-black/20

p-4

space-y-3
"

>



<div>


<p

className="
font-black
"

>

Vision Check


</p>


<p

className="
text-xs
opacity-50
"

>

Permission test only • Tracking begins inside focus mode


</p>


</div>




<CameraEngine

mode="preview"

/>



</div>













{/* START */}

<button


onClick={()=>setRunning(true)}


className="
relative

z-10

w-full

rounded-2xl

py-5


font-black

text-lg


flex

items-center

justify-center

gap-3


transition


hover:scale-[1.02]

active:scale-95
"


style={{

background:
"linear-gradient(135deg,#2563eb,#06b6d4)",

color:"white"

}}

>


<Maximize2 size={20}/>


Enter Focus World


</button>






</section>








{

running &&

<MicroStrictRoom

onClose={()=>setRunning(false)}

/>

}



</>


);


}