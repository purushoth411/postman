import { MAX_FOLDER_DEPTH } from '../constants/constant';

/**
 * Calculate the depth of a folder based on its parent_folder_id chain
 * @param {Object} folder - The folder object with parent_folder_id
 * @param {Array} allFolders - Array of all folders in the collection
 * @returns {number} - The depth level (1 = root, 2 = first level subfolder, 3 = second level subfolder)
 */
export const calculateFolderDepth = (folder, allFolders = []) => {
  if (!folder || !folder.parent_folder_id) {
    // Root level folder (no parent) = level 1
    return 1;
  }

  let depth = 1;
  let currentParentId = folder.parent_folder_id;

  // Create a map for quick lookup
  const folderMap = {};
  allFolders.forEach(f => {
    folderMap[f.id] = f;
  });

  // Traverse up the parent chain
  while (currentParentId) {
    depth++;
    const parentFolder = folderMap[currentParentId];
    
    if (!parentFolder) {
      // Parent not found in the list, assume it's root level
      break;
    }
    
    currentParentId = parentFolder.parent_folder_id;
    
    // Safety check to prevent infinite loops
    if (depth > 10) {
      break;
    }
  }

  return depth;
};

/**
 * Check if a folder can have subfolders
 * @param {Object} folder - The folder object
 * @param {Array} allFolders - Array of all folders in the collection
 * @returns {boolean} - True if subfolders can be created, false if max depth reached
 */
export const canCreateSubfolder = (folder, allFolders = []) => {
  const depth = calculateFolderDepth(folder, allFolders);
  return depth < MAX_FOLDER_DEPTH;
};

