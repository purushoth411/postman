import React from 'react';
import { History, LibraryBig, Globe } from 'lucide-react';

const CollectionIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16v16H4z" />
  </svg>
);

const Tabs = ({ activeTab, setActiveTab }) => (
  <div className="flex border-b border-gray-200 bg-white">
    <button
      className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-all duration-200 relative ${
        activeTab === 'collections'
          ? 'text-orange-600 bg-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
      onClick={() => setActiveTab('collections')}
    >
      <div className="flex items-center justify-center space-x-2">
        <LibraryBig size={18} />
        <span>Collections</span>
      </div>
      {activeTab === 'collections' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
      )}
    </button>
    <button
      className={`flex-1 px-4 py-3.5 text-sm font-semibold transition-all duration-200 relative ${
        activeTab === 'environments'
          ? 'text-orange-600 bg-white'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
      onClick={() => setActiveTab('environments')}
    >
      <div className="flex items-center justify-center space-x-2">
        <Globe className="w-4 h-4" />
        <span>Environments</span>
      </div>
      {activeTab === 'environments' && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600"></div>
      )}
    </button>
  </div>
);

export default Tabs;