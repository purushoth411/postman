import { useState } from "react";

export default function HeadersEditor({ headers = [], setHeaders }) {
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

  return (
    <div>
      {localHeaders.map((header, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={header.key}
            onChange={(e) => handleChange(index, "key", e.target.value)}
            placeholder="Header Key"
            className="flex-1 p-2 border rounded"
          />
          <input
            type="text"
            value={header.value}
            onChange={(e) => handleChange(index, "value", e.target.value)}
            placeholder="Header Value"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={() => removeHeader(index)}
            className="px-2 py-1 text-white bg-red-500 rounded"
          >
            X
          </button>
        </div>
      ))}
      <button
        onClick={addHeader}
        className="px-3 py-1 text-white bg-blue-500 rounded"
      >
        + Add Header
      </button>
    </div>
  );
}
