"use client";

import {
  Users,
  Sparkles,
} from "lucide-react";


interface Props {

name:string;

description:string;

online:number;

icon:string;

active:boolean;

onClick:()=>void;

}


export default function FocusWorldCard({

name,

description,

online,

icon,

active,

onClick,

}:Props){


return(

<button

onClick={onClick}

style={{

background:
active
?
"linear-gradient(135deg,rgba(59,130,246,.25),rgba(34,211,238,.15))"
:
"var(--surface)",

borderColor:
active
?
"var(--primary)"
:
"var(--border)"

}}

className="

group

rounded-3xl

border

p-6

text-left

transition-all

duration-300


hover:-translate-y-1

hover:shadow-xl

"


>


<div className="text-4xl mb-5 group-hover:scale-110 transition">

{icon}

</div>




<h3 className="text-xl font-bold">

{name}

</h3>



<p

className="text-sm mt-2"

style={{

color:"var(--muted)"

}}

>

{description}

</p>




<div className="mt-6 flex items-center justify-between">


<div className="flex gap-2 items-center text-sm">


<Users size={15}/>

{online.toLocaleString()} focusing


</div>




{active && (

<Sparkles size={18}/>

)}


</div>


</button>


);


}