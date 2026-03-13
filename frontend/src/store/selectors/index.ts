import type { RootState } from '../store';

// Auth selectors
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;
export const selectAuthError = (state: RootState) => state.auth.error;

// Folders selectors
export const selectFolders = (state: RootState) => state.folders.folders;
export const selectCurrentFolder = (state: RootState) => state.folders.currentFolder;
export const selectFolderTree = (state: RootState) => state.folders.folderTree;
export const selectFolderContents = (state: RootState) => state.folders.folderContents;
export const selectFoldersLoading = (state: RootState) => state.folders.isLoading;
export const selectFoldersError = (state: RootState) => state.folders.error;

// Files selectors
export const selectFiles = (state: RootState) => state.files.files;
export const selectCurrentFile = (state: RootState) => state.files.currentFile;
export const selectFileFilters = (state: RootState) => state.files.filters;
export const selectUploadProgress = (state: RootState) => state.files.uploadProgress;
export const selectFilesLoading = (state: RootState) => state.files.isLoading;
export const selectFilesError = (state: RootState) => state.files.error;

// Sharing selectors
export const selectShares = (state: RootState) => state.sharing.shares;
export const selectCurrentShare = (state: RootState) => state.sharing.currentShare;
export const selectPublicShare = (state: RootState) => state.sharing.publicShare;
export const selectSharingLoading = (state: RootState) => state.sharing.isLoading;
export const selectSharingError = (state: RootState) => state.sharing.error;

// Users selectors
export const selectUsers = (state: RootState) => state.users.users;
export const selectCurrentUserProfile = (state: RootState) => state.users.currentUser;
export const selectUserStats = (state: RootState) => state.users.userStats;
export const selectStorageInfo = (state: RootState) => state.users.storageInfo;
export const selectUsersLoading = (state: RootState) => state.users.isLoading;
export const selectUsersError = (state: RootState) => state.users.error;