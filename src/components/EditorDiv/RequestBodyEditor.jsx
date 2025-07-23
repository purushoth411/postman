import React, { useState } from 'react';
import { useAuth } from '../../utils/idb';

const RequestBodyEditor = ({ method, body, onChange }) => {
  const {selectedRequest,updateRequest}=useAuth();
  const [bodyType, setBodyType] = useState('raw'); // 'raw' or 'formdata'
  const [formData, setFormData] = useState([
    { key: '', value: '', description: '', type: 'text' },
  ]);

  const handleFormDataChange = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
    updateRequestBody(updated);
  };

  const updateRequestBody = (data) => {
    const simplifiedData = data
      .filter(item => item.key.trim())
      .map(({ key, value, description, type }) => ({
        key, value, description, type
      }));

    const serialized = JSON.stringify({ formData: simplifiedData, isFormData: true });

    updateRequest(selectedRequest.id, { body: serialized });
    onChange("body", serialized); // optional local update
  };

  const handleRawChange = (e) => {
    const raw = e.target.value;
    updateRequest(selectedRequest.id, { body: raw });
    onChange("body", raw); // optional local update
  };

  const addFormField = () => {
    setFormData([...formData, { key: '', value: '', description: '', type: 'text' }]);
  };

  const removeFormField = (index) => {
    const updated = [...formData];
    updated.splice(index, 1);
    setFormData(updated);
    updateRequestBody(updated);
  };

  return (
    <div>
      {/* Body Type Tabs */}
      <div className="flex space-x-4 mb-4">
        {['raw', 'formdata'].map(type => (
          <button
            key={type}
            onClick={() => setBodyType(type)}
            className={`px-3 py-1 rounded text-sm font-medium ${
              bodyType === type
                ? 'bg-orange-500 text-white'
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            {type.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Raw JSON Input */}
      {bodyType === 'raw' && (
        <textarea
          value={typeof body === 'string' ? body : ''}
          onChange={handleRawChange}
          placeholder={
            method === 'GET'
              ? 'GET requests do not support body'
              : 'Enter request body (JSON format)'
          }
          disabled={method === 'GET'}
          className="w-full h-48 p-3 font-mono text-sm border rounded resize-none bg-white disabled:bg-gray-100 disabled:text-gray-400"
        />
      )}

      {/* Form Data Input */}
      {bodyType === 'formdata' && (
        <div className="space-y-2">
          {formData.map((item, index) => (
            <div
              key={index}
              className="grid grid-cols-5 gap-2 items-center"
            >
              <input
                type="text"
                placeholder="Key"
                value={item.key}
                onChange={(e) => handleFormDataChange(index, 'key', e.target.value)}
                className="col-span-1 px-2 py-1 border rounded text-sm"
              />
              {item.type === 'file' ? (
                <input
                  type="file"
                  onChange={(e) =>
                    handleFormDataChange(index, 'value', e.target.files[0]?.name || '')
                  }
                  className="col-span-1 text-sm"
                />
              ) : (
                <input
                  type="text"
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) => handleFormDataChange(index, 'value', e.target.value)}
                  className="col-span-1 px-2 py-1 border rounded text-sm"
                />
              )}
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) => handleFormDataChange(index, 'description', e.target.value)}
                className="col-span-2 px-2 py-1 border rounded text-sm"
              />
              <select
                value={item.type}
                onChange={(e) => handleFormDataChange(index, 'type', e.target.value)}
                className="col-span-1 px-2 py-1 border rounded text-sm"
              >
                <option value="text">Text</option>
                <option value="file">File</option>
              </select>
              <button
                onClick={() => removeFormField(index)}
                className="text-red-500 text-sm px-2 py-1"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            onClick={addFormField}
            className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm"
          >
            + Add Field
          </button>
        </div>
      )}
    </div>
  );
};

export default RequestBodyEditor;
