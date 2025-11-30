import { Outlet } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import RequestEditor from "../components/EditorDiv/RequestEditor";
import EnvironmentEditor from "../components/EnvironmentEditor";
import { useAuth } from "../utils/idb";

export default function Layout() {
  const {
    setSelectedRequest,
    setSelectedEnvironment,
    setSelectedGlobal
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
          <Outlet />
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