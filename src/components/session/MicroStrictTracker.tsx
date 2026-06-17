"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";


import {
  Brain,
  EyeOff,
  Keyboard,
  MousePointer2,
  ShieldCheck,
  AlertTriangle,
  Activity,
} from "lucide-react";


import CameraEngine from "./CameraEngine";





export default function MicroStrictTracker(){


  const lastActivity =
    useRef(Date.now());


  const [tabSwitches,setTabSwitches] =
    useState(0);


  const [idleTime,setIdleTime] =
    useState(0);


  const [focusScore,setFocusScore] =
    useState(0);


  const [active,setActive] =
    useState(false);









  /*
    REAL ACTIVITY TRACKER
  */

  useEffect(()=>{


    function activity(){


      lastActivity.current =
        Date.now();


      setIdleTime(0);


      setActive(true);


    }




    const events = [

      "mousemove",

      "mousedown",

      "keydown",

      "scroll",

      "touchstart",

    ];




    events.forEach(

      e =>

      window.addEventListener(
        e,
        activity
      )

    );





    return()=>{


      events.forEach(

        e =>

        window.removeEventListener(
          e,
          activity
        )

      );


    };



  },[]);












  /*
    TAB SWITCH
  */

  useEffect(()=>{


    function visibility(){


      if(document.hidden){


        setTabSwitches(
          v=>v+1
        );


        setFocusScore(
          v=>Math.max(v-15,0)
        );


      }


    }




    document.addEventListener(

      "visibilitychange",

      visibility

    );





    return()=>{


      document.removeEventListener(

        "visibilitychange",

        visibility

      );


    };



  },[]);













  /*
    MICROSTRICT SCORE ENGINE
  */

  useEffect(()=>{



    const engine =

    setInterval(()=>{



      const idle =

      Math.floor(

        (Date.now()

        -

        lastActivity.current)

        /1000

      );




      setIdleTime(idle);





      if(idle > 30){



        setActive(false);



        setFocusScore(

          v =>

          Math.max(
            v-2,
            0
          )

        );



      }




      else{



        setActive(true);



        setFocusScore(

          v =>

          Math.min(
            v+1,
            100
          )

        );



      }



    },500);






    return()=>clearInterval(engine);



  },[]);













  return(


    <section

    className="
    rounded-[32px]
    border
    p-5
    space-y-5
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
      "
      >



        <div>


          <h2
          className="
          text-xl
          font-black
          flex
          gap-2
          items-center
          "
          >


            <Brain/>

            MicroStrict Guardian


          </h2>





          <p
          className="text-sm"
          style={{
            color:"var(--muted)"
          }}
          >

            Vision + activity integrity

          </p>



        </div>





        {


        active

        ?

        <ShieldCheck color="#22c55e"/>

        :

        <AlertTriangle color="#f59e0b"/>


        }



      </div>









      <CameraEngine />









      {/* SCORE */}


      <div
      className="
      rounded-2xl
      border
      p-5
      "
      >


        <p
        className="text-sm"
        >

          Focus Integrity

        </p>



        <h1
        className="
        text-5xl
        font-black
        "
        >

          {focusScore}%


        </h1>



      </div>










      {/* METRICS */}


      <div
      className="
      grid
      grid-cols-3
      gap-3
      "
      >





        <div className="rounded-xl border p-4">


          <EyeOff/>


          <h2 className="text-2xl font-black">

            {tabSwitches}

          </h2>


          <p className="text-sm">

            Tabs

          </p>



        </div>







        <div className="rounded-xl border p-4">


          <MousePointer2/>


          <h2 className="text-2xl font-black">

            {idleTime}s

          </h2>


          <p className="text-sm">

            Idle

          </p>


        </div>








        <div className="rounded-xl border p-4">


          {

          active

          ?

          <Keyboard/>

          :

          <Activity/>

          }



          <h2 className="text-xl font-black">


            {

            active

            ?

            "ON"

            :

            "OFF"

            }


          </h2>



          <p className="text-sm">

            Input

          </p>


        </div>






      </div>







    </section>


  );


}