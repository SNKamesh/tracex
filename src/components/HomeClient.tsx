"use client";

import { useEffect, useMemo, useState } from "react";
import AdsBanner from "./AdsBanner";
import AppShell from "./AppShell";
import Button from "./Button";
import PageHeader from "./PageHeader";
import SectionCard from "./SectionCard";
import StatCard from "./StatCard";
import StudyPlanList from "./StudyPlanList";
import Toggle from "./Toggle";


const recentItems = [
  "Calculus Notes.pdf",
  "Organic Chemistry Session",
  "Week 6 Study Plan",
  "NoteX: Biology Mind Map",
];


const stats = [
  { label:"Today's Hours", value:"3h 20m" },
  { label:"Focus Hours", value:"2h 45m" },
  { label:"Distraction Hours", value:"0h 35m" },
  { label:"Total Hours", value:"28h 10m" },
  { label:"Streak", value:"12 days" },
];


type OnboardingData = {
  name?: string;
  studyType?: string;
  tracexId?: string;
};


function greetingByHour(hour:number){

  if(hour < 12) return "Good Morning";

  if(hour < 17) return "Good Afternoon";

  return "Good Evening";

}


function generateTracexId(){

const chars =
"ABCDEFGHJKLMNPQRSTUVWXYZ23456789";


return (

"TRX-" +

Array.from(

{length:6},

()=>chars[
Math.floor(
Math.random()*chars.length
)
]

).join("")

);

}




export default function HomeClient(){


const [isPremium,setIsPremium] =
useState(false);



const [onboarding,setOnboarding] =
useState<OnboardingData>({});



const [loaded,setLoaded] =
useState(false);



const [idCopied,setIdCopied] =
useState(false);



const [copyError,setCopyError] =
useState("");






useEffect(()=>{


let cancelled=false;



async function init(){



const {auth,db} =
await import("@/lib/firebase");


const {
onAuthStateChanged
} =
await import("firebase/auth");



const {

doc,
getDoc,
setDoc,
updateDoc,
collection,
query,
where,
getDocs

} =
await import("firebase/firestore");





onAuthStateChanged(

auth,

async(user)=>{



if(!user || cancelled)

return;




try{


const userRef =
doc(
db,
"users",
user.uid
);



const snap =
await getDoc(userRef);



let data:any = {};



if(snap.exists()){


data=snap.data();


}else{


const stored =
localStorage.getItem(
`tracex:onboarding:${user.uid}`
);


if(stored)

data=JSON.parse(stored);


}




if(!data.tracexId){



let tracexId =
generateTracexId();



let unique=false;




while(!unique){


const existing =
await getDocs(

query(

collection(db,"users"),

where(
"tracexId",
"==",
tracexId
)

)

);



if(existing.empty)

unique=true;


else

tracexId=
generateTracexId();


}





if(snap.exists()){



await updateDoc(

userRef,

{
tracexId
}

);



}else{



await setDoc(

userRef,

{

name:data.name || "",

studyType:
data.studyType || "",

email:
user.email ?? "",

tracexId,

createdAt:
Date.now()

}

);


}




data.tracexId =
tracexId;



localStorage.setItem(

`tracex:onboarding:${user.uid}`,

JSON.stringify(data)

);



}





if(!cancelled){


setOnboarding({

name:data.name,

studyType:data.studyType,

tracexId:data.tracexId

});


setLoaded(true);


}




}catch(e){


console.error(e);


if(!cancelled)

setLoaded(true);


}



}

);


}



init();



return()=>{

cancelled=true;

};



},[]);






const greeting =

useMemo(

()=>greetingByHour(

new Date().getHours()

),

[]

);





const title =

loaded

?

`${greeting}, ${onboarding.name || "Scholar"}`

:

greeting;





const subtitle =

onboarding.studyType

?

`${onboarding.studyType} learner • TraceX dashboard is active.`

:

"TraceX dashboard is active.";







function handleCopyId(){


if(!onboarding.tracexId){


setCopyError(
"ID not available yet."
);


return;


}



navigator.clipboard.writeText(

onboarding.tracexId

);



setIdCopied(true);



setTimeout(

()=>setIdCopied(false),

2000

);


}







return(


<AppShell>



<PageHeader


title={title}


subtitle={subtitle}


rightSlot={

<Toggle

checked={isPremium}

onChange={setIsPremium}

label="Premium"

/>

}


/>







<div className="flex items-center gap-2 -mt-2 mb-1">



<span

style={{color:"var(--muted)"}}

className="text-xs"

>

TraceX ID:

</span>





{loaded && onboarding.tracexId && (


<>


<span


style={{


background:

"color-mix(in srgb,var(--primary),transparent 88%)",


color:

"var(--primary)",


border:

"1px solid var(--border)",


letterSpacing:

"0.06em"


}}


className="

text-xs

font-mono

font-semibold

px-2

py-0.5

rounded-md

"

>


{onboarding.tracexId}


</span>




<button


onClick={handleCopyId}


className="text-xs"


style={{

color:"var(--muted)"

}}

>


Copy


</button>


</>


)}



</div>






<div className="h-4 mb-3">


{idCopied && (

<p className="text-xs text-green-400">

Copied!

</p>

)}



{copyError && (

<p className="text-xs text-red-500">

{copyError}

</p>

)}


</div>






<div className="grid gap-4 lg:grid-cols-3">



{stats.map(

s=>

<StatCard

key={s.label}

label={s.label}

value={s.value}

/>

)}



</div>






<AdsBanner visible={!isPremium}/>






<SectionCard

title="Today's Study Plan"

description="Add, edit, delete, reorder — syncs instantly."

>


<StudyPlanList/>


</SectionCard>








<SectionCard

title="Quick Actions"

description="Open focus tools instantly."

>


<div className="flex flex-wrap gap-3">


<Button>

Solo Session

</Button>


<Button variant="secondary">

Create Session

</Button>


<Button variant="secondary">

Join Session

</Button>


<Button variant="secondary">

NoteX Bot

</Button>



</div>


</SectionCard>








<SectionCard

title="Recently Opened"

description="Resume your recent work fast."

>


<div className="grid gap-3 md:grid-cols-2">


{recentItems.map(

item=>(


<div


key={item}


style={{


background:

"var(--surface-solid)",


borderColor:

"var(--border)"


}}


className="

flex

justify-between

rounded-xl

border

px-4

py-3


transition-all

duration-300


hover:-translate-y-1

"

>


<span

style={{

color:"var(--text)"

}}

className="text-sm"

>

{item}

</span>


<span className="chip">

Open

</span>



</div>


)

)}



</div>


</SectionCard>




</AppShell>


);


}