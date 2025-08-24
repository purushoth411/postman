import { createContext, useContext, useState, useEffect } from "react";
import { set, get, del } from "idb-keyval";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [expandPath,setExpandPath]=useState({
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
    setWorkspaces([]);
    setSelectedWorkspace(null);
    setSelectedRequest(null);
  };

  const updateSelectedRequest = async (request) => {
    setSelectedRequest(request);
    await set("SelectedRequest", request);
  };

  const updateRequest = async (id, changes) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/api/updateRequest/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes),
        }
      );

      if (!response.ok) throw new Error("Failed to update request");

      const updated = { ...selectedRequest, ...changes };
      setSelectedRequest(updated);
      await set("SelectedRequest", updated);
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  const updateSelectedWorkspace = async (ws) => {
    setSelectedWorkspace(ws);
    await set("SelectedWorkspace", ws);
  };

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
        updateRequest,
        expandPath,
        setExpandPath
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
