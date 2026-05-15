
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect } from "react"

export function ModeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === "dark"

  useEffect(() => {
    // if (isDark) {
    //   document.documentElement.classList.add("dark")
    // } else {
    //   document.documentElement.classList.remove("dark")
    // }
    setTheme('light');
  }, [])

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark")
  }

  return (
    <button
      aria-label="Toggle_theme"
      role="switch"
      aria-checked={isDark}
      onClick={toggleTheme}
      // removed hidden and disabled to make it work
      disabled
      hidden
      className="
      relative inline-flex items-center h-6 w-12 rounded-full cursor-pointer
      bg-neutral-300 dark:bg-neutral-700
      transition-colors duration-300 ease-in-out
      focus:outline-none focus:ring-0 focus:border-none
    "
    >
      {/* Sliding circle */}
      <span
        className={`
        absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white
        flex items-center justify-center
        transform transition-transform duration-300 ease-in-out
        shadow-md dark:shadow-[0_0_6px_rgba(255,255,255,0.2)]
        ${isDark ? 'translate-x-6' : 'translate-x-0'}
      `}
      >
        {isDark ? (
          <Sun className="h-4 w-4 text-orange-400" />
        ) : (
          <Moon className="h-4 w-4" style={{ color: 'var(--accent-foreground)' }} />
        )}
      </span>
    </button>
  );
}