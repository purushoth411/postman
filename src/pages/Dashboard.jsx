import React from 'react'
import EmptyState from '../components/EmptyState'
import RequestEditor from "../components/EditorDiv/RequestEditor";
import EnvironmentEditor from "../components/EnvironmentEditor";
import { useAuth } from "../utils/idb";

function Dashboard() {
  const {
      selectedRequest,
      setSelectedRequest,
      selectedEnvironment,
      selectedGlobal,
      selectedWorkspace,
    } = useAuth();

     const renderMainContent = () => {
 
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
    return <EmptyState />;
  };

  return (
    <div>
      {renderMainContent()}
     
    </div>
  )
}

export default Dashboard