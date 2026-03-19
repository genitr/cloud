import React from 'react';
import S from './StorageFile.module.css';
import type { FileListItem } from '../../../types';
import { formatDate } from '../../../utils/formatNumber';

interface FileItemProps {
  file: FileListItem;
  onDelete: (file: FileListItem) => void;
  onShare: (file: FileListItem) => void;
  onDownload: (file: FileListItem) => void;
  onClick: () => void;
}

const StorageFile: React.FC<FileItemProps> = ({ file, onDelete, onShare, onDownload, onClick }) => {
  const { name, size_formatted, uploaded_at, content_type } = file;

  const date = formatDate(uploaded_at)

  return (
    <div className={S.item}>
      <div className={S.itemIcon} onClick={onClick}>
        {content_type === 'image' ? '🖼️' : '📄'}
      </div>
      <div className={S.itemInfo} onClick={onClick}>
        <div className={S.itemName}>{name}</div>
      </div>
      <div className={S.itemMeta}>{date}</div>
      <div className={S.itemMeta}>{size_formatted}</div>
      <div className={S.itemActions}>
        <button
          className={S.actionButton}
          onClick={() => onShare(file)}
          title="Поделиться"
        >
          🔗
        </button>
        <button
          className={S.actionButton}
          onClick={() => onDelete(file)}
          title="Удалить"
        >
          🗑️
        </button>
        <button
          className={S.actionButton}
          onClick={() => onDownload(file)}
          title="Скачать">
          ⬇️
        </button>
      </div>
    </div>
  );
};

export default StorageFile;