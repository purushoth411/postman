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
import EnvironmentItem from './EnvironmentItem';

const EnvironmentList = ({ environments, setEnvironments, userId, workspaceId, onEnvironmentSelect, onGlobalSelect, activeEnvironment }) => {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [activeEnvironmentId, setActiveEnvironmentId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch active environment from backend
  useEffect(() => {
    if (!userId || !workspaceId) return;

    const fetchActiveEnvironment = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/api/getActiveEnvironment?user_id=${userId}&workspace_id=${workspaceId}`
        );
        if (!res.ok) throw new Error();
        const data = await res.json();
        setActiveEnvironmentId(data.environment_id || null);
      } catch (err) {
        console.error("Failed to fetch active environment:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActiveEnvironment();
  }, [userId, workspaceId]);

  const handleAddEnvironment = async () => {
    const trimmed = newEnvName.trim();
    if (!trimmed) {
      toast.error("Environment name cannot be empty");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/api/addEnvironment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          workspace_id: workspaceId,
          name: trimmed
        })
      });

      if (!res.ok) throw new Error();
      const newEnvironment = await res.json();
      
      setEnvironments(prev => [...prev, newEnvironment]);
      setNewEnvName('');
      setShowAddInput(false);
      toast.success("Environment created");
    } catch {
      toast.error("Failed to create environment");
    }
  };

  const handleSetActive = async (envId) => {
    try {
      const res = await fetch('http://localhost:5000/api/api/setActiveEnvironment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          workspace_id: workspaceId,
          environment_id: envId
        })
      });

      if (!res.ok) throw new Error();
      setActiveEnvironmentId(envId);
      toast.success("Environment activated");
    } catch {
      toast.error("Failed to activate environment");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddEnvironment();
    if (e.key === 'Escape') {
      setShowAddInput(false);
      setNewEnvName('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-sm text-gray-500">Loading environments...</div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Add Environment Button */}
      <div className="flex items-center justify-between px-2 py-1">
        <h3 className="text-sm font-medium text-gray-700">Environments</h3>
        <button
          onClick={() => setShowAddInput(true)}
          className="p-1 hover:bg-gray-200 rounded"
          title="Add Environment"
        >
          <Plus className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Add Environment Input */}
      {showAddInput && (
        <div className="flex items-center space-x-2 px-2 py-1">
          <Globe className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            className="flex-1 border px-2 py-1 rounded text-sm"
            placeholder="Environment name..."
            value={newEnvName}
            onChange={(e) => setNewEnvName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => newEnvName.trim() ? handleAddEnvironment() : setShowAddInput(false)}
          />
        </div>
      )}

      {/* Global Variables */}
      <div 
        className="flex items-center justify-between px-2 py-2 cursor-pointer hover:bg-gray-100 rounded"
        onClick={() => onGlobalSelect(workspaceId)}
      >
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Global Variables</span>
        </div>
        <span className="text-xs text-gray-500">Global</span>
      </div>

      {/* Environment List */}
      <div className="space-y-1">
        {environments.map(env => (
          <EnvironmentItem
            key={env.id}
            environment={env}
            isActive={activeEnvironmentId === env.id}
            onSetActive={() => handleSetActive(env.id)}
            onSelect={() => onEnvironmentSelect(env)}
            setEnvironments={setEnvironments}
            workspaceId={workspaceId}
            userId={userId}
          />
        ))}
      </div>

      {environments.length === 0 && !showAddInput && (
        <div className="text-center py-8 text-gray-400">
          <Globe className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No environments</p>
          <button
            onClick={() => setShowAddInput(true)}
            className="text-xs text-blue-500 hover:text-blue-600 mt-1"
          >
            Create your first environment
          </button>
        </div>
      )}
    </div>
  );
};

export default EnvironmentList;