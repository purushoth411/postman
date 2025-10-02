import React, { useState } from 'react';
import { Plus  } from 'lucide-react';
import { toast } from 'react-hot-toast';

import CollectionItem from './CollectionItem';
import { useAuth } from '../utils/idb';

const CollectionIcon = () => (
  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16v16H4z" />
  </svg>
);

const CollectionList = ({ collections, setCollections, userId, onRequestSelect, activeRequestId }) => {
  const {user,selectedWorkspace}=useAuth();
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  const handleCreateCollection = async () => {
    const name = newCollectionName.trim();
    if (!name) {
      toast.error("Collection name cannot be empty");
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/api/api/addCollection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId,wks_id:selectedWorkspace.id, name }),
      });

      if (!res.ok) throw new Error('Failed to create collection');

      const data = await res.json();
      const newCollection=data.collection;
      setCollections(prev => [...prev, { ...newCollection,request_count:0, requests: [], folders: [] }]);
      setNewCollectionName('');
      setShowCollectionInput(false);
      toast.success('Collection created successfully');
    } catch (err) {
      console.error(err);
      toast.error("Error creating collection.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCreateCollection();
    }
    if (e.key === 'Escape') {
      setNewCollectionName('');
      setShowCollectionInput(false);
    }
  };

  return (
    <>
    {selectedWorkspace.role !== 'VIEWER' &&
    <>
      {showCollectionInput ? (
        <div className="flex items-center space-x-2 mb-2">
          <input
            autoFocus
            className="flex-1 border border-gray-300 px-3 py-2 rounded-md text-sm"
            value={newCollectionName}
            onChange={(e) => setNewCollectionName(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => {
              if (newCollectionName.trim()) {
                handleCreateCollection();
              } else {
                setShowCollectionInput(false);
                setNewCollectionName('');
              }
            }}
            placeholder="Collection name..."
          />
        </div>
      ) : (
        <button
          onClick={() => setShowCollectionInput(true)}
          className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Collection</span>
        </button>
      )}
      </>
    }

      {collections.length > 0 ? (
        collections.map(col => (
          <CollectionItem
            key={col.id}
            collection={col}
            setCollections={setCollections}
            onRequestSelect={onRequestSelect}
            activeRequestId={activeRequestId}
          />
        ))
      ) : (
        <div className="text-center py-8 text-gray-500">
          <CollectionIcon />
          <p className="text-sm">No collections found</p>
        </div>
      )}
    </>
  );
};

export default CollectionList;
