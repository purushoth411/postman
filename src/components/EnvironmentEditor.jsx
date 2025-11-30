import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Settings, 
  Plus, 
  Eye, 
  EyeOff, 
  Trash2, 
  Save,
  Key,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { getSocket } from '../utils/Socket';

const EnvironmentEditor = ({ environment, workspaceId, userId, isGlobal = false, onVariablesChange }) => {
  const [variables, setVariables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showValues, setShowValues] = useState({});
  const [hasChanges, setHasChanges] = useState(false);
  const [deletedIds, setDeletedIds] = useState([]);

  // Socket listeners for variable operations
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !workspaceId) return;

    if (isGlobal) {
      // Global variable listeners
      const handleGlobalVariableAdded = (data) => {
        console.log('Socket Event: globalVariableAdded', data);
        if (data.workspaceId === workspaceId) {
          setVariables(prev => {
            const exists = prev.some(v => v.id === data.variable.id);
            if (!exists) {
              return [...prev, data.variable];
            }
            return prev;
          });
        }
      };

      const handleGlobalVariableUpdated = (data) => {
        console.log('Socket Event: globalVariableUpdated', data);
        if (data.workspaceId === workspaceId) {
          setVariables(prev =>
            prev.map(v =>
              v.id === data.variableId ? { ...v, ...data.variable } : v
            )
          );
        }
      };

      const handleGlobalVariableDeleted = (data) => {
        console.log('Socket Event: globalVariableDeleted', data);
        if (data.workspaceId === workspaceId) {
          setVariables(prev => prev.filter(v => v.id !== data.variableId));
        }
      };

      socket.on('globalVariableAdded', handleGlobalVariableAdded);
      socket.on('globalVariableUpdated', handleGlobalVariableUpdated);
      socket.on('globalVariableDeleted', handleGlobalVariableDeleted);

      return () => {
        socket.off('globalVariableAdded', handleGlobalVariableAdded);
        socket.off('globalVariableUpdated', handleGlobalVariableUpdated);
        socket.off('globalVariableDeleted', handleGlobalVariableDeleted);
      };
    } else if (environment) {
      // Environment variable listeners
      const handleEnvironmentVariableAdded = (data) => {
        console.log('Socket Event: environmentVariableAdded', data);
        if (data.environmentId === environment.id) {
          setVariables(prev => {
            const exists = prev.some(v => v.id === data.variable.id);
            if (!exists) {
              return [...prev, data.variable];
            }
            return prev;
          });
        }
      };

      const handleEnvironmentVariableUpdated = (data) => {
        console.log('Socket Event: environmentVariableUpdated', data);
        if (data.environmentId === environment.id) {
          setVariables(prev =>
            prev.map(v =>
              v.id === data.variableId ? { ...v, ...data.variable } : v
            )
          );
        }
      };

      const handleEnvironmentVariableDeleted = (data) => {
        console.log('Socket Event: environmentVariableDeleted', data);
        if (data.environmentId === environment.id) {
          setVariables(prev => prev.filter(v => v.id !== data.variableId));
        }
      };

      socket.on('environmentVariableAdded', handleEnvironmentVariableAdded);
      socket.on('environmentVariableUpdated', handleEnvironmentVariableUpdated);
      socket.on('environmentVariableDeleted', handleEnvironmentVariableDeleted);

      return () => {
        socket.off('environmentVariableAdded', handleEnvironmentVariableAdded);
        socket.off('environmentVariableUpdated', handleEnvironmentVariableUpdated);
        socket.off('environmentVariableDeleted', handleEnvironmentVariableDeleted);
      };
    }
  }, [workspaceId, environment, isGlobal]);

  useEffect(() => {
    if (isGlobal && workspaceId) {
      fetchGlobalVariables();
    } else if (environment) {
      fetchEnvironmentVariables();
    }
  }, [environment, workspaceId, isGlobal]);

  const fetchGlobalVariables = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/api/getGlobalVariables?workspace_id=${workspaceId}`);
      if (res.ok) {
        const data = await res.json();
        setVariables(data || []);
      }
    } catch (err) {
      console.error('Error fetching global variables:', err);
      toast.error('Failed to load global variables');
    } finally {
      setLoading(false);
    }
  };

  const fetchEnvironmentVariables = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/api/getEnvironmentVariables?environment_id=${environment.id}`);
      if (res.ok) {
        const data = await res.json();
        setVariables(data || []);
      }
    } catch (err) {
      console.error('Error fetching environment variables:', err);
      toast.error('Failed to load variables');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Process all changes
      const promises = [];

      // Handle deletions
      for (const id of deletedIds) {
        const endpoint = isGlobal ? 'deleteGlobalVariable' : 'deleteEnvironmentVariable';
        promises.push(
          fetch(`http://localhost:5000/api/api/${endpoint}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id })
          })
        );
      }

      // Handle additions and updates
      for (const variable of variables) {
        if (variable.isNew) {
          // Add new variable
          const endpoint = isGlobal ? 'addGlobalVariable' : 'addEnvironmentVariable';
          const body = isGlobal 
            ? { workspace_id: workspaceId, key: variable.key, value: variable.value, type: variable.type }
            : { environment_id: environment.id, key: variable.key, value: variable.value, type: variable.type };
          
          promises.push(
            fetch(`http://localhost:5000/api/api/${endpoint}`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            })
          );
        } else if (variable.isModified) {
          // Update existing variable
          const endpoint = isGlobal ? 'updateGlobalVariable' : 'updateEnvironmentVariable';
          promises.push(
            fetch(`http://localhost:5000/api/api/${endpoint}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ 
                id: variable.id, 
                key: variable.key, 
                value: variable.value, 
                type: variable.type 
              })
            })
          );
        }
      }

      // Wait for all operations to complete
      const results = await Promise.all(promises);
      const allSuccessful = results.every(res => res.ok);

      if (allSuccessful) {
        setHasChanges(false);
        setDeletedIds([]);
        toast.success('Variables saved successfully');
        
        // Refresh the list
        if (isGlobal) {
          fetchGlobalVariables();
        } else {
          fetchEnvironmentVariables();
        }
      } else {
        throw new Error('Some operations failed');
      }
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save variables');
    } finally {
      setSaving(false);
    }
  };

  const addVariable = () => {
    const newVariable = {
      id: `temp_${Date.now()}`,
      key: `variable_${variables.length + 1}`,
      value: '',
      type: 'default',
      isNew: true
    };
    setVariables([...variables, newVariable]);
    setHasChanges(true);
  };

  const updateVariable = (id, updates) => {
    setVariables(prev => prev.map(v => {
      if (v.id === id) {
        return { ...v, ...updates, isModified: !v.isNew };
      }
      return v;
    }));
    setHasChanges(true);
  };

  const deleteVariable = (variable) => {
    if (variable.isNew) {
      // Just remove from list if it's a new unsaved variable
      setVariables(prev => prev.filter(v => v.id !== variable.id));
    } else {
      // Mark for deletion if it exists in DB
      setDeletedIds(prev => [...prev, variable.id]);
      setVariables(prev => prev.filter(v => v.id !== variable.id));
    }
    setHasChanges(true);
  };

  const toggleShowValue = (id) => {
    setShowValues(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading variables...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isGlobal ? (
              <Settings className="w-6 h-6 text-green-500" />
            ) : (
              <Globe className="w-6 h-6 text-blue-500" />
            )}
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {isGlobal ? 'Global Variables' : environment?.name}
              </h1>
              <p className="text-sm text-gray-500">
                {isGlobal 
                  ? 'Variables available across all environments in this workspace'
                  : 'Environment-specific variables'
                }
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {hasChanges && (
              <div className="flex items-center space-x-2 text-yellow-600">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">Unsaved changes</span>
              </div>
            )}
            <button
              onClick={handleSave}
              disabled={!hasChanges || saving}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                hasChanges && !saving
                  ? 'bg-orange-500 hover:bg-orange-600 text-white'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Variables Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          {/* Add Variable Button */}
          <div className="mb-6">
            <button
              onClick={addVariable}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Variable</span>
            </button>
          </div>

          {/* Variables List */}
          {variables.length > 0 ? (
            <div className="space-y-4">
              {variables.map((variable) => (
                <VariableRow
                  key={variable.id}
                  variable={variable}
                  onUpdate={(updates) => updateVariable(variable.id, updates)}
                  onDelete={() => deleteVariable(variable)}
                  showValue={showValues[variable.id]}
                  onToggleShow={() => toggleShowValue(variable.id)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">No variables yet</p>
              <p className="text-sm">Add your first variable to get started</p>
            </div>
          )}

          {/* Usage Info */}
          <div className="mt-12 bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Usage</h3>
            <div className="space-y-3 text-sm text-gray-600">
              <p>• Use variables in your requests with double curly braces: <code className="bg-gray-200 px-2 py-1 rounded">{'{{variable_name}}'}</code></p>
              <p>• {isGlobal ? 'Global variables are available in all environments' : 'Environment variables override global variables with the same name'}</p>
              <p>• Variables are resolved when the request is sent</p>
              <p>• Secret variables are hidden by default for security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Variable Row Component
const VariableRow = ({ variable, onUpdate, onDelete, showValue, onToggleShow }) => {
  const [key, setKey] = useState(variable.key);
  const [value, setValue] = useState(variable.value);
  const [type, setType] = useState(variable.type || 'default');
  const [keyError, setKeyError] = useState('');

  const handleKeyChange = (newKey) => {
    setKey(newKey);
    
    // Validate key
    if (!newKey.trim()) {
      setKeyError('Variable name is required');
    } else if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(newKey)) {
      setKeyError('Variable name must start with a letter or underscore and contain only letters, numbers, and underscores');
    } else {
      setKeyError('');
      onUpdate({ key: newKey });
    }
  };

  const handleValueChange = (newValue) => {
    setValue(newValue);
    onUpdate({ value: newValue });
  };

  const handleTypeChange = (newType) => {
    setType(newType);
    onUpdate({ type: newType });
  };

  const isSecret = type === 'secret';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Variable Key */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variable Name
          </label>
          <input
            type="text"
            value={key}
            onChange={(e) => handleKeyChange(e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm ${
              keyError ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="variable_name"
          />
          {keyError && (
            <p className="mt-1 text-xs text-red-600">{keyError}</p>
          )}
        </div>

        {/* Variable Value */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Value
          </label>
          <div className="relative">
            <input
              type={showValue ? "text" : "password"}
              value={value}
              onChange={(e) => handleValueChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm pr-16"
              placeholder="Enter value..."
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
              <button
                type="button"
                onClick={onToggleShow}
                className="p-1 hover:bg-gray-100 rounded"
                title={showValue ? "Hide value" : "Show value"}
              >
                {showValue ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="p-1 hover:bg-red-100 rounded text-red-500"
                title="Delete variable"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Variable Type */}
      <div className="mt-3">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isSecret}
            onChange={(e) => handleTypeChange(e.target.checked ? 'secret' : 'default')}
            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700">
            Secret variable (hidden by default)
          </span>
        </label>
      </div>
    </div>
  );
};

export default EnvironmentEditor;