import { useEffect, useState, useMemo, useCallback } from 'react';

import S from './MainPage.module.css';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { fetchFolders, createFolder, deleteFolder } from '../../store/slices/foldersSlice';
import { fetchFiles, uploadFile, deleteFile, downloadFile } from '../../store/slices/filesSlice';
import { fetchCurrentUser } from '../../store/slices/authSlice';
import { createShare } from '../../store/slices/sharingSlice';
import { fetchStorageInfo } from '../../store/slices/usersSlice';
import StorageFileList from '../../components/StorageFileList/StorageFileList';
import Toolbar from '../../components/Toolbar/Toolbar';
import StorageSidebar from '../../components/StorageSidebar/StorageSidebar';
import UploadFileModal from '../../components/Modals/UploadFileModal';
import CreateFolderModal from '../../components/Modals/CreateFolderModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';
import ShareModal from '../../components/Modals/ShareModal';
import type { Folder, FileListItem, UploadFileData } from '../../types';
import { Link } from 'react-router-dom';

const MainPage = () => {
  const dispatch = useAppDispatch();
  
  // Состояния для модальных окон
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  
  // Состояния для выбранных элементов
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedFile, setSelectedFile] = useState<FileListItem | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);

  const { folders, isLoading: foldersLoading, error: foldersError } = useAppSelector(state => state.folders);
  const { files, isLoading: filesLoading, error: filesError } = useAppSelector(state => state.files);
  const { user, isLoading: authLoading, isAuthenticated } = useAppSelector(state => state.auth);
  const { storageInfo } = useAppSelector(state => state.users);

  const [shareData, setShareData] = useState<{
    file: FileListItem | null;
    shareUrl: string;
    viewUrl: string;
    downloadsCount: number;
    viewsCount: number;
    createdAt: string;
  }>({
    file: null,
    shareUrl: '',
    viewUrl: '',
    downloadsCount: 0,
    viewsCount: 0,
    createdAt: ''
  });

  // Построение пути для хлебных крошек
  const breadcrumbsPath = useMemo(() => {
    if (!currentFolderId) return ['Корень'];
    
    const path: string[] = [];
    let currentId: number | null = currentFolderId;
    
    while (currentId) {
      const folder = folders.find(f => f.id === currentId);
      if (!folder) break;
      
      path.unshift(folder.name);
      currentId = folder.parent_folder;
    }
    
    return ['Корень', ...path];
  }, [folders, currentFolderId]);

  // Обработчик клика по хлебной крошке
  const handleBreadcrumbClick = useCallback((index: number) => {
    if (index === 0) {
      // Клик на "Корень"
      setCurrentFolderId(null);
      return;
    }
    
    // Находим папку по имени на нужном уровне
    const targetFolderName = breadcrumbsPath[index];
    const targetFolder = folders.find(f => f.name === targetFolderName);
    
    if (targetFolder) {
      setCurrentFolderId(targetFolder.id);
    }
  }, [breadcrumbsPath, folders]);

  // Обновление storageInfo при изменении файлов/папок
  useEffect(() => {
    if (user && (files.length > 0 || folders.length > 0)) {
      dispatch(fetchStorageInfo(user.id));
    }
  }, [dispatch, user, files.length, folders.length]);

  // Загрузка данных только если пользователь авторизован
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (!user) {
      dispatch(fetchCurrentUser());
      
    }

    dispatch(fetchFolders());
    dispatch(fetchFiles({}));
    console.log('user', user)

  }, [dispatch, user, isAuthenticated]);

  // Фильтруем файлы по текущей папке
  const filteredFiles = useMemo(() => {
    if (!files.length) return [];
    
    return files.filter(file => {
      if (currentFolderId === null) {
        return !file.folder_name || file.folder_name === 'Корень';
      } else {
        const currentFolder = folders.find(f => f.id === currentFolderId);
        return currentFolder && file.folder_name === currentFolder.name;
      }
    });
  }, [files, folders, currentFolderId]);

  useEffect(() => {
    // При смене папки загружаем файлы для этой папки
    dispatch(fetchFiles({ folder: currentFolderId }));
  }, [dispatch, currentFolderId]);

  // Обработчики для папок
  const handleFolderClick = (folder: Folder) => {
    setCurrentFolderId(folder.id);
  };

  const handleFolderDelete = (folder: Folder) => {
    setSelectedFolder(folder);
    setDeleteModalOpen(true);
  };

  const handleCreateFolder = async (folderName: string) => {
    try {
      await dispatch(createFolder({ 
        name: folderName, 
        parent_folder: currentFolderId 
      })).unwrap();
      // Обновляем список папок
      dispatch(fetchFolders());
    } catch (error) {
      console.error('Ошибка при создании папки:', error);
    }
  };

  // Обработчики для файлов
  const handleFileClick = (file: FileListItem) => {
    console.log('Файл открыт:', file);
  };

  const handleFileDelete = (file: FileListItem) => {
    setSelectedFile(file);
    setDeleteModalOpen(true);
  };

  const handleFileShare = async (file: FileListItem) => {
    try {
      const result = await dispatch(createShare(file.id)).unwrap();
      
      setShareData({
        file,
        shareUrl: result.share_url,
        viewUrl: `${window.location.origin}/share/${result.share_token}`,
        downloadsCount: result.downloads_count,
        viewsCount: result.views_count,
        createdAt: result.created_at
      });
      
      setShareModalOpen(true);
    } catch (error) {
      console.error('Ошибка при расшаривании файла:', error);
    }
  };

  const handleFileDownload = async (file: FileListItem) => {
    try {
      await dispatch(downloadFile(file.id)).unwrap();
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
    }
  };

  const handleFileUpload = async (filesData: UploadFileData[] | null) => {
    if (!filesData || filesData.length === 0) return;
    
    try {
      for (let i = 0; i < filesData.length; i++) {
        const { file, name, comment } = filesData[i];
        console.log(`Загрузка файла ${i + 1}/${filesData.length} в папку:`, currentFolderId);
        
        const result = await dispatch(uploadFile({
          file,
          name: name || undefined,
          comment: comment || undefined,
          folder: currentFolderId 
        })).unwrap();
        
        console.log(`Файл успешно загружен в папку ${currentFolderId}:`, result);
      }
    } catch (error) {
      console.error('Ошибка при загрузке файлов:', error);
    }
  };

  // Обработчики для модальных окон
  const handleConfirmDelete = async () => {
    try {
      if (selectedFolder) {
        await dispatch(deleteFolder(selectedFolder.id)).unwrap();
        setSelectedFolder(null);
      } else if (selectedFile) {
        await dispatch(deleteFile(selectedFile.id)).unwrap();
        setSelectedFile(null);
      }
      setDeleteModalOpen(false);
    } catch (error) {
      console.error('Ошибка при удалении:', error);
    }
  };

  // Навигация назад (в родительскую папку)
  const handleNavigateUp = () => {
    if (currentFolderId) {
      const currentFolder = folders.find(f => f.id === currentFolderId);
      if (currentFolder?.parent_folder) {
        setCurrentFolderId(currentFolder.parent_folder);
      } else {
        setCurrentFolderId(null);
      }
    }
  };

  if (authLoading) {
    return <div className={S.container}>Загрузка профиля...</div>;
  }

  // Если не авторизован, показываем сообщение
  if (!isAuthenticated) {
    return (
      <div className={S.unauthorizedContainer}>
        <h1>Файловое хранилище</h1>
        <p>Пожалуйста, <Link to="/login">войдите</Link> или <Link to="/registration">зарегистрируйтесь</Link></p>
      </div>
    );
  }

  return (
    <div className={S.mainLayout}>
      {/* Боковая панель */}
      <StorageSidebar
        storageInfo={storageInfo}
        user={user}
      />

      {/* Основной контент */}
      <div className={S.contentArea}>
        {/* Тулбар */}
        <div className={S.toolbarWrapper}>
          <Toolbar 
            onUpload={() => setUploadModalOpen(true)}
            onCreateFolder={() => setCreateFolderModalOpen(true)}
            onNavigateUp={handleNavigateUp}
            showNavigateUp={!!currentFolderId}
            breadcrumbsPath={breadcrumbsPath}
            handleBreadcrumbClick={handleBreadcrumbClick}
          />
        </div>

        {/* Прокручиваемый список файлов */}
        <div className={S.fileListWrapper}>
          <StorageFileList
            folders={folders.filter(f => f.parent_folder === currentFolderId)}
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
            onFileClick={handleFileClick}
            currentFolderId={currentFolderId}
          />
        </div>
      </div>

      {/* Модальные окна */}
      <UploadFileModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onUpload={handleFileUpload}
      />

      <CreateFolderModal
        isOpen={createFolderModalOpen}
        onClose={() => setCreateFolderModalOpen(false)}
        onCreate={handleCreateFolder}
      />

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
            downloadsCount: 0,
            viewsCount: 0,
            createdAt: ''
          });
        }}
        itemName={shareData.file?.name}
        shareUrl={shareData.shareUrl}
        viewUrl={shareData.viewUrl}
        downloadsCount={shareData.downloadsCount}
        viewsCount={shareData.viewsCount}
        createdAt={shareData.createdAt}
      />
    </div>
  );
};

export default MainPage;