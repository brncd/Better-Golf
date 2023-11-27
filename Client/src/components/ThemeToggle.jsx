import { Switch } from "@nextui-org/react";
import { useEffect, useState } from "react";
import { MoonIcon } from "../assets/MoonIcon";
import { SunIcon } from "../assets/SunIcon";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      return "dark";
    } else {
      return "light";
    }
  });

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  const handleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else {
      setTheme("light");
    }
  };

  return (
    <div>
      <Switch
        defaultSelected={theme === "dark"}
        size="lg"
        color={theme === "dark" ? "secondary" : "primary"}
        thumbIcon={({ isSelected, className }) =>
          isSelected ? (
            <MoonIcon className={className} />
          ) : (
            <SunIcon className={className} />
          )
        }
        onChange={handleTheme}
      >
        {/* {theme === "dark" ? "Modo oscuro" : "Modo claro"} */}
      </Switch>
    </div>
  );
}
