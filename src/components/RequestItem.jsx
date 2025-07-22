import React from 'react';
import { File, MoreHorizontal } from 'lucide-react';
import { useAuth } from '../utils/idb';

const getMethodColor = (method) => {
  const colors = {
    GET: 'text-green-600 bg-green-100',
    POST: 'text-blue-600 bg-blue-100',
    PUT: 'text-yellow-600 bg-yellow-100',
    DELETE: 'text-red-600 bg-red-100',
    PATCH: 'text-purple-600 bg-purple-100',
  };
  return colors[method] || 'text-gray-600 bg-gray-100';
};

const RequestItem = ({ request, onRequestSelect, activeRequestId }) => {
  const {setSelectedRequest}=useAuth();
  return (
    <div
      className={`group flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer rounded-lg ml-4 ${
        activeRequestId === request.id
          ? 'bg-orange-100 text-orange-800'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={() => {onRequestSelect?.(request);
        setSelectedRequest(request); }}
    >
      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getMethodColor(request.method)}`}>
        {request.method}
      </span>
      <File className="w-4 h-4 text-gray-400" />
      <span className="truncate flex-1">{request.name}</span>
      <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity">
        <MoreHorizontal className="w-3 h-3" />
      </button>
    </div>
  );
};

export default RequestItem;
