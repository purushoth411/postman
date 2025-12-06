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
import { getSocket } from '../utils/Socket';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import { confirm } from '../utils/alert';

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

  
    // SOCKET SETUP — Listen for new collections
  useEffect(() => {
  const socket = getSocket();
  if (!socket || !user?.id) return;

  const handleFolderAdded = (data) => {
    console.log('Socket Event: folderAdded', data);

    const newFolder = data.folder;

    setCollections(prev =>
      prev.map(c => {
        if (parseInt(c.id) !== parseInt(newFolder.collection_id)) return c;
        
        // Check if folder already exists (avoid duplicates)
        const exists = (c.folders || []).some(f => parseInt(f.id) === parseInt(newFolder.id));
        if (exists) return c;
        
        return { ...c, folders: [...(c.folders || []), newFolder] };
      })
    );

    // Show toast for folders added by other users
    toast.success(`Folder "${newFolder.name}" added`);
  };

  socket.on('folderAdded', handleFolderAdded);
  return () => socket.off('folderAdded', handleFolderAdded);
}, [user?.id, selectedWorkspace?.id, setCollections]);

useEffect(() => {
  const socket = getSocket();
  if (!socket || !user?.id) return;

  // ✅ When a new request is added
  const handleRequestAdded = (data) => {
    if (data.workspaceId !== selectedWorkspace?.id) return;

    console.log("Socket Event: requestAdded", data);

    setCollections(prev =>
      prev.map(c => {
        if (parseInt(c.id) !== parseInt(data.collectionId)) return c;

        // Add to correct folder or collection root
        if (data.folderId) {
          const addToFolder = (folders) =>
            folders.map(f =>
              f.id === data.folderId
                ? { ...f, requests: [...(f.requests || []), data.request] }
                : { ...f, folders: addToFolder(f.folders || []) }
            );
          return { ...c, folders: addToFolder(c.folders || []) };
        } else {
          return { ...c, requests: [...(c.requests || []), data.request] };
        }
      })
    );

   // toast.success(`New request added: ${data.request.name}`);
  };

  // ✅ When a folder is renamed
  const handleFolderRenamed = (data) => {
    

    console.log("Socket Event: folderRenamed", data);

    setCollections(prev =>
      prev.map(c => {
        const updateFolder = (folders) =>
          folders.map(f =>
            f.id === data.folderId
              ? { ...f, name: data.name }
              : { ...f, folders: updateFolder(f.folders || []) }
          );

        return { ...c, folders: updateFolder(c.folders || []) };
      })
    );
  };

  // ✅ When a folder is deleted
  const handleFolderDeleted = (data) => {
    

    console.log("Socket Event: folderDeleted", data);

    setCollections(prev =>
      prev.map(c => {
        const removeFolder = (folders) =>
          folders
            .map(f => ({
              ...f,
              folders: removeFolder(f.folders || []),
            }))
            .filter(f => f.id !== data.folderId);

        return { ...c, folders: removeFolder(c.folders || []) };
      })
    );

 //   toast.success("Folder deleted successfully");
  };

  // ✅ When a collection is renamed
  const handleCollectionRenamed = (data) => {
    if (data.workspaceId !== selectedWorkspace?.id) return;
    if (parseInt(data.collectionId) !== parseInt(collection.id)) return;

    console.log("Socket Event: collectionRenamed", data);
    setCollections(prev =>
      prev.map(c =>
        c.id === data.collectionId ? { ...c, name: data.name } : c
      )
    );
  };

  // ✅ When a collection is deleted
  const handleCollectionDeleted = (data) => {
    if (data.workspaceId !== selectedWorkspace?.id) return;
    if (parseInt(data.collectionId) !== parseInt(collection.id)) return;

    console.log("Socket Event: collectionDeleted", data);
    setCollections(prev => prev.filter(c => c.id !== data.collectionId));
    toast.success("Collection deleted");
  };

  // ✅ When a request is renamed
  const handleRequestRenamed = (data) => {
    if (data.workspaceId !== selectedWorkspace?.id) return;
    if (parseInt(data.collectionId) !== parseInt(collection.id)) return;

    console.log("Socket Event: requestRenamed", data);
    setRequestData(data.requestId, { name: data.name });
  };

  // ✅ When a request is deleted
  const handleRequestDeleted = (data) => {
    if (data.workspaceId !== selectedWorkspace?.id) return;
    if (parseInt(data.collectionId) !== parseInt(collection.id)) return;

    console.log("Socket Event: requestDeleted", data);
    setRequestData(data.requestId, null, true);
  };

  // ✅ When a request is updated
  const handleRequestUpdated = (data) => {
    if (data.workspaceId !== selectedWorkspace?.id) return;
    if (parseInt(data.collectionId) !== parseInt(collection.id)) return;

    console.log("Socket Event: requestUpdated", data);
    setRequestData(data.requestId, data.changes);
  };

  socket.on("requestAdded", handleRequestAdded);
  socket.on("folderRenamed", handleFolderRenamed);
  socket.on("folderDeleted", handleFolderDeleted);
  socket.on("collectionRenamed", handleCollectionRenamed);
  socket.on("collectionDeleted", handleCollectionDeleted);
  socket.on("requestRenamed", handleRequestRenamed);
  socket.on("requestDeleted", handleRequestDeleted);
  socket.on("requestUpdated", handleRequestUpdated);

  return () => {
    socket.off("requestAdded", handleRequestAdded);
    socket.off("folderRenamed", handleFolderRenamed);
    socket.off("folderDeleted", handleFolderDeleted);
    socket.off("collectionRenamed", handleCollectionRenamed);
    socket.off("collectionDeleted", handleCollectionDeleted);
    socket.off("requestRenamed", handleRequestRenamed);
    socket.off("requestDeleted", handleRequestDeleted);
    socket.off("requestUpdated", handleRequestUpdated);
  };
}, [user?.id, selectedWorkspace?.id, setCollections, collection.id]);


 // console.log("collcetioon Deytails"+JSON.stringify(collection,null,2));

  // Close dropdown when clicking outside
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
            `${getApiUrl(API_ENDPOINTS.GET_REQUESTS_BY_COLLECTION)}?collection_id=${collection.id}`,
             { credentials: 'include' }
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
        `${getApiUrl(API_ENDPOINTS.GET_REQUESTS_BY_COLLECTION)}?collection_id=${collection.id}`,
         { credentials: 'include' }
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
      const res = await fetch(getApiUrl(API_ENDPOINTS.RENAME_COLLECTION), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session
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
      const res = await fetch(getApiUrl(API_ENDPOINTS.ADD_REQUEST), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session
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
      const res = await fetch(getApiUrl(API_ENDPOINTS.ADD_FOLDER), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          user_id:user.id,
          collection_id: collection.id,
          name: trimmed,
        }),
      });
      if (!res.ok) throw new Error('Failed to add folder');
      const data = await res.json();
      const newFolder = data.folder;
      // Update state from API response
      setCollections(prev => prev.map(c => {
        if (c.id === collection.id) {
          // Check if folder already exists (avoid duplicates)
          const exists = (c.folders || []).some(f => f.id === newFolder.id);
          if (!exists) {
            return { ...c, folders: [...(c.folders || []), newFolder] };
          }
        }
        return c;
      }));
      setNewFolderName('');
      setShowAddFolderInput(false);
      // Don't show toast here - socket event will show it
    } catch (err) {
      console.error(err);
      toast.error("Error adding folder.");
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm('Are you sure you want to delete this collection?', 'Delete Collection', 'warning');
    if (!confirmed) return;
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.DELETE_COLLECTION), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session
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
    <div className="group mb-1">
      {/* Header */}
      <div className="flex items-center space-x-2 px-3 py-2 text-sm rounded-lg hover:bg-white transition-colors duration-150 border border-transparent hover:border-gray-200 hover:shadow-sm">
        <button onClick={toggleExpanded} className="p-0.5 border-none bg-transparent hover:bg-gray-100 rounded transition-colors">
          {expanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
        </button>

        {editing ? (
          <input
            autoFocus
            className="font-medium text-gray-900 flex-1 border border-orange-300 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
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
          <button onClick={toggleExpanded} className="flex items-center space-x-2 flex-1 text-left p-0 border-none bg-transparent hover:text-orange-600 transition-colors">
            {expanded ? <FolderOpen className="w-4 h-4 text-orange-500" /> : <Folder className="w-4 h-4 text-orange-500" />}
            <span className="font-semibold text-gray-800 truncate">{collection.name}</span>
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
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {activeDropdown === collection.id && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-xl shadow-xl z-10 overflow-hidden"
            >
              <button
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
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
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setShowAddRequestInput(true);
                  setActiveDropdown(null);
                }}
              >
                <FileText className="w-4 h-4" />
                <span>Add Request</span>
              </button>
              <button
                className="w-full flex items-center space-x-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                onClick={() => {
                  setShowAddFolderInput(true);
                  setActiveDropdown(null);
                }}
              >
                <FolderPlus className="w-4 h-4" />
                <span>Add Folder</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
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

      {/* Add Request Input */}
      {showAddRequestInput && (
        <div className="ml-8 mt-2 mb-2 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
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
        <div className="ml-8 mt-2 mb-2 flex items-center space-x-2">
          <Folder className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
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
        <div className="ml-4 mt-1 space-y-0.5">
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
