import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/idb';

const RequestBodyEditor = ({ method, body_raw, body_formdata, onChange }) => {
  const { selectedRequest, updateRequest } = useAuth();

   const [localRaw, setLocalRaw] = useState(body_raw || '');

  // decide initial tab: formdata if it exists, otherwise raw
  const [bodyType, setBodyType] = useState(
    body_formdata ? 'formdata' : 'raw'
  );

  const [formData, setFormData] = useState(
    body_formdata
      ? JSON.parse(body_formdata)
      : [{ key: '', value: '', description: '', type: 'text' }]
  );

  useEffect(() => {
    // when request changes, reset state
    if (body_formdata) {
      setBodyType('formdata');
      setFormData(JSON.parse(body_formdata));
    } else {
      setBodyType('raw');
    }
  }, [body_formdata, body_raw]);

  // ---- FORM DATA ----
  const handleFormDataChange = (index, field, value) => {
    const updated = [...formData];
    updated[index][field] = value;
    setFormData(updated);
    updateFormDataBody(updated);
  };

  const updateFormDataBody = (data) => {
    const simplified = data
      .filter((item) => item.key.trim())
      .map(({ key, value, description, type }) => ({
        key,
        value,
        description,
        type,
      }));

    const serialized = JSON.stringify(simplified);
    updateRequest(selectedRequest.id, { body_formdata: serialized });
    onChange('body_formdata', serialized);
  };

  // ---- RAW BODY ----


  const handleRawChange = (e) => {
    setLocalRaw(e.target.value); // update local only
  };

  const handleRawBlur = () => {
    updateRequest(selectedRequest.id, { body_raw: localRaw });
    onChange('body_raw', localRaw);
  };

  // ---- FORM FIELDS ----
  const addFormField = () => {
    setFormData([
      ...formData,
      { key: '', value: '', description: '', type: 'text' },
    ]);
  };

  const removeFormField = (index) => {
    const updated = [...formData];
    updated.splice(index, 1);
    setFormData(updated);
    updateFormDataBody(updated);
  };

  return (
    <div>
      {/* Body Type Tabs */}
      <div className="flex space-x-4 mb-4">
        {['raw', 'formdata'].map((type) => (
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
        value={localRaw}
        onChange={handleRawChange}
        onBlur={handleRawBlur} // sync on blur
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
            <div key={index} className="grid grid-cols-6 gap-2 items-center">
              {/* Key */}
              <input
                type="text"
                placeholder="Key"
                value={item.key}
                onChange={(e) =>
                  handleFormDataChange(index, 'key', e.target.value)
                }
                className="col-span-1 px-2 py-1 border rounded text-sm"
              />
              {/* Value / File */}
              {item.type === 'file' ? (
                <input
                  type="file"
                  onChange={(e) =>
                    handleFormDataChange(
                      index,
                      'value',
                      e.target.files[0]?.name || ''
                    )
                  }
                  className="col-span-2 text-sm"
                />
              ) : (
                <input
                  type="text"
                  placeholder="Value"
                  value={item.value}
                  onChange={(e) =>
                    handleFormDataChange(index, 'value', e.target.value)
                  }
                  className="col-span-2 px-2 py-1 border rounded text-sm"
                />
              )}
              {/* Description */}
              <input
                type="text"
                placeholder="Description"
                value={item.description}
                onChange={(e) =>
                  handleFormDataChange(index, 'description', e.target.value)
                }
                className="col-span-2 px-2 py-1 border rounded text-sm"
              />
              {/* Type */}
              <select
                value={item.type}
                onChange={(e) =>
                  handleFormDataChange(index, 'type', e.target.value)
                }
                className="col-span-1 px-2 py-1 border rounded text-sm"
              >
                <option value="text">Text</option>
                <option value="file">File</option>
              </select>
              {/* Remove */}
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
