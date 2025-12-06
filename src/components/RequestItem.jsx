import React, { useEffect, useRef, useState } from 'react';
import { File, MoreHorizontal, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../utils/idb';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import { confirm } from '../utils/alert';

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

const RequestItem = ({ request, onRequestSelect, activeRequestId,setRequestData }) => {
  const { selectedRequest, setSelectedRequest,selectedWorkspace } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState(request.name);
  const [activeDropdown, setActiveDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);


// Rename request
const handleRename = async () => {
  const trimmed = editingName.trim();
  if (!trimmed) {
    toast.error("Request name cannot be empty");
    return;
  }

  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.RENAME_REQUEST), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify({ request_id: request.id, name: trimmed }),
    });

    const data = await res.json();
    if (!res.ok || !data.status) throw new Error(data.message || 'Failed to rename request');

    setRequestData(request.id, { name: trimmed });   // 👈 update in parent state
    setEditing(false);
    toast.success("Request renamed successfully");
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Error renaming request.");
  }
};

// Delete request
const handleDelete = async () => {
  const confirmed = await confirm("Are you sure you want to delete this request?", "Delete Request", "warning");
  if (!confirmed) return;
  try {
    const res = await fetch(getApiUrl(API_ENDPOINTS.DELETE_REQUEST), {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify({ request_id: request.id }),
    });
    if (!res.ok) throw new Error('Failed to delete request');

    setRequestData(request.id, {}, true);   // 👈 remove request
    toast.success("Request deleted successfully");
  } catch (err) {
    console.error(err);
    toast.error("Error deleting request.");
  }
};


  // Helpers to update nested folders
  const updateFolderRequests = (folders = [], reqId, newName) =>
    folders.map(f => ({
      ...f,
      requests: f.requests?.map(r => r.id === reqId ? { ...r, name: newName } : r),
      folders: updateFolderRequests(f.folders, reqId, newName)
    }));

  const removeRequestFromFolders = (folders = [], reqId) =>
    folders.map(f => ({
      ...f,
      requests: f.requests?.filter(r => r.id !== reqId),
      folders: removeRequestFromFolders(f.folders, reqId)
    }));

  return (
    <div
      className={`group flex items-center space-x-2 px-3 py-2 text-sm cursor-pointer rounded-lg ml-4 transition-all duration-150 ${
        selectedRequest?.id === request?.id 
          ? 'bg-orange-50 text-orange-900 border border-orange-200 shadow-sm'
          : 'text-gray-700 hover:bg-white hover:border hover:border-gray-200 hover:shadow-sm border border-transparent'
      }`}
      onClick={() => {
        onRequestSelect?.(request);
        setSelectedRequest(request);
      }}
    >
      <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${getMethodColor(request.method)}`}>
        {request.method}
      </span>
      <File className={`w-4 h-4 ${selectedRequest?.id === request?.id ? 'text-orange-600' : 'text-gray-400'}`} />

      {editing ? (
        <input
          autoFocus
          className="flex-1 border border-orange-300 px-3 py-1.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          value={editingName}
          onChange={e => setEditingName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={e => e.key === 'Enter' && handleRename()}
        />
      ) : (
        <span className={`truncate flex-1 font-medium ${selectedRequest?.id === request?.id ? 'text-orange-900' : 'text-gray-800'}`}>{request.name}</span>
      )}

      {/* Dropdown */}
       {selectedWorkspace.role !== 'VIEWER' &&
      <div className="relative" ref={dropdownRef}>
        <button
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          onClick={e => {
            e.stopPropagation();
            setActiveDropdown(prev => !prev);
          }}
        >
          <MoreVertical className="w-4 h-4 text-gray-500" />
        </button>
        {activeDropdown && (
          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden">
            <button
              className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => {
                setEditing(true);
                setActiveDropdown(false);
              }}
            >
              <Edit3 className="w-4 h-4" />
              <span>Rename</span>
            </button>
            <div className="border-t border-gray-100"></div>
            <button
              className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        )}
      </div>
}
    </div>
  );
};

export default RequestItem;
