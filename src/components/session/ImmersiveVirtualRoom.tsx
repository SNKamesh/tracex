"use client";

import { useEffect, useState } from "react";

import {

Sparkles,

Quote,

Users,

} from "lucide-react";




interface Props {

world?:{

id:string;

name:string;

icon:string;

online:number;

};

}






const quotes = [

"Deep work beats long work.",

"Small focus today. Massive results tomorrow.",

"Discipline creates freedom.",

"Your future self is watching.",

];








export default function ImmersiveVirtualRoom({

world

}:Props){



const [quote,setQuote] =

useState(

quotes[0]

);







useEffect(()=>{


const interval =

setInterval(()=>{


setQuote(

quotes[

Math.floor(

Math.random()*quotes.length

)

]

);


},8000);



return()=>clearInterval(interval);


},[]);









function background(){


switch(world?.id){


case "rain":

return (

"radial-gradient(circle at top,#38bdf855,transparent 40%),linear-gradient(135deg,#020617,#0f172a)"

);



case "zen":

return (

"radial-gradient(circle at top,#22c55e55,transparent 40%),linear-gradient(135deg,#02130b,#020617)"

);



case "exam":

return (

"radial-gradient(circle at top,#ef444455,transparent 40%),linear-gradient(135deg,#1a0505,#020617)"

);



default:

return (

"radial-gradient(circle at top,#6366f155,transparent 40%),linear-gradient(135deg,#020617,#0b1025)"

);

}


}









return(

<div


className="

relative

overflow-hidden

rounded-[36px]

border

h-[420px]

p-8

"

style={{

background:background(),

borderColor:"var(--border)"

}}

>










{/* floating glow */}


<div

className="

absolute

top-20

left-20

h-32

w-32

rounded-full

bg-cyan-400/20

blur-[80px]

animate-pulse

"

/>






<div

className="

absolute

bottom-10

right-10

h-44

w-44

rounded-full

bg-blue-500/20

blur-[100px]

animate-pulse

"

/>










{/* stars */}


<div

className="

absolute

inset-0

opacity-40

"

>


{Array.from({length:30}).map(

(_,i)=>(


<span

key={i}

className="

absolute

h-1

w-1

rounded-full

bg-white

animate-pulse

"

style={{


top:`${Math.random()*100}%`,


left:`${Math.random()*100}%`,


}}


/>


)

)}


</div>









{/* CONTENT */}



<div

className="

relative

z-10

flex

h-full

flex-col

justify-between

"

>






<div>


<div

className="

inline-flex

items-center

gap-2

rounded-full

bg-white/10

px-4

py-2

backdrop-blur

"

>


<Sparkles size={16}/>


TraceX World Active


</div>






<h1

className="

mt-6

text-5xl

font-black

"

>


{world?.icon}


{" "}


{world?.name}


</h1>





</div>









<div>


<div

className="

flex

items-center

gap-3

text-xl

font-bold

"

>


<Quote />


{quote}


</div>







<div

className="

mt-8

flex

items-center

gap-2

text-sm

opacity-80

"

>


<Users size={16}/>


{world?.online}


{" "}

students focusing


</div>



</div>







</div>





</div>


);


}