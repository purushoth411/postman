import React, { useState, useRef, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  File,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Edit3,
  FileText,
  FolderPlus,
  Trash2,
  MoreVertical,
} from 'lucide-react';
import { toast } from 'react-hot-toast';

import RequestItem from './RequestItem';
import { useAuth } from '../utils/idb';
import FolderItem from './FolderItem';

const CollectionItem = ({ collection, setCollections, onRequestSelect, activeRequestId }) => {
    const { user,expandPath,selectedWorkspace } = useAuth();
  const [expanded, setExpanded] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState(collection.name);
  const [showAddRequestInput, setShowAddRequestInput] = useState(false);
  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [newRequestName, setNewRequestName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');

  const dropdownRef = useRef(null);

 // console.log("collcetioon Deytails"+JSON.stringify(collection,null,2));

  // Close dropdown when clicking outside

  useEffect(()=>{
    console.log("Colllection");
    console.log(collection);
  },[collection]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

// Auto-expand on search
useEffect(() => {
  if (expandPath?.collectionId === collection.id && !expanded) {
    (async () => {
      try {
        if (!collection.requests) {
          const res = await fetch(
            `http://localhost:5000/api/api/getRequestsByCollectionId?collection_id=${collection.id}`
          );
          const data = await res.json();
          if (data.status) {
            setCollections(prev =>
              prev.map(c =>
                c.id === collection.id
                  ? { ...c, requests: data.requests, folders: data.folders || [] }
                  : c
              )
            );
          }
        }
      } catch (err) {
        console.error('Error fetching requests:', err);
        toast.error('Failed to load requests');
      }
      // Only set expanded if this is triggered by searchPath
      setExpanded(true);
    })();
  }
}, [expandPath, collection.id]);

// Normal toggle on user click
const toggleExpanded = async () => {
  if (!expanded && !collection.requests) {
    try {
      const res = await fetch(
        `http://localhost:5000/api/api/getRequestsByCollectionId?collection_id=${collection.id}`
      );
      const data = await res.json();
      if (data.status) {
        setCollections(prev =>
          prev.map(c =>
            c.id === collection.id
              ? { ...c, requests: data.requests, folders: data.folders || [] }
              : c
          )
        );
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
      toast.error('Failed to load requests');
    }
  }
  // Toggle based on user click
  setExpanded(prev => !prev);
};


// const setFolderData = (folderId, requests, folders, name) => {
//   setCollections(prev =>
//     prev.map(c => {
//       if (c.id !== collection.id) return c;

//       // Helper recursive update function
//       const updateFolders = (fArr) => {
//         return fArr.map(f => {
//           if (f.id === folderId) {
//             return { 
//               ...f, 
//               requests, 
//               folders, 
//               ...(name !== undefined ? { name } : {}) // only update if provided
//             };
//           }
//           if (f.folders?.length) {
//             return { ...f, folders: updateFolders(f.folders) };
//           }
//           return f;
//         });
//       };

//       return {
//         ...c,
//         folders: updateFolders(c.folders || [])
//       };
//     })
//   );
// };

const setFolderData = (folderId, requests, folders, name, isDelete = false) => {
  setCollections(prev =>
    prev.map(c => {
      if (c.id !== collection.id) return c;

      // Recursive update function
      const updateFolders = (fArr) => {
        return fArr
          .map(f => {
            if (f.id === folderId) {
              if (isDelete) {
                return null; // mark for removal
              }
              return { 
                ...f, 
                requests, 
                folders, 
                ...(name !== undefined ? { name } : {}) 
              };
            }
            if (f.folders?.length) {
              return { ...f, folders: updateFolders(f.folders) };
            }
            return f;
          })
          .filter(Boolean); // remove nulls
      };

      return {
        ...c,
        folders: updateFolders(c.folders || [])
      };
    })
  );
};

const setRequestData = (requestId, newData, isDelete = false) => {
  setCollections(prev =>
    prev.map(c => {
      if (c.id !== collection.id) return c;

      const updateFolders = (folders = []) =>
        folders.map(f => ({
          ...f,
          requests: f.requests?.map(r =>
            r.id === requestId ? { ...r, ...newData } : r
          ).filter(r => !isDelete || r.id !== requestId),
          folders: updateFolders(f.folders)
        }));

      return {
        ...c,
        requests: c.requests
          ?.map(r => r.id === requestId ? { ...r, ...newData } : r)
          .filter(r => !isDelete || r.id !== requestId),
        folders: updateFolders(c.folders || [])
      };
    })
  );
};




  const handleRename = async () => {
    const trimmedName = editingName.trim();
    if (!trimmedName) {
      toast.error("Collection name cannot be empty");
      return;
    }

    try {
      const res = await fetch(`http://localhost:5000/api/api/renameCollection`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection_id: collection.id, name: trimmedName }),
      });
      if (!res.ok) throw new Error('Failed to rename collection');
      setCollections(prev => prev.map(c => c.id === collection.id ? { ...c, name: trimmedName } : c));
      setEditing(false);
      toast.success('Collection renamed successfully');
    } catch (err) {
      console.error(err);
      toast.error("Error renaming collection.");
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
          user_id:user.id,
          collection_id: collection.id,
          name: trimmed,
          method: 'GET',
          url: '',
          headers: {},
          body_raw: '',
        }),
      });
      if (!res.ok) throw new Error('Failed to add request');
      const newRequest = await res.json();
      setCollections(prev => prev.map(c => c.id === collection.id ? { ...c, requests: [...(c.requests || []), newRequest.request] } : c));
      setNewRequestName('');
      setShowAddRequestInput(false);
      toast.success('Request added successfully');
    } catch (err) {
      console.error(err);
      toast.error("Error adding request.");
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
          collection_id: collection.id,
          name: trimmed,
        }),
      });
      if (!res.ok) throw new Error('Failed to add folder');
      const data = await res.json();
      const newFolder=data.folder;
      setCollections(prev => prev.map(c => c.id === collection.id ? { ...c, folders: [...(c.folders || []), newFolder] } : c));
      setNewFolderName('');
      setShowAddFolderInput(false);
      toast.success('Folder added successfully');
    } catch (err) {
      console.error(err);
      toast.error("Error adding folder.");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this collection?')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/api/deleteCollection`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ collection_id: collection.id }),
      });
      if (!res.ok) throw new Error('Failed to delete collection');
      setCollections(prev => prev.filter(c => c.id !== collection.id));
      toast.success('Collection deleted successfully');
    } catch (err) {
      console.error(err);
      toast.error("Error deleting collection.");
    }
  };

  const handleKeyDownInput = (e, action) => {
    if (e.key === 'Enter') {
      action();
    }
    if (e.key === 'Escape') {
      setEditing(false);
      setShowAddRequestInput(false);
      setShowAddFolderInput(false);
      setEditingName(collection.name);
      setNewRequestName('');
      setNewFolderName('');
    }
  };

  return (
    <div className="group">
      {/* Header */}
      <div className="flex items-center space-x-2 px-2 py-1.5 text-sm rounded-lg hover:bg-gray-100">
        <button onClick={toggleExpanded} className="p-0 border-none bg-transparent">
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronRight className="w-4 h-4 text-gray-400" />}
        </button>

        {editing ? (
          <input
            autoFocus
            className="font-medium text-gray-800 flex-1 border border-gray-300 px-2 py-1 rounded text-sm"
            value={editingName}
            onChange={e => setEditingName(e.target.value)}
            onKeyDown={e => handleKeyDownInput(e, handleRename)}
            onBlur={() => {
              if (editingName.trim()) {
                handleRename();
              } else {
                setEditing(false);
                setEditingName(collection.name);
              }
            }}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <button onClick={toggleExpanded} className="flex items-center space-x-2 flex-1 text-left p-0 border-none bg-transparent">
            {expanded ? <FolderOpen className="w-4 h-4 text-orange-500" /> : <Folder className="w-4 h-4 text-orange-500" />}
            <span className="font-medium text-gray-800 truncate">{collection.name}</span>
          </button>
        )}
        
        {/* <span className="text-xs text-gray-500">
          {(collection.request_count) + (collection.folders?.length || 0)}
        </span> */}

        {/* Dropdown button */}
         {selectedWorkspace.role !== 'VIEWER' &&
        <div className="relative">
          <button
            onClick={e => {
              e.stopPropagation();
              setActiveDropdown(prev => (prev === collection.id ? null : collection.id));
            }}
            className=" p-1 hover:bg-gray-200 rounded transition-opacity"
          >
            <MoreVertical className="w-3 h-3" />
          </button>
          {activeDropdown === collection.id && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10"
            >
              <button
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
                onClick={() => {
                  setEditing(true);
                  setEditingName(collection.name);
                  setActiveDropdown(null);
                }}
              >
                <Edit3 className="w-4 h-4" />
                <span>Rename</span>
              </button>
              <button
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setShowAddRequestInput(true);
                  setActiveDropdown(null);
                }}
              >
                <FileText className="w-4 h-4" />
                <span>Add Request</span>
              </button>
              <button
                className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => {
                  setShowAddFolderInput(true);
                  setActiveDropdown(null);
                }}
              >
                <FolderPlus className="w-4 h-4" />
                <span>Add Folder</span>
              </button>
              <hr className="my-1" />
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

      {/* Add Request Input */}
      {showAddRequestInput && (
        <div className="ml-6 mt-2 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            className="flex-1 border border-gray-300 px-2 py-1 rounded text-sm"
            placeholder="Request name..."
            value={newRequestName}
            onChange={e => setNewRequestName(e.target.value)}
            onKeyDown={e => handleKeyDownInput(e, handleAddRequest)}
            onBlur={() => {
              if (newRequestName.trim()) {
                handleAddRequest();
              } else {
                setShowAddRequestInput(false);
                setNewRequestName('');
              }
            }}
          />
        </div>
      )}

      {/* Add Folder Input */}
      {showAddFolderInput && (
        <div className="ml-6 mt-2 flex items-center space-x-2">
          <Folder className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            className="flex-1 border border-gray-300 px-2 py-1 rounded text-sm"
            placeholder="Folder name..."
            value={newFolderName}
            onChange={e => setNewFolderName(e.target.value)}
            onKeyDown={e => handleKeyDownInput(e, handleAddFolder)}
            onBlur={() => {
              if (newFolderName.trim()) {
                handleAddFolder();
              } else {
                setShowAddFolderInput(false);
                setNewFolderName('');
              }
            }}
          />
        </div>
      )}

      {/* Contents */}
      {expanded && (
        <div className="ml-2 mt-1 space-y-1">
        {collection.folders?.map(folder => (
  <FolderItem
    key={folder.id}
    folder={folder}
    userId={user.id}
    onRequestSelect={onRequestSelect}
    activeRequestId={activeRequestId}
    setFolderData={setFolderData}
    setRequestData={setRequestData} 
  />
))}
{collection.requests?.map(req => (
  <RequestItem key={req.id} request={req} onRequestSelect={onRequestSelect} activeRequestId={activeRequestId} setRequestData={setRequestData}  />
))}

        </div>
      )}
    </div>
  );
};

export default CollectionItem;
