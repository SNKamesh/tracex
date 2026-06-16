import {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from "react";
  
  
  type Theme = "light" | "dark" | "amoled";
  
  
  type ThemeContextType = {
    theme: Theme;
    setTheme: (theme: Theme) => void;
  };
  
  
  const ThemeContext =
    createContext<ThemeContextType | undefined>(
      undefined
    );
  
  
  export function ThemeProvider({
    children,
  }: {
    children: ReactNode;
  }) {
    const [theme, setThemeState] =
      useState<Theme>("dark");
  
  
    useEffect(() => {
      const saved =
        localStorage.getItem(
          "tracex-theme"
        ) as Theme | null;
  
  
      const activeTheme =
        saved ?? "dark";
  
  
      setThemeState(activeTheme);
  
  
      document.documentElement.dataset.theme =
        activeTheme;
  
    }, []);
  
  
    const setTheme = (
      value: Theme
    ) => {
  
      setThemeState(value);
  
  
      localStorage.setItem(
        "tracex-theme",
        value
      );
  
  
      document.documentElement.dataset.theme =
        value;
  
    };
  
  
    return (
  
      <ThemeContext.Provider
        value={{
          theme,
          setTheme,
        }}
      >
  
        {children}
  
      </ThemeContext.Provider>
  
    );
  }
  
  
  export function useTheme() {
  
    const context =
      useContext(
        ThemeContext
      );
  
  
    if (!context) {
  
      throw new Error(
        "useTheme must be used inside ThemeProvider"
      );
  
    }
  
  
    return context;
  
  }