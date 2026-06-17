"use client";

import {

useEffect,

useState,

useRef,

} from "react";


import {

Brain,

ShieldCheck,

AlertTriangle,

MousePointer2,

Keyboard,

EyeOff,

} from "lucide-react";






type FocusState =

"Flow"

|

"Active"

|

"Away"

|

"Distracted";









export default function MicroStrictTracker(){



const [score,setScore] =

useState(100);



const [state,setState] =

useState<FocusState>("Flow");



const [tabSwitches,setTabSwitches] =

useState(0);



const [idle,setIdle] =

useState(0);



const lastActivity =

useRef(Date.now());











/* ACTIVITY TRACKER */


useEffect(()=>{



function active(){


lastActivity.current =

Date.now();



setIdle(0);


}




window.addEventListener(

"mousemove",

active

);



window.addEventListener(

"keydown",

active

);




return()=>{


window.removeEventListener(

"mousemove",

active

);


window.removeEventListener(

"keydown",

active

);


};



},[]);











/* TAB TRACKER */


useEffect(()=>{



function checkTab(){



if(

document.hidden

){



setTabSwitches(v=>v+1);



setScore(v=>

Math.max(

0,

v-5

)

);



}



}




document.addEventListener(

"visibilitychange",

checkTab

);





return()=>{


document.removeEventListener(

"visibilitychange",

checkTab

);


};



},[]);












/* SCORE ENGINE */


useEffect(()=>{



const engine =

setInterval(()=>{



const idleSeconds =


Math.floor(

(Date.now()-lastActivity.current)

/1000

);



setIdle(idleSeconds);






if(

idleSeconds>120

){


setState(

"Distracted"

);


setScore(v=>

Math.max(

0,

v-10

)

);


}



else if(

idleSeconds>45

){


setState(

"Away"

);


}



else if(

score>90

){


setState(

"Flow"

);


}



else{


setState(

"Active"

);


}




},5000);





return()=>clearInterval(engine);



},[score]);












return(


<div


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








<div

className="flex justify-between"

>





<div>


<Brain />



<h3

className="

font-black

mt-3

"

>


MicroStrict Tracker


</h3>




</div>







{


state==="Flow"

?


<ShieldCheck

color="#22c55e"

/>


:


<AlertTriangle

color="#f59e0b"

/>


}







</div>












<div

className="mt-6"

>




<p

className="

text-5xl

font-black

"

>


{score}%


</p>





<p

style={{


color:

"var(--muted)"


}}

>


{state} State


</p>





</div>













<div

className="

grid

grid-cols-3

gap-3

mt-6

text-center

"

>






<div

className="

rounded-xl

border

p-3

"

>


<EyeOff

size={16}

className="mx-auto"

/>


<p className="text-xl font-bold">


{tabSwitches}


</p>


<small>

Tabs

</small>


</div>









<div

className="

rounded-xl

border

p-3

"

>


<MousePointer2

size={16}

className="mx-auto"

/>


<p className="text-xl font-bold">


{idle}s


</p>


<small>

Idle

</small>


</div>










<div

className="

rounded-xl

border

p-3

"

>


<Keyboard

size={16}

className="mx-auto"

/>


<p className="text-xl font-bold">


ON


</p>


<small>

Input

</small>


</div>







</div>






</div>


);


}