import React, { useState, useEffect } from 'react';
import RequestBar from './RequestBar';
import RequestTabs from './RequestTabs';
import ResponseViewer from './ResponseViewer';
import { useAuth } from '../../utils/idb';

const RequestEditor = ({ onChangeRequest }) => {
  const { selectedRequest } = useAuth();

  const request = selectedRequest || { 
    id: null,
    method: 'GET', 
    url: '', 
    body_raw: '', 
    body_formdata: '',
    params:'',
    headers:'',
  };

  const [method, setMethod] = useState(request.method);
  const [url, setUrl] = useState(request.url);
  const [bodyRaw, setBodyRaw] = useState(request.body_raw);
  const [bodyFormData, setBodyFormData] = useState(request.body_formdata);
  const [params,setParams]=useState(request.params);
  const [headers,setHeaders]=useState(request.headers);
  const [activeTab, setActiveTab] = useState('body');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Sync when selectedRequest.id changes (not every rerender)
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
    if (key =='body_formdata') setBodyFormData(value);
  };

 const handleSendRequest = async () => {
  if (!url.trim()) return;

  setLoading(true);
  try {
    const options = { method, headers: {} };

    // Only include body for POST/PUT/PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      if (activeTab === 'body') {
        if (bodyRaw) {
          // Raw JSON body
          options.headers['Content-Type'] = 'application/json';
          options.body = bodyRaw;
        }else  if (bodyFormData) {
          // Parse and create FormData
          const parsed = JSON.parse(bodyFormData || '[]');
          const formData = new FormData();
          parsed.forEach(({ key, value, type }) => {
            if (!key) return;

            if (type === 'file' && value instanceof File) {
              // Append actual file object if available
              formData.append(key, value);
            } else {
              formData.append(key, value);
            }
          });
          options.body = formData;
          // fetch will set the Content-Type automatically for FormData
        } 
      }
    }

    const start = Date.now();
    const res = await fetch(url, options);
    const end = Date.now();

    const text = await res.text();

    setResponse({
      status: res.status,
      statusText: res.statusText,
      headers: Object.fromEntries(res.headers.entries()),
      body: text,
      time: end - start,
      size: new Blob([text]).size,
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


  return (
    <div className="flex flex-col h-full border rounded shadow bg-white">
      <RequestBar
        loading={loading}
        onChange={handleChange}
        onSend={handleSendRequest}
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

      <ResponseViewer response={response} />
    </div>
  );
};

export default RequestEditor;
