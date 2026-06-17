"use client";

import { useState } from "react";

import {

Music,

Volume2,

VolumeX,

CloudRain,

Flame,

Coffee,

Orbit,

Headphones,

} from "lucide-react";





const sounds = [


{
id:"lofi",
name:"Lo-Fi Beats",
icon:Headphones,
defaultVolume:60,
},


{
id:"rain",
name:"Rain",
icon:CloudRain,
defaultVolume:45,
},


{
id:"library",
name:"Library",
icon:Coffee,
defaultVolume:35,
},


{
id:"space",
name:"Space Hum",
icon:Orbit,
defaultVolume:50,
},


{
id:"fire",
name:"Fireplace",
icon:Flame,
defaultVolume:40,
},


];










export default function AmbientEngine(){



const [enabled,setEnabled] =

useState(true);




const [volumes,setVolumes] =

useState<Record<string,number>>(

Object.fromEntries(

sounds.map(

s=>[s.id,s.defaultVolume]

)

)

);









function changeVolume(

id:string,

value:number

){


setVolumes(

prev=>({

...prev,

[id]:value

})

);


}











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









{/* HEADER */}


<div

className="

flex

items-center

justify-between

"

>



<div>



<Music />



<h3

className="

font-black

mt-3

"

>

Ambient Engine

</h3>




<p

className="text-sm"

style={{

color:"var(--muted)"

}}

>


Design your focus atmosphere


</p>




</div>








<button

onClick={()=>setEnabled(!enabled)}

className="

rounded-xl

border

p-3

transition

hover:scale-105

"

>



{

enabled

?

<Volume2 size={18}/>

:

<VolumeX size={18}/>

}



</button>





</div>











{/* MIXER */}



<div

className="

mt-6

space-y-5

"

>




{sounds.map(sound=>{


const Icon = sound.icon;




return(

<div

key={sound.id}

>


<div

className="

mb-2

flex

items-center

justify-between

text-sm

"

>




<div

className="

flex

items-center

gap-2

"

>


<Icon size={16}/>


<span>


{sound.name}


</span>


</div>





<span>


{

enabled

?

volumes[sound.id]+"%"

:

"OFF"


}


</span>





</div>








<input


type="range"


min="0"


max="100"


disabled={!enabled}


value={volumes[sound.id]}



onChange={(e)=>

changeVolume(

sound.id,

Number(e.target.value)

)

}



className="

w-full

accent-cyan-400

cursor-pointer

"


/>



</div>


);


})}






</div>








</div>


);



}