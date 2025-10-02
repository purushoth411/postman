// import React, { useState } from 'react';
// import EmptyState from '../components/EmptyState';
// import EnvironmentEditor from '../components/EnvironmentEditor';

// function Dashboard({ selectedRequest, selectedEnvironment, selectedGlobal, workspaceId }) {
//   // If an environment is selected, show the environment editor
//   if (selectedEnvironment) {
//     return (
//       <EnvironmentEditor 
//         environment={selectedEnvironment} 
//         workspaceId={workspaceId}
//         isGlobal={false}
//       />
//     );
//   }

//   // If global variables are selected, show the global editor
//   if (selectedGlobal) {
//     return (
//       <EnvironmentEditor 
//         workspaceId={selectedGlobal} 
//         isGlobal={true}
//       />
//     );
//   }

//   // If a request is selected, show the request editor (your existing logic)
//   if (selectedRequest) {
//     // Return your existing request editor component
//     return <div>Request Editor for {selectedRequest.name}</div>;
//   }

//   // Default empty state
//   return <EmptyState />;
// }

// export default Dashboard;
import React from 'react'
import EmptyState from '../components/EmptyState'

function Dashboard() {
  return (
    <div>
      <EmptyState />
    </div>
  )
}

export default Dashboard