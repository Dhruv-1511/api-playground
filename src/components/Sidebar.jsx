import React from "react";
import { Plus, History, Folder, Trash2, Settings, Server } from "lucide-react";
import { useRequestStore } from "../store/useRequestStore";
import { useEnvStore } from "../store/useEnvStore";
import { Button } from "./ui/Button";

export const Sidebar = ({ searchTerm = "" }) => {
  const { collections, currentRequest, setCurrentRequest, deleteRequest } =
    useRequestStore();
  // eslint-disable-next-line no-unused-vars
  const { environments, activeEnvId, setActiveEnv } = useEnvStore();

  const filteredCollections = collections.filter(
    (req) =>
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.method.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const createNewRequest = () => {
    setCurrentRequest({
      id: "new",
      name: "Untitled Request",
      method: "GET",
      url: "",
      params: [{ key: "", value: "", enabled: true }],
      headers: [{ key: "", value: "", enabled: true }],
      body: "",
      bodyType: "json",
    });
  };

  return (
    <div className="w-64 border-r bg-card flex flex-col h-screen overflow-hidden shadow-2xl z-20">
      <div className="p-6 border-b space-y-6">
        <div className="flex items-center gap-2 py-1">
          <img
            src="/src/assets/logo.png"
            alt="RequestLab"
            className="size-12 object-contain"
          />
          <h2 className="text-xl font-black tracking-tighter bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            RequestLab
          </h2>
        </div>

        <Button
          onClick={createNewRequest}
          variant="brand"
          className="w-full justify-start gap-3 py-6"
        >
          <Plus size={20} />
          <span className="font-bold tracking-tight text-base">
            New Request
          </span>
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        <div>
          <h3 className="px-3 mb-3 text-[10px] font-bold tracking-widest uppercase text-muted-foreground/60 flex items-center gap-2">
            <Folder size={14} />
            Collections
          </h3>
          <div className="space-y-1">
            {filteredCollections.map((req) => (
              <div
                key={req.id}
                onClick={() => setCurrentRequest(req)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-sm transition-all duration-200 ${
                  currentRequest.id === req.id
                    ? "bg-primary/10 text-primary border border-primary/20 shadow-sm"
                    : "hover:bg-accent/50 hover:translate-x-1"
                }`}
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className={`text-[9px] font-black w-10 text-center uppercase py-0.5 rounded-md border ${
                      req.method === "GET"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : req.method === "POST"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : req.method === "PUT"
                        ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                        : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                    }`}
                  >
                    {req.method}
                  </span>
                  <span className="truncate font-medium">{req.name}</span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteRequest(req.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-destructive/10 hover:text-destructive rounded-lg transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {collections.length === 0 && (
              <div className="px-3 py-8 text-center border-2 border-dashed border-muted rounded-2xl">
                <p className="text-xs text-muted-foreground font-medium italic">
                  No saved requests
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t bg-background/30 backdrop-blur-sm flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          className="w-8 h-8 p-0 rounded-lg hover:bg-primary/10 hover:text-primary transition-colors"
        >
          <Settings size={18} />
        </Button>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-black tracking-tighter text-primary/80">
            REQUESTLAB v2.0
          </span>
          <span className="text-[8px] font-medium text-muted-foreground uppercase tracking-widest">
            Pro Edition
          </span>
        </div>
      </div>
    </div>
  );
};
