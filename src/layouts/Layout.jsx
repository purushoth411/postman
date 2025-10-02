import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useState } from "react";
import RequestEditor from "../components/EditorDiv/RequestEditor";
import EnvironmentEditor from "../components/EnvironmentEditor";
import { useAuth } from "../utils/idb";

export default function Layout() {
  const navigate = useNavigate();
  const {
    user,
    selectedRequest,
    setSelectedRequest,
    selectedEnvironment,
    setSelectedEnvironment,
    selectedGlobal,
    setSelectedGlobal,
    selectedWorkspace,
  } = useAuth();

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
  };

  const handleEnvironmentSelect = (environment) => {
    setSelectedEnvironment(environment);
  };

  const handleGlobalSelect = (workspaceId) => {
    setSelectedGlobal(workspaceId);
  };

  // Determine what to show in the main content area
  const renderMainContent = () => {
    // Priority order: Request > Environment > Global > Default Outlet
    if (selectedRequest) {
      return (
        <RequestEditor
          request={selectedRequest}
          onChangeRequest={setSelectedRequest}
        />
      );
    }
    
    if (selectedEnvironment) {
      return (
        <EnvironmentEditor
          environment={selectedEnvironment}
          workspaceId={selectedWorkspace?.id}
          isGlobal={false}
        />
      );
    }
    
    if (selectedGlobal) {
      return (
        <EnvironmentEditor
          workspaceId={selectedGlobal}
          isGlobal={true}
        />
      );
    }
    
    // Default to Outlet (Dashboard or other routes)
    return <Outlet />;
  };

  return (
    <div className="h-screen flex flex-col w-full">
      <Header />
     
      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onRequestSelect={handleRequestSelect}
          onEnvironmentSelect={handleEnvironmentSelect}
          onGlobalSelect={handleGlobalSelect}
        />
       
        <main className="flex-1 overflow-y-auto bg-gray-50" id="scroll-container">
          {renderMainContent()}
        </main>
      </div>
      
      {/* Footer */}
      <div className="border-t border-[#092e4650] bg-white text-[#092e46] px-4 py-3 flex items-center justify-center">
        <p className="text-sm text-[#092e46]">
          © {new Date().getFullYear()} Postmon. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}