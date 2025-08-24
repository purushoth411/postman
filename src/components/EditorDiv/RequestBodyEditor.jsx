import React, { useState, useEffect } from 'react';
import { useAuth } from '../../utils/idb';
import { Code, FormInput, Plus, Settings, Trash2 } from 'lucide-react';

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
  if (body_formdata) {
    setBodyType('formdata');
    setFormData(JSON.parse(body_formdata));
  } else {
    setBodyType('raw');
    setFormData([{ key: '', value: '', description: '', type: 'text' }]); // reset formData too
  }

  // reset raw body too
  setLocalRaw(body_raw || '');
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

    const formatJson = () => {
    try {
      const formatted = JSON.stringify(JSON.parse(localRaw), null, 2);
      setLocalRaw(formatted);
      updateRequest(selectedRequest.id, { body_raw: formatted });
      onChange('body_raw', formatted);
    } catch (error) {
      console.error('Invalid JSON');
    }
  };

 return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Header with tabs and actions */}
      <div className="flex items-center justify-between px-4 py-1 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-1">
          {['raw', 'formdata'].map((type) => (
            <button
              key={type}
              onClick={() => setBodyType(type)}
              className={`flex items-center gap-2 px-4 py-1 rounded-md text-sm font-medium transition-all duration-200 ${
                bodyType === type
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
              }`}
            >
              {type === 'raw' ? <Code className="w-4 h-4" /> : <FormInput className="w-4 h-4" />}
              {type === 'raw' ? 'Raw' : 'Form Data'}
            </button>
          ))}
        </div>
        {bodyType === 'raw' && (
          <button
            onClick={formatJson}
            className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-md transition-colors"
          >
            <Settings className="w-4 h-4" />
            Format JSON
          </button>
        )}
      </div>

      <div className="p-2">
        {/* Raw JSON Input */}
        {bodyType === 'raw' && (
          <div className="relative">
            <textarea
              value={localRaw}
              onChange={handleRawChange}
              onBlur={handleRawBlur}
              placeholder={
                method === 'GET'
                  ? 'GET requests do not support body'
                  : '{\n  "key": "value",\n  "example": "data"\n}'
              }
              disabled={method === 'GET'}
              className="w-full h-64 p-2 font-mono text-sm border border-gray-300 rounded-lg resize-none bg-white disabled:bg-gray-50 disabled:text-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            {method === 'GET' && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-50 bg-opacity-90 rounded-lg">
                <p className="text-gray-500 font-medium">GET requests do not support request body</p>
              </div>
            )}
          </div>
        )}

        {/* Form Data Input */}
        {bodyType === 'formdata' && (
          <div className="space-y-3">
            {/* Headers */}
            <div className="grid grid-cols-12 gap-3 px-2 py-1 text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 rounded-md">
              <div className="col-span-3">Key</div>
              <div className="col-span-3">Value</div>
              <div className="col-span-3">Description</div>
              <div className="col-span-2">Type</div>
              <div className="col-span-1">Action</div>
            </div>

            {/* Form Fields */}
            {formData.map((item, index) => (
              <div key={index} className="grid grid-cols-12 gap-3 items-start p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <input
                  type="text"
                  placeholder="Enter key"
                  value={item.key}
                  onChange={(e) => handleFormDataChange(index, 'key', e.target.value)}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                {item.type === 'file' ? (
                  <div className="col-span-3 relative">
                    <input
                      type="file"
                      onChange={(e) => handleFormDataChange(index, 'value', e.target.files[0]?.name || '')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer hover:bg-gray-50">
                      <Upload className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600 truncate">
                        {item.value || 'Choose file...'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <input
                    type="text"
                    placeholder="Enter value"
                    value={item.value}
                    onChange={(e) => handleFormDataChange(index, 'value', e.target.value)}
                    className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                )}
                
                <input
                  type="text"
                  placeholder="Optional description"
                  value={item.description}
                  onChange={(e) => handleFormDataChange(index, 'description', e.target.value)}
                  className="col-span-3 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                
                <select
                  value={item.type}
                  onChange={(e) => handleFormDataChange(index, 'type', e.target.value)}
                  className="col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="text">Text</option>
                  <option value="file">File</option>
                </select>
                
                <button
                  onClick={() => removeFormField(index)}
                  className="col-span-1 flex items-center justify-center p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}

            <button
              onClick={addFormField}
              className="flex items-center gap-2 px-4 py-2 text-orange-600 border border-orange-300 rounded-md hover:bg-orange-50 transition-all duration-200 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Form Field
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestBodyEditor;
