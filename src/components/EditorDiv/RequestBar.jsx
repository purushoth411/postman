import React from "react";
import { Send } from "lucide-react";
import { useAuth } from "../../utils/idb";

const RequestBar = ({ loading, onChange, onSend }) => {
 
  const { selectedRequest, updateRequest } = useAuth();
  // console.log("selectedRequest: " + JSON.stringify(selectedRequest, null, 2));


  const method = selectedRequest?.method || "GET";
  const url = selectedRequest?.url || "";

  const handleMethodChange = (e) => {
    const newMethod = e.target.value;
    updateRequest(selectedRequest.id, { method: newMethod });
    onChange("method", newMethod); // Still trigger onChange if needed elsewhere
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    updateRequest(selectedRequest.id, { url: newUrl });
    onChange("url", newUrl); // Still trigger onChange if needed elsewhere
  };

  return (
    <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
      <select
        value={method}
        onChange={handleMethodChange}
        className="border rounded px-3 py-2 text-sm font-semibold focus:ring-orange-500"
      >
        {["GET", "POST", "PUT", "PATCH", "DELETE"].map((m) => (
          <option key={m} value={m}>
            {m}
          </option>
        ))}
      </select>

      <input
        type="text"
        value={url}
        onChange={handleUrlChange}
        placeholder="Enter request URL"
        className="flex-1 px-3 py-2 text-sm border rounded focus:ring-orange-500"
      />

      <button
        onClick={onSend}
        disabled={loading || !url.trim()}
        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded flex items-center space-x-2 text-sm"
      >
        <Send className="w-4 h-4" />
        <span>{loading ? "Sending..." : "Send"}</span>
      </button>
    </div>
  );
};

export default RequestBar;
