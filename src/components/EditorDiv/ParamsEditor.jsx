import { useState, useEffect } from "react";
import { updateUrlFromParams } from "../../helpers/Commonhelper";
import { useAuth } from "../../utils/idb";

export default function ParamsEditor({ params = [], setParams }) {
  const [localParams, setLocalParams] = useState(params);
  const { selectedRequest, updateRequest } = useAuth();

  // Sync local params with selectedRequest.queryParams
  useEffect(() => {
    if (selectedRequest?.queryParams) {
      setLocalParams(selectedRequest.queryParams);
      setParams(selectedRequest.queryParams);
    }
  }, [selectedRequest?.queryParams, setParams]);

  const handleChange = (index, field, value) => {
    const updated = [...localParams];
    updated[index][field] = value;
    setLocalParams(updated);
    setParams(updated);

    const baseUrl = selectedRequest?.url?.split("?")[0] || "";
    const newUrl = updateUrlFromParams(baseUrl, updated);
    updateRequest(selectedRequest.id, { queryParams: updated, url: newUrl });
  };

  const addParam = () => {
    const updated = [...localParams, { key: "", value: "" }];
    setLocalParams(updated);
    setParams(updated);

    const baseUrl = selectedRequest?.url?.split("?")[0] || "";
    const newUrl = updateUrlFromParams(baseUrl, updated);
    updateRequest(selectedRequest.id, { queryParams: updated, url: newUrl });
  };

  const removeParam = (index) => {
    const updated = localParams.filter((_, i) => i !== index);
    setLocalParams(updated);
    setParams(updated);

    const baseUrl = selectedRequest?.url?.split("?")[0] || "";
    const newUrl = updateUrlFromParams(baseUrl, updated);
    updateRequest(selectedRequest.id, { queryParams: updated, url: newUrl });
  };

  return (
    <div>
      {localParams.map((param, index) => (
        <div key={index} className="flex gap-2 mb-2">
          <input
            type="text"
            value={param.key}
            onChange={(e) => handleChange(index, "key", e.target.value)}
            placeholder="Key"
            className="flex-1 p-2 border rounded"
          />
          <input
            type="text"
            value={param.value}
            onChange={(e) => handleChange(index, "value", e.target.value)}
            placeholder="Value"
            className="flex-1 p-2 border rounded"
          />
          <button
            onClick={() => removeParam(index)}
            className="px-2 py-1 text-white bg-red-500 rounded"
          >
            X
          </button>
        </div>
      ))}
      <button
        onClick={addParam}
        className="px-3 py-1 text-white bg-blue-500 rounded"
      >
        + Add Param
      </button>
    </div>
  );
}
