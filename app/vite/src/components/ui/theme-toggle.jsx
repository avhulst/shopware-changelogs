import { Moon, Sun } from "lucide-react";
import React from "react";
import { Button } from "./button";

export function ThemeToggle() {
  const [dark, setDark] = React.useState(
    () => typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  );
  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch (e) {}
  }
  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label={dark ? "Heller Modus" : "Dunkler Modus"}>
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}
