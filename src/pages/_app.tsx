import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { useEffect } from "react";

const THEME_KEY = "tracex:theme";

function applyTheme(theme: string) {
  if (typeof document === "undefined") return;

  document.body.classList.remove("tracex-theme-amoled", "tracex-theme-dark", "tracex-theme-light");

  const normalized = ["amoled", "dark", "light"].includes(theme) ? theme : "amoled";
  document.body.classList.add(`tracex-theme-${normalized}`);
}

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    const savedTheme = localStorage.getItem(THEME_KEY) || "amoled";
    applyTheme(savedTheme);

    const handleThemeUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<string>;
      applyTheme(customEvent.detail || localStorage.getItem(THEME_KEY) || "amoled");
    };

    window.addEventListener("tracex-theme-change", handleThemeUpdate);
    return () => window.removeEventListener("tracex-theme-change", handleThemeUpdate);
  }, []);

  return <Component {...pageProps} />;
}