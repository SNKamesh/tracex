"use client";

import { useState } from "react";

import {

Award,

Brain,

Clock,

Flame,

RefreshCcw,

Save,

Target,

TrendingUp,

Loader2,

CheckCircle2,

} from "lucide-react";


import { auth } from "@/lib/firebase";

import { api } from "@/lib/api";







interface Props {

seconds:number;

onRestart:()=>void;

}









function formatTime(seconds:number){


const h =
Math.floor(seconds / 3600);


const m =
Math.floor((seconds % 3600) / 60);



return `${h}h ${m}m`;


}









export default function SessionSummary({

seconds,

onRestart,

}:Props){







const [saving,setSaving] =

useState(false);




const [saved,setSaved] =

useState(false);




const [error,setError] =

useState("");








const focusScore = 94;


const distractions = 2;



const rank =

focusScore >= 90

?

"S+"

:

"A";











async function saveSession(){



try{


setSaving(true);


setError("");





const user =

auth.currentUser;





if(!user){



throw new Error(

"Login required"

);


}







const token =

await user.getIdToken();








await api.post(

"/api/sessions",

{

durationSeconds:

seconds,


focusScore,


distractions,


rank,


endedAt:

Date.now(),


},


token


);







setSaved(true);





}

catch(err){



console.error(err);



setError(

"Could not save session. Try again."

);



}

finally{


setSaving(false);


}



}













return(


<div

className="

min-h-[75vh]

flex

items-center

justify-center

"

>








<section


className="

w-full

max-w-4xl

rounded-[36px]

border

p-10

"

style={{



background:

"var(--surface)",



borderColor:

"var(--border)"



}}

>









<div

className="text-center"

>





<div

className="

mx-auto

mb-5

flex

h-20

w-20

items-center

justify-center

rounded-full

bg-green-500/10

"

>



<Award

size={42}

color="#22c55e"

/>



</div>









<h1

className="

text-5xl

font-black

"

>


Focus Complete


</h1>








<p

className="mt-3"

style={{color:"var(--muted)"}}

>


TraceX analyzed your focus performance


</p>







</div>












<div

className="

mt-10

grid

grid-cols-2

gap-5

lg:grid-cols-4

"

>










<div className="summary-card">

<Clock/>

<h2>{formatTime(seconds)}</h2>

<p>Duration</p>

</div>









<div className="summary-card">

<Brain/>

<h2>{focusScore}%</h2>

<p>Focus</p>

</div>









<div className="summary-card">

<Target/>

<h2>{distractions}</h2>

<p>Breaks</p>

</div>









<div className="summary-card">

<Flame/>

<h2>{rank}</h2>

<p>Rank</p>

</div>










</div>












<div

className="

mt-8

rounded-3xl

border

p-6

"

>





<div className="flex gap-3">


<TrendingUp/>




<div>


<h3 className="font-black">

TraceX AI Insight

</h3>





<p

className="mt-2"

style={{color:"var(--muted)"}}

>


Your Focus DNA improved.

Keep building consistent deep work sessions.


</p>




</div>



</div>




</div>









{error && (


<p className="mt-5 text-red-400 text-sm">


{error}


</p>


)}










<div

className="

mt-8

flex

gap-4

"

>









<button


disabled={saving || saved}


onClick={saveSession}


className="

flex-1

rounded-xl

py-4

font-bold

disabled:opacity-50

"


style={{



background:

"var(--primary)",



color:"white"



}}

>





{


saving

?


<Loader2 className="inline mr-2 animate-spin"/>


:


saved

?


<CheckCircle2 className="inline mr-2"/>


:


<Save className="inline mr-2"/>


}




{


saved

?

"Saved"

:

saving

?

"Saving..."

:

"Save Session"


}




</button>










<button


onClick={onRestart}


className="

flex-1

rounded-xl

border

py-4

font-bold

"

>



<RefreshCcw

className="inline mr-2"

/>



New Session



</button>








</div>









</section>





</div>


);


}