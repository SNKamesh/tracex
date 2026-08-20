import { useCallback } from "react";
import { useRouter } from "next/router";

import TraceXIntro from "@/components/intro/TraceXIntro";
import { useAuth } from "@/lib/AuthContext";

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();

  const handleComplete = useCallback(() => {
    router.replace(user ? "/home" : "/signup");
  }, [router, user]);

  return <TraceXIntro onComplete={handleComplete} />;
}
