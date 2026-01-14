'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown, Search } from 'lucide-react'
import { Button } from './ui/Button'

interface JsonViewerProps {
  data: unknown
  searchTerm?: string
  onSearchChange?: (term: string) => void
}

const JsonViewer = ({ data, searchTerm = '', onSearchChange }: JsonViewerProps) => {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set(['root']))

  const toggleExpanded = (path: string) => {
    const newExpanded = new Set(expandedPaths)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedPaths(newExpanded)
  }

  const renderValue = (value: unknown, path: string, key: string | null = null): React.ReactNode => {
    const fullPath = path
    const isExpanded = expandedPaths.has(fullPath)

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const keyMatch = key && key.toLowerCase().includes(searchLower)
      const valueMatch = typeof value === 'string' && value.toLowerCase().includes(searchLower)
      if (!keyMatch && !valueMatch) return null
    }

    if (value === null) {
      return (
        <div className="flex items-center gap-2 py-0.5">
          {key && <span className="text-primary">{key}:</span>}
          <span className="text-muted-foreground">null</span>
        </div>
      )
    }

    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center gap-2 py-0.5">
          {key && <span className="text-primary">{key}:</span>}
          <span className="text-blue-500">{value.toString()}</span>
        </div>
      )
    }

    if (typeof value === 'number') {
      return (
        <div className="flex items-center gap-2 py-0.5">
          {key && <span className="text-primary">{key}:</span>}
          <span className="text-emerald-500">{value}</span>
        </div>
      )
    }

    if (typeof value === 'string') {
      return (
        <div className="flex items-center gap-2 py-0.5">
          {key && <span className="text-primary">{key}:</span>}
          <span className="text-amber-500">&quot;{value}&quot;</span>
        </div>
      )
    }

    if (Array.isArray(value)) {
      const canExpand = value.length > 0
      return (
        <div className="py-0.5">
          <div
            className="flex items-center gap-1 cursor-pointer hover:bg-accent/50 rounded-sm px-1 py-0.5"
            onClick={() => canExpand && toggleExpanded(fullPath)}
          >
            {canExpand && (
              isExpanded ? (
                <ChevronDown size={12} className="text-muted-foreground" />
              ) : (
                <ChevronRight size={12} className="text-muted-foreground" />
              )
            )}
            {key && <span className="text-primary">{key}:</span>}
            <span className="text-purple-500">Array</span>
            <span className="text-muted-foreground text-xs">({value.length})</span>
          </div>
          {isExpanded && (
            <div className="ml-4 border-l border-border pl-3">
              {value.map((item, index) => (
                <div key={index}>
                  {renderValue(item, `${fullPath}[${index}]`, index.toString())}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value as Record<string, unknown>)
      const canExpand = keys.length > 0
      return (
        <div className="py-0.5">
          <div
            className="flex items-center gap-1 cursor-pointer hover:bg-accent/50 rounded-sm px-1 py-0.5"
            onClick={() => canExpand && toggleExpanded(fullPath)}
          >
            {canExpand && (
              isExpanded ? (
                <ChevronDown size={12} className="text-muted-foreground" />
              ) : (
                <ChevronRight size={12} className="text-muted-foreground" />
              )
            )}
            {key && <span className="text-primary">{key}:</span>}
            <span className="text-cyan-500">Object</span>
            <span className="text-muted-foreground text-xs">({keys.length})</span>
          </div>
          {isExpanded && (
            <div className="ml-4 border-l border-border pl-3">
              {keys.map((objKey) => (
                <div key={objKey}>
                  {renderValue((value as Record<string, unknown>)[objKey], `${fullPath}.${objKey}`, objKey)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return null
  }

  const expandAll = () => {
    const allPaths = new Set<string>()
    const collectPaths = (obj: unknown, path: string) => {
      if (obj && typeof obj === 'object') {
        allPaths.add(path)
        if (Array.isArray(obj)) {
          obj.forEach((item, index) => collectPaths(item, `${path}[${index}]`))
        } else {
          Object.keys(obj as Record<string, unknown>).forEach(key =>
            collectPaths((obj as Record<string, unknown>)[key], `${path}.${key}`)
          )
        }
      }
    }
    collectPaths(data, 'root')
    setExpandedPaths(allPaths)
  }

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 p-3 border-b border-border">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-transparent border border-border rounded-sm text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <Button variant="ghost" size="sm" onClick={() => setExpandedPaths(new Set())}>
          Collapse
        </Button>
        <Button variant="ghost" size="sm" onClick={expandAll}>
          Expand
        </Button>
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {renderValue(data, 'root')}
      </div>
    </div>
  )
}

export default JsonViewer
