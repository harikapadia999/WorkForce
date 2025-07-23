"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Monitor } from "lucide-react"

type Theme = "light" | "dark" | "system"

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("system")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
      applyTheme(savedTheme)
    } else {
      applyTheme("system")
    }
  }, [])

  const applyTheme = (newTheme: Theme) => {
    const root = document.documentElement

    if (newTheme === "system") {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
      root.classList.toggle("dark", systemTheme === "dark")
    } else {
      root.classList.toggle("dark", newTheme === "dark")
    }
  }

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    applyTheme(newTheme)
  }

  if (!mounted) return null

  const getIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />
      case "dark":
        return <Moon className="w-4 h-4" />
      default:
        return <Monitor className="w-4 h-4" />
    }
  }

  const getNextTheme = (): Theme => {
    switch (theme) {
      case "light":
        return "dark"
      case "dark":
        return "system"
      default:
        return "light"
    }
  }

  return (
    <Button
      onClick={() => handleThemeChange(getNextTheme())}
      className="glass-button bg-white/10 dark:bg-black/10 hover:bg-white/20 dark:hover:bg-black/20 border border-white/20 dark:border-white/10 rounded-xl p-3 transition-all duration-300 hover:scale-105"
      size="sm"
    >
      {getIcon()}
    </Button>
  )
}
