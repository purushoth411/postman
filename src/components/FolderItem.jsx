import React, { useState, useRef, useEffect } from 'react';
import {
  Folder, FolderOpen, FileText, ChevronRight, ChevronDown,
  MoreVertical, Edit3, FolderPlus, Trash2
} from 'lucide-react';
import RequestItem from './RequestItem';
import toast from 'react-hot-toast';
import { useAuth } from '../utils/idb';

const FolderItem = ({ folder, userId, onRequestSelect, activeRequestId, setFolderData }) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState(folder.name);
  const [showAddRequestInput, setShowAddRequestInput] = useState(false);
  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [newRequestName, setNewRequestName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const dropdownRef = useRef(null);
  const {user}=useAuth();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleExpanded = async () => {
    if (!expanded && !folder.requests) {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/api/getRequestsByFolderId?folder_id=${folder.id}`);
        const data = await res.json();
        if (data.status) {
          setFolderData(folder.id, data.requests, data.folders);
        }
      } catch (err) {
        console.error('Error fetching folder data:', err);
      } finally {
        setLoading(false);
      }
    }
    setExpanded(!expanded);
  };

  const handleKeyDownInput = (e, action) => {
    if (e.key === 'Enter') action();
    if (e.key === 'Escape') {
      setEditing(false);
      setShowAddRequestInput(false);
      setShowAddFolderInput(false);
      setEditingName(folder.name);
      setNewRequestName('');
      setNewFolderName('');
    }
  };

  const handleRename = async () => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      toast.error("Folder name cannot be empty");
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/api/renameFolder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: folder.id, name: trimmed })
      });
      if (!res.ok) throw new Error();
      setFolderData(folder.id, folder.requests || [], folder.folders || []);
      setEditing(false);
      toast.success("Folder renamed");
    } catch {
      toast.error("Failed to rename folder");
    }
  };

  const handleAddRequest = async () => {
    const trimmed = newRequestName.trim();
    if (!trimmed) {
      toast.error("Request name cannot be empty");
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/api/addRequest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          folder_id: folder.id,
          collection_id:folder.collection_id,
          name: trimmed,
          method: 'GET',
          url: '',
          headers: {},
          body: ''
        })
      });
      if (!res.ok) throw new Error();
      const newRequest = await res.json();
      setFolderData(folder.id, [...(folder.requests || []), newRequest.request], folder.folders || []);
      setNewRequestName('');
      setShowAddRequestInput(false);
      toast.success("Request added");
    } catch {
      toast.error("Failed to add request");
    }
  };

  const handleAddFolder = async () => {
    const trimmed = newFolderName.trim();
    if (!trimmed) {
      toast.error("Folder name cannot be empty");
      return;
    }
    try {
      const res = await fetch('http://localhost:5000/api/api/addFolder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            user_id:user.id,
          parent_folder_id: folder.id,
          collection_id: folder.collection_id,
          name: trimmed
        })
      });
      if (!res.ok) throw new Error();
      const newFolder = await res.json();
      setFolderData(folder.id, folder.requests || [], [...(folder.folders || []), newFolder]);
      setNewFolderName('');
      setShowAddFolderInput(false);
      toast.success("Folder added");
    } catch {
      toast.error("Failed to add folder");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this folder?')) return;
    try {
      const res = await fetch('http://localhost:5000/api/api/deleteFolder', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folder_id: folder.id })
      });
      if (!res.ok) throw new Error();
      toast.success("Folder deleted");
      setFolderData(folder.id, null, null); // let parent re-fetch if needed
    } catch {
      toast.error("Failed to delete folder");
    }
  };

  return (
    <div className="ml-4">
      <div className="flex items-center space-x-2 px-2 py-1 cursor-pointer text-sm text-gray-700">
        <button onClick={toggleExpanded}>
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </button>

        {editing ? (
          <input
            autoFocus
            value={editingName}
            onChange={e => setEditingName(e.target.value)}
            onKeyDown={e => handleKeyDownInput(e, handleRename)}
            onBlur={() => handleRename()}
            className="text-sm border px-1 rounded"
          />
        ) : (
          <div className="flex-1 flex items-center" onClick={toggleExpanded}>
            {expanded ? <FolderOpen className="w-4 h-4 text-blue-500" /> : <Folder className="w-4 h-4 text-blue-500" />}
            <span className="truncate ml-1">{folder.name}</span>
          </div>
        )}

        {loading && <span className="text-xs text-gray-400">Loading...</span>}

        {/* Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={e => {
              e.stopPropagation();
              setActiveDropdown(prev => (prev === folder.id ? null : folder.id));
            }}
            className="p-1 hover:bg-gray-200 rounded"
          >
            <MoreVertical className="w-3 h-3" />
          </button>
          {activeDropdown === folder.id && (
            <div className="absolute right-0 mt-1 bg-white shadow-lg border rounded z-10 w-48">
              <button className="px-3 py-2 text-sm hover:bg-gray-100 w-full text-left" onClick={() => { setEditing(true); setActiveDropdown(null); }}>
                <Edit3 className="w-4 h-4 inline mr-2" />
                Rename
              </button>
              <button className="px-3 py-2 text-sm hover:bg-gray-100 w-full text-left" onClick={() => { setShowAddRequestInput(true); setActiveDropdown(null); }}>
                <FileText className="w-4 h-4 inline mr-2" />
                Add Request
              </button>
              <button className="px-3 py-2 text-sm hover:bg-gray-100 w-full text-left" onClick={() => { setShowAddFolderInput(true); setActiveDropdown(null); }}>
                <FolderPlus className="w-4 h-4 inline mr-2" />
                Add Folder
              </button>
              <hr />
              <button className="px-3 py-2 text-sm hover:bg-red-50 text-red-600 w-full text-left" onClick={handleDelete}>
                <Trash2 className="w-4 h-4 inline mr-2" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Inputs */}
      {showAddRequestInput && (
        <div className="ml-6 mt-1 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            className="flex-1 border px-2 py-1 rounded text-sm"
            placeholder="Request name..."
            value={newRequestName}
            onChange={e => setNewRequestName(e.target.value)}
            onKeyDown={e => handleKeyDownInput(e, handleAddRequest)}
            onBlur={() => newRequestName.trim() ? handleAddRequest() : setShowAddRequestInput(false)}
          />
        </div>
      )}

      {showAddFolderInput && (
        <div className="ml-6 mt-1 flex items-center space-x-2">
          <Folder className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            className="flex-1 border px-2 py-1 rounded text-sm"
            placeholder="Folder name..."
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => handleKeyDownInput(e, handleAddFolder)}
            onBlur={() => newFolderName.trim() ? handleAddFolder() : setShowAddFolderInput(false)}
          />
        </div>
      )}

      {/* Contents */}
      {expanded && (
        <div className="ml-6 space-y-1">
          {folder.folders?.map(sub => (
            <FolderItem
              key={sub.id}
              folder={sub}
              userId={userId}
              onRequestSelect={onRequestSelect}
              activeRequestId={activeRequestId}
              setFolderData={setFolderData}
            />
          ))}
          {folder.requests?.map(req => (
            <RequestItem
              key={req.id}
              request={req}
              onRequestSelect={onRequestSelect}
              activeRequestId={activeRequestId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderItem;
