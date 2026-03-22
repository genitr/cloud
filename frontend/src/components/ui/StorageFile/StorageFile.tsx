import React from 'react';
import S from './StorageFile.module.css';
import type { FileListItem } from '../../../types';

interface FileItemProps {
  file: FileListItem;
  onDelete: (file: FileListItem) => void;
  onShare: (file: FileListItem) => void;
  onDownload: (file: FileListItem) => void;
  onPreview: (file: FileListItem) => void;
  onRename?: (file: FileListItem) => void;
}

const StorageFile: React.FC<FileItemProps> = ({ 
  file, 
  onDelete, 
  onShare, 
  onDownload, 
  onPreview,
  onRename 
}) => {

  const { 
    name, 
    size_formatted, 
    uploaded_at, 
    content_type, 
    comment,
    last_downloaded_at
  } = file;
  
  const getFileIcon = () => {
    if (!content_type) return '📄';
    if (content_type.startsWith('image/')) return '🖼️';
    if (content_type.startsWith('video/')) return '🎬';
    if (content_type.startsWith('audio/')) return '🎵';
    if (content_type.includes('pdf')) return '📕';
    if (content_type.includes('text')) return '📝';
    if (content_type.includes('zip') || content_type.includes('rar')) return '🗜️';
    return '📄';
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('ru-RU');
    } catch {
      return dateString;
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return 'Никогда';
    try {
      return new Date(dateString).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Неизвестно';
    }
  };

  const truncateComment = (text: string, maxLength: number = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className={S.item}>
      <div className={S.itemIcon} onClick={() => onPreview(file)}>
        {getFileIcon()}
      </div>
      <div className={S.itemInfo} onClick={() => onPreview(file)}>
        <div className={S.itemName}>{name}</div>
      </div>
      <div className={S.itemMeta}>
        {comment && (
          <div className={S.itemComment}>
            {truncateComment(comment)}
          </div>
        )}
      </div>
      <div className={S.itemMeta}>
        {size_formatted}
      </div>
      <div className={S.itemMeta}>
        {formatDate(uploaded_at)}
      </div>
      <div className={S.itemMeta}>
        {last_downloaded_at && (
          <div>{formatDateTime(last_downloaded_at)}</div>
        )}
      </div>
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
          onClick={() => onRename?.(file)}
          title="Переименовать"
        >
          ✏️
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