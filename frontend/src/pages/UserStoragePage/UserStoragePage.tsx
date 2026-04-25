import { useEffect, useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive';

import S from './UserStoragePage.module.css';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { deleteFolder, fetchFolders } from '../../store/slices/foldersSlice';
import { fetchFiles, deleteFile, downloadFile, updateFile, fetchFileDetails } from '../../store/slices/filesSlice';
import { fetchUsers, fetchStorageInfo } from '../../store/slices/usersSlice';
import { createShare } from '../../store/slices/sharingSlice';
import StorageFileList from '../../components/StorageFileList/StorageFileList';
import StorageSidebar from '../../components/StorageSidebar/StorageSidebar';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import ShareModal from '../../components/Modals/ShareModal';
import FilePreviewModal from '../../components/Modals/FilePreviewModal';
import RenameFileModal from '../../components/Modals/RenameFileModal';
import type { Folder, FileListItem, UserDetail } from '../../types';
import Icon from '../../components/ui/Icon/Icon';

const UserStoragePage = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  
  const { folders, isLoading: foldersLoading, error: foldersError } = useAppSelector(state => state.folders);
  const { files, isLoading: filesLoading, error: filesError } = useAppSelector(state => state.files);
  const { users, storageInfo } = useAppSelector(state => state.users);
  const { user: currentUser } = useAppSelector(state => state.auth);
  
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(() => {
    // Восстанавливаем состояние из sessionStorage при перезагрузке
    const saved = sessionStorage.getItem(`user_storage_folder_${userId}`);
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileListItem | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [selectedFileForPreview, setSelectedFileForPreview] = useState<FileListItem | null>(null);
  const [selectedFileForRename, setSelectedFileForRename] = useState<FileListItem | null>(null);
  const [shareData, setShareData] = useState<{
    file: FileListItem | null;
    shareUrl: string;
    viewUrl: string;
    createdAt: string;
  }>({
    file: null,
    shareUrl: '',
    viewUrl: '',
    createdAt: ''
  });
  const [isInitialized, setIsInitialized] = useState(false);

  const targetUser = users.find(u => u.id === Number(userId));
  
  // Сохраняем текущую папку при изменении
  useEffect(() => {
    if (userId) {
      sessionStorage.setItem(`user_storage_folder_${userId}`, JSON.stringify(currentFolderId));
    }
  }, [currentFolderId, userId]);

  // Проверка прав
  useEffect(() => {
    if (!currentUser?.is_staff && !currentUser?.is_superuser) {
      navigate('/main');
    }
  }, [currentUser, navigate]);

  // Загружаем пользователей при монтировании
  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  // Загружаем данные пользователя
  const loadUserData = useCallback(async () => {
    if (userId && (currentUser?.is_staff || currentUser?.is_superuser)) {
      console.log('Загрузка данных для пользователя:', userId);
      await Promise.all([
        dispatch(fetchFolders({ userId: Number(userId) })),
        dispatch(fetchFiles({ user_id: Number(userId) })),
        dispatch(fetchStorageInfo(Number(userId)))
      ]);
    }
  }, [dispatch, userId, currentUser]);

  // Загружаем данные при монтировании и при изменении userId
  useEffect(() => {
    if (userId && currentUser && (currentUser.is_staff || currentUser.is_superuser)) {
      loadUserData().then(() => setIsInitialized(true));
    }
  }, [userId, currentUser, loadUserData]);

  const isMobile = useMediaQuery({ maxWidth: 640 });

  // Фильтруем папки по текущей папке и по владельцу
  const filteredFolders = folders.filter(f => {
    if (f.owner !== Number(userId)) return false;
    if (currentFolderId === null) {
      return f.parent_folder === null;
    }
    return f.parent_folder === currentFolderId;
  });

  // Фильтруем файлы по текущей папке и по владельцу
  const filteredFiles = useMemo(() => {
    if (!files.length) return [];
    
    return files.filter(file => {
      if ((file as FileListItem).owner !== Number(userId)) return false;
      
      if (currentFolderId === null) {
        return !file.folder_name || file.folder_name === 'Корень';
      } else {
        const currentFolder = folders.find(f => f.id === currentFolderId);
        return currentFolder && file.folder_name === currentFolder.name;
      }
    });
  }, [files, folders, currentFolderId, userId]);

  // Хлебные крошки
  const breadcrumbsPath = useMemo(() => {
    if (!currentFolderId) return ['root'];
    
    const path: string[] = [];
    let currentId: number | null = currentFolderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId && f.owner === Number(userId));
      if (!folder) break;
      path.unshift(folder.name);
      currentId = folder.parent_folder;
    }
    
    return ['root', ...path];
  }, [folders, currentFolderId, userId]);

  const handleBreadcrumbClick = (index: number) => {
    if (index === 0) {
      setCurrentFolderId(null);
      return;
    }
    
    const targetFolderName = breadcrumbsPath[index];
    const targetFolder = folders.find(f => f.name === targetFolderName && f.owner === Number(userId));
    
    if (targetFolder) {
      setCurrentFolderId(targetFolder.id);
    }
  };

  const handleFolderClick = (folder: Folder) => {
    setCurrentFolderId(folder.id);
  };

  const handleFolderDelete = async (folder: Folder) => {
    setSelectedFolder(folder);
    setDeleteModalOpen(true);
  };

  const handleFileDelete = (file: FileListItem) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  const handleFilePreview = async (file: FileListItem) => {
    try {
      const fileDetails = await dispatch(fetchFileDetails({ 
        fileId: file.id, 
        userId: Number(userId) 
      })).unwrap();
      setSelectedFileForPreview(fileDetails as unknown as FileListItem);
      setPreviewModalOpen(true);
    } catch (error) {
      console.error('Ошибка при загрузке файла для просмотра:', error);
    }
  };

  const handleRenameClick = (file: FileListItem) => {
    setSelectedFileForRename(file);
    setRenameModalOpen(true);
  };

  const handleFileRename = async (newName: string, newComment?: string) => {
    if (!selectedFileForRename) return;
    
    try {
      const updateData: { name?: string; comment?: string } = {};
      
      if (newName && newName !== selectedFileForRename.name) {
        updateData.name = newName;
      }
      
      if (newComment !== undefined && newComment !== selectedFileForRename.comment) {
        updateData.comment = newComment;
      }
      
      if (Object.keys(updateData).length > 0) {
        await dispatch(updateFile({ 
          id: selectedFileForRename.id, 
          data: updateData,
          userId: Number(userId)
        })).unwrap();
        
        // Обновляем списки после переименования
        await Promise.all([
          dispatch(fetchFolders({ userId: Number(userId) })),
          dispatch(fetchFiles({ user_id: Number(userId) }))
        ]);
      }
    } catch (error) {
      console.error('Ошибка при обновлении файла:', error);
      throw error;
    }
  };

  const handleFileShare = async (file: FileListItem) => {
    try {
      const result = await dispatch(createShare({ 
        fileId: file.id, 
        userId: Number(userId) 
      })).unwrap();
      
      setShareData({
        file,
        shareUrl: result.share_url,
        viewUrl: result.view_url || `${window.location.origin}/share/${result.share_token}`,
        createdAt: result.created_at
      });
      
      setShareModalOpen(true);
    } catch (error) {
      console.error('Ошибка при расшаривании файла:', error);
      alert('Не удалось создать публичную ссылку');
    }
  };

  const handleFileDownload = async (file: FileListItem) => {
    try {
      await dispatch(downloadFile({ 
        fileId: file.id, 
        userId: Number(userId) 
      })).unwrap();
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
    }
  };

  const handleConfirmDelete = async () => {
    try {
      if (selectedFolder) {
        await dispatch(deleteFolder({ 
          folderId: selectedFolder.id, 
          userId: Number(userId) 
        })).unwrap();
        setSelectedFolder(null);
      } else if (selectedFile) {
        await dispatch(deleteFile({ 
          fileId: selectedFile.id, 
          userId: Number(userId) 
        })).unwrap();
        setSelectedFile(null);
      }
      setDeleteModalOpen(false);
      
      // Обновляем списки
      await Promise.all([
        dispatch(fetchFolders({ userId: Number(userId) })),
        dispatch(fetchFiles({ user_id: Number(userId) }))
      ]);
    } catch (error) {
      console.error('Ошибка при удалении:', error);
    }
  };

  // Показываем загрузку только при первой инициализации
  if (!isInitialized && (foldersLoading || filesLoading)) {
    return <div className={S.container}>Загрузка данных пользователя...</div>;
  }

  if (!targetUser) {
    return <div className={S.container}>Пользователь не найден</div>;
  }

  return (
    <div className={S.mainLayout}>
      {!isMobile && (
        <StorageSidebar
          storageInfo={storageInfo}
          user={targetUser as UserDetail}
        />
      )}

      <div className={S.contentArea}>
        <div className={S.header}>
          <button 
            className={S.backButton} 
            onClick={() => navigate('/admin')}
            title='Назад к админ-панели'
          >
            <Icon name='arrowLeft' />
          </button>
          <h2>Хранилище пользователя: {targetUser.username}</h2>
        </div>

        <div className={S.breadcrumbsWrapper}>
          <div className={S.breadcrumbs}>
            {breadcrumbsPath.map((name, index) => (
              <span key={index}>
                {index > 0 && <span className={S.separator}>/</span>}
                <button
                  className={`${S.breadcrumb} ${index === breadcrumbsPath.length - 1 ? S.active : ''}`}
                  onClick={() => handleBreadcrumbClick(index)}
                >
                  {name}
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className={S.fileListWrapper}>
          <StorageFileList
            folders={filteredFolders}
            foldersIsLoading={foldersLoading}
            foldersError={foldersError}
            onFolderDelete={handleFolderDelete}
            onFolderClick={handleFolderClick}
            files={filteredFiles}
            filesIsLoading={filesLoading}
            filesError={filesError}
            onFileDelete={handleFileDelete}
            onFileShare={handleFileShare}
            onFileDownload={handleFileDownload}
            onFilePreview={handleFilePreview}
            onFileRename={handleRenameClick}
            currentFolderId={currentFolderId}
          />
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSelectedFolder(null);
          setSelectedFile(null);
        }}
        onConfirm={handleConfirmDelete}
        itemName={selectedFolder?.name || selectedFile?.name}
      />

      <ShareModal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setShareData({
            file: null,
            shareUrl: '',
            viewUrl: '',
            createdAt: ''
          });
        }}
        itemName={shareData.file?.name}
        shareUrl={shareData.shareUrl}
        viewUrl={shareData.viewUrl}
        createdAt={shareData.createdAt}
      />

      <FilePreviewModal
        isOpen={previewModalOpen}
        onClose={() => {
          setPreviewModalOpen(false);
          setSelectedFileForPreview(null);
        }}
        file={selectedFileForPreview}
        userId={Number(userId)}
      />

      <RenameFileModal
        isOpen={renameModalOpen}
        onClose={() => {
          setRenameModalOpen(false);
          setSelectedFileForRename(null);
        }}
        file={selectedFileForRename}
        onRename={handleFileRename}
      />
    </div>
  );
};

export default UserStoragePage;