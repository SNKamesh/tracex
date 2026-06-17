"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";


import {
  ShieldCheck,
  Eye,
  TimerOff,
  Music,
  Sparkles,
  AlertTriangle,
  LogOut,
} from "lucide-react";


import CameraEngine from "./CameraEngine";





type Props={

onClose:()=>void;

};



type Panel =
null |
"music" |
"motivation";






function format(sec:number){


const h =
Math.floor(sec/3600);


const m =
Math.floor((sec%3600)/60);


const s =
sec%60;



return (

String(h).padStart(2,"0")
+
":"
+
String(m).padStart(2,"0")
+
":"
+
String(s).padStart(2,"0")

);


}








export default function MicroStrictRoom({
onClose,
}:Props){





const roomRef =
useRef<HTMLDivElement|null>(null);



const awayPenalty =
useRef(false);



const ending =
useRef(false);






const [time,setTime] =
useState(0);


const [trust,setTrust] =
useState(100);


const [away,setAway] =
useState(0);


const [tabs,setTabs] =
useState(0);


const [guardianLock,setGuardianLock] =
useState(false);


const [lostTimer,setLostTimer] =
useState(10);


const [finished,setFinished] =
useState(false);


const [panel,setPanel] =
useState<Panel>(null);









function endSession(){


ending.current=true;


setFinished(true);



if(document.fullscreenElement){

document.exitFullscreen();

}


}









/*
FULLSCREEN GUARD
*/

useEffect(()=>{


const open =
setTimeout(()=>{


roomRef.current
?.requestFullscreen()
.catch(()=>{});


},300);





function check(){


if(
!document.fullscreenElement &&
!ending.current
){


setGuardianLock(true);


}


}




document.addEventListener(
"fullscreenchange",
check
);



return()=>{


clearTimeout(open);


document.removeEventListener(
"fullscreenchange",
check
);


};


},[]);









/*
VERIFIED TIMER
*/

useEffect(()=>{


if(
guardianLock ||
finished
)
return;




const timer =
setInterval(()=>{


setTime(v=>v+1);


},1000);




return()=>clearInterval(timer);



},[
guardianLock,
finished
]);










/*
RECOVERY TIMER
*/

useEffect(()=>{


if(!guardianLock){


setLostTimer(10);

return;


}




const count =
setInterval(()=>{


setLostTimer(v=>{


if(v<=1){


clearInterval(count);


endSession();


return 0;


}



return v-1;


});


},1000);





return()=>clearInterval(count);



},[
guardianLock
]);










/*
TAB TRACK
*/

useEffect(()=>{


function check(){


if(
document.hidden &&
!finished
){


setTabs(v=>v+1);


setTrust(v=>

Math.max(
0,
v-1
)

);


}


}



document.addEventListener(
"visibilitychange",
check
);



return()=>{


document.removeEventListener(
"visibilitychange",
check
);


};


},[
finished
]);










return(

<>


<div

ref={roomRef}

className="
fixed
inset-0

z-[9999]

overflow-hidden

bg-black

text-white
"

>{/* FULL CAMERA WORLD */}

<CameraEngine

mode="strict"

view="mirror"


onVisionLost={()=>{


setGuardianLock(true);


}}


onVisionBack={()=>{


setGuardianLock(false);


}}




onUpdate={(d)=>{


setAway(d.away);



if(d.status==="away"){


if(!awayPenalty.current){


awayPenalty.current=true;


setTrust(v=>

Math.max(
0,
v-2
)

);


}


}





if(d.status==="focused"){


awayPenalty.current=false;



setTrust(v=>

Math.min(
100,
v+0.01
)

);


}


}}


/>









{/* TOP CONTROLS */}

<div className="
absolute

top-8
right-8

z-20

flex
items-center
gap-3
">



<button

onClick={()=>setPanel("music")}

className="
h-12
w-12

rounded-full

bg-black/25

backdrop-blur-xl

flex
items-center
justify-center
"

>

<Music size={18}/>

</button>






<button

onClick={()=>setPanel("motivation")}

className="
h-12
w-12

rounded-full

bg-black/25

backdrop-blur-xl

flex
items-center
justify-center
"

>

<Sparkles size={18}/>

</button>






<button

onClick={endSession}

className="
ml-3

rounded-full

px-6
py-3

bg-black/30

backdrop-blur-xl

font-black
"

>

<LogOut
size={15}
className="inline mr-2"
/>

End Session

</button>


</div>









{/* BOTTOM HUD */}

<div className="
absolute

bottom-8

left-1/2

-translate-x-1/2

z-20


flex

items-center

gap-10


rounded-full

bg-black/25

backdrop-blur-xl


px-10
py-4

font-semibold
">


<span>

{format(time)}

</span>




<span className="
flex
items-center
gap-2
">

<ShieldCheck size={16}/>

{Math.round(trust)}%

</span>





<span className="
flex
items-center
gap-2
">

<Eye size={16}/>

{format(away)}

</span>





<span className="
flex
items-center
gap-2
">

<TimerOff size={16}/>

{tabs}

</span>


</div>











{/* SIDE PANEL */}

{

panel &&


<div className="
absolute

right-8

top-24

z-30

w-80


rounded-[30px]


bg-black/40

backdrop-blur-2xl


p-6
">



<h2 className="
capitalize

text-xl

font-black
">

{panel}

</h2>




{

panel==="music"

?

<p className="
mt-5
opacity-70
">

Focus sounds coming soon 🎵

</p>


:


<p className="
mt-5
opacity-70
">

Stay consistent. Small progress compounds ✨

</p>


}





<button

onClick={()=>setPanel(null)}

className="
mt-8

opacity-60
"

>

Close

</button>



</div>


}










{/* GUARDIAN LOCK */}

{

guardianLock &&


<div className="
absolute

inset-0

z-50


bg-black/80

backdrop-blur-xl


flex

items-center

justify-center
">



<div className="text-center">


<AlertTriangle

size={60}

className="mx-auto"

/>




<h1 className="
text-3xl

font-black

mt-5
">

Focus Interrupted

</h1>




<p className="
mt-3

opacity-70
">

Verified timer paused

</p>





<button

onClick={()=>{


roomRef.current
?.requestFullscreen()
.then(()=>{


setGuardianLock(false);


});


}}

className="
mt-8

rounded-full

bg-white

text-black

px-8

py-4

font-black
"

>

Return to Focus

</button>





<h2 className="
mt-6

text-5xl

font-black
">

{lostTimer}

</h2>


</div>



</div>


}





</div>











{/* FINAL REPORT */}

{

finished &&


<div className="
fixed
inset-0

z-[99999]

bg-black/80

flex
items-center
justify-center

text-white
">



<div className="
w-96

rounded-[35px]

bg-slate-900

p-8
">


<h1 className="
text-3xl

font-black
">

Session Complete 🔥

</h1>



<p className="mt-6">

Focus: {format(time)}

</p>


<p>

Trust: {Math.round(trust)}%

</p>


<p>

Away: {format(away)}

</p>


<p>

Tabs: {tabs}

</p>






<button

onClick={onClose}

className="
mt-8

w-full

rounded-2xl

bg-blue-500

py-4

font-black
"

>

Finish

</button>


</div>


</div>


}



</>

);

}