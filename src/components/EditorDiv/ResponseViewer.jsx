import React, { useState, useMemo } from 'react';
import { Copy, Search, X } from 'lucide-react';
import toast from 'react-hot-toast';

const ResponseViewer = ({ response, variables }) => {
  const [viewMode, setViewMode] = useState('pretty'); // pretty, raw, html, preview
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showRequestDetails, setShowRequestDetails] = useState(false);

  const formatJson = (text) => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  };

  const isJson = (text) => {
    try {
      JSON.parse(text);
      return true;
    } catch {
      return false;
    }
  };

  const isHtml = (text) => {
    return /<\/?[a-z][\s\S]*>/i.test(text);
  };

  // Highlight search term in content
  const highlightSearch = (text) => {
    if (!searchTerm || !text) return text;
    
    const parts = text.split(new RegExp(`(${searchTerm})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === searchTerm.toLowerCase() 
        ? `<mark class="bg-yellow-300 text-black">${part}</mark>`
        : part
    ).join('');
  };

  // Get formatted content based on view mode
  const formattedContent = useMemo(() => {
    if (!response?.body) return '';

    let content = response.body;

    switch (viewMode) {
      case 'pretty':
        content = isJson(content) ? formatJson(content) : content;
        break;
      case 'raw':
        // Keep as-is
        break;
      case 'html':
        // Return raw HTML for rendering
        break;
      case 'preview':
        // For HTML preview mode
        break;
      default:
        content = formatJson(content);
    }

    return content;
  }, [response?.body, viewMode]);

  // Highlighted content for search
  const highlightedContent = useMemo(() => {
    if (!searchTerm) return formattedContent;
    return highlightSearch(formattedContent);
  }, [formattedContent, searchTerm]);

  // Count search matches
  const searchMatches = useMemo(() => {
    if (!searchTerm || !formattedContent) return 0;
    const matches = formattedContent.match(new RegExp(searchTerm, 'gi'));
    return matches ? matches.length : 0;
  }, [formattedContent, searchTerm]);

  const handleCopy = () => {
    if (!response?.body) return;

    navigator.clipboard.writeText(formattedContent)
      .then(() => {
        toast.success("Response copied to clipboard");
      })
      .catch(() => {
        toast.error("Failed to copy response");
      });
  };

  const handleSearchToggle = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchTerm('');
    }
  };

  if (!response) return null;

  const availableModes = [
    { id: 'pretty', label: 'Pretty', available: isJson(response.body) },
    { id: 'raw', label: 'Raw', available: true },
    { id: 'html', label: 'HTML', available: isHtml(response.body) },
    { id: 'preview', label: 'Preview', available: isHtml(response.body) },
  ].filter(mode => mode.available);

  return (
    <div className="border-t bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="flex justify-between items-center p-4">
          <div className="space-x-3 text-sm">
            <span className="font-semibold">Response</span>
            <span
              className={`px-2 py-1 text-xs rounded font-medium ${
                response.status >= 200 && response.status < 300
                  ? 'bg-green-100 text-green-800'
                  : response.error
                  ? 'bg-red-100 text-red-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {response.status} {response.statusText}
            </span>
            <span className="text-xs text-gray-500">
              {response.time} ms • {response.size} bytes
            </span>
            {response.resolvedUrl && (
              <span className="text-xs text-gray-400 truncate max-w-xs" title={response.resolvedUrl}>
                {response.resolvedUrl}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowRequestDetails(!showRequestDetails)}
              className={`p-2 rounded hover:bg-gray-100 ${showRequestDetails ? 'bg-red-100 text-red-600' : ''}`}
              title="Show request details"
            >
              <span className="text-xs font-medium">{response.requestMethod || 'GET'}</span>
            </button>
            <button
              onClick={handleSearchToggle}
              className={`p-2 rounded hover:bg-gray-100 ${showSearch ? 'bg-blue-100 text-blue-600' : ''}`}
              title="Search in response"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={handleCopy}
              className="p-2 rounded hover:bg-gray-100"
              title="Copy response"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Request Details */}
        {showRequestDetails && (
          <div className="px-4 pb-3 border-b border-gray-200 bg-gray-50">
            <div className="text-xs font-semibold text-gray-700 mb-2">Request Details:</div>
            <div className="space-y-1 text-xs">
              <div><span className="font-medium">Method:</span> <span className="text-gray-600">{response.requestMethod || 'GET'}</span></div>
              {response.resolvedUrl && (
                <div><span className="font-medium">URL:</span> <span className="text-gray-600 break-all">{response.resolvedUrl}</span></div>
              )}
              {response.requestHeaders && Object.keys(response.requestHeaders).length > 0 && (
                <div>
                  <span className="font-medium">Headers:</span>
                  <pre className="mt-1 p-2 bg-white border border-gray-200 rounded text-xs overflow-x-auto">
                    {JSON.stringify(response.requestHeaders, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Mode Tabs */}
        <div className="flex items-center space-x-1 px-4 pb-2">
          {availableModes.map(mode => (
            <button
              key={mode.id}
              onClick={() => setViewMode(mode.id)}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                viewMode === mode.id
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        {showSearch && (
          <div className="px-4 pb-3 flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search in response..."
                className="w-full px-3 py-2 pr-8 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            {searchTerm && (
              <span className="text-sm text-gray-600 whitespace-nowrap">
                {searchMatches} {searchMatches === 1 ? 'match' : 'matches'}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Response Content */}
      <div className="flex-1 overflow-auto bg-white max-h-[400px]">
        {viewMode === 'preview' && isHtml(response.body) ? (
          // HTML Preview Mode
          <iframe
            srcDoc={response.body}
            className="w-full h-full border-0"
            sandbox="allow-same-origin"
            title="HTML Preview"
          />
        ) : (
          // Code Display Mode
          <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
            <code
              dangerouslySetInnerHTML={{ 
                __html: searchTerm ? highlightedContent : formattedContent 
              }}
            />
          </pre>
        )}
      </div>

    
    </div>
  );
};

export default ResponseViewer;