import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/router";

import TraceXIntro from "@/components/intro/TraceXIntro";
import { useAuth } from "@/lib/AuthContext";

export default function Index() {
  const router = useRouter();
  const { user } = useAuth();
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleComplete = useCallback(() => {
    if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);

    // Hold the finished TraceX logo for 1.5s before revealing the next screen.
    redirectTimerRef.current = setTimeout(() => {
      router.replace(user ? "/home" : "/signup");
    }, 1500);
  }, [router, user]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) clearTimeout(redirectTimerRef.current);
    };
  }, []);

  return <TraceXIntro onComplete={handleComplete} />;
}
