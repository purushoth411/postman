import React, { useState } from "react";
import { X } from "lucide-react";

const WorkspaceModal = ({ user, onClose, onCreated }) => {
  const [wsName, setWsName] = useState("");
  const [members, setMembers] = useState([{ email: "", role: "VIEWER" }]);

  const handleMemberChange = (index, field, value) => {
    const updated = [...members];
    updated[index][field] = value;
    setMembers(updated);
  };

  const addMemberRow = () => {
    setMembers([...members, { email: "", role: "VIEWER" }]);
  };

  const handleCreateWorkspace = async () => {
    if (!wsName.trim()) return;

    const response = await fetch("http://localhost:5000/api/api/createWorkspace", {
      method: "POST",
      headers: {"Content-Type": "application/json" },
      body: JSON.stringify({
        name: wsName,
        user_id: user?.id,
        members,
      }),
    });

    const result = await response.json();
    if (result.status) {
      onCreated(result.workspace); // pass back to Header
      onClose();
      setWsName("");
      setMembers([{ email: "", role: "VIEWER" }]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button className="absolute top-3 right-3" onClick={onClose}>
          <X className="w-5 h-5 text-gray-500" />
        </button>
        <h2 className="text-xl font-semibold mb-4">Create Workspace</h2>

        <input
          type="text"
          value={wsName}
          onChange={(e) => setWsName(e.target.value)}
          placeholder="Workspace Name"
          className="w-full border rounded-lg px-3 py-2 mb-4"
        />

        <h3 className="text-sm font-medium mb-2">Members</h3>
        {members.map((m, idx) => (
          <div key={idx} className="flex space-x-2 mb-2">
            <input
              type="email"
              placeholder="Email"
              value={m.email}
              onChange={(e) => handleMemberChange(idx, "email", e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2"
            />
            <select
              value={m.role}
              onChange={(e) => handleMemberChange(idx, "role", e.target.value)}
              className="border rounded-lg px-2"
            >
              <option value="OWNER">Owner</option>
              <option value="EDITOR">Editor</option>
              <option value="VIEWER">Viewer</option>
            </select>
          </div>
        ))}
        <button onClick={addMemberRow} className="text-orange-500 text-sm mb-4">
          + Add Member
        </button>

        <div className="flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleCreateWorkspace}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default WorkspaceModal;
