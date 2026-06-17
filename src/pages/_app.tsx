import "@/styles/globals.css";

import type { AppProps } from "next/app";
import { useRouter } from "next/router";

import { AuthProvider } from "@/lib/AuthContext";
import { ThemeProvider } from "@/context/ThemeProvider";

import ProtectedRoute from "@/components/auth/ProtectedRoute";



const PUBLIC_ROUTES = [

  "/",

  "/login",

  "/signup",

  "/register",

];




export default function App({

  Component,

  pageProps,

}: AppProps) {



  const router =
    useRouter();



  const isPublicRoute =

    PUBLIC_ROUTES.includes(

      router.pathname

    );





  return (


    <ThemeProvider>


      <AuthProvider>



        {


          isPublicRoute ?


            (


              <Component

                {...pageProps}

              />


            )


            :


            (


              <ProtectedRoute>


                <Component

                  {...pageProps}

                />


              </ProtectedRoute>


            )


        }



      </AuthProvider>


    </ThemeProvider>


  );

}