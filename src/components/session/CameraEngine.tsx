"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";


import {
  Camera,
  Eye,
  ShieldCheck,
  AlertTriangle,
  Activity,
  Video,
  VideoOff,
} from "lucide-react";


import {
  FaceDetector,
  FilesetResolver,
} from "@mediapipe/tasks-vision";




type FocusState =
  | "focused"
  | "away"
  | "distracted";






export default function CameraEngine(){


  const videoRef =
    useRef<HTMLVideoElement | null>(null);


  const streamRef =
    useRef<MediaStream | null>(null);


  const detectorRef =
    useRef<FaceDetector | null>(null);


  const lastVideoTime =
    useRef(-1);



  const [enabled,setEnabled] =
    useState(false);


  const [aiReady,setAiReady] =
    useState(false);


  const [focus,setFocus] =
    useState<FocusState>("away");


  const [confidence,setConfidence] =
    useState(0);


  const [awayTime,setAwayTime] =
    useState(0);


  const [cameraError,setCameraError] =
    useState("");









  async function loadAI(){


    const vision =
      await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
      );



    detectorRef.current =
      await FaceDetector.createFromOptions(
        vision,
        {
          baseOptions:{
            modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/latest/blaze_face_short_range.tflite",
          },


          runningMode:"VIDEO",
        }
      );


    setAiReady(true);

  }










  async function startCamera(){


    try{


      setCameraError("");


      const stream =
        await navigator.mediaDevices
        .getUserMedia({

          video:{
            width:1280,
            height:720,
            facingMode:"user",
          },

          audio:false,

        });



      streamRef.current =
        stream;



      if(videoRef.current){

        videoRef.current.srcObject =
          stream;


        await videoRef.current.play();

      }



      await loadAI();



      setEnabled(true);



    }

    catch(error){


      console.error(error);


      setCameraError(
        "Camera or AI failed to start"
      );


    }


  }










  /*
    REAL MICROSTRICT VISION ENGINE
  */


  useEffect(()=>{


    if(!enabled || !aiReady)
      return;



    let animation:number;



    function scan(){



      const video =
        videoRef.current;


      const detector =
        detectorRef.current;



      if(

        video &&

        detector &&

        video.currentTime !==
        lastVideoTime.current

      ){



        lastVideoTime.current =
          video.currentTime;




        const result =
          detector.detectForVideo(

            video,

            performance.now()

          );





        const faceFound =
          result.detections.length > 0;





        if(faceFound){


          setFocus(
            "focused"
          );


          setConfidence(
            98
          );


          setAwayTime(
            0
          );


        }


        else{


          setAwayTime(v=>{


            const next =
              v + 1;



            if(next > 10){


              setFocus(
                "distracted"
              );


              setConfidence(
                20
              );


            }


            else{


              setFocus(
                "away"
              );


              setConfidence(
                60
              );


            }



            return next;


          });



        }


      }



      animation =
        requestAnimationFrame(scan);


    }




    scan();




    return()=>{

      cancelAnimationFrame(
        animation
      );

    };



  },[
    enabled,
    aiReady
  ]);










  /*
    CLEAN CAMERA
  */

  useEffect(()=>{


    return()=>{


      streamRef.current
      ?.getTracks()
      .forEach(
        track =>
          track.stop()
      );


    };


  },[]);










  return (

    <section

      className="
      rounded-[32px]
      border
      p-5
      overflow-hidden
      "

      style={{

        background:
        "var(--surface)",


        borderColor:
        "var(--border)",

      }}

    >




      {/* HEADER */}


      <div className="
      flex
      justify-between
      items-center
      mb-5
      ">


        <div>


          <h2 className="
          font-black
          text-xl
          ">

            MicroStrict Vision

          </h2>



          <p
          className="text-sm"
          style={{
            color:"var(--muted)"
          }}
          >

            {
              enabled
              ?
              "AI vision analysis running"
              :
              "Enable camera to start analysis"
            }

          </p>


        </div>




        {
          enabled
          ?
          <Video color="#22c55e"/>
          :
          <VideoOff color="#64748b"/>
        }



      </div>









      {/* CAMERA */}


      <div className="
      relative
      aspect-video
      bg-black
      rounded-3xl
      overflow-hidden
      ">



        <video

          ref={videoRef}

          autoPlay

          muted

          playsInline

          className="
          absolute
          inset-0
          h-full
          w-full
          object-cover
          scale-x-[-1]
          "

        />





        {
          enabled &&
          aiReady &&
          (

          <div className="
          absolute
          top-4
          left-4
          rounded-full
          bg-black/60
          px-4
          py-2
          text-xs
          text-green-400
          ">

            ● AI ACTIVE

          </div>

          )
        }








        {
          !enabled &&

          <div className="
          absolute
          inset-0
          flex
          items-center
          justify-center
          ">


            <button

            onClick={startCamera}

            className="
            flex
            gap-2
            items-center
            rounded-xl
            px-6
            py-3
            font-bold
            "

            style={{

              background:
              "linear-gradient(135deg,#2563eb,#06b6d4)",

              color:"white"

            }}

            >


              <Camera size={18}/>

              Enable Vision


            </button>


          </div>

        }




      </div>









      {
        cameraError &&

        <p className="
        text-red-400
        text-sm
        mt-3
        ">

          {cameraError}

        </p>

      }











      {/* STATS */}


      <div className="
      grid
      grid-cols-3
      gap-3
      mt-5
      ">




        <div className="vision-card">

          <Eye size={16}/>

          <p>State</p>

          <h3>
            {focus}
          </h3>

        </div>





        <div className="vision-card">

          <ShieldCheck size={16}/>

          <p>Trust</p>

          <h3>
            {confidence}%
          </h3>

        </div>





        <div className="vision-card">

          <Activity size={16}/>

          <p>Away</p>

          <h3>
            {awayTime}s
          </h3>

        </div>




      </div>



    </section>

  );


}