import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  selectCurrentFolder,
  selectFolderContents,
  selectFoldersLoading,
} from '../store/selectors';
import {
  fetchFolderContents,
  createFolder,
  updateFolder,
  deleteFolder,
  setCurrentFolder,
} from '../store/slices/foldersSlice';
import type { Folder } from '../types';

export const useFolder = (folderId?: number) => {
  const dispatch = useAppDispatch();
  const currentFolder = useAppSelector(selectCurrentFolder);
  const contents = useAppSelector(selectFolderContents);
  const isLoading = useAppSelector(selectFoldersLoading);

  const loadContents = useCallback((id: number) => {
    return dispatch(fetchFolderContents(id)).unwrap();
  }, [dispatch]);

  const createNewFolder = useCallback((data: { name: string; parent_folder?: number | null }) => {
    return dispatch(createFolder(data)).unwrap();
  }, [dispatch]);

  const renameFolder = useCallback((id: number, name: string) => {
    return dispatch(updateFolder({ id, data: { name } })).unwrap();
  }, [dispatch]);

  const moveFolder = useCallback((id: number, parent_folder: number | null) => {
    return dispatch(updateFolder({ id, data: { parent_folder } })).unwrap();
  }, [dispatch]);

  const removeFolder = useCallback((id: number) => {
    return dispatch(deleteFolder(id)).unwrap();
  }, [dispatch]);

  const navigateToFolder = useCallback((folder: Folder | null) => {
    dispatch(setCurrentFolder(folder));
  }, [dispatch]);

  const currentFolderId = folderId ?? currentFolder?.id;

  return {
    currentFolder,
    contents,
    isLoading,
    currentFolderId,
    loadContents,
    createNewFolder,
    renameFolder,
    moveFolder,
    removeFolder,
    navigateToFolder,
  };
};