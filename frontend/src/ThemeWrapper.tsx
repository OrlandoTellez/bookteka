import { useLayoutEffect } from "react";
import { useTheme } from "./context/ThemeContext";

export const ThemeWrapper = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();

  // useLayoutEffect: aplica data-theme en body antes del paint para que
  // no haya destello del tema anterior en el primer render.
  useLayoutEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  return <>{children}</>;
};
