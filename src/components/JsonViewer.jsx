import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Search, Filter } from 'lucide-react';
import { Button } from './ui/Button';

const JsonViewer = ({ data, searchTerm = '', onSearchChange }) => {
  const [expandedPaths, setExpandedPaths] = useState(new Set(['root']));
  const [filterType, setFilterType] = useState('all'); // all, objects, arrays, primitives

  const toggleExpanded = (path) => {
    const newExpanded = new Set(expandedPaths);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
    }
    setExpandedPaths(newExpanded);
  };

  const renderValue = (value, path, key = null) => {
    const fullPath = path;
    const isExpanded = expandedPaths.has(fullPath);

    // Filter logic
    if (filterType !== 'all') {
      if (filterType === 'objects' && (!value || typeof value !== 'object' || Array.isArray(value))) return null;
      if (filterType === 'arrays' && !Array.isArray(value)) return null;
      if (filterType === 'primitives' && (value && typeof value === 'object')) return null;
    }

    // Search logic
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      const keyMatch = key && key.toLowerCase().includes(searchLower);
      const valueMatch = typeof value === 'string' && value.toLowerCase().includes(searchLower);
      if (!keyMatch && !valueMatch) return null;
    }

    if (value === null) {
      return (
        <div className="flex items-center gap-2 py-1">
          {key && <span className="text-primary font-medium">{key}:</span>}
          <span className="text-muted-foreground">null</span>
        </div>
      );
    }

    if (typeof value === 'boolean') {
      return (
        <div className="flex items-center gap-2 py-1">
          {key && <span className="text-primary font-medium">{key}:</span>}
          <span className="text-blue-600">{value.toString()}</span>
        </div>
      );
    }

    if (typeof value === 'number') {
      return (
        <div className="flex items-center gap-2 py-1">
          {key && <span className="text-primary font-medium">{key}:</span>}
          <span className="text-green-600">{value}</span>
        </div>
      );
    }

    if (typeof value === 'string') {
      return (
        <div className="flex items-center gap-2 py-1">
          {key && <span className="text-primary font-medium">{key}:</span>}
          <span className="text-orange-600">"{value}"</span>
        </div>
      );
    }

    if (Array.isArray(value)) {
      const canExpand = value.length > 0;
      return (
        <div className="py-1">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-muted/20 rounded px-2 py-1"
            onClick={() => canExpand && toggleExpanded(fullPath)}
          >
            {canExpand && (
              isExpanded ? (
                <ChevronDown size={14} className="text-muted-foreground" />
              ) : (
                <ChevronRight size={14} className="text-muted-foreground" />
              )
            )}
            {key && <span className="text-primary font-medium">{key}:</span>}
            <span className="text-purple-600">Array</span>
            <span className="text-muted-foreground text-xs">({value.length})</span>
          </div>
          {isExpanded && (
            <div className="ml-4 border-l border-border pl-4">
              {value.map((item, index) => (
                <div key={index}>
                  {renderValue(item, `${fullPath}[${index}]`, index.toString())}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    if (typeof value === 'object') {
      const keys = Object.keys(value);
      const canExpand = keys.length > 0;
      return (
        <div className="py-1">
          <div
            className="flex items-center gap-2 cursor-pointer hover:bg-muted/20 rounded px-2 py-1"
            onClick={() => canExpand && toggleExpanded(fullPath)}
          >
            {canExpand && (
              isExpanded ? (
                <ChevronDown size={14} className="text-muted-foreground" />
              ) : (
                <ChevronRight size={14} className="text-muted-foreground" />
              )
            )}
            {key && <span className="text-primary font-medium">{key}:</span>}
            <span className="text-cyan-600">Object</span>
            <span className="text-muted-foreground text-xs">({keys.length})</span>
          </div>
          {isExpanded && (
            <div className="ml-4 border-l border-border pl-4">
              {keys.map((objKey) => (
                <div key={objKey}>
                  {renderValue(value[objKey], `${fullPath}.${objKey}`, objKey)}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-4 p-4 border-b border-border flex-shrink-0">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search JSON..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-muted-foreground" />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="all">All Types</option>
            <option value="objects">Objects Only</option>
            <option value="arrays">Arrays Only</option>
            <option value="primitives">Primitives Only</option>
          </select>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setExpandedPaths(new Set())}
          className="text-sm px-3"
        >
          Collapse
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            const allPaths = new Set();
            const collectPaths = (obj, path) => {
              if (obj && typeof obj === 'object') {
                allPaths.add(path);
                if (Array.isArray(obj)) {
                  obj.forEach((item, index) => collectPaths(item, `${path}[${index}]`));
                } else {
                  Object.keys(obj).forEach(key => collectPaths(obj[key], `${path}.${key}`));
                }
              }
            };
            collectPaths(data, 'root');
            setExpandedPaths(allPaths);
          }}
          className="text-sm px-3"
        >
          Expand
        </Button>
      </div>

      {/* JSON Tree */}
      <div className="flex-1 overflow-auto p-6 font-mono text-sm min-h-0">
        <div className="space-y-2">
          {renderValue(data, 'root')}
        </div>
      </div>
    </div>
  );
};

export default JsonViewer;