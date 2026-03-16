import React from 'react';
import S from './StorageFolder.module.css';
import type { Folder } from '../../../types';

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
  const { name, updated_at } = folder;
  
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Неизвестно';
    try {
      return dateString.split('T')[0];
    } catch (e) {
      return 'Неизвестно: ' + e;
    }
  };

  const date = formatDate(updated_at);

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