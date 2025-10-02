import React, { useState, useEffect } from "react";
import { Send, Save } from "lucide-react";
import { useAuth } from "../../utils/idb";
import { parseQueryParams } from "../../helpers/Commonhelper";

const RequestBar = ({ loading, onChange, onSend, onSave }) => {
  const { selectedRequest, updateRequest,selectedWorkspace } = useAuth();

  const method = selectedRequest?.method || "GET";
  const [localUrl, setLocalUrl] = useState(selectedRequest?.url || "");

  useEffect(() => {
    setLocalUrl(selectedRequest?.url || "");
  }, [selectedRequest?.url]);

  const handleMethodChange = (e) => {
    const newMethod = e.target.value;
    updateRequest(selectedRequest.id, { method: newMethod });
    onChange("method", newMethod);
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setLocalUrl(newUrl); // update local input only
  };

  const handleUrlBlur = () => {
    const paramsArray = parseQueryParams(localUrl);
    updateRequest(selectedRequest.id, { url: localUrl, queryParams: paramsArray });
    onChange("url", localUrl);
  };

  const handleSave = () => {
    if (!selectedRequest) return;
    // Call parent save function or API here
    if (onSave) {
      console.log("Saving request:", selectedRequest);
      onSave(selectedRequest);
    } else {
      console.log("Saving request:", selectedRequest);
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
      {/* Request Name */}
      <div className="font-medium text-gray-700 min-w-[150px] truncate">
        {selectedRequest?.name || "Untitled Request"}
      </div>

      {/* Method Dropdown */}
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

      {/* URL Input */}
      <input
        type="text"
        value={localUrl}
        onChange={handleUrlChange}
        onBlur={handleUrlBlur} // sync with store on blur
        placeholder="Enter request URL"
        className="flex-1 px-3 py-2 text-sm border rounded focus:ring-orange-500"
      />

      {/* Save Button */}
      {selectedWorkspace.role !== 'VIEWER' && 
      <button
        onClick={handleSave}
        disabled={!selectedRequest}
        className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded flex items-center space-x-2 text-sm"
      >
        <Save className="w-4 h-4" />
        <span>Save</span>
      </button>
}

      {/* Send Button */}
      <button
        onClick={onSend}
        disabled={loading || !localUrl.trim()}
        className="bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-white px-4 py-2 rounded flex items-center space-x-2 text-sm"
      >
        <Send className="w-4 h-4" />
        <span>{loading ? "Sending..." : "Send"}</span>
      </button>
    </div>
  );
};

export default RequestBar;
