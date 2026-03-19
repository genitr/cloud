import React from 'react';
import S from './StorageFolder.module.css';
import type { Folder } from '../../../types';
import { useAppSelector } from '../../../store/hooks';
import { selectFolderStats } from '../../../store/slices/foldersSlice';
import { formatDate } from '../../../utils/formatNumber';

interface FolderItemProps {
  folder: Folder;
  onDelete: (folder: Folder) => void;
  onClick: () => void;
}

const StorageFolder: React.FC<FolderItemProps> = ({ 
  folder, 
  onDelete,
  onClick 
}) => {
  const { name, updated_at, id } = folder;

  const fileCount = useAppSelector(state => 
    selectFolderStats(state, id)
  );

  const date = formatDate(updated_at)

  // Склонение слова "файл"
  const getFileWord = (count: number): string => {
    if (count % 10 === 1 && count % 100 !== 11) return 'файл';
    if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'файла';
    return 'файлов';
  };

  return (
    <div className={S.item}>
      <div className={S.itemIcon} onClick={onClick}>
        📁
      </div>
      <div className={S.itemInfo} onClick={onClick}>
        <div className={S.itemName}>{name}</div>
      </div>
      <div className={S.itemMeta}>
        {date}
      </div>
      <div className={S.itemMeta}>
        {fileCount} {getFileWord(fileCount)}
      </div>
      <div className={S.itemActions}>
        <button 
          className={S.actionButton}
          onClick={() => onDelete(folder)}
          title="Удалить"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};

export default StorageFolder;