# Remaining Files to Update

Due to the large number of files, here's a guide to complete the updates:

## Files Still Needing Updates:

### Components needing API URL updates:
1. `components/Sidebar.jsx` - 2 URLs
2. `components/CollectionList.jsx` - 1 URL  
3. `components/CollectionItem.jsx` - 6 URLs
4. `components/FolderItem.jsx` - 5 URLs
5. `components/RequestItem.jsx` - 2 URLs
6. `components/RequestBar.jsx` - 1 URL
7. `components/RequestSearch.jsx` - 1 URL
8. `components/EnvironmentList.jsx` - 3 URLs
9. `components/EnvironmentItem.jsx` - 2 URLs
10. `components/EnvironmentEditor.jsx` - 5 URLs

## Pattern to Follow:

### 1. Add imports at top:
```javascript
import { getApiUrl, API_ENDPOINTS } from '../config/api';
```

### 2. Replace URLs:
```javascript
// Before:
fetch('http://localhost:5000/api/api/addCollection', ...)

// After:
fetch(getApiUrl(API_ENDPOINTS.ADD_COLLECTION), ...)
```

### 3. Replace alerts:
```javascript
// Before:
alert("Error message");

// After:
import { alertError, alertSuccess, alertWarning } from '../utils/alert';
alertError("Error message");
```

## Quick Reference - API Endpoints:
- ADD_COLLECTION
- GET_COLLECTIONS
- RENAME_COLLECTION
- DELETE_COLLECTION
- ADD_FOLDER
- RENAME_FOLDER
- DELETE_FOLDER
- ADD_REQUEST
- RENAME_REQUEST
- DELETE_REQUEST
- GET_REQUESTS_BY_COLLECTION
- GET_REQUESTS_BY_FOLDER
- GET_ENVIRONMENTS
- GET_ACTIVE_ENVIRONMENT
- ADD_ENVIRONMENT
- UPDATE_ENVIRONMENT
- DELETE_ENVIRONMENT
- SET_ACTIVE_ENVIRONMENT
- GET_ENVIRONMENT_VARIABLES
- GET_GLOBAL_VARIABLES
- SEARCH_REQUESTS

