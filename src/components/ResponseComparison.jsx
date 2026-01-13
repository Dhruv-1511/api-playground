import React, { useState } from 'react';
import { useRequestStore } from '../store/useRequestStore';
import { Button } from './ui/Button';
import { GitCompare, X } from 'lucide-react';
import JsonViewer from './JsonViewer';

const ResponseComparison = ({ onClose }) => {
  const { history } = useRequestStore();
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [searchTerms, setSearchTerms] = useState(['', '']);

  const recentResponses = history.slice(0, 10).map(item => ({
    ...item.response,
    timestamp: item.timestamp,
    requestName: item.name || 'Unnamed Request'
  }));

  const addToComparison = (response) => {
    if (selectedResponses.length < 2 && !selectedResponses.find(r => r.timestamp === response.timestamp)) {
      setSelectedResponses([...selectedResponses, response]);
    }
  };

  const removeFromComparison = (timestamp) => {
    setSelectedResponses(selectedResponses.filter(r => r.timestamp !== timestamp));
  };

  const getStatusColor = (status) => {
    if (status >= 200 && status < 300) return 'text-emerald-500 bg-emerald-500/10';
    if (status >= 400) return 'text-red-500 bg-red-500/10';
    return 'text-amber-500 bg-amber-500/10';
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-background border border-border rounded-sm shadow-lg max-w-6xl w-full max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <GitCompare size={18} className="text-primary" />
            <span className="font-medium">Compare Responses</span>
          </div>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Sidebar */}
          <div className="w-72 border-r border-border flex flex-col">
            <div className="p-3 border-b border-border">
              <p className="text-sm font-medium mb-2">Select Responses</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedResponses([])}
                disabled={selectedResponses.length === 0}
              >
                Clear
              </Button>
            </div>

            <div className="flex-1 overflow-auto">
              {recentResponses.map((response) => {
                const isSelected = selectedResponses.find(r => r.timestamp === response.timestamp);
                const canSelect = selectedResponses.length < 2 || isSelected;

                return (
                  <div
                    key={response.timestamp}
                    className={`p-3 border-b border-border cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10' : 'hover:bg-accent/50'
                    } ${!canSelect ? 'opacity-50' : ''}`}
                    onClick={() => canSelect && (isSelected ? removeFromComparison(response.timestamp) : addToComparison(response))}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <span className="text-sm font-medium truncate">{response.requestName}</span>
                      <span className={`px-1.5 py-0.5 rounded-sm text-xs font-medium ${getStatusColor(response.status)}`}>
                        {response.status}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {response.time}ms - {(response.size / 1024).toFixed(1)}KB
                    </div>
                    {isSelected && (
                      <div className="mt-1 text-xs text-primary">
                        Response {selectedResponses.indexOf(isSelected) + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison */}
          <div className="flex-1 overflow-hidden">
            {selectedResponses.length < 2 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <GitCompare size={32} className="mx-auto mb-3 opacity-50" />
                  <p className="font-medium">Select two responses to compare</p>
                  <p className="text-sm mt-1">Choose from the list on the left</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex">
                {/* Response 1 */}
                <div className="flex-1 border-r border-border flex flex-col">
                  <div className="px-3 py-2 border-b border-border bg-blue-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm font-medium">Response 1</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-sm text-xs font-medium ${getStatusColor(selectedResponses[0].status)}`}>
                      {selectedResponses[0].status}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <JsonViewer
                      data={selectedResponses[0].data}
                      searchTerm={searchTerms[0]}
                      onSearchChange={(term) => setSearchTerms([term, searchTerms[1]])}
                    />
                  </div>
                </div>

                {/* Response 2 */}
                <div className="flex-1 flex flex-col">
                  <div className="px-3 py-2 border-b border-border bg-emerald-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-sm font-medium">Response 2</span>
                    </div>
                    <span className={`px-1.5 py-0.5 rounded-sm text-xs font-medium ${getStatusColor(selectedResponses[1].status)}`}>
                      {selectedResponses[1].status}
                    </span>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <JsonViewer
                      data={selectedResponses[1].data}
                      searchTerm={searchTerms[1]}
                      onSearchChange={(term) => setSearchTerms([searchTerms[0], term])}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponseComparison;
