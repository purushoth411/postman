import React from 'react';
import { Send } from 'lucide-react';

const RequestBar = ({ method, url, loading, onChange, onSend }) => {
  return (
    <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
      <select
        value={method}
        onChange={(e) => onChange('method', e.target.value)}
        className="border rounded px-3 py-2 text-sm font-semibold focus:ring-orange-500"
      >
        {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <input
        type="text"
        value={url}
        onChange={(e) => onChange('url', e.target.value)}
        placeholder="Enter request URL"
        className="flex-1 px-3 py-2 text-sm border rounded focus:ring-orange-500"
      />

      <button
        onClick={onSend}
        disabled={loading || !url.trim()}
        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded flex items-center space-x-2 text-sm"
      >
        <Send className="w-4 h-4" />
        <span>{loading ? 'Sending...' : 'Send'}</span>
      </button>
    </div>
  );
};

export default RequestBar;
