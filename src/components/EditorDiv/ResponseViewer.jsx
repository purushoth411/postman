import React from 'react';
import { Copy, Download } from 'lucide-react';

const ResponseViewer = ({ response }) => {
  const formatJson = (text) => {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch {
      return text;
    }
  };

  if (!response) return null;

  return (
    <div className="border-t bg-gray-50">
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
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded hover:bg-gray-200">
            <Copy className="w-4 h-4" />
          </button>
          <button className="p-2 rounded hover:bg-gray-200">
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-white overflow-auto border-t max-h-[400px]">
        <pre className="p-4 text-sm font-mono whitespace-pre-wrap">
          <code>{formatJson(response.body)}</code>
        </pre>
      </div>
    </div>
  );
};

export default ResponseViewer;
