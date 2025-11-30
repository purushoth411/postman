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
import { getSocket } from '../utils/Socket';



const EnvironmentList = ({ environments, setEnvironments, userId, workspaceId, onEnvironmentSelect, onGlobalSelect, activeEnvironment, onEnvironmentChange }) => {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [activeEnvironmentId, setActiveEnvironmentId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Socket listeners for environment operations
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !userId || !workspaceId) return;

    // Handle environment added
    const handleEnvironmentAdded = (data) => {
      console.log('Socket Event: environmentAdded', data);
      if (data.workspaceId === workspaceId) {
        const newEnv = data.environment;
        setEnvironments(prev => {
          const exists = prev.some(e => e.id === newEnv.id);
          if (!exists) {
            return [...prev, newEnv];
          }
          return prev;
        });
        toast.success(`Environment "${newEnv.name}" added`);
      }
    };

    // Handle environment updated
    const handleEnvironmentUpdated = (data) => {
      console.log('Socket Event: environmentUpdated', data);
      if (data.workspaceId === workspaceId) {
        setEnvironments(prev =>
          prev.map(e =>
            e.id === data.environmentId ? { ...e, name: data.name } : e
          )
        );
        toast.success("Environment updated");
      }
    };

    // Handle environment deleted
    const handleEnvironmentDeleted = (data) => {
      console.log('Socket Event: environmentDeleted', data);
      if (data.workspaceId === workspaceId) {
        setEnvironments(prev => prev.filter(e => e.id !== data.environmentId));
        // If deleted environment was active, clear active state
        if (activeEnvironmentId === data.environmentId) {
          setActiveEnvironmentId(null);
        }
        toast.success("Environment deleted");
      }
    };

    // Handle environment activated
    const handleEnvironmentActivated = (data) => {
      console.log('Socket Event: environmentActivated', data);
      if (data.workspaceId === workspaceId && data.userId === userId) {
        setActiveEnvironmentId(data.environmentId);
      }
    };

    socket.on('environmentAdded', handleEnvironmentAdded);
    socket.on('environmentUpdated', handleEnvironmentUpdated);
    socket.on('environmentDeleted', handleEnvironmentDeleted);
    socket.on('environmentActivated', handleEnvironmentActivated);

    return () => {
      socket.off('environmentAdded', handleEnvironmentAdded);
      socket.off('environmentUpdated', handleEnvironmentUpdated);
      socket.off('environmentDeleted', handleEnvironmentDeleted);
      socket.off('environmentActivated', handleEnvironmentActivated);
    };
  }, [userId, workspaceId, setEnvironments, activeEnvironmentId]);

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
      // If clicking on already active environment, deactivate it
      const newActiveId = activeEnvironmentId === envId ? null : envId;
      
      const res = await fetch('http://localhost:5000/api/api/setActiveEnvironment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          workspace_id: workspaceId,
          environment_id: newActiveId
        })
      });

      if (!res.ok) throw new Error();
      
      const data = await res.json();
      setActiveEnvironmentId(newActiveId);
      
      if (newActiveId) {
        toast.success("Environment activated");
      } else {
        toast.success("Environment deactivated");
      }
    } catch {
      toast.error("Failed to update environment status");
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
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-sm font-semibold text-gray-700">Environments</h3>
        <button
          onClick={() => setShowAddInput(true)}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="Add Environment"
        >
          <Plus className="w-4 h-4 text-gray-600" />
        </button>
      </div>

      {/* Add Environment Input */}
      {showAddInput && (
        <div className="flex items-center space-x-2 px-3 py-2">
          <Globe className="w-4 h-4 text-gray-400" />
          <input
            autoFocus
            className="flex-1 border border-gray-300 px-3 py-2 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
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
        className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-white rounded-lg transition-colors duration-150 border border-transparent hover:border-gray-200 hover:shadow-sm"
        onClick={() => onGlobalSelect(workspaceId)}
      >
        <div className="flex items-center space-x-2">
          <Settings className="w-4 h-4 text-green-500" />
          <span className="text-sm font-semibold text-gray-800">Global Variables</span>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Global</span>
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
        <div className="text-center py-12 text-gray-400">
          <Globe className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium text-gray-500">No environments</p>
          <button
            onClick={() => setShowAddInput(true)}
            className="text-xs text-orange-600 hover:text-orange-700 font-medium mt-2 hover:underline"
          >
            Create your first environment
          </button>
        </div>
      )}
    </div>
  );
};

export default EnvironmentList;