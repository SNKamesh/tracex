"use client";

import { useEffect, useState } from "react";

import {
  CheckCircle2,
  Cpu,
  ShieldCheck,
  Waves,
} from "lucide-react";


interface Props {

onComplete:()=>void;

}



const steps=[

{
text:"Preparing focus environment",
icon:Waves
},

{
text:"Initializing MicroStrict Engine",
icon:Cpu
},

{
text:"Loading distraction shield",
icon:ShieldCheck
},

{
text:"Workspace ready",
icon:CheckCircle2
}

];




export default function FocusBoot({

onComplete

}:Props){


const [current,setCurrent]=
useState(0);




useEffect(()=>{


const interval=setInterval(()=>{


setCurrent(v=>{


if(v===steps.length-1){


clearInterval(interval);


setTimeout(
onComplete,
700
);


return v;


}


return v+1;


});


},700);



return()=>clearInterval(interval);


},[onComplete]);





return(

<div

className="

min-h-[70vh]

flex

items-center

justify-center

"

>



<div

className="

w-[420px]

rounded-[32px]

border

p-8

text-center

"

style={{

background:"var(--surface)",

borderColor:"var(--border)"

}}

>



<div

className="

mx-auto

mb-8

h-24

w-24

rounded-full

flex

items-center

justify-center

animate-pulse

"

style={{

background:
"rgba(56,189,248,.15)"

}}

>


<Cpu

size={42}

color="#38bdf8"

/>


</div>






<h1

className="text-3xl font-black"

>

TraceX AI Boot

</h1>



<p

className="mt-2 text-sm"

style={{

color:"var(--muted)"

}}

>

Creating your perfect focus state

</p>






<div className="mt-8 space-y-4">



{steps.map((s,i)=>{


const Icon=s.icon;



return(


<div

key={s.text}

className="

flex

items-center

gap-3

rounded-xl

p-3

transition-all

"

style={{


opacity:

i<=current?1:.35,


background:

i===current

?

"rgba(56,189,248,.1)"

:

"transparent"


}}


>


<Icon size={18}/>


<span className="text-sm">


{s.text}


</span>



</div>


);


})}



</div>



</div>


</div>


);


}
