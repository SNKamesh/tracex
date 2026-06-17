"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { Camera } from "lucide-react";

import {
  FaceDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";



type Status =
| "focused"
| "checking"
| "away";



type Props={

mode:
"preview" |
"strict";

view?:
"normal" |
"mirror";

onUpdate?:(data:{
status:Status;
away:number;
})=>void;

onVisionLost?:()=>void;
onVisionBack?:()=>void;

};






export default function CameraEngine({

mode,
view="normal",
onUpdate,
onVisionLost,
onVisionBack,

}:Props){





const videoRef =
useRef<HTMLVideoElement|null>(null);


const streamRef =
useRef<MediaStream|null>(null);


const detector =
useRef<FaceDetector|null>(null);


const missingSince =
useRef<number|null>(null);


const lost =
useRef(false);





const [enabled,setEnabled] =
useState(false);


const [ready,setReady] =
useState(false);


const [status,setStatus] =
useState<Status>("checking");


const [away,setAway] =
useState(0);









async function loadAI(){


if(
mode==="preview" ||
detector.current
)
return;



const vision =
await FilesetResolver.forVisionTasks(
"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
);




detector.current =
await FaceDetector.createFromOptions(
vision,
{

baseOptions:{

modelAssetPath:
"https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite"

},


runningMode:"VIDEO",


}

);



setReady(true);


}









async function startCamera(){



const stream =
await navigator.mediaDevices.getUserMedia({


video:{

width:1280,
height:720,
facingMode:"user",

},


audio:false,


});




streamRef.current =
stream;




stream
.getVideoTracks()[0]
.onended=()=>{


lost.current=true;


onVisionLost?.();


};






if(videoRef.current){


videoRef.current.srcObject =
stream;



await videoRef.current.play();


}






await loadAI();



setEnabled(true);




if(lost.current){


lost.current=false;


onVisionBack?.();


}



}









useEffect(()=>{



if(
mode!=="strict" ||
!enabled ||
!ready
)
return;





const ai =
setInterval(()=>{



const video =
videoRef.current;


const track =
streamRef.current
?.getVideoTracks()[0];




if(
!track ||
track.readyState!=="live"
){



if(!lost.current){


lost.current=true;


onVisionLost?.();


}


return;


}






if(
!video ||
video.readyState<2 ||
video.videoWidth<=0 ||
video.videoHeight<=0
)
return;






let face=false;




try{


const result =
detector.current
?.detectForVideo(
video,
performance.now()
);



face =
(result?.detections.length ?? 0)
>
0;


}

catch{


return;


}








if(face){


missingSince.current=null;


setStatus("focused");


return;


}







if(!missingSince.current){


missingSince.current=
Date.now();


setStatus("checking");


return;


}





const missing =
Date.now()
-
missingSince.current;






if(missing>18000){


setStatus("away");


setAway(
Math.floor(missing/1000)
);


}

else{


setStatus("checking");


}





},1000);




return()=>clearInterval(ai);



},[
mode,
enabled,
ready,
onVisionLost
]);









useEffect(()=>{


onUpdate?.({

status,
away,

});


},[
status,
away,
onUpdate
]);










useEffect(()=>{


return()=>{


streamRef.current
?.getTracks()
.forEach(t=>t.stop());


};


},[]);










return(

<div

className={

view==="mirror"

?

`
absolute
inset-0
bg-black
`

:

`
relative
overflow-hidden
rounded-2xl
bg-black
`

}

>




<video

ref={videoRef}

autoPlay
muted
playsInline

className={

view==="mirror"

?

`
h-full
w-full
object-cover
scale-x-[-1]
`

:

`
w-full
aspect-video
object-cover
scale-x-[-1]
`

}

/>






{
!enabled &&


<button

onClick={startCamera}

className="
absolute
inset-0

flex
items-center
justify-center

gap-2

bg-black/50

backdrop-blur

font-black

text-white
"

>


<Camera size={18}/>


Enable Vision


</button>


}





</div>

);

}