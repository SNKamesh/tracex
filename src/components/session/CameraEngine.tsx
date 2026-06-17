"use client";


import {

useEffect,

useRef,

useState

} from "react";


import {

Camera,

Eye,

ShieldCheck,

AlertTriangle,

} from "lucide-react";





type FocusState =

"focused"

|

"away"

|

"distracted";







export default function CameraEngine(){



const videoRef =

useRef<HTMLVideoElement>(null);



const [enabled,setEnabled] =

useState(false);



const [focus,setFocus] =

useState<FocusState>("focused");



const [missingSeconds,setMissingSeconds] =

useState(0);



const [confidence,setConfidence] =

useState(100);









/* START CAMERA */



async function startCamera(){


try{


const stream =

await navigator.mediaDevices.getUserMedia({

video:true,

audio:false,

});



if(videoRef.current){


videoRef.current.srcObject = stream;


}



setEnabled(true);



}

catch(err){


console.error(

"Camera denied",

err

);


}



}









/*

TEMP MICROSTRICT ENGINE

later replace this logic with:

MediaPipe / TensorFlow

*/


useEffect(()=>{


if(!enabled)

return;





const interval =

setInterval(()=>{



/*

For now:

browser camera active = focused

later AI detection plugs here

*/


const detected =

videoRef.current &&

videoRef.current.readyState >= 2;





if(detected){



setMissingSeconds(0);


setConfidence(100);


setFocus("focused");



}

else{



setMissingSeconds(v=>{


const next = v+2;



if(next > 30){



setFocus("distracted");


setConfidence(30);



}


else if(next > 10){



setFocus("away");


setConfidence(70);



}



return next;



});



}




},2000);






return()=>clearInterval(interval);



},[enabled]);











return(



<div


className="

rounded-[32px]

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

className="

flex

items-center

justify-between

mb-5

"

>



<div>


<h2

className="font-black text-xl"

>


MicroStrict Vision


</h2>



<p

className="text-sm"

style={{

color:"var(--muted)"

}}

>


AI presence monitoring


</p>



</div>






{

focus==="focused"

?

<ShieldCheck color="#22c55e"/>

:

<AlertTriangle color="#f59e0b"/>


}




</div>











<div

className="

relative

overflow-hidden

rounded-3xl

bg-black

aspect-video

"

>






<video


ref={videoRef}


autoPlay


muted


playsInline


className="

h-full

w-full

object-cover

"


/>







{

!enabled &&



<button


onClick={startCamera}



className="

absolute

inset-0

m-auto

h-14

w-48

rounded-xl

font-bold

"


style={{


background:

"var(--primary)",


color:"white"


}}


>



<Camera

className="inline mr-2"

/>


Enable Vision


</button>


}





</div>









<div

className="

mt-5

grid

grid-cols-2

gap-3

"

>






<div

className="

rounded-xl

border

p-3

"

>



<Eye size={16}/>



<p className="mt-2 text-sm">


State


</p>




<h3

className="font-black capitalize"

>


{focus}


</h3>



</div>








<div

className="

rounded-xl

border

p-3

"

>



<p className="text-sm">


Confidence


</p>




<h3

className="text-2xl font-black"

>


{confidence}%


</h3>




</div>





</div>







</div>



);


}