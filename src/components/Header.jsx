import React from 'react';
import { 
  Search, Settings, User, Plus, Save, Download, Upload, LogOut 
} from 'lucide-react';
import { useAuth } from '../utils/idb';
import { useNavigate } from 'react-router-dom';

const Header = ({ 
  currentWorkspace = "My Workspace",
  onNewRequest,
  onSave,
  onImport,
  onExport,
  onSettings
}) => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login"); // or "/auth/login" based on your routes
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="text-xl font-semibold text-gray-800">Postmon</span>
        </div>
        
        <div className="flex items-center space-x-2 ml-8">
          <span className="text-sm text-gray-600">Workspace:</span>
          <select className="text-sm font-medium text-gray-800 bg-transparent border-none outline-none cursor-pointer">
            <option>{currentWorkspace}</option>
            <option>Team Workspace</option>
            <option>Personal</option>
          </select>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search requests, collections..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right section - Actions */}
      <div className="flex items-center space-x-2">
        <button
          onClick={onNewRequest}
          className="flex items-center space-x-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">New</span>
        </button>

        <button onClick={onImport} title="Import"
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
          <Upload className="w-4 h-4" />
        </button>

        <button onClick={onExport} title="Export"
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
        </button>

        <button onClick={onSave} title="Save"
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
          <Save className="w-4 h-4" />
        </button>

        <button onClick={onSettings} title="Settings"
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
          <Settings className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-2"></div>

        <button title="User Profile"
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors">
          <User className="w-4 h-4" />
        </button>

        <button onClick={handleLogout} title="Logout"
          className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors">
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

export default Header;
