import React, { useState, useRef, useEffect } from "react";
import {
  Folder,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown,
  MoreVertical,
  Edit3,
  FolderPlus,
  Trash2,
} from "lucide-react";
import RequestItem from "./RequestItem";
import toast from "react-hot-toast";
import { useAuth } from "../utils/idb";
import { getSocket } from "../utils/Socket";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { confirm } from "../utils/alert";
import { canCreateSubfolder, calculateFolderDepth } from "../utils/folderUtils";
import { MAX_FOLDER_DEPTH } from "../constants/constant";

const FolderItem = ({
  folder,
  userId,
  onRequestSelect,
  activeRequestId,
  setFolderData,
  setRequestData,
  allFolders = [] // Pass all folders for depth calculation
}) => {
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState(folder.name);
  const [showAddRequestInput, setShowAddRequestInput] = useState(false);
  const [showAddFolderInput, setShowAddFolderInput] = useState(false);
  const [newRequestName, setNewRequestName] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const dropdownRef = useRef(null);
  const { user, expandPath,selectedWorkspace } = useAuth();

  // Calculate if this folder can have subfolders
  const canAddSubfolder = canCreateSubfolder(folder, allFolders);
  const folderDepth = calculateFolderDepth(folder, allFolders);

  
    
      // SOCKET SETUP — Listen for new collections
  useEffect(() => {
  const socket = getSocket();
  if (!socket || !user?.id) return;

const handleFolderAdded = (data) => {
  const newFolder = data.folder;

  // only update this FolderItem if the added folder is a child of this one
  if (!newFolder.parent_folder_id || parseInt(newFolder.parent_folder_id) !== parseInt(folder.id)) {
    return;
  }

  // Check if folder already exists (avoid duplicates with API response)
  const exists = folder.folders?.some(f => parseInt(f.id) === parseInt(newFolder.id));
  if (exists) return;

  setFolderData(
    folder.id,
    folder.requests || [],
    [...(folder.folders || []), newFolder]
  );
  
  // Show toast for folders added by other users (not the current user who created it)
  // The API response handler already shows toast for the creator
  toast.success(`Folder "${newFolder.name}" added`);
};


  const handleFolderRenamed = (data) => {
    if (data.workspaceId !== selectedWorkspace?.id) return;
    setFolderData(data.folder_id, folder.requests || [], folder.folders || [], data.newName);
  };

  const handleFolderDeleted = (data) => {
    if (data.workspaceId !== selectedWorkspace?.id) return;
    setFolderData(data.folder_id, null, null, null, true);
  };

  const handleRequestAdded = (data) => {
    if (data.workspaceId !== selectedWorkspace?.id) return;
    const newRequest = data.request;
    setFolderData(
      newRequest.folder_id,
      [...(folder.requests || []), newRequest],
      folder.folders || []
    );
  };

  socket.on("folderAdded", handleFolderAdded);
  socket.on("folderRenamed", handleFolderRenamed);
  socket.on("folderDeleted", handleFolderDeleted);
  socket.on("requestAdded", handleRequestAdded);

  return () => {
    socket.off("folderAdded", handleFolderAdded);
    socket.off("folderRenamed", handleFolderRenamed);
    socket.off("folderDeleted", handleFolderDeleted);
    socket.off("requestAdded", handleRequestAdded);
  };
}, [user?.id, selectedWorkspace?.id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-expand folder when triggered by search or expandPath
useEffect(() => {
  if (expandPath?.folderIds?.includes(folder.id) && !expanded) {
    const fetchFolderData = async () => {
      if (!folder.requests) {
        setLoading(true);
        try {
          const res = await fetch(
            `${getApiUrl(API_ENDPOINTS.GET_REQUESTS_BY_FOLDER)}?folder_id=${folder.id}`,
             { credentials: 'include' }
          );
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
      setExpanded(true); // only expand automatically
    };

    fetchFolderData();
  }
}, [expandPath, folder.id]); // don't include expanded here, prevents overriding user toggle

// Manual toggle
const toggleExpanded = async () => {
  if (!expanded && !folder.requests) {
    setLoading(true);
    try {
      const res = await fetch(
        `${getApiUrl(API_ENDPOINTS.GET_REQUESTS_BY_FOLDER)}?folder_id=${folder.id}`,
         { credentials: 'include' }
      );
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

  setExpanded(prev => !prev); // toggle manually without interference from expandPath
};


  const handleKeyDownInput = (e, action) => {
    if (e.key === "Enter") action();
    if (e.key === "Escape") {
      setEditing(false);
      setShowAddRequestInput(false);
      setShowAddFolderInput(false);
      setEditingName(folder.name);
      setNewRequestName("");
      setNewFolderName("");
    }
  };

  const handleRename = async () => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      toast.error("Folder name cannot be empty");
      return;
    }
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.RENAME_FOLDER), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({ folder_id: folder.id, name: trimmed }),
      });
      if (!res.ok) throw new Error();
        setFolderData(folder.id, folder.requests || [], folder.folders || [], trimmed);
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
      const res = await fetch(getApiUrl(API_ENDPOINTS.ADD_REQUEST), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          user_id: userId,
          folder_id: folder.id,
          collection_id: folder.collection_id,
          name: trimmed,
          method: "GET",
          url: "",
          headers: {},
          body_raw: "",
        }),
      });
      if (!res.ok) throw new Error();
      const newRequest = await res.json();
      setFolderData(
        folder.id,
        [...(folder.requests || []), newRequest.request],
        folder.folders || []
      );
      setNewRequestName("");
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

    // Check depth before creating
    if (!canAddSubfolder) {
      toast.error(`Maximum folder depth level reached. Cannot create subfolders beyond this level.`);
      setNewFolderName("");
      setShowAddFolderInput(false);
      return;
    }

    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.ADD_FOLDER), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          user_id: user.id,
          parent_folder_id: folder.id,
          collection_id: folder.collection_id,
          name: trimmed,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to add folder');
      }
      
      const result = await res.json();
      // Update state from API response
      if (result.folder) {
        // Check if folder already exists (avoid duplicates with socket event)
        const exists = folder.folders?.some(f => parseInt(f.id) === parseInt(result.folder.id));
        if (!exists) {
          setFolderData(folder.id, folder.requests || [], [
            ...(folder.folders || []),
            result.folder,
          ]);
        }
      }
      setNewFolderName("");
      setShowAddFolderInput(false);
      // Show toast for immediate feedback (socket event will also show for other users)
      toast.success(`Folder "${trimmed}" added`);
    } catch (err) {
      toast.error(err.message || "Failed to add folder");
    }
  };

  const handleDelete = async () => {
    const confirmed = await confirm("Are you sure you want to delete this folder?", "Delete Folder", "warning");
    if (!confirmed) return;
    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.DELETE_FOLDER), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({ folder_id: folder.id }),
      });
      if (!res.ok) throw new Error();
      toast.success("Folder deleted");
      setFolderData(folder.id, null, null,null,true); // let parent re-fetch if needed
    } catch {
      toast.error("Failed to delete folder");
    }
  };

  return (
    <div className="ml-4 mb-1">
      <div className="flex items-center space-x-2 px-3 py-2 cursor-pointer text-sm rounded-lg hover:bg-white transition-colors duration-150 border border-transparent hover:border-gray-200 hover:shadow-sm">
        <button onClick={toggleExpanded} className="p-0.5 hover:bg-gray-100 rounded transition-colors">
          {expanded ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {editing ? (
          <input
            autoFocus
            value={editingName}
            onChange={(e) => setEditingName(e.target.value)}
            onKeyDown={(e) => handleKeyDownInput(e, handleRename)}
            onBlur={() => handleRename()}
            className="text-sm border border-red-300 px-3 py-1.5 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        ) : (
          <div className="flex-1 flex items-center" onClick={toggleExpanded}>
            {expanded ? (
              <FolderOpen className="w-4 h-4 text-blue-500" />
            ) : (
              <Folder className="w-4 h-4 text-blue-500" />
            )}
            <span className="truncate ml-2 font-medium text-gray-800">{folder.name}</span>
          </div>
        )}

        {loading && <span className="text-xs text-gray-400">Loading...</span>}

        {/* Dropdown */}
         {selectedWorkspace.role !== 'VIEWER' &&
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setActiveDropdown((prev) =>
                prev === folder.id ? null : folder.id
              );
            }}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
          {activeDropdown === folder.id && (
            <div className="absolute right-0 mt-1 bg-white shadow-xl border border-gray-200 rounded-xl z-10 w-52 overflow-hidden">
              <button
                className="px-4 py-2.5 text-sm hover:bg-gray-50 w-full text-left transition-colors flex items-center space-x-2"
                onClick={() => {
                  setEditing(true);
                  setActiveDropdown(null);
                }}
              >
                <Edit3 className="w-4 h-4" />
                <span>Rename</span>
              </button>
              <button
                className="px-4 py-2.5 text-sm hover:bg-gray-50 w-full text-left transition-colors flex items-center space-x-2"
                onClick={() => {
                  setShowAddRequestInput(true);
                  setActiveDropdown(null);
                }}
              >
                <FileText className="w-4 h-4" />
                <span>Add Request</span>
              </button>
              <button
                className={`px-4 py-2.5 text-sm w-full text-left transition-colors flex items-center space-x-2 ${
                  canAddSubfolder 
                    ? 'hover:bg-gray-50 text-gray-700' 
                    : 'opacity-50 cursor-not-allowed text-gray-400'
                }`}
                onClick={() => {
                  if (canAddSubfolder) {
                    setShowAddFolderInput(true);
                    setActiveDropdown(null);
                  } else {
                    toast.error(`Maximum folder depth level reached. This folder is at level ${folderDepth}.`);
                  }
                }}
                disabled={!canAddSubfolder}
                title={canAddSubfolder ? `Add Folder (Current level: ${folderDepth})` : `Maximum depth reached (Level ${folderDepth}/${MAX_FOLDER_DEPTH})`}
              >
                <FolderPlus className="w-4 h-4" />
                <span>Add Folder</span>
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                className="px-4 py-2.5 text-sm hover:bg-red-50 text-red-600 w-full text-left transition-colors flex items-center space-x-2"
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

      {/* Inputs */}
      {showAddRequestInput && (
        <div className="ml-8 mt-2 mb-2 flex items-center space-x-2">
          <FileText className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
            placeholder="Request name..."
            value={newRequestName}
            onChange={(e) => setNewRequestName(e.target.value)}
            onKeyDown={(e) => handleKeyDownInput(e, handleAddRequest)}
            onBlur={() =>
              newRequestName.trim()
                ? handleAddRequest()
                : setShowAddRequestInput(false)
            }
          />
        </div>
      )}

      {showAddFolderInput && (
        <div className="ml-8 mt-2 mb-2 flex items-center space-x-2">
          <Folder className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent shadow-sm"
            placeholder="Folder name..."
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            onKeyDown={(e) => handleKeyDownInput(e, handleAddFolder)}
            onBlur={() =>
              newFolderName.trim()
                ? handleAddFolder()
                : setShowAddFolderInput(false)
            }
          />
        </div>
      )}

      {/* Contents */}
      {expanded && (
        <div className="ml-6 space-y-0.5">
          {folder.folders?.map((sub) => (
            <FolderItem
              key={sub.id}
              folder={sub}
              userId={userId}
              onRequestSelect={onRequestSelect}
              activeRequestId={activeRequestId}
              setFolderData={setFolderData}
              setRequestData={setRequestData}
              allFolders={allFolders}
            />
          ))}
          {folder.requests?.map((req) => (
            <RequestItem
              key={req.id}
              request={req}
              onRequestSelect={onRequestSelect}
              activeRequestId={activeRequestId}
              setRequestData={setRequestData}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FolderItem;
