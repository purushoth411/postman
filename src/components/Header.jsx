import React, { useState, useEffect } from "react";
import { Search, Plus, Upload, Download, Save, User, LogOut, Edit2, Trash2 } from "lucide-react";
import { useAuth } from "../utils/idb";
import { useNavigate } from "react-router-dom";
import WorkspaceModal from "./WorkspaceModal";
import RequestSearch from "./RequestSearch";
import { getSocket } from "../utils/Socket";
import { toast } from "react-hot-toast";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { alertError, confirm } from "../utils/alert";
import apihubLogo from "../assets/images/apihub_logo.png";

const Header = () => {
  const { logout, workspaces, selectedWorkspace, setSelectedWorkspace, user, setWorkspaces } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);

  // Socket listeners for workspace operations
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user?.id) return;

    // Handle workspace created
    const handleWorkspaceCreated = (data) => {
      
      console.log('Socket Event: workspaceCreated', data);
      if (data.userId === user?.id) {
        // Only add if not already in list
        const exists = workspaces.some(w => w.id === data.workspace.id);
        if (!exists && setWorkspaces) {
          setWorkspaces([...workspaces, data.workspace]);
          toast.success(`Workspace "${data.workspace.name}" created`);
        }
      }
    };

    // Handle workspace updated
    const handleWorkspaceUpdated = (data) => {
      console.log('Socket Event: workspaceUpdated', data);
      if (data.workspaceId) {
        const updatedWorkspaces = workspaces.map(ws => 
          ws.id === data.workspaceId ? { ...ws, ...data.workspace } : ws
        );
        setWorkspaces(updatedWorkspaces);
        
        // Update selected workspace if it's the one being updated
        if (selectedWorkspace?.id === data.workspaceId) {
          setSelectedWorkspace({ ...selectedWorkspace, ...data.workspace });
        }
        toast.success("Workspace updated");
      }
    };

    // Handle workspace deleted
    const handleWorkspaceDeleted = (data) => {
      console.log('Socket Event: workspaceDeleted', data);
      if (data.workspaceId) {
        const updatedWorkspaces = workspaces.filter(w => w.id !== data.workspaceId);
        setWorkspaces(updatedWorkspaces);
        
        // If deleted workspace was selected, clear selection
        if (selectedWorkspace?.id === data.workspaceId) {
          setSelectedWorkspace(updatedWorkspaces[0] || null);
        }
        toast.success("Workspace deleted");
      }
    };

    socket.on('workspaceCreated', handleWorkspaceCreated);
    socket.on('workspaceUpdated', handleWorkspaceUpdated);
    socket.on('workspaceDeleted', handleWorkspaceDeleted);

    return () => {
      socket.off('workspaceCreated', handleWorkspaceCreated);
      socket.off('workspaceUpdated', handleWorkspaceUpdated);
      socket.off('workspaceDeleted', handleWorkspaceDeleted);
    };
  }, [user?.id, workspaces, selectedWorkspace, setWorkspaces, setSelectedWorkspace]);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleWorkspaceSelect = (ws) => {
    setSelectedWorkspace(ws);
    setShowDropdown(false);
  };

  const handleEditWorkspace = async (ws, e) => {
    e.stopPropagation(); // Prevent workspace selection
    
    // Fetch full workspace details with members
    try {
      const response = await fetch(
        `${getApiUrl(API_ENDPOINTS.GET_WORKSPACE_DETAILS)}?workspace_id=${ws.id}&user_id=${user?.id}`,
         { credentials: 'include' }
      );
      const result = await response.json();
      if (result.status && result.workspace) {
        setEditingWorkspace(result.workspace);
        setShowModal(true);
        setShowDropdown(false);
      } else {
        alertError(result.message || "Failed to load workspace details");
      }
    } catch (error) {
      console.error("Error fetching workspace details:", error);
      alertError("Failed to load workspace details");
    }
  };

  const handleDeleteWorkspace = async (ws, e) => {
    e.stopPropagation(); // Prevent workspace selection
    
    const confirmed = await confirm(
      `Are you sure you want to delete "${ws.name}"? This action cannot be undone.`,
      'Delete Workspace',
      'warning'
    );
    if (!confirmed) {
      return;
    }

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.DELETE_WORKSPACE), {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          workspace_id: ws.id,
          user_id: user?.id,
        }),
      });

      const result = await response.json();
      if (result.status) {
        // Remove from workspaces list
        const updatedWorkspaces = workspaces.filter(w => w.id !== ws.id);
        setWorkspaces(updatedWorkspaces);
        
        // If deleted workspace was selected, clear selection
        if (selectedWorkspace?.id === ws.id) {
          setSelectedWorkspace(updatedWorkspaces[0] || null);
        }
        
        setShowDropdown(false);
      } else {
        alertError(result.message || "Failed to delete workspace");
      }
    } catch (error) {
      console.error("Error deleting workspace:", error);
      alertError("Failed to delete workspace");
    }
  };

  const handleCreateWorkspace = () => {
    setEditingWorkspace(null);
    setShowModal(true);
    setShowDropdown(false);
  };

  const handleWorkspaceCreated = (workspace) => {
    if (setWorkspaces) {
      setWorkspaces([...workspaces, workspace]);
    }
    setSelectedWorkspace(workspace);
  };

  const handleWorkspaceUpdated = (workspace) => {
    const updatedWorkspaces = workspaces.map(ws => 
      ws.id === workspace.id ? workspace : ws
    );
    setWorkspaces(updatedWorkspaces);
    
    // Update selected workspace if it's the one being edited
    if (selectedWorkspace?.id === workspace.id) {
      setSelectedWorkspace(workspace);
    }
  };

  // Check if user is owner of a workspace
  const isOwner = (ws) => {
    return ws.user_id === user?.id || 
           ws.members?.some(m => m.user_id === user?.id && m.role === "OWNER");
  };

  // Check if user can edit (owner or editor)
  const canEdit = (ws) => {
    return isOwner(ws) || 
           ws.members?.some(m => m.user_id === user?.id && m.role === "EDITOR");
  };

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-6 py-3 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-3">
            <img 
              src={apihubLogo} 
              alt="APIHub Logo" 
              className="h-10 w-auto"
            />
          </div>

          {/* Workspaces */}
          <div className="relative">
            <button
              className="px-4 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 flex items-center space-x-2 shadow-sm hover:shadow"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <span className="text-sm font-medium text-gray-700">{selectedWorkspace ? selectedWorkspace.name : "Select Workspace"}</span>
              <svg className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl w-80 z-50 overflow-hidden">
                <div className="p-3 border-b border-gray-100 bg-gray-50">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search workspace..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm bg-white"
                    />
                  </div>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {filteredWorkspaces.length > 0 ? (
                    filteredWorkspaces.map((ws) => (
                      <div
                        key={ws.id}
                        className="flex items-center justify-between px-4 py-3 hover:bg-red-50 group transition-colors border-b border-gray-50 last:border-b-0"
                      >
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => handleWorkspaceSelect(ws)}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium text-gray-800">{ws.name}</span>
                            {selectedWorkspace?.id === ws.id && (
                              <span className="px-2 py-0.5 text-xs font-semibold text-red-600 bg-red-100 rounded-full">Active</span>
                            )}
                          </div>
                        </div>
                        
                        {/* Action Icons */}
                        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {canEdit(ws) && (
                            <button
                              onClick={(e) => handleEditWorkspace(ws, e)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                              title="Edit workspace"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                          {isOwner(ws) && (
                            <button
                              onClick={(e) => handleDeleteWorkspace(ws, e)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete workspace"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="px-4 py-8 text-center text-gray-500 text-sm">
                      No workspaces found
                    </div>
                  )}
                </div>
                <div
                  className="px-4 py-3 text-red-600 hover:bg-red-50 cursor-pointer border-t border-gray-100 transition-colors font-medium text-sm flex items-center space-x-2"
                  onClick={handleCreateWorkspace}
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Workspace</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center - Search */}
        <RequestSearch />

        {/* Right */}
        <div className="flex items-center space-x-3">
          <div className="w-px h-8 bg-gray-300"></div>
          <button 
            title={user?.name || "User Profile"} 
            className="p-2.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <User className="w-5 h-5" />
          </button>
          <button
            onClick={async () => {
              const confirmed = await confirm("Are you sure you want to log out?", "Logout", "warning");
              if (confirmed) {
                handleLogout();
              }
            }}
            title="Logout"
            className="p-2.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Modal */}
      {showModal && (
        <WorkspaceModal
          user={user}
          workspace={editingWorkspace}
          onClose={() => {
            setShowModal(false);
            setEditingWorkspace(null);
          }}
          onCreated={handleWorkspaceCreated}
          onUpdated={handleWorkspaceUpdated}
        />
      )}
    </>
  );
};

export default Header;