import React from 'react';
import { History, LibraryBig, Globe } from 'lucide-react';

const CollectionIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
    <path d="M4 4h16v16H4z" />
  </svg>
);

const Tabs = ({ activeTab, setActiveTab }) => (
  <div className="flex border-b border-gray-200">
    <button
      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
        activeTab === 'collections'
          ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
          : 'text-gray-600 hover:text-gray-800'
      }`}
      onClick={() => setActiveTab('collections')}
    >
      <div className="flex items-center justify-center space-x-2">
        <LibraryBig size={17} />
        <span>Collections</span>
      </div>
    </button>
    <button
      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
        activeTab === 'history'
          ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
          : 'text-gray-600 hover:text-gray-800'
      }`}
      onClick={() => setActiveTab('history')}
    >
      <div className="flex items-center justify-center space-x-2">
        <History className="w-4 h-4" />
        <span>History</span>
      </div>
    </button>
    <button
      className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
        activeTab === 'environments'
          ? 'text-orange-600 border-b-2 border-orange-600 bg-orange-50'
          : 'text-gray-600 hover:text-gray-800'
      }`}
      onClick={() => setActiveTab('environments')}
    >
      <div className="flex items-center justify-center space-x-2">
        <Globe className="w-4 h-4" />
        <span>Env</span>
      </div>
    </button>
  </div>
);

export default Tabs;