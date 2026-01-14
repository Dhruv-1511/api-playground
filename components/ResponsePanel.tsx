'use client'

import { useState } from "react"
import { Copy, Check, GitCompare } from "lucide-react"
import { Button } from "./ui/Button"
import JsonViewer from "./JsonViewer"
import ResponseComparison from "./ResponseComparison"
import MonacoEditor from "./MonacoEditor"

interface Response {
  data: unknown
  status: number | string
  statusText: string
  headers: Record<string, string>
  time: number
  size: number
  error?: boolean
}

interface ResponsePanelProps {
  response: Response | null
}

export const ResponsePanel = ({ response }: ResponsePanelProps) => {
  const [activeTab, setActiveTab] = useState("tree")
  const [copied, setCopied] = useState(false)
  const [jsonSearchTerm, setJsonSearchTerm] = useState('')
  const [showComparison, setShowComparison] = useState(false)

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground p-8">
        <div className="text-center">
          <p className="text-lg font-medium mb-2">No Response</p>
          <p className="text-sm">Send a request to see the response here</p>
        </div>
      </div>
    )
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const getStatusColor = (status: number | string) => {
    const statusNum = typeof status === 'number' ? status : parseInt(status as string, 10)
    if (statusNum >= 200 && statusNum < 300) return "text-emerald-500 bg-emerald-500/10"
    if (statusNum >= 400) return "text-red-500 bg-red-500/10"
    if (statusNum >= 300) return "text-amber-500 bg-amber-500/10"
    return "text-muted-foreground bg-muted"
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Status Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border text-sm">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <span className={`px-2 py-0.5 rounded-sm font-medium ${getStatusColor(response.status)}`}>
              {response.status} {response.statusText}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Time:</span>
            <span className="font-medium">{response.time} ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Size:</span>
            <span className="font-medium">{(response.size / 1024).toFixed(2)} KB</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowComparison(true)} className="gap-2">
            <GitCompare size={14} />
            Compare
          </Button>
          <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {copied ? "Copied" : "Copy"}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border text-sm">
        {[
          { key: "tree", label: "Tree" },
          { key: "pretty", label: "Pretty" },
          { key: "raw", label: "Raw" },
          { key: "headers", label: "Headers" },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2 transition-colors border-b-2 -mb-px ${
              activeTab === key
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === "tree" && (
          <div className="h-full">
            <JsonViewer
              data={response.data}
              searchTerm={jsonSearchTerm}
              onSearchChange={setJsonSearchTerm}
            />
          </div>
        )}
        {activeTab === "pretty" && (
          <div className="h-full">
            <MonacoEditor
              height="100%"
              defaultLanguage="json"
              theme="vs-dark"
              value={
                typeof response.data === "string"
                  ? response.data
                  : JSON.stringify(response.data, null, 2)
              }
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 13,
                wordWrap: "on",
                padding: { top: 12, bottom: 12 },
              }}
            />
          </div>
        )}
        {activeTab === "raw" && (
          <div className="h-full overflow-auto">
            <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
              {typeof response.data === "string"
                ? response.data
                : JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        )}
        {activeTab === "headers" && (
          <div className="p-4 space-y-2 overflow-auto h-full">
            {Object.entries(response.headers).map(([key, value]) => (
              <div key={key} className="flex gap-4 py-2 border-b border-border text-sm">
                <span className="font-medium w-1/3 truncate">{key}</span>
                <span className="flex-1 text-muted-foreground font-mono break-all">{value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {showComparison && (
        <ResponseComparison
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  )
}
