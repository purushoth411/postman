import React from 'react';
import RequestBodyEditor from './RequestBodyEditor';

const RequestTabs = ({ activeTab, setActiveTab, method, body, onBodyChange }) => {
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
            body={body}
            onChange={onBodyChange}
          />
        )}
        {activeTab === 'headers' && (
          <div className="text-gray-500 italic">Custom headers support coming soon...</div>
        )}
        {activeTab === 'params' && (
          <div className="text-gray-500 italic">Query parameters editor coming soon...</div>
        )}
      </div>
    </>
  );
};

export default RequestTabs;
