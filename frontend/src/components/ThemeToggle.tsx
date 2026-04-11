import { Moon, Sun } from "lucide-react";
import { useState } from "react";

function ThemeToggle() {
  const [dark, setDark] = useState(false);

  const toggle = () => {
    setDark(!dark);
    document.documentElement.classList.toggle("dark");
  };

  return (
    <button
      onClick={toggle}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
    >
      {dark ? <Sun size={18}/> : <Moon size={18}/>}
    </button>
  );
}

export default ThemeToggle;