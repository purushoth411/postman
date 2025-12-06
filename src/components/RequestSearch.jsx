import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { useAuth } from "../utils/idb";
import { getApiUrl, API_ENDPOINTS } from "../config/api";


export default function RequestSearch() {
  const { selectedWorkspace, setSelectedRequest,setExpandPath } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  

  // 🔎 search API requests from current workspace
  useEffect(() => {
    const fetchResults = async () => {
      if (!query || !selectedWorkspace) {
        setResults([]);
        return;
      }

      try {
        const res = await fetch(
          `${getApiUrl(API_ENDPOINTS.SEARCH_REQUESTS)}?workspace_id=${selectedWorkspace.id}&q=${encodeURIComponent(query)}`,
           { credentials: 'include' }
        );
        const data = await res.json();
        if (data.status) {
          setResults(data.results);
        }
      } catch (err) {
        console.error("Search error:", err);
      }
    };

    const debounce = setTimeout(fetchResults, 300); // debounce for better UX
    return () => clearTimeout(debounce);
  }, [query, selectedWorkspace]);

const handleSearchSelect = (request) => {
  setSelectedRequest(request);
  setResults([]);
  setQuery("");

  
 setExpandPath({
  collectionId: request.collection_id,
  folderIds: request.folder_path || [], // e.g., [parentFolderId, subFolderId]
  requestId: request.id,
});

};
  return (
    <div className="flex-1 max-w-md mx-8 relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search Requests..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
        />
      </div>

      {results.length > 0 && (
        <div className="absolute mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
          {results.map((r) => (
            <div
              key={r.id}
              onClick={() => handleSearchSelect(r)}
              className="px-4 py-2 cursor-pointer hover:bg-gray-100"
            >
              <div className="font-medium">{r.name}</div>
              <div className="text-sm text-gray-500">
                {r.path} {/* e.g., "Users Collection / Auth Folder / Login Request" */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
