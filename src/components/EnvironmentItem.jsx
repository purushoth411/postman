import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  MoreVertical, 
  Edit3, 
  Trash2,
  Settings,
  Check
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EnvironmentItem = ({ environment, isActive, onSetActive, onSelect, setEnvironments, workspaceId, userId }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(environment.name);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (!window.confirm(`Delete environment "${environment.name}"?`)) return;

    try {
      const res = await fetch(`http://localhost:5000/api/api/deleteEnvironment`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
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
      const res = await fetch(`http://localhost:5000/api/api/updateEnvironment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
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
      className={`flex items-center justify-between px-2 py-2 rounded cursor-pointer group ${
        isActive ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'
      }`}
      onClick={() => !isEditing && onSelect()}
    >
      <div className="flex items-center space-x-2 flex-1 min-w-0">
        <Globe className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />
        {isEditing ? (
          <input
            autoFocus
            className="flex-1 border px-2 py-1 rounded text-sm"
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
          <span className={`text-sm truncate ${isActive ? 'font-medium text-blue-700' : 'text-gray-700'}`}>
            {environment.name}
          </span>
        )}
      </div>

      <div className="flex items-center space-x-1">
        {isActive && (
          <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
        )}
        {!isActive && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSetActive();
            }}
            className="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Set Active
          </button>
        )}
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-1 hover:bg-gray-200 rounded opacity-0 group-hover:opacity-100 transition-opacity"
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
              <div className="absolute right-0 mt-1 w-40 bg-white border rounded shadow-lg z-20">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(true);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-gray-100 text-sm text-left"
                >
                  <Edit3 className="w-4 h-4" />
                  <span>Rename</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full flex items-center space-x-2 px-3 py-2 hover:bg-red-50 text-sm text-left text-red-600"
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