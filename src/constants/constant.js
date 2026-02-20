// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// API endpoints
export const API_ENDPOINTS = {
  // User endpoints
  LOGIN: '/api/users/login',
  REGISTER: '/api/users/register',
  LOGOUT: '/api/users/logout',
  
  // Workspace endpoints
  GET_WORKSPACES: '/api/api/getWorkspaces',
  CREATE_WORKSPACE: '/api/api/createWorkspace',
  UPDATE_WORKSPACE: '/api/api/updateWorkspace',
  DELETE_WORKSPACE: '/api/api/deleteWorkspace',
  GET_WORKSPACE_DETAILS: '/api/api/getWorkspaceDetails',
  SEARCH_USERS: '/api/api/searchUsers',
  
  // Collection endpoints
  GET_COLLECTIONS: '/api/api/getCollections',
  ADD_COLLECTION: '/api/api/addCollection',
  RENAME_COLLECTION: '/api/api/renameCollection',
  DELETE_COLLECTION: '/api/api/deleteCollection',
  
  // Folder endpoints
  ADD_FOLDER: '/api/api/addFolder',
  RENAME_FOLDER: '/api/api/renameFolder',
  DELETE_FOLDER: '/api/api/deleteFolder',
  
  // Request endpoints
  GET_REQUESTS_BY_COLLECTION: '/api/api/getRequestsByCollectionId',
  GET_REQUESTS_BY_FOLDER: '/api/api/getRequestsByFolderId',
  GET_REQUEST: '/api/api/getRequest',
  ADD_REQUEST: '/api/api/addRequest',
  UPDATE_REQUEST: '/api/api/updateRequest',
  RENAME_REQUEST: '/api/api/renameRequest',
  DELETE_REQUEST: '/api/api/deleteRequest',
  SAVE_REQUEST: '/api/api/saveRequest',
  SEARCH_REQUESTS: '/api/api/searchRequests',
  
  // Environment endpoints
  GET_ENVIRONMENTS: '/api/api/getEnvironments',
  GET_ACTIVE_ENVIRONMENT: '/api/api/getActiveEnvironment',
  ADD_ENVIRONMENT: '/api/api/addEnvironment',
  UPDATE_ENVIRONMENT: '/api/api/updateEnvironment',
  DELETE_ENVIRONMENT: '/api/api/deleteEnvironment',
  SET_ACTIVE_ENVIRONMENT: '/api/api/setActiveEnvironment',
  
  // Environment Variables
  GET_ENVIRONMENT_VARIABLES: '/api/api/getEnvironmentVariables',
  ADD_ENVIRONMENT_VARIABLE: '/api/api/addEnvironmentVariable',
  UPDATE_ENVIRONMENT_VARIABLE: '/api/api/updateEnvironmentVariable',
  DELETE_ENVIRONMENT_VARIABLE: '/api/api/deleteEnvironmentVariable',
  
  // Global Variables
  GET_GLOBAL_VARIABLES: '/api/api/getGlobalVariables',
  ADD_GLOBAL_VARIABLE: '/api/api/addGlobalVariable',
  UPDATE_GLOBAL_VARIABLE: '/api/api/updateGlobalVariable',
  DELETE_GLOBAL_VARIABLE: '/api/api/deleteGlobalVariable',
  
  // Chat endpoints
  GET_CHANNELS: '/api/chat/channels',
  CREATE_CHANNEL: '/api/chat/channels',
  GET_MESSAGES: '/api/chat/messages',
  SEND_MESSAGE: '/api/chat/messages',
  UPDATE_MESSAGE: '/api/chat/messages',
  DELETE_MESSAGE: '/api/chat/messages',
  GET_NOTIFICATIONS: '/api/chat/notifications',
  MARK_NOTIFICATION_READ: '/api/chat/notifications/read',
  MARK_ALL_NOTIFICATIONS_READ: '/api/chat/notifications/read-all',
  GET_UNREAD_COUNT: '/api/chat/notifications/unread-count',
  GET_MEMBERS: '/api/chat/members',
};

// Helper function to build full API URL
export const getApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Folder-related constants
// Maximum allowed folder depth (levels)
// Level 1 = Root folders (under collection)
// Level 2 = First-level subfolders
// Level 3 = Second-level subfolders
// Level 4+ = Not allowed
export const MAX_FOLDER_DEPTH = 3;
