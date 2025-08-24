import { Copy, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export default function HeadersEditor ({ headers = [], setHeaders })  {
  const [localHeaders, setLocalHeaders] = useState(headers);

  const handleChange = (index, field, value) => {
    const updated = [...localHeaders];
    updated[index][field] = value;
    setLocalHeaders(updated);
    setHeaders(updated);
  };

  const addHeader = () => {
    setLocalHeaders([...localHeaders, { key: "", value: "" }]);
  };

  const removeHeader = (index) => {
    const updated = localHeaders.filter((_, i) => i !== index);
    setLocalHeaders(updated);
    setHeaders(updated);
  };

  const duplicateHeader = (index) => {
    const updated = [...localHeaders];
    const duplicate = { ...localHeaders[index] };
    updated.splice(index + 1, 0, duplicate);
    setLocalHeaders(updated);
    setHeaders(updated);
  };

  const commonHeaders = [
    'Content-Type',
    'Authorization',
    'Accept',
    'User-Agent',
    'Cache-Control',
    'Cookie'
  ];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      
      
      <div className="p-2">
        {/* Headers */}
        <div className="grid grid-cols-12 gap-3 px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 rounded-md mb-3">
          <div className="col-span-4">Header Name</div>
          <div className="col-span-5">Header Value</div>
          <div className="col-span-3">Actions</div>
        </div>

        {/* Header Fields */}
        <div className="space-y-2">
          {localHeaders.map((header, index) => (
            <div key={index} className="grid grid-cols-12 gap-3 items-center p-1 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group">
              <div className="col-span-4 relative">
                <input
                  type="text"
                  value={header.key}
                  onChange={(e) => handleChange(index, "key", e.target.value)}
                  placeholder="Header name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  list={`headers-${index}`}
                />
                <datalist id={`headers-${index}`}>
                  {commonHeaders.map(h => (
                    <option key={h} value={h} />
                  ))}
                </datalist>
              </div>
              <input
                type="text"
                value={header.value}
                onChange={(e) => handleChange(index, "value", e.target.value)}
                placeholder="Header value"
                className="col-span-5 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <div className="col-span-3 flex items-center gap-1">
                <button
                  onClick={() => duplicateHeader(index)}
                  className="flex items-center justify-center p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  title="Duplicate header"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  onClick={() => removeHeader(index)}
                  className="flex items-center justify-center p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                  title="Remove header"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={addHeader}
          className="mt-1 flex items-center gap-2 px-4 py-2 text-orange-600 border border-orange-300 rounded-md hover:bg-orange-50 transition-all duration-200 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Header
        </button>
      </div>
    </div>
  );
};