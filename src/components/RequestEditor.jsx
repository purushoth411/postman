import React, { useState, useEffect } from 'react';
import { Send, Copy, Download } from 'lucide-react';

const RequestEditor = ({ request, onChangeRequest, onSendRequest }) => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState('body');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update local state when request changes
  useEffect(() => {
    if (request) {
      setMethod(request.method || 'GET');
      setUrl(request.url || '');
      setBody(request.body || '');
      setResponse(null);
    } else {
      setMethod('GET');
      setUrl('');
      setBody('');
      setResponse(null);
    }
  }, [request]);

  const handleMethodChange = (e) => {
    const newMethod = e.target.value;
    setMethod(newMethod);
    onChangeRequest({ ...request, method: newMethod });
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setUrl(newUrl);
    onChangeRequest({ ...request, url: newUrl });
  };

  const handleBodyChange = (e) => {
    const newBody = e.target.value;
    setBody(newBody);
    onChangeRequest({ ...request, body: newBody });
  };

  const handleSendRequest = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    try {
      const options = {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (body.trim() && ['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = body;
      }

      const startTime = Date.now();
      const response = await fetch(url, options);
      const endTime = Date.now();
      
      const responseBody = await response.text();
      
      setResponse({
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        body: responseBody,
        time: endTime - startTime,
        size: new Blob([responseBody]).size
      });
    } catch (error) {
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        body: error.message,
        time: 0,
        size: 0,
        error: true
      });
    } finally {
      setLoading(false);
    }
  };

  const formatResponseBody = (body) => {
    try {
      return JSON.stringify(JSON.parse(body), null, 2);
    } catch {
      return body;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      {/* Request Header */}
      <div className="flex items-center space-x-3 p-4 border-b border-gray-200 bg-white">
        <select 
          value={method} 
          onChange={handleMethodChange} 
          className="border border-gray-300 rounded px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-orange-500"
        >
          {['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'].map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input
          type="text"
          value={url}
          onChange={handleUrlChange}
          placeholder="Enter request URL"
          className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <button 
          onClick={handleSendRequest}
          disabled={loading || !url.trim()}
          className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-6 py-2 rounded text-sm font-medium flex items-center space-x-2 transition-colors"
        >
          <Send className="w-4 h-4" />
          <span>{loading ? 'Sending...' : 'Send'}</span>
        </button>
      </div>

      {/* Request Body Section */}
      <div className="flex-1 flex flex-col">
        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50">
          {['body', 'headers', 'params'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium capitalize ${
                activeTab === tab
                  ? 'border-b-2 border-orange-500 text-orange-600 bg-white'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex">
          {/* Request Section */}
          <div className="flex-1 flex flex-col">
            {activeTab === 'body' && (
              <textarea
                value={body}
                onChange={handleBodyChange}
                placeholder={method === 'GET' ? 'This request does not have a body' : 'Enter request body (JSON)'}
                disabled={method === 'GET'}
                className="flex-1 p-4 text-sm font-mono resize-none focus:outline-none disabled:bg-gray-50 disabled:text-gray-400"
              />
            )}
            {activeTab === 'headers' && (
              <div className="p-4 text-sm text-gray-500">
                Headers configuration (not implemented in demo)
              </div>
            )}
            {activeTab === 'params' && (
              <div className="p-4 text-sm text-gray-500">
                Query parameters (not implemented in demo)
              </div>
            )}
          </div>

          {/* Response Section */}
          {response && (
            <div className="flex-1 border-l border-gray-200 flex flex-col">
              {/* Response Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm font-medium">Response</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded ${
                      response.status >= 200 && response.status < 300 
                        ? 'bg-green-100 text-green-800'
                        : response.error
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {response.status} {response.statusText}
                    </span>
                    <span className="text-xs text-gray-500">
                      {response.time}ms • {response.size} bytes
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-1.5 hover:bg-gray-200 rounded">
                      <Copy className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="p-1.5 hover:bg-gray-200 rounded">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Response Body */}
              <div className="flex-1 overflow-auto">
                <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
                  {formatResponseBody(response.body)}
                </pre>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestEditor;
