import React, { useState, useRef, useEffect } from 'react';
import { 
  Globe, 
  Plus, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronRight,
  Key,
  Eye,
  EyeOff,
  Check,
  X
} from 'lucide-react';
import { toast } from 'react-hot-toast';

const EnvironmentList = ({ environments, setEnvironments, userId, workspaceId }) => {
  const [showAddInput, setShowAddInput] = useState(false);
  const [newEnvName, setNewEnvName] = useState('');
  const [activeEnvironment, setActiveEnvironment] = useState(null);

  // Load active environment from localStorage
  useEffect(() => {
    const savedEnv = localStorage.getItem(`activeEnvironment_${workspaceId}`);
    if (savedEnv && environments.find(env => env.id === savedEnv)) {
      setActiveEnvironment(savedEnv);
    }
  }, [environments, workspaceId]);

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
          name: trimmed,
          variables: {}
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

  const handleSetActive = (envId) => {
    setActiveEnvironment(envId);
    localStorage.setItem(`activeEnvironment_${workspaceId}`, envId);
    toast.success("Environment activated");
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddEnvironment();
    if (e.key === 'Escape') {
      setShowAddInput(false);
      setNewEnvName('');
    }
  };

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
      <GlobalVariables workspaceId={workspaceId} />

      {/* Environment List */}
      <div className="space-y-1">
        {environments.map(env => (
          <EnvironmentItem
            key={env.id}
            environment={env}
            isActive={activeEnvironment === env.id}
            onSetActive={() => handleSetActive(env.id)}
            setEnvironments={setEnvironments}
            workspaceId={workspaceId}
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

// Global Variables Component
const GlobalVariables = ({ workspaceId }) => {
  const [expanded, setExpanded] = useState(false);
  const [variables, setVariables] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (expanded && workspaceId) {
      (async () => {
        setLoading(true);
        try {
          const res = await fetch(`http://localhost:5000/api/api/getGlobalVariables?workspace_id=${workspaceId}`);
          if (res.ok) {
            const data = await res.json();
            setVariables(data.variables || {});
          }
        } catch (err) {
          console.error('Error fetching global variables:', err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [expanded, workspaceId]);

  return (
    <div className="border rounded-lg p-2 bg-gray-50">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center space-x-2">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <Globe className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium">Global Variables</span>
        </div>
        <span className="text-xs text-gray-500">
          {Object.keys(variables).length} vars
        </span>
      </div>

      {expanded && (
        <div className="mt-2">
          {loading ? (
            <div className="text-xs text-gray-400">Loading...</div>
          ) : (
            <VariableEditor
              variables={variables}
              setVariables={setVariables}
              isGlobal={true}
              workspaceId={workspaceId}
            />
          )}
        </div>
      )}
    </div>
  );
};

// Individual Environment Item
const EnvironmentItem = ({ environment, isActive, onSetActive, setEnvironments, workspaceId }) => {
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editingName, setEditingName] = useState(environment.name);
  const [variables, setVariables] = useState(environment.variables || {});
  const [activeDropdown, setActiveDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRename = async () => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      toast.error("Environment name cannot be empty");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/api/renameEnvironment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          environment_id: environment.id,
          name: trimmed
        })
      });

      if (!res.ok) throw new Error();
      
      setEnvironments(prev => prev.map(env => 
        env.id === environment.id ? { ...env, name: trimmed } : env
      ));
      setEditing(false);
      toast.success("Environment renamed");
    } catch {
      toast.error("Failed to rename environment");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${environment.name}"?`)) return;

    try {
      const res = await fetch('http://localhost:5000/api/api/deleteEnvironment', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ environment_id: environment.id })
      });

      if (!res.ok) throw new Error();
      
      setEnvironments(prev => prev.filter(env => env.id !== environment.id));
      
      // If this was the active environment, clear it
      if (isActive) {
        localStorage.removeItem(`activeEnvironment_${workspaceId}`);
      }
      
      toast.success("Environment deleted");
    } catch {
      toast.error("Failed to delete environment");
    }
  };

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  return (
    <div className={`border rounded-lg p-2 ${isActive ? 'bg-blue-50 border-blue-200' : 'bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 flex-1">
          <button onClick={toggleExpanded}>
            {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>

          {editing ? (
            <input
              autoFocus
              value={editingName}
              onChange={(e) => setEditingName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename();
                if (e.key === 'Escape') {
                  setEditing(false);
                  setEditingName(environment.name);
                }
              }}
              onBlur={handleRename}
              className="text-sm border px-1 rounded flex-1"
            />
          ) : (
            <div className="flex items-center space-x-2 flex-1" onClick={toggleExpanded}>
              <Globe className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-gray-500'}`} />
              <span className="text-sm font-medium truncate">{environment.name}</span>
              {isActive && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">Active</span>}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1">
          {!isActive && (
            <button
              onClick={onSetActive}
              className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded"
              title="Set as active environment"
            >
              Activate
            </button>
          )}
          
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveDropdown(!activeDropdown);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <MoreVertical className="w-3 h-3" />
            </button>
            
            {activeDropdown && (
              <div className="absolute right-0 mt-1 bg-white shadow-lg border rounded z-10 w-32">
                <button
                  className="px-3 py-2 text-sm hover:bg-gray-100 w-full text-left"
                  onClick={() => {
                    setEditing(true);
                    setActiveDropdown(false);
                  }}
                >
                  <Edit3 className="w-4 h-4 inline mr-2" />
                  Rename
                </button>
                <hr />
                <button
                  className="px-3 py-2 text-sm hover:bg-red-50 text-red-600 w-full text-left"
                  onClick={handleDelete}
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {expanded && (
        <div className="mt-2 pl-6">
          <VariableEditor
            variables={variables}
            setVariables={setVariables}
            environmentId={environment.id}
            workspaceId={workspaceId}
          />
        </div>
      )}
    </div>
  );
};

// Variable Editor Component
const VariableEditor = ({ variables, setVariables, environmentId, workspaceId, isGlobal = false }) => {
  const [editingKey, setEditingKey] = useState('');
  const [editingValue, setEditingValue] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [showValues, setShowValues] = useState({});

  const handleAddVariable = async () => {
    const key = editingKey.trim();
    const value = editingValue.trim();
    
    if (!key) {
      toast.error("Variable name cannot be empty");
      return;
    }

    const newVariables = { ...variables, [key]: value };

    try {
      const endpoint = isGlobal ? 'updateGlobalVariables' : 'updateEnvironmentVariables';
      const body = isGlobal 
        ? { workspace_id: workspaceId, variables: newVariables }
        : { environment_id: environmentId, variables: newVariables };

      const res = await fetch(`http://localhost:5000/api/api/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error();

      setVariables(newVariables);
      setEditingKey('');
      setEditingValue('');
      setShowAddInput(false);
      toast.success("Variable added");
    } catch {
      toast.error("Failed to add variable");
    }
  };

  const handleDeleteVariable = async (key) => {
    const newVariables = { ...variables };
    delete newVariables[key];

    try {
      const endpoint = isGlobal ? 'updateGlobalVariables' : 'updateEnvironmentVariables';
      const body = isGlobal 
        ? { workspace_id: workspaceId, variables: newVariables }
        : { environment_id: environmentId, variables: newVariables };

      const res = await fetch(`http://localhost:5000/api/api/${endpoint}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!res.ok) throw new Error();

      setVariables(newVariables);
      toast.success("Variable deleted");
    } catch {
      toast.error("Failed to delete variable");
    }
  };

  const toggleShowValue = (key) => {
    setShowValues(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-2">
      {/* Existing Variables */}
      {Object.entries(variables).map(([key, value]) => (
        <div key={key} className="flex items-center space-x-2 text-xs">
          <Key className="w-3 h-3 text-gray-400" />
          <span className="font-mono bg-gray-100 px-2 py-1 rounded">{key}</span>
          <span>=</span>
          <div className="flex items-center space-x-1 flex-1">
            <span className="font-mono bg-gray-100 px-2 py-1 rounded flex-1 truncate">
              {showValues[key] ? value : '•'.repeat(Math.min(value.length, 8))}
            </span>
            <button
              onClick={() => toggleShowValue(key)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {showValues[key] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
            <button
              onClick={() => handleDeleteVariable(key)}
              className="p-1 hover:bg-red-100 rounded text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}

      {/* Add Variable Input */}
      {showAddInput ? (
        <div className="space-y-2">
          <div className="flex items-center space-x-2 text-xs">
            <Key className="w-3 h-3 text-gray-400" />
            <input
              autoFocus
              placeholder="Variable name"
              value={editingKey}
              onChange={(e) => setEditingKey(e.target.value)}
              className="border px-2 py-1 rounded font-mono text-xs"
            />
            <span>=</span>
            <input
              placeholder="Value"
              value={editingValue}
              onChange={(e) => setEditingValue(e.target.value)}
              className="flex-1 border px-2 py-1 rounded font-mono text-xs"
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddVariable();
                if (e.key === 'Escape') {
                  setShowAddInput(false);
                  setEditingKey('');
                  setEditingValue('');
                }
              }}
            />
            <button
              onClick={handleAddVariable}
              className="p-1 hover:bg-green-100 rounded text-green-600"
            >
              <Check className="w-3 h-3" />
            </button>
            <button
              onClick={() => {
                setShowAddInput(false);
                setEditingKey('');
                setEditingValue('');
              }}
              className="p-1 hover:bg-red-100 rounded text-red-500"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddInput(true)}
          className="flex items-center space-x-2 text-xs text-gray-500 hover:text-gray-700 w-full"
        >
          <Plus className="w-3 h-3" />
          <span>Add Variable</span>
        </button>
      )}
    </div>
  );
};

export default EnvironmentList;