'use client'

import { useState, useEffect, useRef } from "react"
import { Sidebar } from "@/components/Sidebar"
import { RequestPanel } from "@/components/RequestPanel"
import { ResponsePanel } from "@/components/ResponsePanel"
import { Github, Sun, Moon, Search, ChevronDown, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { useThemeStore } from "@/store/useThemeStore"
import { useRequestStore } from "@/store/useRequestStore"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { isDark, toggleTheme } = useThemeStore()
  const { currentResponse, setCurrentResponse } = useRequestStore()
  const [searchTerm, setSearchTerm] = useState("")
  const [requestPanelHeight, setRequestPanelHeight] = useState(50)
  const containerRef = useRef<HTMLDivElement>(null)
  const isResizingRef = useRef(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        (e.target as HTMLElement).tagName !== "INPUT" &&
        (e.target as HTMLElement).tagName !== "TEXTAREA"
      ) {
        e.preventDefault()
        document.getElementById("global-search")?.focus()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [isDark])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizingRef.current || !containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const newHeight = ((e.clientY - rect.top) / rect.height) * 100
      setRequestPanelHeight(Math.max(20, Math.min(80, newHeight)))
    }

    const handleMouseUp = () => {
      isResizingRef.current = false
      document.body.style.cursor = ""
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background text-foreground">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar searchTerm={searchTerm} />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-12 border-b border-border flex items-center justify-between px-4 bg-card">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Workspace:</span>
              <span className="font-medium">My RequestLab</span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </div>

            <div className="hidden md:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-sm border border-border w-56">
              <Search size={14} className="text-muted-foreground" />
              <input
                id="global-search"
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-muted-foreground"
              />
              <kbd className="text-[10px] text-muted-foreground bg-background px-1.5 py-0.5 rounded-sm border border-border">/</kbd>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select className="h-8 px-2 text-xs bg-transparent border border-border rounded-sm">
              <option>No Environment</option>
              <option>Production</option>
              <option>Staging</option>
              <option>Local</option>
            </select>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={toggleTheme}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </Button>

            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" asChild>
              <a href="https://github.com" target="_blank" rel="noreferrer">
                <Github size={16} />
              </a>
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div style={{ height: `${requestPanelHeight}%` }}>
            <RequestPanel onResponse={setCurrentResponse} />
          </div>

          <div
            className="h-1 bg-border hover:bg-primary/50 transition-colors cursor-row-resize"
            onMouseDown={() => {
              isResizingRef.current = true
              document.body.style.cursor = "row-resize"
            }}
          />

          <div style={{ height: `${100 - requestPanelHeight}%`, minHeight: '200px' }}>
            <ResponsePanel response={currentResponse} />
          </div>
        </div>
      </main>
    </div>
  )
}
