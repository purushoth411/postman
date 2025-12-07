import React, { useState, useEffect } from "react";
import { X, Trash2, Plus } from "lucide-react";
import { getApiUrl, API_ENDPOINTS } from "../config/api";
import { alertError } from "../utils/alert";

const WorkspaceModal = ({ user, workspace = null, onClose, onCreated, onUpdated, onDeleted }) => {
  const isEditMode = !!workspace;
  const isOwner = workspace?.user_id === user?.id || workspace?.members?.some(m => m.user_id === user?.id && m.role === "OWNER");
  
  const [wsName, setWsName] = useState("");
  const [members, setMembers] = useState([{ email: "", role: "VIEWER" }]);
  const [existingMembers, setExistingMembers] = useState([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (workspace) {
      setWsName(workspace.name);
      // Separate existing members from new ones
      if (workspace.members && workspace.members.length > 0) {
        setExistingMembers(workspace.members.map(m => ({
          ...m,
          email: m.user_email || m.email || "", // Ensure email is set
          originalRole: m.role
        })));
      } else {
        setExistingMembers([]);
      }
      setMembers([{ email: "", role: "VIEWER" }]);
    } else {
      // Reset when creating new workspace
      setWsName("");
      setExistingMembers([]);
      setMembers([{ email: "", role: "VIEWER" }]);
    }
  }, [workspace]);

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const handleExistingMemberChange = (index, field, value) => {
    const updated = [...existingMembers];
    updated[index][field] = value;
    setExistingMembers(updated);
  };

  const addMemberRow = () => {
    setMembers([...members, { email: "", role: "VIEWER" }]);
  };

  const removeMember = (index) => {
    setMembers(members.filter((_, i) => i !== index));
  };

  const removeExistingMember = (index) => {
    const updated = [...existingMembers];
    updated[index].toRemove = true;
    setExistingMembers(updated);
  };

  const handleCreateWorkspace = async () => {
    if (!wsName.trim()) return;

    setSubmitting(true);

    const validMembers = members.filter(m => m.email.trim());

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.CREATE_WORKSPACE), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          name: wsName,
          user_id: user?.id,
          members: validMembers,
        }),
      });

      const result = await response.json();
      if (result.status) {
        onCreated?.(result.workspace);
        onClose();
        resetForm();
      } else {
        alertError(result.message || "Failed to create workspace");
      }
    } catch (error) {
      console.error("Error creating workspace:", error);
      alertError("Failed to create workspace");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateWorkspace = async () => {
    if (!wsName.trim()) return;

    setSubmitting(true);

    const validNewMembers = members.filter(m => m.email.trim());
    const updatedMembers = existingMembers.filter(m => !m.toRemove);
    const removedMembers = existingMembers.filter(m => m.toRemove);

    try {
      const response = await fetch(getApiUrl(API_ENDPOINTS.UPDATE_WORKSPACE), {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          workspace_id: workspace.id,
          name: wsName,
          user_id: user?.id,
          existingMembers: updatedMembers.map(m => ({
            user_id: m.user_id,
            role: m.role,
            originalRole: m.originalRole
          })),
          newMembers: validNewMembers,
          removedMembers: removedMembers.map(m => m.user_id),
        }),
      });

      const result = await response.json();
      if (result.status) {
        onUpdated?.(result.workspace);
        onClose();
        resetForm();
      } else {
        alertError(result.message || "Failed to update workspace");
      }
    } catch (error) {
      console.error("Error updating workspace:", error);
      alertError("Failed to update workspace");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkspace = async () => {
    const response = await fetch(getApiUrl(API_ENDPOINTS.DELETE_WORKSPACE), {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: 'include', // Include cookies for session
      body: JSON.stringify({
        workspace_id: workspace.id,
        user_id: user?.id,
      }),
    });

    const result = await response.json();
    if (result.status) {
      onDeleted?.(workspace.id);
      onClose();
      resetForm();
    } else {
      alertError(result.message || "Failed to delete workspace");
    }
  };

  const resetForm = () => {
    setWsName("");
    setMembers([{ email: "", role: "VIEWER" }]);
    setExistingMembers([]);
    setShowDeleteConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative max-h-[90vh] overflow-y-auto border border-gray-100">
        <button className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors" onClick={onClose}>
          <X className="w-5 h-5 text-gray-500 hover:text-gray-700" />
        </button>
        
        <h2 className="text-2xl font-bold mb-6 text-gray-900">
          {isEditMode ? "Edit Workspace" : "Create Workspace"}
        </h2>

        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Workspace Name</label>
          <input
            type="text"
            value={wsName}
            onChange={(e) => setWsName(e.target.value)}
            placeholder="Enter workspace name"
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all bg-white shadow-sm hover:shadow"
            disabled={isEditMode && !isOwner}
          />
        </div>

        {/* Existing Members */}
        {isEditMode && existingMembers.length > 0 && (
          <>
            <div className="mb-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3">Current Members</h3>
              <div className="space-y-2">
                {existingMembers.map((m, idx) => (
                  <div 
                    key={idx} 
                    className={`flex space-x-2 items-center p-3 rounded-lg border ${m.toRemove ? 'opacity-50 bg-gray-50' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <input
                      type="email"
                      value={m.email || m.user_email || ""}
                      disabled
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white text-sm"
                      placeholder="Email"
                    />
                    <select
                      value={m.role}
                      onChange={(e) => handleExistingMemberChange(idx, "role", e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      disabled={!isOwner || m.toRemove || m.user_id === user?.id}
                    >
                      <option value="OWNER">Owner</option>
                      <option value="EDITOR">Editor</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                    {isOwner && m.user_id !== user?.id && (
                      <button
                        onClick={() => removeExistingMember(idx)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={m.toRemove}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* New Members */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            {isEditMode ? "Add New Members" : "Members"}
          </h3>
          <div className="space-y-2">
            {members.map((m, idx) => (
              <div key={idx} className="flex space-x-2 items-center">
                <input
                  type="email"
                  placeholder="Enter email address"
                  value={m.email}
                  onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
                  className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none bg-white shadow-sm"
                />
                <select
                  value={m.role}
                  onChange={(e) => handleMemberChange(idx, "role", e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="OWNER">Owner</option>
                  <option value="EDITOR">Editor</option>
                  <option value="VIEWER">Viewer</option>
                </select>
                {members.length > 1 && (
                  <button
                    onClick={() => removeMember(idx)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        
          <button 
            onClick={addMemberRow} 
            className="text-red-600 text-sm font-medium mt-3 hover:text-red-700 flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          {/* Delete button (only for owners in edit mode) */}
          {isEditMode && isOwner && (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center space-x-2 transition-colors shadow-sm hover:shadow"
            >
              <Trash2 className="w-4 h-4" />
              <span className="font-medium">Delete</span>
            </button>
          )}
          
          <div className="flex space-x-3 ml-auto">
            <button
              onClick={onClose}
              className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={isEditMode ? handleUpdateWorkspace : handleCreateWorkspace}
              className="px-5 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all shadow-sm hover:shadow"
              disabled={(isEditMode && !isOwner) || submitting}
            >
              {submitting ? "Processing..." : isEditMode ? "Update" : "Create"}
            </button>
          </div>
        </div>

        {/* Delete Confirmation Dialog */}
        {showDeleteConfirm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-2xl backdrop-blur-sm">
            <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm border border-gray-100">
              <h3 className="text-lg font-bold mb-2 text-gray-900">Delete Workspace?</h3>
              <p className="text-gray-600 mb-6 text-sm">
                This action cannot be undone. All data in this workspace will be permanently deleted.
              </p>
              <div className="flex space-x-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteWorkspace}
                  className="px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 font-medium transition-colors shadow-sm hover:shadow"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceModal;