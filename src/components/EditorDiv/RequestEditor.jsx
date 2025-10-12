import React, { useState, useEffect } from 'react';
import RequestBar from './RequestBar';
import RequestTabs from './RequestTabs';
import ResponseViewer from './ResponseViewer';
import { useAuth } from '../../utils/idb';

const RequestEditor = ({ onChangeRequest }) => {
  const { user, selectedRequest, selectedEnvironment, selectedGlobal, selectedWorkspace } = useAuth();

  const request = selectedRequest || { 
    id: null,
    method: 'GET', 
    url: '', 
    body_raw: '', 
    body_formdata: '',
    params: '',
    headers: '',
  };

  const [method, setMethod] = useState(request.method);
  const [url, setUrl] = useState(request.url);
  const [bodyRaw, setBodyRaw] = useState(request.body_raw);
  const [bodyFormData, setBodyFormData] = useState(request.body_formdata);
  const [params, setParams] = useState(request.queryParams);
  const [headers, setHeaders] = useState(request.headers);
  const [activeTab, setActiveTab] = useState('body');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [variables, setVariables] = useState({});

  // Fetch environment and global variables
  useEffect(() => {
    if (!user || !selectedWorkspace) return;
    fetchVariables();
  }, [user, selectedWorkspace, selectedEnvironment, selectedGlobal]);

  const fetchVariables = async () => {
    try {
      const mergedVars = {};

      // 1. Fetch Global Variables first (lower priority)
      const globalRes = await fetch(
        `http://localhost:5000/api/api/getGlobalVariables?workspace_id=${selectedWorkspace.id}`
      );
      if (globalRes.ok) {
        const globalData = await globalRes.json();
        globalData.forEach(v => {
          mergedVars[v.key] = v.value;
        });
      }

      // 2. Fetch Active Environment Variables (higher priority - overrides global)
      const activeEnvRes = await fetch(
        `http://localhost:5000/api/api/getActiveEnvironment?user_id=${user.id}&workspace_id=${selectedWorkspace.id}`
      );
      
      if (activeEnvRes.ok) {
        const activeEnvData = await activeEnvRes.json();
        
        if (activeEnvData.environment_id) {
          const envVarsRes = await fetch(
            `http://localhost:5000/api/api/getEnvironmentVariables?environment_id=${activeEnvData.environment_id}`
          );
          
          if (envVarsRes.ok) {
            const envVarsData = await envVarsRes.json();
            envVarsData.forEach(v => {
              mergedVars[v.key] = v.value; // Override global with environment-specific
            });
          }
        }
      }

      setVariables(mergedVars);
    } catch (err) {
      console.error('Error fetching variables:', err);
    }
  };

  // Sync when selectedRequest.id changes
  useEffect(() => {
    if (!selectedRequest) return;
    setMethod(selectedRequest.method || 'GET');
    setUrl(selectedRequest.url || '');
    setBodyRaw(selectedRequest.body_raw || '');
    setBodyFormData(selectedRequest.body_formdata || '');
    setResponse(null);
  }, [selectedRequest?.id]);

  const handleChange = (key, value) => {
    const updated = { ...request, [key]: value };
    onChangeRequest(updated);

    if (key === 'method') setMethod(value);
    if (key === 'url') setUrl(value);
    if (key === 'body_raw') setBodyRaw(value);
    if (key === 'body_formdata') setBodyFormData(value);
  };

  // Replace variables in a string
  const replaceVariables = (str) => {
    if (!str) return str;
    
    // Replace {{variable_name}} with actual values
    return str.replace(/\{\{([^}]+)\}\}/g, (match, varName) => {
      const trimmedVar = varName.trim();
      if (variables.hasOwnProperty(trimmedVar)) {
        return variables[trimmedVar];
      }
      // If variable not found, leave as is
      return match;
    });
  };

  const handleSendRequest = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      // Replace variables in URL
      const resolvedUrl = replaceVariables(url);

      const options = { method, headers: {} };

      // Replace variables in headers if they exist
      if (headers && Array.isArray(headers)) {
        headers.forEach(({ key, value, enabled }) => {
          if (enabled && key) {
            options.headers[key] = replaceVariables(value);
          }
        });
      }

      // Only include body for POST/PUT/PATCH
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        if (activeTab === 'body') {
          if (bodyRaw) {
            // Replace variables in raw body
            const resolvedBody = replaceVariables(bodyRaw);
            options.headers['Content-Type'] = 'application/json';
            options.body = resolvedBody;
          } else if (bodyFormData) {
            // Parse and create FormData with variable replacement
            const parsed = JSON.parse(bodyFormData || '[]');
            const formData = new FormData();
            parsed.forEach(({ key, value, type, enabled }) => {
              if (!key || !enabled) return;

              if (type === 'file' && value instanceof File) {
                formData.append(key, value);
              } else {
                // Replace variables in form data values
                formData.append(key, replaceVariables(value));
              }
            });
            options.body = formData;
          }
        }
      }

      const start = Date.now();
      const res = await fetch(resolvedUrl, options);
      const end = Date.now();

      const text = await res.text();

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: Object.fromEntries(res.headers.entries()),
        body: text,
        time: end - start,
        size: new Blob([text]).size,
        resolvedUrl, // Show the resolved URL in response
      });
    } catch (err) {
      setResponse({
        status: 0,
        statusText: 'Error',
        headers: {},
        body: err.message,
        time: 0,
        size: 0,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRequest = async (request) => {
    if (!request) return;

    const requestData = {
      name: request.name || "Untitled Request",
      method: request.method || "GET",
      url: request.url || "",
      body_raw: request.body_raw || "",
      body_formdata: request.body_formdata || "",
      queryParams: request.queryParams || [],
    };

    try {
      const res = await fetch("http://localhost:5000/api/api/saveRequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: request.id,
          user_id: user.id,
          request_data: requestData,
        }),
      });

      const data = await res.json();
      if (data.status) {
        alert("✅ Request saved for all users!");
      } else {
        alert("❌ Failed to save request");
      }
    } catch (err) {
      console.error(err);
      alert("⚠️ Error saving request");
    }
  };

  return (
    <div className="flex flex-col h-full border rounded shadow bg-white">
      {/* Variable indicator
      {Object.keys(variables).length > 0 && (
        <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-700">
          <span className="font-medium">🔧 Active Variables:</span>
          <span className="ml-2">{Object.keys(variables).length} variable(s) loaded</span>
        </div>
      )} */}

      <RequestBar
        loading={loading}
        onChange={handleChange}
        onSend={handleSendRequest}
        onSave={handleSaveRequest}
      />

      <RequestTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        method={method}
        body_raw={bodyRaw}
        body_formdata={bodyFormData}
        params={params}
        headers={headers}
        setParams={setParams}
        setHeaders={setHeaders}
        onBodyChange={handleChange}
      />

      <ResponseViewer response={response} variables={variables} />
    </div>
  );
};

export default RequestEditor;