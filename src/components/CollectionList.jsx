import React, { useEffect, useState } from 'react';
import { Plus  } from 'lucide-react';
import { toast } from 'react-hot-toast';

import CollectionItem from './CollectionItem';
import { useAuth } from '../utils/idb';
import { getSocket } from '../utils/Socket';
import { getApiUrl, API_ENDPOINTS } from '../config/api';

const CollectionIcon = () => (
  <svg className="w-8 h-8 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16v16H4z" />
  </svg>
);

const CollectionList = ({ collections, setCollections, userId, onRequestSelect, activeRequestId }) => {
  const {user,selectedWorkspace}=useAuth();
  const [showCollectionInput, setShowCollectionInput] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');

  // SOCKET SETUP — Listen for new collections
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user?.id) return;

    const handleCollectionAdded = (data) => {
      console.log('Socket Event: collectionAdded', data);

      // Ensure the event belongs to this workspace
      if (data.workspaceId !== selectedWorkspace?.id) return;

      const newCollection = data.collection;
      setCollections((prev) => {
        const list = Array.isArray(prev) ? prev : [];

        //  Avoid duplicates by comparing IDs
        if (list.some((col) => parseInt(col.id) === parseInt(newCollection.id))) {
          return list;
        }

        return [
          ...list,
          { ...newCollection, request_count: 0, requests: [], folders: [] },
        ];
      });

      // Only show toast for collections added by other users (not yourself)
      // The API response handler already updated the state
      toast.success(`Collection "${newCollection.name}" added`);
    };

    socket.on('collectionAdded', handleCollectionAdded);
    return () => {
      socket.off('collectionAdded', handleCollectionAdded);
    };
  }, [user?.id, selectedWorkspace?.id, setCollections]);

  const handleCreateCollection = async () => {
    const name = newCollectionName.trim();
    if (!name) {
      toast.error("Collection name cannot be empty");
      return;
    }

    try {
      const res = await fetch(getApiUrl(API_ENDPOINTS.ADD_COLLECTION), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // Include cookies for session
        body: JSON.stringify({ user_id: userId,wks_id:selectedWorkspace.id, name }),
      });

      if (!res.ok) throw new Error('Failed to create collection');

      const result = await res.json();
      // Add collection to state from API response
      if (result.collection) {
        setCollections((prev) => {
          const list = Array.isArray(prev) ? prev : [];
          if (list.some((col) => parseInt(col.id) === parseInt(result.collection.id))) {
            return list; // Already exists
          }
          return [...list, { ...result.collection, request_count: 0, requests: [], folders: [] }];
        });
      }

      setNewCollectionName('');
      setShowCollectionInput(false);
      // Don't show toast here - socket event will show it
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
   {selectedWorkspace && selectedWorkspace.role !== 'VIEWER' && 
    <>
      {showCollectionInput ? (
        <div className="flex items-center space-x-2 mb-3">
          <input
            autoFocus
            className="flex-1 border border-gray-300 px-3 py-2.5 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent shadow-sm"
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
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 text-sm font-medium text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 hover:border-orange-300 transition-all duration-200 mb-3 shadow-sm hover:shadow"
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
        <div className="text-center py-12 text-gray-400">
          <CollectionIcon />
          <p className="text-sm font-medium mt-3 text-gray-500">No collections found</p>
          <p className="text-xs mt-1 text-gray-400">Create your first collection to get started</p>
        </div>
      )}
    </>
  );
};

export default CollectionList;
