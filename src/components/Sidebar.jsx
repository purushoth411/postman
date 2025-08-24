import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../utils/idb';

import Tabs from './Tabs';
import SearchBar from './SearchBar';
import CollectionList from './CollectionList';
import HistoryList from './HistoryList';
import EnvironmentList from './EnvironmentList';

const Sidebar = ({ history = [], onRequestSelect, activeRequestId }) => {
  const { user, selectedWorkspace } = useAuth();
  const [collections, setCollections] = useState([]);
  const [environments, setEnvironments] = useState([]);
  const [activeTab, setActiveTab] = useState('collections');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id && selectedWorkspace?.id) {
      (async () => {
        try {
          const res = await fetch(
            `http://localhost:5000/api/api/getCollections?wks_id=${selectedWorkspace.id}`
          );
          if (!res.ok) throw new Error("Failed to fetch collections");
          const data = await res.json();
          setCollections(data || []);
        } catch (err) {
          console.error(err);
          toast.error("Error fetching collections.");
        }
      })();
    }
  }, [user?.id, selectedWorkspace?.id]);

  // Fetch environments when user/workspace changes or when environment tab is active
  useEffect(() => {
    if (user?.id && selectedWorkspace?.id && activeTab === 'environments') {
      (async () => {
        try {
          const res = await fetch(
            `http://localhost:5000/api/api/getEnvironments?wks_id=${selectedWorkspace.id}`
          );
          if (!res.ok) throw new Error("Failed to fetch environments");
          const data = await res.json();
          setEnvironments(data || []);
        } catch (err) {
          console.error(err);
          toast.error("Error fetching environments.");
        }
      })();
    }
  }, [user?.id, selectedWorkspace?.id, activeTab]);

  // Filter collections & history based on search term
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.requests?.some(req => req.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredHistory = history.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEnvironments = environments.filter(env =>
    env.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    Object.keys(env.variables || {}).some(key => 
      key.toLowerCase().includes(searchTerm.toLowerCase()) ||
      env.variables[key].toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
      <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <SearchBar activeTab={activeTab} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <div className="flex-1 overflow-auto p-2 space-y-2">
        {activeTab === 'collections' ? (
          <CollectionList
            collections={filteredCollections}
            setCollections={setCollections}
            userId={user?.id}
            onRequestSelect={onRequestSelect}
            activeRequestId={activeRequestId}
          />
        ) : activeTab === 'history' ? (
          <HistoryList history={filteredHistory} onRequestSelect={onRequestSelect} />
        ) : (
          <EnvironmentList
            environments={filteredEnvironments}
            setEnvironments={setEnvironments}
            userId={user?.id}
            workspaceId={selectedWorkspace?.id}
          />
        )}
      </div>
    </div>
  );
};

export default Sidebar;