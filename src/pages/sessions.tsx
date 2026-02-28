import dynamic from "next/dynamic";

const SessionsClient = dynamic(() => import("@/components/SessionsClient"), {
  ssr: false,
});

export default function SessionsPage() {
  return <SessionsClient />;
}