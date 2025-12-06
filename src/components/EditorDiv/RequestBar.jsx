import React, { useState, useEffect } from "react";
import { Send, Save, Edit3, Check } from "lucide-react";
import { useAuth } from "../../utils/idb";
import { parseQueryParams } from "../../helpers/Commonhelper";
import { toast } from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../../config/api";

const RequestBar = ({ loading, onChange, onSend, onSave }) => {
  const { selectedRequest, updateRequest, selectedWorkspace } = useAuth();

  const method = selectedRequest?.method || "GET";
  const [localUrl, setLocalUrl] = useState(selectedRequest?.url || "");
  const [editingName, setEditingName] = useState(false);
  const [name, setName] = useState(selectedRequest?.name || "");

  useEffect(() => {
    setLocalUrl(selectedRequest?.url || "");
    setName(selectedRequest?.name || "");
  }, [selectedRequest?.url, selectedRequest?.name]);

  const handleMethodChange = (e) => {
    const newMethod = e.target.value;
    updateRequest(selectedRequest.id, { method: newMethod });
    onChange("method", newMethod);
  };

  const handleUrlChange = (e) => {
    const newUrl = e.target.value;
    setLocalUrl(newUrl);
  };

  const handleUrlKeyDown = (e) => {
    if(e.key === "Enter" && !loading && localUrl.trim()) {
        onSend();
    }
  }

  const handleUrlBlur = () => {
    const paramsArray = parseQueryParams(localUrl);
    updateRequest(selectedRequest.id, { url: localUrl, queryParams: paramsArray });
    onChange("url", localUrl);
  };

  const handleSave = () => {
    if (!selectedRequest) return;
    if (onSave) onSave(selectedRequest);
    else console.log("Saving request:", selectedRequest);
  };

  const handleRename = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Request name cannot be empty");
      return;
    }

    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.RENAME_REQUEST), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({ request_id: selectedRequest.id, name: trimmed }),
      });

      const data = await res.json();
      if (!res.ok || !data.status) throw new Error(data.message || "Failed to rename request");

      updateRequest(selectedRequest.id, { name: trimmed });
      toast.success("Request renamed successfully");
      setEditingName(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Error renaming request.");
    }
  };

  return (
    <div className="flex items-center gap-3 p-4 border-b bg-gray-50">
      {/* Editable Request Name */}
      <div className="flex items-center gap-1 min-w-[180px]">
        {editingName ? (
          <>
            <input
              className="border px-2 py-1 text-sm rounded w-[150px]"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleRename()}
              onBlur={handleRename}
              autoFocus
            />
            <Check
              className="w-4 h-4 text-green-600 cursor-pointer"
              onClick={handleRename}
            />
          </>
        ) : (
          <div
            className="font-medium text-gray-700 truncate flex items-center gap-1 cursor-pointer hover:text-orange-600"
            onClick={() => {
              if (selectedWorkspace.role !== "VIEWER") setEditingName(true);
            }}
          >
            <span>{name || "Untitled Request"}</span>
            {selectedWorkspace.role !== "VIEWER" && (
              <Edit3 className="w-3 h-3 text-gray-500" />
            )}
          </div>
        )}
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
        onBlur={handleUrlBlur}
        onKeyDown={handleUrlKeyDown}
        placeholder="Enter request URL"
        className="flex-1 px-3 py-2 text-sm border rounded focus:ring-orange-500"
      />

      {/* Save Button */}
      {selectedWorkspace.role !== "VIEWER" && (
        <button
          onClick={handleSave}
          disabled={!selectedRequest}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded flex items-center space-x-2 text-sm"
        >
          <Save className="w-4 h-4" />
          <span>Save</span>
        </button>
      )}

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
