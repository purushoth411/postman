import React, { useState, useEffect } from 'react';
import RequestBar from './RequestBar';
import RequestTabs from './RequestTabs';
import ResponseViewer from './ResponseViewer';

const RequestEditor = ({ request, onChangeRequest }) => {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('');
  const [body, setBody] = useState('');
  const [activeTab, setActiveTab] = useState('body');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMethod(request?.method || 'GET');
    setUrl(request?.url || '');
    setBody(request?.body || '');
    setResponse(null);
  }, [request]);

  const handleChange = (key, value) => {
    const updated = { ...request, [key]: value };
    onChangeRequest(updated);

    if (key === 'method') setMethod(value);
    if (key === 'url') setUrl(value);
    if (key === 'body') setBody(value);
  };

  const handleSendRequest = async () => {
    if (!url.trim()) return;

    setLoading(true);
    try {
      const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
      };

      if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        options.body = body;
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
        method={method}
        url={url}
        loading={loading}
        onChange={handleChange}
        onSend={handleSendRequest}
      />

      <RequestTabs
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        method={method}
        body={body}
        onBodyChange={(val) => handleChange('body', val)}
      />

      <ResponseViewer response={response} />
    </div>
  );
};

export default RequestEditor;
