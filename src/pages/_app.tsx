import "@/styles/globals.css";

import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { useEffect } from "react";

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



  useEffect(() => {
    const titles: Record<string, string> = {
      "/home": "Home",
      "/dashboard": "Dashboard",
      "/sessions": "Study Sessions",
      "/study-plans": "Study Plans",
      "/friends": "Friends",
      "/converter": "File Converter",
      "/classroom": "Classroom",
      "/blocker": "Blocker",
      "/settings": "Settings",
      "/theme": "Theme",
    };
    const recordVisit = (url: string) => {
      const path = url.split(/[?#]/)[0] || "/";
      const title = titles[path];
      if (!title || path === "/home") return;
      try {
        const stored = JSON.parse(window.localStorage.getItem("tracex:recently-opened") || "[]");
        const pages = Array.isArray(stored) ? stored : [];
        const next = [{ path, title, visitedAt: Date.now() }, ...pages.filter((item: { path?: string }) => item?.path !== path)].slice(0, 6);
        window.localStorage.setItem("tracex:recently-opened", JSON.stringify(next));
      } catch {
        window.localStorage.removeItem("tracex:recently-opened");
      }
    };
    recordVisit(router.asPath);
    router.events.on("routeChangeComplete", recordVisit);
    return () => router.events.off("routeChangeComplete", recordVisit);
  }, [router]);

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