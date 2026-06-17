"use client";

import { useEffect, useState } from "react";

import {
  Clock,
  Flag,
  GripVertical,
  Trash2,
} from "lucide-react";

import {
  DndContext,
  closestCenter,
  DragEndEvent,
} from "@dnd-kit/core";

import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";

import { CSS } from "@dnd-kit/utilities";

import { auth, db } from "@/lib/firebase";

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  writeBatch,
} from "firebase/firestore";



interface Task {
  id:string;
  text:string;
  priority?:"low"|"medium"|"high";
  reminderTime?:string;
  displayTime?:string;
  completed?:boolean;
  order?:number;
}




function SortableTask({
  task,
  remove,
  toggle,
}:{
  task:Task;
  remove:(id:string)=>void;
  toggle:(t:Task)=>void;
}){


const {
attributes,
listeners,
setNodeRef,
transform,
transition,
}=useSortable({
id:task.id
});



return (

<div

ref={setNodeRef}

style={{
transform:CSS.Transform.toString(transform),
transition,
background:"var(--surface)",
border:"1px solid var(--border)",
}}

className="
rounded-xl
p-4
flex
justify-between
items-center
"
>


<div className="flex gap-3 items-center">


<button
{...attributes}
{...listeners}
>

<GripVertical size={17}/>

</button>



<input

type="checkbox"

checked={task.completed || false}

onChange={()=>toggle(task)}

/>




<div>


<p

className={
task.completed
?
"line-through opacity-50"
:
"font-semibold"
}

>

{task.text}

</p>




<small style={{color:"var(--muted)"}}>

<Flag size={12} className="inline"/>

{" "}

{task.priority}

{" • "}

{task.displayTime || "No reminder"}

</small>



</div>


</div>





<button onClick={()=>remove(task.id)}>

<Trash2 size={16}/>

</button>




</div>

);

}









export default function StudyPlanList(){


const [uid,setUid] =
useState<string|null>(null);


const [items,setItems] =
useState<Task[]>([]);


const [task,setTask] =
useState("");


const [error,setError] =
useState("");



const [priority,setPriority] =
useState<"low"|"medium"|"high">(
"medium"
);



const [clock,setClock] =
useState(false);



const [hour,setHour] =
useState("06");

const [minute,setMinute] =
useState("00");


const [period,setPeriod] =
useState<"AM"|"PM">("PM");


const [savedTime,setSavedTime] =
useState("");


const [display,setDisplay] =
useState("");



const [alerted,setAlerted] =
useState<string[]>([]);







/* AUTH */


useEffect(()=>{


return auth.onAuthStateChanged(user=>{


if(user)

setUid(user.uid);


});


},[]);







/* FIRESTORE SYNC */


useEffect(()=>{


if(!uid)

return;



return onSnapshot(

query(

collection(
db,
"users",
uid,
"studyPlans"
),

orderBy("order")

),

snap=>{


setItems(

snap.docs.map(d=>({

id:d.id,

...d.data(),

})) as Task[]

);


}


);


},[uid]);










/* ALARM */


useEffect(()=>{


const timer=setInterval(()=>{


const now=new Date();


const current =

`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;




items.forEach(t=>{


if(

t.reminderTime===current &&

!alerted.includes(t.id)

){



new Audio("/alarm.mp3")
.play()
.catch(()=>{});



if(Notification.permission==="granted"){


new Notification(

"TraceX Reminder",

{

body:`${t.text} starts now`

}

);


}



setAlerted(a=>[...a,t.id]);


}


});


},20000);



return()=>clearInterval(timer);


},[items,alerted]);







useEffect(()=>{


if(

typeof Notification!=="undefined" &&

Notification.permission==="default"

)

Notification.requestPermission();


},[]);










function saveClock(){


let h=Number(hour);


if(period==="PM" && h!==12)

h+=12;


if(period==="AM" && h===12)

h=0;



setSavedTime(

`${String(h).padStart(2,"0")}:${minute}`

);



setDisplay(

`${hour.padStart(2,"0")}:${minute} ${period}`

);


setClock(false);


}










async function addTask(){


if(!uid)

return;



if(!task.trim()){



setError(

"Add a mission name before launching your focus block."

);



setTimeout(()=>{

setError("");

},3000);



return;


}




await addDoc(

collection(

db,

"users",

uid,

"studyPlans"

),

{


text:task.trim(),


priority,


reminderTime:savedTime,


displayTime:display,


completed:false,


order:Date.now(),


createdAt:serverTimestamp(),


}


);




setTask("");

setDisplay("");

setSavedTime("");

setError("");


}









async function toggle(t:Task){


if(!uid)return;



await updateDoc(

doc(

db,

"users",

uid,

"studyPlans",

t.id

),

{

completed:!t.completed

}

);


}









async function remove(id:string){


if(!uid)return;



await deleteDoc(

doc(

db,

"users",

uid,

"studyPlans",

id

)

);


}









async function dragEnd(e:DragEndEvent){



if(

!e.over ||

e.active.id===e.over.id

)

return;




const oldIndex=

items.findIndex(

i=>i.id===e.active.id

);



const newIndex=

items.findIndex(

i=>i.id===e.over?.id

);




const moved=

arrayMove(

items,

oldIndex,

newIndex

);



setItems(moved);




if(!uid)return;




const batch=

writeBatch(db);



moved.forEach((item,index)=>{


batch.update(

doc(

db,

"users",

uid,

"studyPlans",

item.id

),

{

order:index

}

);


});



await batch.commit();


}











return (

<div className="flex flex-col gap-5">





<div className="flex gap-3">


<input

value={task}

onChange={e=>{

setTask(e.target.value);

if(error)setError("");

}}

placeholder="Create focus mission..."

className="flex-1 rounded-xl px-4 py-3"

/>






<select

value={priority}

onChange={e=>

setPriority(e.target.value as any)

}

className="rounded-xl px-4"

>


<option value="high">
High Priority
</option>

<option value="medium">
Medium Priority
</option>

<option value="low">
Low Priority
</option>


</select>







<button

onClick={()=>setClock(true)}

className="tx-button"

>

<Clock size={17}/>

{display || "Focus Time"}

</button>






<button

onClick={addTask}

className="tx-button"

>

Add Task

</button>



</div>







{error && (

<p

style={{color:"var(--danger)"}}

className="text-sm font-medium animate-pulse"

>

{error}

</p>

)}









{clock && (


<div

className="
fixed
inset-0
z-[9999]
flex
items-center
justify-center
bg-black/60
backdrop-blur-sm
"

>


<div

style={{
background:"var(--surface-solid)"
}}

className="
rounded-2xl
p-6
w-80
"

>


<h2 className="font-bold mb-5">

Set Reminder

</h2>



<div className="flex gap-3">


<input

value={hour}

onChange={e=>setHour(e.target.value)}

className="w-20 p-3 rounded-xl text-center"

/>



<input

value={minute}

onChange={e=>setMinute(e.target.value)}

className="w-20 p-3 rounded-xl text-center"

/>




<button

onClick={()=>setPeriod(period==="AM"?"PM":"AM")}

>

{period}

</button>


</div>




<button

onClick={saveClock}

className="tx-button mt-5 w-full"

>

Save

</button>


</div>


</div>


)}










<DndContext

collisionDetection={closestCenter}

onDragEnd={dragEnd}

>


<SortableContext

items={items.map(i=>i.id)}

strategy={verticalListSortingStrategy}

>


<div className="flex flex-col gap-3">


{items.map(t=>(


<SortableTask

key={t.id}

task={t}

remove={remove}

toggle={toggle}

/>


))}


</div>


</SortableContext>


</DndContext>




</div>

);


}