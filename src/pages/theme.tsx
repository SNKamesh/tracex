import dynamic from "next/dynamic";

const ThemeClient = dynamic(() => import("@/components/ThemeClient"), {
  ssr: false,
});

export default function ThemePage() {
  return <ThemeClient />;
}