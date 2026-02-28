import dynamic from "next/dynamic";

const BlockerClient = dynamic(() => import("@/components/BlockerClient"), {
  ssr: false,
});

export default function BlockerPage() {
  return <BlockerClient />;
}