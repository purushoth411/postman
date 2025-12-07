import { Plus, Settings } from 'lucide-react';
import React, { useState, useEffect } from 'react';

const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50">
      <div className="mb-8">
        <svg 
          width="200" 
          height="200" 
          viewBox="0 0 200 200" 
          className="text-red-500 opacity-80"
        >
          <rect x="20" y="60" width="160" height="100" rx="10" fill="currentColor" opacity="0.1" />
          <rect x="30" y="80" width="140" height="6" rx="3" fill="currentColor" opacity="0.3" />
          <rect x="30" y="95" width="100" height="6" rx="3" fill="currentColor" opacity="0.3" />
          <rect x="30" y="110" width="120" height="6" rx="3" fill="currentColor" opacity="0.3" />
          <circle cx="160" cy="40" r="15" fill="currentColor" opacity="0.6" />
          <path d="M155 40 L160 45 L170 35" stroke="white" strokeWidth="2" fill="none" />
        </svg>
      </div>
      
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Welcome to API Tester
      </h2>
      <p className="text-gray-600 mb-8 max-w-md">
        Select a request from the sidebar to get started, or create a new request to begin testing your APIs.
      </p>
      
      <div className="flex space-x-4">
        {/* <button className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
          <Plus className="w-5 h-5" />
          <span>Create New Request</span>
        </button>
        <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2">
          <Settings className="w-5 h-5" />
          <span>Import Collection</span>
        </button> */}
      </div>
    </div>
  );
};
export default EmptyState;