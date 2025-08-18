import React from 'react';
import RequestBodyEditor from './RequestBodyEditor';
import ParamsEditor from "./ParamsEditor";
import HeadersEditor from "./HeadersEditor";

const RequestTabs = ({ activeTab, setActiveTab, method, body_raw, body_formdata, onBodyChange, params,headers,setParams,setHeaders }) => {
  return (
    <>
      <div className="flex border-b text-sm font-medium">
        {['body', 'headers', 'params'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 capitalize ${
              activeTab === tab
                ? 'border-b-2 border-orange-500 text-orange-600 bg-white'
                : 'text-gray-600 hover:text-black'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'body' && (
          <RequestBodyEditor
            method={method}
            body_raw={body_raw}
            body_formdata={body_formdata}
            onChange={onBodyChange}
          />
        )}


{activeTab === "params" && (
  <ParamsEditor params={params} setParams={setParams} />
)}

{activeTab === "headers" && (
  <HeadersEditor headers={headers} setHeaders={setHeaders} />
)}

      </div>
    </>
  );
};

export default RequestTabs;
