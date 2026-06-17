"use client";

export default function AdsBanner({

  visible = true,

}: {

  visible?: boolean;

}) {


if(!visible)

return null;




return(


<div


style={{


background:

"var(--surface)",


borderColor:

"var(--border)",


color:

"var(--muted)",


boxShadow:

"var(--shadow-sm)",


}}


className="


my-4


rounded-[var(--radius-md)]


border


px-4

py-3


text-center


text-sm



backdrop-blur-xl



animate-[fadeIn_0.35s_ease]


transition-all


duration-300



hover:-translate-y-[2px]


"

>



<span>


🔔 Ads display only for Freemium users.


{" "}


<span


style={{

color:

"var(--primary)"

}}


className="font-medium"


>


Upgrade to remove ads.


</span>



</span>




</div>


);


}