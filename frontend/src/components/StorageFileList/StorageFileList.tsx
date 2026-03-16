import React from 'react';
import S from './StorageFileList.module.css';
import StorageFile from '../ui/StorageFile/StorageFile';
import StorageFolder from '../ui/StorageFolder/StorageFolder';
import type { FileListItem, Folder } from '../../types';

interface StorageFileListProps {
    folders?: Folder[];
    foldersIsLoading: boolean;
    foldersError: string | null;
    onFolderDelete: (folder: Folder) => void;
    onFolderClick: (folder: Folder) => void;
    files?: FileListItem[];
    filesIsLoading: boolean;
    filesError: string | null;
    onFileDelete: (file: FileListItem) => void;
    onFileShare: (file: FileListItem) => void;
    onFileDownload: (file: FileListItem) => void;
    onFileClick: (folder: FileListItem) => void;
    currentFolderId?: number | null;  // Добавляем пропс
}

const StorageFileList: React.FC<StorageFileListProps> = ({
    folders = [],
    foldersIsLoading,
    foldersError,
    onFolderDelete,
    onFolderClick,
    files = [],
    filesIsLoading,
    filesError,
    onFileDelete,
    onFileShare,
    onFileDownload,
    onFileClick,
    currentFolderId,  // Добавляем
}) => {
    // Фильтруем папки по текущей папке
    const filteredFolders = folders.filter(f => f.parent_folder === currentFolderId);
    
    // Файлы уже должны быть отфильтрованы на бэкенде, но на всякий случай
    // можно добавить фильтрацию и здесь, если нужно

    return (
        <div className={S.fileList}>
            <div className={S.listHeader}>
                <div className={S.headerName}>Название</div>
                <div className={S.headerModified}>Изменён</div>
                <div className={S.headerSize}>Размер</div>
                <div className={S.headerActions}>Действия</div>
            </div>

            {foldersIsLoading && <div>Загрузка папок...</div>}
            {foldersError && <div style={{ color: 'red' }}>Ошибка: {foldersError}</div>}
            
            {!foldersIsLoading && !foldersError && (
                <>
                    {filteredFolders.length === 0 ? (
                        <div>Нет папок в текущей директории</div>
                    ) : (
                        filteredFolders.map(folder => (
                            <StorageFolder
                                key={folder.id}
                                folder={folder}
                                onDelete={onFolderDelete}
                                onClick={() => onFolderClick(folder)}
                            />
                        ))
                    )}
                </>
            )}

            {filesIsLoading && <div>Загрузка файлов...</div>}
            {filesError && <div style={{ color: 'red' }}>Ошибка: {filesError}</div>}

            {!filesIsLoading && !filesError && (
                <>
                    {files.length === 0 ? (
                        <div>Нет файлов в текущей директории</div>
                    ) : (
                        files.map(file => (
                            <StorageFile
                                key={file.id}
                                file={file}
                                onDelete={onFileDelete}
                                onShare={onFileShare}
                                onDownload={onFileDownload}
                                onClick={() => onFileClick(file)}
                            />
                        ))
                    )}
                </>
            )}
        </div>
    );
};

export default StorageFileList;