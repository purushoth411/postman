import { createContext, useContext, useState, useEffect } from "react";
import { set, get, del } from "idb-keyval"; // Import IndexedDB helper
// import { v4 as uuidv4 } from "uuid";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState(null); // new state

  useEffect(() => {
    const fetchUser = async () => {
      const storedUser = await get("LoggedInUser");
      if (storedUser) {
        setUser(storedUser);
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
  };

  const logout = async () => {
    setUser(null);
    await del("LoggedInUser");
  };

  const updateSelectedRequest = async (request) => {
    setSelectedRequest(request); // update state
    await set("SelectedRequest", request); // persist to IndexedDB
  };

const updateRequest = async (id, changes) => {
  try {
    const response = await fetch(`http://localhost:5000/api/api/updateRequest/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(changes)
    });

    if (!response.ok) {
      throw new Error("Failed to update request");
    }

    // Merge changes with the current selectedRequest
    const updated = { ...selectedRequest, ...changes };

    // Update state and IndexedDB
    setSelectedRequest(updated);
    await set("SelectedRequest", updated);

  } catch (error) {
    console.error('Error updating request:', error);
  }
};




  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        loading,
        selectedRequest,
        setSelectedRequest: updateSelectedRequest,
        updateRequest
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => useContext(AuthContext);
