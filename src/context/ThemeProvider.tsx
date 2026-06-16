import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";


type Theme =
  | "light"
  | "dark"
  | "amoled";


type ThemeContextType = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};


const ThemeContext =
  createContext<ThemeContextType | undefined>(
    undefined
  );


const STORAGE_KEY =
  "tracex-theme";


const themes: Theme[] = [
  "light",
  "dark",
  "amoled",
];


function applyTheme(
  theme: Theme
) {

  const root =
    document.documentElement;


  root.dataset.theme =
    theme;


  root.style.colorScheme =
    theme === "light"
      ? "light"
      : "dark";


}


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
        STORAGE_KEY
      ) as Theme | null;


    const activeTheme =
      saved &&
      themes.includes(saved)
        ? saved
        : "dark";


    setThemeState(
      activeTheme
    );


    applyTheme(
      activeTheme
    );


  }, []);



  const setTheme = (
    value: Theme
  ) => {


    setThemeState(
      value
    );


    localStorage.setItem(
      STORAGE_KEY,
      value
    );


    applyTheme(
      value
    );


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