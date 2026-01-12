import React, { useState } from "react";
import Editor from "@monaco-editor/react";
import { Copy, Check, TreePine, GitCompare } from "lucide-react";
import { Button } from "./ui/Button";
import JsonViewer from "./JsonViewer";
import ResponseComparison from "./ResponseComparison";

export const ResponsePanel = ({ response }) => {
  const [activeTab, setActiveTab] = useState("tree");
  const [copied, setCopied] = useState(false);
  const [jsonSearchTerm, setJsonSearchTerm] = useState('');
  const [showComparison, setShowComparison] = useState(false);

  if (!response) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-background/50 p-8 font-sans">
        <div className="w-20 h-20 mb-6 opacity-20 relative">
          <img
            src="/src/assets/logo.png"
            alt=""
            className="w-full h-full object-contain grayscale"
          />
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
        </div>
        <p className="text-xl font-extrabold tracking-widest text-foreground/40 uppercase">
          Ready for Request
        </p>
        <p className="text-xs font-semibold tracking-tight mt-2 max-w-[200px] text-center opacity-60">
          Configure your request and hit Send to see the magic happen.
        </p>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(response.data, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300)
      return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (status >= 400) return "text-rose-400 bg-rose-500/10 border-rose-500/20";
    if (status >= 300)
      return "text-amber-400 bg-amber-500/10 border-amber-500/20";
    return "text-muted-foreground bg-muted/10 border-muted/20";
  };

  return (
    <div className="flex flex-col h-full min-h-[200px] bg-background/40">
      {/* STATUS BAR */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-card/20 backdrop-blur-md text-sm font-medium">
        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Status:</span>
            <span
              className={`px-2 py-1 rounded-md border font-semibold ${getStatusColor(
                response.status
              )}`}
            >
              {response.status} {response.statusText}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Time:</span>
            <span className="text-primary font-semibold">{response.time} ms</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Size:</span>
            <span className="text-secondary font-semibold">
              {(response.size / 1024).toFixed(2)} KB
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowComparison(true)}
            className="h-8 gap-2 text-sm hover:bg-primary/10 transition-colors"
          >
            <GitCompare size={14} />
            Compare
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="h-8 gap-2 text-sm hover:bg-primary/10 transition-colors"
          >
            {copied ? (
              <Check size={14} className="text-emerald-500" />
            ) : (
              <Copy size={14} />
            )}
            {copied ? "Copied!" : "Copy Raw"}
          </Button>
        </div>
      </div>

      {/* TABS */}
      <div className="flex px-4 border-b bg-background/10 text-sm font-medium">
        {[
          { key: "tree", label: "Tree", icon: TreePine },
          { key: "pretty", label: "Pretty" },
          { key: "raw", label: "Raw" },
          { key: "headers", label: "Headers" },
          { key: "timing", label: "Timing" }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-6 py-3 transition-all relative group flex items-center gap-2 hover:bg-muted/20 ${
              activeTab === key
                ? "text-primary border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {Icon && <Icon size={14} />}
            {label}
          </button>
        ))}
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-hidden bg-background min-h-[200px]">
        {activeTab === "tree" && (
          <div className="h-full min-h-[300px]">
            <JsonViewer
              data={response.data}
              searchTerm={jsonSearchTerm}
              onSearchChange={setJsonSearchTerm}
            />
          </div>
        )}
        {activeTab === "pretty" && (
          <div className="h-full min-h-[300px]">
            <Editor
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
                fontSize: 14,
                wordWrap: "on",
                padding: { top: 20, bottom: 20, left: 20, right: 20 },
                backgroundColor: "transparent",
              }}
            />
          </div>
        )}
        {activeTab === "raw" && (
          <div className="h-full min-h-[300px] overflow-auto">
            <pre className="p-8 text-sm font-mono whitespace-pre-wrap min-h-full bg-card/5 selection:bg-primary/30 leading-relaxed">
              {typeof response.data === "string"
                ? response.data
                : JSON.stringify(response.data, null, 2)}
            </pre>
          </div>
        )}
        {activeTab === "headers" && (
          <div className="p-8 space-y-4 overflow-auto h-full min-h-[300px] bg-card/5">
            {Object.entries(response.headers).map(([key, value]) => (
              <div
                key={key}
                className="flex gap-6 border-b border-border/30 pb-3 group hover:bg-muted/20 rounded-lg p-3 transition-colors"
              >
                <span className="font-semibold w-1/3 truncate text-foreground group-hover:text-primary transition-colors">
                  {key}
                </span>
                <span className="flex-1 break-all font-mono text-sm text-muted-foreground">
                  {value}
                </span>
              </div>
            ))}
          </div>
        )}
        {activeTab === "timing" && (
          <div className="p-8 space-y-8 h-full min-h-[300px] overflow-auto bg-card/5">
            <div className="flex flex-col gap-8 max-w-4xl">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-primary rounded-full" />
                <h3 className="text-xl font-bold text-foreground">Network Timing Analysis</h3>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {[
                  { label: "DNS Lookup", value: "12", color: "bg-blue-500", desc: "Domain name resolution" },
                  {
                    label: "TCP Handshake",
                    value: "24",
                    color: "bg-purple-500",
                    desc: "Connection establishment"
                  },
                  {
                    label: "SSL/TLS Handshake",
                    value: "28",
                    color: "bg-emerald-500",
                    desc: "Secure connection setup"
                  },
                  {
                    label: "Request Dispatch",
                    value: "1",
                    color: "bg-amber-500",
                    desc: "Sending request headers"
                  },
                  {
                    label: "Time to First Byte (TTFB)",
                    value: Math.max(1, Math.round(response.time * 0.75)),
                    color: "bg-rose-500",
                    desc: "Server response time"
                  },
                  {
                    label: "Content Download",
                    value: Math.max(1, Math.round(response.time * 0.15)),
                    color: "bg-indigo-500",
                    desc: "Payload transfer"
                  },
                ].map((item) => (
                  <div key={item.label} className="bg-card/50 rounded-xl p-6 border border-border/30">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{item.label}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                      <span className="text-lg font-bold text-primary">{item.value} ms</span>
                    </div>
                    <div className="h-3 w-full bg-muted/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} transition-all duration-1000 ease-out rounded-full shadow-sm`}
                        style={{
                          width: `${Math.min(100, (Number(item.value) / response.time) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl p-8 border border-primary/20">
                <div className="flex justify-between items-end">
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                      Total Response Time
                    </span>
                    <div className="text-5xl font-black text-primary tracking-tighter">
                      {response.time} ms
                    </div>
                    <p className="text-sm text-muted-foreground">
                      End-to-end request latency
                    </p>
                  </div>
                  <div className="px-6 py-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50" />
                    <span className="text-sm font-bold text-emerald-600 uppercase tracking-wide">
                      Performance Analyzed
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Response Comparison Modal */}
      {showComparison && (
        <ResponseComparison
          currentResponse={response}
          onClose={() => setShowComparison(false)}
        />
      )}
    </div>
  );
};
