"use client";


import {

useState

} from "react";


import {

Rocket,

Brain,

} from "lucide-react";


import FocusWorldCard from "./FocusWorldCard";

import FocusBoot from "./FocusBoot";

import FocusRoom from "./FocusRoom";





const worlds = [



{

id:"orbit",

name:"Orbit Station",

icon:"🌌",

online:1240,

description:
"Deep silent work with cosmic ambience."

},




{

id:"rain",

name:"Neo Library",

icon:"🌧️",

online:3200,

description:
"Rain, books and peaceful night energy."

},




{

id:"exam",

name:"Exam Arena",

icon:"⚡",

online:890,

description:
"High intensity competitive focus."

},




{

id:"zen",

name:"Zen Garden",

icon:"🍃",

online:560,

description:
"Relaxed mindful study sessions."

}



];










export default function FocusLobby(){





const [selected,setSelected] =

useState(

worlds[0]

);




const [phase,setPhase] =

useState<

"lobby"

|

"boot"

|

"room"

>(

"lobby"

);










/* BOOT SCREEN */


if(

phase==="boot"

){




return(



<FocusBoot


onComplete={()=>{


setPhase(

"room"

);


}}


/>



);



}










/* FOCUS ROOM */


if(

phase==="room"

){



return(


<FocusRoom

world={selected}

/>


);



}












return(


<div

className="space-y-10"

>










{/* HERO */}



<section


className="

relative

overflow-hidden

rounded-[32px]

border

p-10

"

style={{



background:

"linear-gradient(135deg,var(--surface),rgba(56,189,248,.12))",



borderColor:

"var(--border)"



}}


>









<div

className="

absolute

-right-20

-top-20

h-60

w-60

rounded-full

blur-[100px]

opacity-50

"

style={{


background:

"var(--primary)"


}}


/>










<div

className="relative z-10"

>





<div

className="

mb-4

flex

items-center

gap-3

"

>




<Rocket

size={22}

color="#38bdf8"

/>





<span

className="font-bold"

>


TraceX Focus Gateway


</span>




</div>










<h1

className="

text-5xl

font-black

tracking-tight

"

>


Enter your Focus Universe


</h1>








<p

className="

mt-4

max-w-xl

text-sm

leading-relaxed

"

style={{


color:

"var(--muted)"


}}


>



Select your world. TraceX prepares your focus,

ambience and AI productivity environment.



</p>






</div>





</section>













{/* WORLDS */}



<section>





<h2

className="

mb-5

text-2xl

font-black

"

>


Choose Focus World


</h2>








<div

className="

grid

grid-cols-1

gap-5

lg:grid-cols-2

"

>




{worlds.map(

world=>(




<FocusWorldCard


key={world.id}


{...world}


active={

selected.id===world.id

}



onClick={()=>


setSelected(world)


}



/>




)


)}






</div>





</section>














{/* SELECTED */}



<section


className="

rounded-[28px]

border

p-6

"

style={{



background:

"var(--surface)",



borderColor:

"var(--border)"



}}



>







<p

className="text-sm"

style={{


color:

"var(--muted)"


}}


>



Selected Environment



</p>








<h3

className="

mt-1

text-2xl

font-black

"

>



{selected.icon}


{" "}


{selected.name}



</h3>









<p

className="mt-2"

style={{


color:

"var(--muted)"


}}


>




{selected.online.toLocaleString()}


{" "}


learners focusing right now




</p>






</section>














{/* START */}



<button



onClick={()=>


setPhase(

"boot"

)


}




className="

w-full

rounded-2xl

py-5

text-lg

font-black


transition-all

duration-300


hover:scale-[1.01]

active:scale-[.98]

"



style={{



background:

"linear-gradient(135deg,#2563eb,#06b6d4)",



color:

"white"



}}



>






<Brain

className="

mr-2

inline

"

/>





Initialize Focus Session





</button>









</div>


);


}