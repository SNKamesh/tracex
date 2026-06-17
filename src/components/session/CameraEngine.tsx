"use client";

import {

useEffect,

useRef,

useState,

} from "react";


import {

Camera,

Eye,

ShieldCheck,

AlertTriangle,

Activity,

Video,

VideoOff,

} from "lucide-react";






type FocusState =

"focused"

|

"away"

|

"distracted";









export default function CameraEngine(){



const videoRef =

useRef<HTMLVideoElement | null>(null);



const streamRef =

useRef<MediaStream | null>(null);




const lastActivity =

useRef(Date.now());






const [enabled,setEnabled] =

useState(false);



const [focus,setFocus] =

useState<FocusState>("focused");



const [confidence,setConfidence] =

useState(100);



const [awayTime,setAwayTime] =

useState(0);



const [cameraError,setCameraError] =

useState("");













async function startCamera(){


try{


setCameraError("");



const stream =

await navigator.mediaDevices.getUserMedia({

video:{

width:1280,

height:720,

facingMode:"user",

},

audio:false,

});





streamRef.current = stream;





if(videoRef.current){


videoRef.current.srcObject = stream;


await videoRef.current.play();


}





setEnabled(true);



}

catch(error){



console.error(error);



setCameraError(

"Camera access blocked"

);



}


}












/* USER ACTIVITY */


useEffect(()=>{



function active(){


lastActivity.current = Date.now();


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












/* MICROSTRICT ENGINE */


useEffect(()=>{


if(!enabled)

return;





const interval =

setInterval(()=>{





const idle =

Date.now()

-

lastActivity.current;





const tabHidden =

document.hidden;






if(

tabHidden ||

idle > 30000

){



setFocus("distracted");


setConfidence(40);



setAwayTime(

v=>v+5

);



}




else if(

idle > 15000

){



setFocus("away");



setConfidence(75);



}




else{



setFocus("focused");



setConfidence(98);



setAwayTime(0);



}




},5000);






return()=>clearInterval(interval);




},[enabled]);












/* CAMERA CLEANUP */


useEffect(()=>{


return()=>{


streamRef.current

?.getTracks()

.forEach(

track=>track.stop()

);


};


},[]);












return(

<section


className="

rounded-[32px]

border

p-5

overflow-hidden

"

style={{


background:

"var(--surface)",


borderColor:

"var(--border)",


}}

>










{/* HEADER */}



<div

className="

flex

items-center

justify-between

mb-5

"

>





<div>



<h2

className="

font-black

text-xl

"

>


MicroStrict Vision


</h2>





<p

className="text-sm"

style={{

color:"var(--muted)"

}}

>


AI focus guardian active


</p>




</div>






{


enabled

?


<Video color="#22c55e"/>

:


<VideoOff color="#64748b"/>


}





</div>













{/* VIDEO */}


<div

className="

relative

aspect-video

rounded-3xl

overflow-hidden

bg-black

"

>






<video


ref={videoRef}


autoPlay


muted


playsInline


className="

absolute

inset-0

h-full

w-full

object-cover

scale-x-[-1]

"

/>










{/* HUD */}


{

enabled &&


<div

className="

absolute

top-4

left-4

rounded-full

bg-black/50

backdrop-blur

px-4

py-2

text-xs

text-green-400

"

>


● TRACKING


</div>


}











{


!enabled &&


<div

className="

absolute

inset-0

flex

items-center

justify-center

"

>



<button


onClick={startCamera}


className="

flex

items-center

gap-2

rounded-xl

px-6

py-3

font-bold

transition

hover:scale-105

"

style={{


background:

"linear-gradient(135deg,#2563eb,#06b6d4)",


color:"white",


}}

>



<Camera size={18}/>



Enable Vision



</button>



</div>


}






</div>











{

cameraError &&


<p

className="

text-red-400

text-sm

mt-3

"

>


{cameraError}


</p>


}












{/* STATS */}


<div

className="

grid

grid-cols-3

gap-3

mt-5

"

>






<div className="vision-card">


<Eye size={16}/>


<p>State</p>


<h3>

{focus}

</h3>


</div>







<div className="vision-card">


<ShieldCheck size={16}/>


<p>Trust</p>


<h3>

{confidence}%

</h3>


</div>







<div className="vision-card">


<Activity size={16}/>


<p>Away</p>


<h3>

{awayTime}s

</h3>


</div>






</div>






</section>

);


}