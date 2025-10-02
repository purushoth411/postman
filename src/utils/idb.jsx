import { createContext, useContext, useState, useEffect } from "react";
import { set, get, del } from "idb-keyval";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedEnvironment, setSelectedEnvironment] = useState(null);
  const [selectedGlobal, setSelectedGlobal] = useState(null);
  const [expandPath, setExpandPath] = useState({
    collectionId: null,
    folderIds: null, // e.g., [parentFolderId, subFolderId]
    requestId: null,
  });

  // ✅ reusable fetchWorkspaces
  const fetchWorkspaces = async (user) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/api/getWorkspaces?user_id=${user.id}`
      );
      const data = await res.json();
      if (data.status) {
        setWorkspaces(data.workspaces);
        // restore or set default workspace
        const storedWs = await get("SelectedWorkspace");
        if (storedWs) {
          setSelectedWorkspace(storedWs);
        } else if (data.workspaces.length > 0) {
          const defaultWs = data.workspaces[0];
          setSelectedWorkspace(defaultWs);
          await set("SelectedWorkspace", defaultWs);
        }
      }
    } catch (err) {
      console.error("Error fetching workspaces:", err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await get("LoggedInUser");
      if (storedUser) {
        setUser(storedUser);
        await fetchWorkspaces(storedUser);
      }
      setLoading(false);
    };
    fetchUser();
  }, []);

  const login = async (userData) => {
    const appKey = "Postmon-Clone";
    const userWithKey = { ...userData, appKey };
    setUser(userWithKey);
    await set("LoggedInUser", userWithKey);
    // ✅ always load workspaces after login/signup
    await fetchWorkspaces(userWithKey);
  };

  const logout = async () => {
    setUser(null);
    await del("LoggedInUser");
    await del("SelectedWorkspace");
    await del("SelectedRequest");
    await del("SelectedEnvironment");
    await del("SelectedGlobal");
    setWorkspaces([]);
    setSelectedWorkspace(null);
    setSelectedRequest(null);
    setSelectedEnvironment(null);
    setSelectedGlobal(null);
  };

  const updateSelectedRequest = async (request) => {
  const requestId=request.id || request;
  if (!user) return;

  try {
    const res = await fetch(
      `http://localhost:5000/api/api/getRequest?request_id=${requestId}&user_id=${user.id}`
    );
    const data = await res.json();

    if (data.status) {
      setSelectedRequest(data.request);
      await set("SelectedRequest", data.request); // optional local caching
    } else {
      console.warn("Request not found");
    }
  } catch (err) {
    console.error("Error fetching request:", err);
  }
};


  const updateSelectedEnvironment = async (environment) => {
    setSelectedEnvironment(environment);
    setSelectedRequest(null); // Clear request selection
    setSelectedGlobal(null); // Clear global selection
    await set("SelectedEnvironment", environment);
    await del("SelectedRequest");
    await del("SelectedGlobal");
  };

  const updateSelectedGlobal = async (workspaceId) => {
    setSelectedGlobal(workspaceId);
    setSelectedRequest(null); // Clear request selection
    setSelectedEnvironment(null); // Clear environment selection
    await set("SelectedGlobal", workspaceId);
    await del("SelectedRequest");
    await del("SelectedEnvironment");
  };

  const updateRequest = async (id, changes) => {
  if (!user) return;
  try {
    const response = await fetch(
      `http://localhost:5000/api/api/updateRequest?request_id=${id}&user_id=${user.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      }
    );
    const data = await response.json();
    if (!data.status) throw new Error("Failed to update draft");

    const updated = { ...selectedRequest, ...changes, isDraft: true };
    setSelectedRequest(updated);
    await set("SelectedRequest", updated);
  } catch (error) {
    console.error("Error updating draft:", error);
  }
};


  const updateSelectedWorkspace = async (ws) => {
    setSelectedWorkspace(ws);
    // Clear selections when workspace changes
    setSelectedRequest(null);
    setSelectedEnvironment(null);
    setSelectedGlobal(null);
    await set("SelectedWorkspace", ws);
    await del("SelectedRequest");
    await del("SelectedEnvironment");
    await del("SelectedGlobal");
  };

  // Restore selections on app load
  useEffect(() => {
    const restoreSelections = async () => {
      if (selectedWorkspace) {
        const storedRequest = await get("SelectedRequest");
        const storedEnvironment = await get("SelectedEnvironment");
        const storedGlobal = await get("SelectedGlobal");

        if (storedRequest) {
          setSelectedRequest(storedRequest);
        } else if (storedEnvironment) {
          setSelectedEnvironment(storedEnvironment);
        } else if (storedGlobal) {
          setSelectedGlobal(storedGlobal);
        }
      }
    };
    restoreSelections();
  }, [selectedWorkspace]);

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        workspaces,
        selectedWorkspace,
        setSelectedWorkspace: updateSelectedWorkspace,
        loading,
        selectedRequest,
        setSelectedRequest: updateSelectedRequest,
        selectedEnvironment,
        setSelectedEnvironment: updateSelectedEnvironment,
        selectedGlobal,
        setSelectedGlobal: updateSelectedGlobal,
        updateRequest,
        expandPath,
        setExpandPath,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);