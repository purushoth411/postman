import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  MoreVertical, 
  Edit3, 
  Trash2,
  Settings
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getApiUrl, API_ENDPOINTS } from '../config/api';
import { confirm } from '../utils/alert';

const EnvironmentItem = ({ environment, isActive, onSetActive, onSelect, setEnvironments, workspaceId, userId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(environment.name);

  const handleDelete = async (e) => {
    e.stopPropagation();
    const confirmed = await confirm(`Delete environment "${environment.name}"?`, 'Delete Environment', 'warning');
    if (!confirmed) return;

    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.DELETE_ENVIRONMENT), {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({ environment_id: environment.id })
      });

      if (!res.ok) throw new Error();
      setEnvironments(prev => prev.filter(e => e.id !== environment.id));
      toast.success("Environment deleted");
    } catch {
      toast.error("Failed to delete environment");
    }
  };

  const handleRename = async () => {
    const trimmed = editName.trim();
    if (!trimmed || trimmed === environment.name) {
      setIsEditing(false);
      setEditName(environment.name);
      return;
    }

    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.UPDATE_ENVIRONMENT), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({
          environment_id: environment.id,
          name: trimmed
        })
      });

      if (!res.ok) throw new Error();
      setEnvironments(prev => prev.map(e => 
        e.id === environment.id ? { ...e, name: trimmed } : e
      ));
      setIsEditing(false);
      toast.success("Environment renamed");
    } catch {
      toast.error("Failed to rename environment");
      setEditName(environment.name);
      setIsEditing(false);
    }
  };

  return (
    <div 
      className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer group transition-all duration-150 ${
        isActive 
          ? 'bg-red-50 border border-red-200 shadow-sm' 
          : 'hover:bg-white hover:border hover:border-gray-200 hover:shadow-sm border border-transparent'
      }`}
      onClick={() => !isEditing && onSelect()}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <Globe className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-red-500' : 'text-gray-400'}`} />
        {isEditing ? (
          <input
            autoFocus
            className="flex-1 border border-red-300 px-3 py-1.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleRename();
              if (e.key === 'Escape') {
                setIsEditing(false);
                setEditName(environment.name);
              }
            }}
            onBlur={handleRename}
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <span className={`text-sm truncate font-semibold ${isActive ? 'text-red-700' : 'text-gray-800'}`}>
            {environment.name}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {/* Toggle Switch */}
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(e) => {
                e.stopPropagation();
                onSetActive();
              }}
              className="sr-only peer"
            />
            <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 ${
              isActive ? 'bg-red-500' : 'bg-gray-300'
            }`}>
              <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-200 ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}></div>
            </div>
          </label>
        </div>
        <div className="relative">
        <button
  onClick={(e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  }}
  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
>
  <MoreVertical className="w-4 h-4 text-gray-500" />
</button>
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div className="absolute right-0 mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 hover:bg-gray-50 text-sm text-left transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Rename</span>
                </button>
                <div className="border-t border-gray-100"></div>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 hover:bg-red-50 text-sm text-left text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnvironmentItem;