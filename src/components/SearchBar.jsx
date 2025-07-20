import React from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ activeTab, searchTerm, setSearchTerm }) => (
  <div className="p-3 border-b border-gray-200">
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
      <input
        type="text"
        placeholder={`Search ${activeTab}...`}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
      />
    </div>
  </div>
);

export default SearchBar;
