import "@/styles/globals.css";

import type { AppProps } from "next/app";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { AuthProvider } from "@/lib/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";


const THEME_KEY =
  "tracex:theme";


const PUBLIC_ROUTES = [

  "/",
  "/login",
  "/signup",
  "/register",

];


function applyTheme(
  theme: string
) {

  if (
    typeof document === "undefined"
  )
    return;


  const normalized =
    [
      "amoled",
      "dark",
      "light",
    ].includes(theme)
      ? theme
      : "amoled";


  document.documentElement.dataset.theme =
    normalized;


  document.body.classList.remove(
    "tracex-theme-amoled",
    "tracex-theme-dark",
    "tracex-theme-light"
  );


  document.body.classList.add(
    `tracex-theme-${normalized}`
  );

}



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



  useEffect(() => {


    const savedTheme =
      localStorage.getItem(
        THEME_KEY
      )
      ||
      "amoled";


    applyTheme(
      savedTheme
    );


    const handleThemeUpdate =
      (
        event: Event
      ) => {


        const customEvent =
          event as CustomEvent<string>;


        applyTheme(
          customEvent.detail ||
          localStorage.getItem(
            THEME_KEY
          )
          ||
          "amoled"
        );


      };



    window.addEventListener(
      "tracex-theme-change",
      handleThemeUpdate
    );


    return () =>

      window.removeEventListener(
        "tracex-theme-change",
        handleThemeUpdate
      );


  }, []);




  return (

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

  );

}