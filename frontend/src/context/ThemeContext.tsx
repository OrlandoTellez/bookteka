import React, { createContext, useContext, useState } from "react";

export type ThemeName = "light" | "dark"

type ThemeContextType = {
  theme: string;
  toggleTheme: () => void;
};

export interface ThemeInfo {
  id: ThemeName;
  name: string;
  icon: React.ReactNode;
  colors: {
    primary: string;
    secondary: string;
  };
}

const ThemeContext = createContext<ThemeContextType>({} as ThemeContextType);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  // Inicialización síncrona desde localStorage para evitar el flash de tema
  // (el tema correcto ya se aplica en el primer render).
  const [theme, setTheme] = useState<ThemeName>(() => {
    const savedTheme = localStorage.getItem("theme");
    return savedTheme === "dark" ? "dark" : "light";
  });

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
