import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./components/Sidebar";
import { RequestPanel } from "./components/RequestPanel";
import { ResponsePanel } from "./components/ResponsePanel";
import { Github, Sun, Moon, ChevronDown, Search, Server } from "lucide-react";
import { Button } from "./components/ui/Button";
import { useThemeStore } from "./store/useThemeStore";
import { useRequestStore } from "./store/useRequestStore";
import logo from './assets/logo.png';

function App() {
  const { isDark, toggleTheme } = useThemeStore();
  const { currentResponse, setCurrentResponse } = useRequestStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [requestPanelHeight, setRequestPanelHeight] = useState(50); // percentage
  const containerRef = useRef(null);
  const isResizingRef = useRef(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "/" &&
        e.target.tagName !== "INPUT" &&
        e.target.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        document.getElementById("global-search")?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizingRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const newHeight = ((e.clientY - rect.top) / rect.height) * 100;
      setRequestPanelHeight(Math.max(20, Math.min(80, newHeight)));
    };

    const handleMouseUp = () => {
      isResizingRef.current = false;
      document.body.style.cursor = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, []);

  return (
    <div ref={containerRef} className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
      <Sidebar searchTerm={searchTerm} />

      <main className="flex-1 flex flex-col min-w-0 bg-background/50">
        <header className="h-14 border-b flex items-center justify-between px-4 bg-background/80 backdrop-blur-xl z-20 sticky top-0">
          <div className="flex items-center gap-6 overflow-hidden">
            <div className="flex items-center gap-2 border-r pr-6 border-border/50">
              <div className="w-8 h-8 rounded-lg brand-gradient flex items-center justify-center text-white font-bold text-xs shadow-lg">
                RL
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                  Workspace
                </span>
                <span className="text-sm font-bold truncate max-w-[150px]">
                  My RequestLab
                </span>
              </div>
              <ChevronDown size={14} className="text-muted-foreground ml-1" />
            </div>

            <div className="hidden lg:flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-xl border border-border/50 w-64 group focus-within:ring-2 ring-primary/20 transition-all">
              <Search
                size={14}
                className="text-muted-foreground group-focus-within:text-primary transition-colors"
              />
              <input
                id="global-search"
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent border-none outline-none text-xs w-full placeholder:text-muted-foreground/50 font-medium"
              />
              <span className="text-[10px] font-bold text-muted-foreground/40 bg-muted px-1.5 py-0.5 rounded border border-border/50">
                /
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden xl:flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">
                Cloud Synced
              </span>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-background/40 border border-border/50 rounded-xl px-2 py-1 shadow-sm">
              <Server size={14} className="text-primary/60" />
              <select className="bg-transparent border-none outline-none text-[11px] font-bold tracking-tight uppercase cursor-pointer pr-4">
                <option>No Environment</option>
                <option>Production API</option>
                <option>Staging</option>
                <option>Localhost</option>
              </select>
            </div>

            <div className="flex items-center gap-2 border-l pl-4 border-border/50">
               <Button
                 variant="ghost"
                 size="sm"
                 className="w-9 h-9 p-0 rounded-xl hover:bg-yellow-400/10"
                 onClick={toggleTheme}
               >
                {isDark ? (
                  <Sun size={18} className="text-yellow-400" />
                ) : (
                  <Moon size={18} className="text-primary" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:flex w-9 h-9 p-0 rounded-xl hover:bg-primary/10"
              >
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                >
                  <Github size={18} />
                </a>
              </Button>
              <div className="w-8 h-8 rounded-full border-2 border-primary/20 p-0.5 shadow-md hover:scale-105 transition-transform cursor-pointer">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center overflow-hidden">
                  <img
                    src={logo}
                    className="w-full h-full object-cover scale-150 grayscale opacity-80"
                    alt="Profile"
                  />
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-background/50">
          <div style={{ height: `${requestPanelHeight}%` }} className="transition-all duration-300 ease-in-out">
            <RequestPanel onResponse={setCurrentResponse} />
          </div>
          <div
            className="h-px bg-border hover:bg-primary/50 transition-colors cursor-row-resize relative group"
            onMouseDown={() => {
              isResizingRef.current = true;
              document.body.style.cursor = "row-resize";
            }}
          >
            <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
           <div style={{ height: `${100 - requestPanelHeight}%`, minHeight: '200px' }} className="transition-all duration-300 ease-in-out">
             <ResponsePanel response={currentResponse} />
           </div>
        </div>
      </main>
    </div>
  );
}

export default App;
