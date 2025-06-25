"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"

export function ModeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <div className="flex items-center gap-2 p-2">
      <Button className="text-xl cursor-pointer" size="lg" variant={ theme === 'light' ? 'default' : 'outline' } onClick={() => setTheme("light")}>
        <Sun className="scale-150" />
        Light Mode
      </Button>
      <Button className="text-xl cursor-pointer" size="lg" variant={ theme === 'dark' ? 'default' : 'outline' } onClick={() => setTheme("dark")}>
        <Moon className="scale-150" />
        Dark Mode
      </Button>
    </div>
  )
}
