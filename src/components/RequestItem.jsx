import React, { useEffect, useRef, useState } from 'react';
import { File, MoreHorizontal, Edit3, Trash2, MoreVertical } from 'lucide-react';
import { toast } from 'react-hot-toast';
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
    const res = await fetch(`http://localhost:5000/api/api/renameRequest`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
  if (!window.confirm("Are you sure you want to delete this request?")) return;
  try {
    const res = await fetch(`http://localhost:5000/api/api/deleteRequest`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
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
      className={`group flex items-center space-x-2 px-2 py-1.5 text-sm cursor-pointer rounded-lg ml-4 ${
        selectedRequest?.id === request?.id ? 'bg-orange-100 text-orange-800'
          : 'text-gray-700 hover:bg-gray-100'
      }`}
      onClick={() => {
        onRequestSelect?.(request);
        setSelectedRequest(request);
      }}
    >
      <span className={`px-2 py-0.5 text-xs font-semibold rounded ${getMethodColor(request.method)}`}>
        {request.method}
      </span>
      <File className="w-4 h-4 text-gray-400" />

      {editing ? (
        <input
          autoFocus
          className="flex-1 border border-gray-300 px-2 py-1 rounded text-sm"
          value={editingName}
          onChange={e => setEditingName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={e => e.key === 'Enter' && handleRename()}
        />
      ) : (
        <span className="truncate flex-1">{request.name}</span>
      )}

      {/* Dropdown */}
       {selectedWorkspace.role !== 'VIEWER' &&
      <div className="relative" ref={dropdownRef}>
        <button
          className="p-1 hover:bg-gray-200 rounded"
          onClick={e => {
            e.stopPropagation();
            setActiveDropdown(prev => !prev);
          }}
        >
          <MoreVertical className="w-3 h-3" />
        </button>
        {activeDropdown && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <button
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
              onClick={() => {
                setEditing(true);
                setActiveDropdown(false);
              }}
            >
              <Edit3 className="w-4 h-4" />
              <span>Rename</span>
            </button>
            <button
              className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
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
