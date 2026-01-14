'use client'

import Image from "next/image"
import { Plus, Folder, Trash2, Settings } from "lucide-react"
import { useRequestStore } from "@/store/useRequestStore"
import { Button } from "./ui/Button"

interface SidebarProps {
  searchTerm?: string
}

export const Sidebar = ({ searchTerm = "" }: SidebarProps) => {
  const { collections, currentRequest, setCurrentRequest, deleteRequest } =
    useRequestStore()

  const filteredCollections = collections.filter(
    (req) =>
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.method.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
    })
  }

  const methodColors: Record<string, string> = {
    GET: "text-emerald-500 bg-emerald-500/10",
    POST: "text-blue-500 bg-blue-500/10",
    PUT: "text-amber-500 bg-amber-500/10",
    PATCH: "text-orange-500 bg-orange-500/10",
    DELETE: "text-red-500 bg-red-500/10",
  }

  return (
    <div className="w-64 border-r border-border bg-card flex flex-col h-screen">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-4">
          <Image src="/logo.png" alt="RequestLab" width={32} height={32} />
          <span className="text-lg font-semibold">RequestLab</span>
        </div>
        <Button
          onClick={createNewRequest}
          className="w-full justify-center gap-2"
        >
          <Plus size={16} />
          New Request
        </Button>
      </div>

      {/* Collections */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="flex items-center gap-2 px-2 py-1.5 text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
          <Folder size={14} />
          Collections
        </div>
        <div className="space-y-1">
          {filteredCollections.map((req) => (
            <div
              key={req.id}
              onClick={() => setCurrentRequest(req)}
              className={`group flex items-center justify-between px-2 py-2 rounded-sm cursor-pointer text-sm transition-colors ${
                currentRequest.id === req.id
                  ? "bg-accent text-accent-foreground"
                  : "hover:bg-accent/50"
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span
                  className={`text-[10px] font-semibold w-11 text-center py-0.5 rounded-sm ${
                    methodColors[req.method] || methodColors.GET
                  }`}
                >
                  {req.method}
                </span>
                <span className="truncate">{req.name}</span>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  deleteRequest(req.id)
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-destructive/10 hover:text-destructive rounded-sm transition-opacity"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          {collections.length === 0 && (
            <div className="px-3 py-8 text-center border border-dashed border-border rounded-sm">
              <Folder size={24} className="mx-auto mb-2 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No saved requests</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Create your first request above
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-border flex items-center justify-between">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Settings size={16} />
        </Button>
        <div className="text-right">
          <div className="text-xs font-medium text-foreground">RequestLab</div>
          <div className="text-[10px] text-muted-foreground">v2.0</div>
        </div>
      </div>
    </div>
  )
}
