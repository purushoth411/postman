import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import { useState } from "react";
import RequestEditor from "../components/RequestEditor";

export default function Layout() {
  const navigate = useNavigate();
  
   const [selectedRequest, setSelectedRequest] = useState(null);

  const handleNewRequest = () => {
    // You can open new request editor with empty/default request
    setSelectedRequest({
      id: null,
      name: '',
      method: 'GET',
      url: '',
      body: '',
      headers: {},
    });
  };

  const handleRequestSelect = (request) => {
    setSelectedRequest(request);
  };
  

  
  const handleSave = () => {
    // Handle save functionality
    console.log('Save current request');
    // Add your save logic here
  };
  
  const handleImport = () => {
    // Handle import functionality
    console.log('Import collection');
    // Add file import logic here
  };
  
  const handleExport = () => {
    // Handle export functionality
    console.log('Export collection');
    // Add export logic here
  };
  
  const handleSettings = () => {
    // Navigate to settings or open settings modal
    navigate('/settings');
  };
  
  return (
    <div className="h-screen flex flex-col w-full">
      <Header
        onNewRequest={handleNewRequest}
        onSave={handleSave}
        onImport={handleImport}
        onExport={handleExport}
        onSettings={handleSettings}
      />
     
      {/* Main content area with sidebar */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onRequestSelect={handleRequestSelect}
         
          
       
        />
       
         <main className="flex-1 overflow-y-auto bg-gray-50" id="scroll-container">
          {selectedRequest ? (
            <RequestEditor
              request={selectedRequest}
              onChangeRequest={setSelectedRequest}
            />
          ) : (
            <Outlet />
            
          )}
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