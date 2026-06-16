import { useEffect } from "react";
import { useRouter } from "next/router";

import { useAuth } from "@/lib/AuthContext";


type Props = {

  children: React.ReactNode;

};


export default function ProtectedRoute({
  children,
}: Props) {


  const router =
    useRouter();


  const {
    user,
    loading,
  } = useAuth();



  useEffect(() => {


    if (
      !loading &&
      !user
    ) {


      router.replace(
        "/login"
      );


    }


  }, [
    loading,
    user,
    router,
  ]);




  if (loading) {


    return (

      <div
        className="
        min-h-screen
        flex
        items-center
        justify-center
        "
      >

        Loading Trace X...

      </div>

    );

  }



  if (!user) {


    return null;


  }




  return (

    <>

      {children}

    </>

  );

}