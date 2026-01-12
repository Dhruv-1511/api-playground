import React, { useState } from 'react';
import { useRequestStore } from '../store/useRequestStore';
import { Button } from './ui/Button';
import { GitCompare, X } from 'lucide-react';
import JsonViewer from './JsonViewer';

const ResponseComparison = ({ onClose }) => {
  const { history } = useRequestStore();
  const [selectedResponses, setSelectedResponses] = useState([]);
  const [searchTerms, setSearchTerms] = useState(['', '']);
  const [viewMode, setViewMode] = useState('side-by-side'); // side-by-side, diff

  // Get recent responses for comparison
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

  const clearComparison = () => {
    setSelectedResponses([]);
  };

  // Calculate diff between two responses
  const calculateDiff = (response1, response2) => {
    const diff = {
      status: response1.status !== response2.status,
      statusText: response1.statusText !== response2.statusText,
      time: response1.time !== response2.time,
      size: response1.size !== response2.size,
      headers: {},
      data: null
    };

    // Compare headers
    const allHeaderKeys = new Set([...Object.keys(response1.headers), ...Object.keys(response2.headers)]);
    allHeaderKeys.forEach(key => {
      if (response1.headers[key] !== response2.headers[key]) {
        diff.headers[key] = {
          value1: response1.headers[key],
          value2: response2.headers[key]
        };
      }
    });

    // Simple data comparison (can be enhanced)
    if (JSON.stringify(response1.data) !== JSON.stringify(response2.data)) {
      diff.data = true;
    }

    return diff;
  };

  const diff = selectedResponses.length === 2 ? calculateDiff(selectedResponses[0], selectedResponses[1]) : null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <GitCompare size={20} className="text-primary" />
            <h2 className="text-xl font-bold">Response Comparison</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X size={16} />
          </Button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Response History Sidebar */}
          <div className="w-80 border-r border-border bg-card/20 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold mb-3">Select Responses to Compare</h3>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearComparison}
                  disabled={selectedResponses.length === 0}
                >
                  Clear All
                </Button>
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="bg-background border border-border rounded px-3 py-1 text-sm"
                >
                  <option value="side-by-side">Side by Side</option>
                  <option value="diff">Diff View</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-auto">
              {recentResponses.map((response) => {
                const isSelected = selectedResponses.find(r => r.timestamp === response.timestamp);
                const canSelect = selectedResponses.length < 2 || isSelected;

                return (
                  <div
                    key={response.timestamp}
                    className={`p-4 border-b border-border/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-primary/10 border-primary/20' : 'hover:bg-muted/50'
                    } ${!canSelect ? 'opacity-50' : ''}`}
                    onClick={() => canSelect && (isSelected ? removeFromComparison(response.timestamp) : addToComparison(response))}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="font-medium text-sm truncate">
                          {response.requestName}
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(response.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        response.status >= 200 && response.status < 300
                          ? 'bg-green-500/20 text-green-400'
                          : response.status >= 400
                          ? 'bg-red-500/20 text-red-400'
                          : 'bg-yellow-500/20 text-yellow-400'
                      }`}>
                        {response.status}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {response.time}ms • {(response.size / 1024).toFixed(1)}KB
                    </div>
                    {isSelected && (
                      <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                        <div className={`w-2 h-2 rounded-full ${selectedResponses.indexOf(isSelected) === 0 ? 'bg-blue-500' : 'bg-green-500'}`} />
                        Response {selectedResponses.indexOf(isSelected) + 1}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Comparison View */}
          <div className="flex-1 overflow-hidden">
            {selectedResponses.length === 0 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <GitCompare size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">Select two responses to compare</p>
                  <p className="text-sm mt-2">Choose from the history panel on the left</p>
                </div>
              </div>
            ) : selectedResponses.length === 1 ? (
              <div className="h-full flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <span className="text-2xl">1</span>
                  </div>
                  <p className="text-lg font-medium">Select one more response</p>
                  <p className="text-sm mt-2">Choose another response from the history to compare</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex">
                {/* Response 1 */}
                <div className="flex-1 border-r border-border flex flex-col">
                  <div className="p-4 border-b border-border bg-blue-500/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">Response 1</span>
                        <span className="text-sm text-muted-foreground">
                          {selectedResponses[0].requestName}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded ${
                          selectedResponses[0].status >= 200 && selectedResponses[0].status < 300
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {selectedResponses[0].status}
                        </span>
                      </div>
                    </div>
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
                  <div className="p-4 border-b border-border bg-green-500/10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">Response 2</span>
                        <span className="text-sm text-muted-foreground">
                          {selectedResponses[1].requestName}
                        </span>
                      </div>
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded ${
                          selectedResponses[1].status >= 200 && selectedResponses[1].status < 300
                            ? 'bg-green-500/20 text-green-400'
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {selectedResponses[1].status}
                        </span>
                      </div>
                    </div>
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

        {/* Footer with diff summary */}
        {diff && (
          <div className="p-4 border-t border-border bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                {diff.status && (
                  <span className="text-red-400">⚠️ Status changed</span>
                )}
                {diff.time && (
                  <span className="text-blue-400">⏱️ Time: {selectedResponses[0].time}ms → {selectedResponses[1].time}ms</span>
                )}
                {Object.keys(diff.headers).length > 0 && (
                  <span className="text-orange-400">📋 {Object.keys(diff.headers).length} header(s) changed</span>
                )}
                {diff.data && (
                  <span className="text-purple-400">📄 Response data changed</span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Differences highlighted above
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseComparison;