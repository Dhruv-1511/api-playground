import React, { useState, useEffect } from "react";
import { Sidebar } from "./components/Sidebar";
import { RequestPanel } from "./components/RequestPanel";
import { ResponsePanel } from "./components/ResponsePanel";
import { useRequestStore } from "./store/useRequestStore";
import { Terminal, Github, Sun, Moon } from "lucide-react";
import { Button } from "./components/ui/Button";
import { Analytics } from "@vercel/analytics/next";

function App() {
  const [response, setResponse] = useState(null);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  return (
    <>
      <Analytics />
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
        <Sidebar />

        <main className="flex-1 flex flex-col min-w-0">
          <header className="h-12 border-b flex items-center justify-between px-4 bg-card/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
              <Terminal className="text-primary" size={20} />
              <h1 className="font-bold text-sm tracking-tight">
                API PLAYGROUND
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsDark(!isDark)}
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </Button>
              <Button variant="ghost" size="sm">
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center"
                >
                  <Github size={18} />
                </a>
              </Button>
            </div>
          </header>

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <div className="flex-1 min-h-[40%]">
              <RequestPanel onResponse={setResponse} />
            </div>
            <div className="h-1.5 bg-border hover:bg-primary/50 transition-colors cursor-row-resize" />
            <div className="flex-1 min-h-[30%]">
              <ResponsePanel response={response} />
            </div>
          </div>
        </main>
      </div>
    </>
  );
}

export default App;
