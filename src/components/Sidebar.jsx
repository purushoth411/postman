import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../utils/idb';

import Tabs from './Tabs';
import SearchBar from './SearchBar';
import CollectionList from './CollectionList';
import HistoryList from './HistoryList';

const Sidebar = ({ history = [], onRequestSelect, activeRequestId }) => {
  const { user } = useAuth();
  const [collections, setCollections] = useState([]);
  const [activeTab, setActiveTab] = useState('collections');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user?.id) {
      (async () => {
        try {
          const res = await fetch(`http://localhost:5000/api/api/getCollections?user_id=${user.id}`);
          if (!res.ok) throw new Error('Failed to fetch collections');
          const data = await res.json();
          setCollections(data || []);
        } catch (err) {
          console.error(err);
          toast.error('Error fetching collections.');
        }
      })();
    }
  }, [user?.id]);

  // Filter collections & history based on search term here or inside child components
  const filteredCollections = collections.filter(collection =>
    collection.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    collection.requests?.some(req => req.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const filteredHistory = history.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
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
        ) : (
          <HistoryList history={filteredHistory} onRequestSelect={onRequestSelect} />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
