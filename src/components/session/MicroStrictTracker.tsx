"use client";

import { useEffect, useState } from "react";

import {
  Brain,
  EyeOff,
  Keyboard,
  MousePointer2,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

import CameraEngine from "./CameraEngine";


export default function MicroStrictTracker() {


  const [tabSwitches, setTabSwitches] = useState(0);

  const [idleTime, setIdleTime] = useState(0);

  const [focusScore, setFocusScore] = useState(100);

  const [active, setActive] = useState(true);



  /*
    TAB SWITCH TRACKING
  */

  useEffect(() => {


    function handleVisibility() {


      if (document.hidden) {

        setTabSwitches((v) => v + 1);

        setFocusScore((v) =>
          Math.max(v - 10, 0)
        );

      }


    }


    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );


    return () =>
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );


  }, []);






  /*
    IDLE TRACKING
  */

  useEffect(() => {


    let seconds = 0;



    function reset() {

      seconds = 0;

      setIdleTime(0);

      setActive(true);

    }



    window.addEventListener(
      "mousemove",
      reset
    );


    window.addEventListener(
      "keydown",
      reset
    );



    const interval =
      setInterval(() => {


        seconds += 1;


        setIdleTime(seconds);



        if (seconds > 30) {


          setActive(false);


          setFocusScore((v) =>
            Math.max(v - 1, 0)
          );


        }


      }, 1000);




    return () => {


      clearInterval(interval);


      window.removeEventListener(
        "mousemove",
        reset
      );


      window.removeEventListener(
        "keydown",
        reset
      );


    };



  }, []);







  return (

    <div

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

            <Brain size={22} />

            MicroStrict Guardian

          </h2>



          <p

            className="text-sm"

            style={{

              color:
                "var(--muted)",

            }}

          >

            AI anti-distraction system

          </p>


        </div>





        {

          active ?

            <ShieldCheck color="#22c55e" />

            :

            <AlertTriangle color="#f59e0b" />


        }


      </div>








      {/* CAMERA */}


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

          style={{

            color:
              "var(--muted)",

          }}

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


          <EyeOff />


          <h2 className="text-2xl font-black">

            {tabSwitches}

          </h2>


          <p className="text-sm">

            Tabs

          </p>


        </div>






        <div className="rounded-xl border p-4">


          <MousePointer2 />


          <h2 className="text-2xl font-black">

            {idleTime}s

          </h2>


          <p className="text-sm">

            Idle

          </p>


        </div>







        <div className="rounded-xl border p-4">


          <Keyboard />


          <h2 className="text-xl font-black">


            {

              active
                ? "ON"
                : "OFF"

            }


          </h2>


          <p className="text-sm">

            Input

          </p>


        </div>




      </div>





    </div>

  );


}