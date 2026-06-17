"use client";

import { useEffect, useState } from "react";

import {
  Pause,
  Play,
  Square,
  Users,
  Timer,
} from "lucide-react";


import CameraEngine from "./CameraEngine";

import MicroStrictTracker from "./MicroStrictTracker";

import AmbientEngine from "./AmbientEngine";

import ImmersiveVirtualRoom from "./ImmersiveVirtualRoom";

import SessionSummary from "./SessionSummary";






interface Props {

  world?: {

    id:string;

    name:string;

    icon:string;

    description:string;

    online:number;

  };

}







function formatTime(seconds:number){


const h =
Math.floor(seconds / 3600);


const m =
Math.floor((seconds % 3600) / 60);


const s =
seconds % 60;



return (

`${String(h).padStart(2,"0")}`

+

":"

+

`${String(m).padStart(2,"0")}`

+

":"

+

`${String(s).padStart(2,"0")}`

);


}










export default function FocusRoom({

world

}:Props){






const [running,setRunning] =
useState(false);




const [seconds,setSeconds] =
useState(0);




const [finished,setFinished] =
useState(false);









/* TIMER ENGINE */


useEffect(()=>{


if(!running)

return;




const timer =

setInterval(()=>{


setSeconds(

v=>v+1

);


},1000);





return()=>clearInterval(timer);



},[running]);










function endSession(){


setRunning(false);


setFinished(true);


}









function restartSession(){



setSeconds(0);


setRunning(false);


setFinished(false);



}










if(finished){



return(

<SessionSummary


seconds={seconds}


onRestart={restartSession}


/>

);



}












return(

<div className="space-y-6">







{/* IMMERSIVE WORLD */}



<ImmersiveVirtualRoom

world={world}

/>











{/* MAIN GRID */}


<div


className="

grid

grid-cols-1

xl:grid-cols-[1fr_380px]

gap-6

"

>









{/* LEFT */}



<div

className="space-y-6"

>








<CameraEngine />









{/* TIMER CARD */}



<section


className="

rounded-[32px]

border

p-8

text-center

"

style={{


background:

"var(--surface)",



borderColor:

"var(--border)"


}}

>








<div


className="

inline-flex

items-center

gap-2

rounded-full

border

px-5

py-2

text-sm

mb-6

"

>



<Timer size={15}/>


Focus Session



</div>









<h1


className="

text-7xl

font-black

tracking-tight

"

>


{formatTime(seconds)}


</h1>









<p

className="mt-3 text-sm"

style={{

color:"var(--muted)"

}}

>


Stay locked in. TraceX is tracking your focus.


</p>










<div


className="

mt-10

flex

justify-center

gap-4

"

>









<button



onClick={()=>


setRunning(!running)


}



className="

flex

items-center

gap-2

rounded-xl

px-8

py-3

font-bold

transition

hover:scale-105

"



style={{



background:

"linear-gradient(135deg,#2563eb,#06b6d4)",



color:

"white"



}}



>







{

running

?

<Pause size={18}/>

:

<Play size={18}/>

}





{


running

?

"Pause"

:

"Start"


}





</button>










<button



onClick={endSession}



className="

flex

items-center

gap-2

rounded-xl

border

px-6

transition

hover:scale-105

"



>



<Square size={17}/>


End



</button>








</div>






</section>








</div>












{/* RIGHT */}



<div

className="space-y-5"

>









<MicroStrictTracker />









<section


className="

rounded-3xl

border

p-5

"


style={{



background:

"var(--surface)",



borderColor:

"var(--border)"



}}


>







<Users />





<h3

className="font-bold mt-3"

>


Live Focus Room


</h3>








<p

className="

text-4xl

font-black

mt-3

"

>


{world?.online ?? 0}


</p>








<p

className="text-sm mt-2"

style={{

color:"var(--muted)"

}}

>


students focusing with you


</p>







</section>










<AmbientEngine />










</div>







</div>






</div>


);


}