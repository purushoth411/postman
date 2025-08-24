import React, { useState } from "react";
import { Search, Plus, Upload, Download, Save, User, LogOut } from "lucide-react";
import { useAuth } from "../utils/idb";
import { useNavigate } from "react-router-dom";
import WorkspaceModal from "./WorkspaceModal"; // ✅ import
import RequestSearch from "./RequestSearch";

const Header = ({ onNewRequest, onSave, onImport, onExport }) => {
  const { logout, workspaces, selectedWorkspace, setSelectedWorkspace, user } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleWorkspaceSelect = (ws) => {
    setSelectedWorkspace(ws);
    setShowDropdown(false);
  };

  const filteredWorkspaces = workspaces.filter((ws) =>
    ws.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        {/* Left */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="text-xl font-semibold text-gray-800">Postmon</span>
          </div>

          {/* Workspaces */}
          <div className="relative ml-8">
            <div
              className="px-3 py-1 border rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {selectedWorkspace ? selectedWorkspace.name : "Select Workspace"}
            </div>

            {showDropdown && (
              <div className="absolute top-full left-0 mt-2 bg-white border rounded-lg shadow-lg w-64 z-50">
                <input
                  type="text"
                  placeholder="Search workspace..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-3 py-2 border-b outline-none text-sm"
                />
                <div className="max-h-48 overflow-y-auto">
                  {filteredWorkspaces.map((ws) => (
                    <div
                      key={ws.id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleWorkspaceSelect(ws)}
                    >
                      {ws.name}
                    </div>
                  ))}
                </div>
                <div
                  className="px-3 py-2 text-orange-500 hover:bg-gray-50 cursor-pointer border-t"
                  onClick={() => {
                    setShowModal(true);
                    setShowDropdown(false);
                  }}
                >
                  <Plus className="inline w-4 h-4 mr-1" /> Create Workspace
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Center - Search */}
        {/* <div className="flex-1 max-w-md mx-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search requests, collections..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div> */}
        <RequestSearch />

        {/* Right */}
        <div className="flex items-center space-x-2">
          {/* <button
            onClick={onNewRequest}
            className="flex items-center space-x-1 px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            <Plus className="w-4 h-4" /> <span className="text-sm font-medium">New</span>
          </button> */}
          {/* <button onClick={onImport} title="Import" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Upload className="w-4 h-4" />
          </button>
          <button onClick={onExport} title="Export" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Download className="w-4 h-4" />
          </button>
          <button onClick={onSave} title="Save" className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <Save className="w-4 h-4" />
          </button> */}
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <button  title={user?.name || "User Profile"} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
            <User className="w-4 h-4" />
          </button>
          <button
  onClick={() => {
    if (window.confirm("Are you sure you want to log out?")) {
      handleLogout();
    }
  }}
  title="Logout"
  className="p-2 text-red-500 hover:text-white hover:bg-red-500 rounded-lg"
>
  <LogOut className="w-4 h-4" />
</button>
        </div>
      </header>

      {/* Modal */}
      {showModal && (
        <WorkspaceModal
          user={user}
          onClose={() => setShowModal(false)}
          onCreated={(workspace) => setSelectedWorkspace(workspace)} // ✅ set new workspace
        />
      )}
    </>
  );
};

export default Header;
