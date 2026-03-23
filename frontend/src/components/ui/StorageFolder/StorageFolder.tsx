import React from 'react';
import S from './StorageFolder.module.css';
import type { Folder } from '../../../types';
import { useAppSelector } from '../../../store/hooks';
import { selectFolderStats } from '../../../store/slices/foldersSlice';
import { formatDate, getFileWord } from '../../../utils/formatNumber';
import Icon from '../Icon/Icon';

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
  const { name, updated_at, id, size_formatted } = folder;

  const fileCount = useAppSelector(state => 
    selectFolderStats(state, id)
  );

  return (
    <div className={S.item}>
      <div className={S.itemIcon} onClick={onClick}>
        <Icon name='folder' size={40}/>
      </div>
      <div className={S.itemInfo} onClick={onClick}>
        <div className={S.itemName}>{name}</div>
        <div className={S.itemMeta}>{fileCount} {getFileWord(fileCount)}</div>
      </div>
      <div className={S.itemMeta}></div>
      <div className={S.itemMeta}>
        {size_formatted}
      </div>
      <div className={S.itemMeta}>
        {formatDate(updated_at)}
      </div>
      <div className={S.itemMeta}></div>
      <div className={S.itemActions}>
        <button 
          className={S.actionButton}
          onClick={() => onDelete(folder)}
          title="Удалить"
        >
          <Icon name='delete' />
        </button>
      </div>
    </div>
  );
};

export default StorageFolder;