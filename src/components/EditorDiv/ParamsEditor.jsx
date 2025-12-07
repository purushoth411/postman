import { useState, useEffect } from "react";
import { updateUrlFromParams } from "../../helpers/Commonhelper";
import { useAuth } from "../../utils/idb";
import { Copy, Plus, Trash2, X } from "lucide-react"; // optional icons

export default function ParamsEditor({ params = [], setParams }) {
  const [localParams, setLocalParams] = useState(() =>
    Array.isArray(params) ? params : []
  );
  const { selectedRequest, updateRequest } = useAuth();

  // Sync local params with selectedRequest.queryParams
useEffect(() => {
  let qp = [];

  // prefer queryParams from the request
  if (selectedRequest?.queryParams) {
    qp = selectedRequest.queryParams;
    if (typeof qp === "string") {
      try {
        qp = JSON.parse(qp);
      } catch {
        qp = [];
      }
    }
  }

  // ensure it's always an array
  if (!Array.isArray(qp)) qp = [];

  setLocalParams(qp);
  setParams(qp);
}, [selectedRequest?.id, selectedRequest?.queryParams, setParams]);

  const updateAll = (updated) => {
    setLocalParams(updated);
    setParams(updated);
    const baseUrl = selectedRequest?.url?.split("?")[0] || "";
    const newUrl = updateUrlFromParams(baseUrl, updated);
    updateRequest(selectedRequest.id, { queryParams: updated, url: newUrl });
  };

  const handleChange = (index, field, value) => {
    const updated = [...localParams];
    updated[index][field] = value;
    updateAll(updated);
  };

  const addParam = () => {
    const updated = [...localParams, { key: "", value: "" }];
    updateAll(updated);
  };

  const removeParam = (index) => {
    const updated = localParams.filter((_, i) => i !== index);
    updateAll(updated);
  };
    const duplicateParam = (index) => {
    const updated = [...localParams];
    const duplicate = { ...localParams[index] };
    updated.splice(index + 1, 0, duplicate);
    updateAll(updated);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      
      
      <div className="p-2">
        {/* Headers */}
        <div className="grid grid-cols-12 gap-3 px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 rounded-md mb-1">
          <div className="col-span-4">Key</div>
          <div className="col-span-5">Value</div>
          <div className="col-span-3">Actions</div>
        </div>

        {/* Parameter Fields */}
        <div className="space-y-2">
          {Array.isArray(localParams) &&
            localParams.map((param, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-3 items-center p-1 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
              >
                <input
                  type="text"
                  value={param.key}
                  onChange={(e) => handleChange(index, "key", e.target.value)}
                  placeholder="Parameter name"
                  className="col-span-4 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  value={param.value}
                  onChange={(e) => handleChange(index, "value", e.target.value)}
                  placeholder="Parameter value"
                  className="col-span-5 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="col-span-3 flex items-center gap-1">
                  <button
                    onClick={() => duplicateParam(index)}
                    className="flex items-center justify-center p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                    title="Duplicate parameter"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => removeParam(index)}
                    className="flex items-center justify-center p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    title="Remove parameter"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>

        <button
          onClick={addParam}
          className="mt-1 flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-md hover:bg-red-50 transition-all duration-200 font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Parameter
        </button>
      </div>
    </div>
  );
};

