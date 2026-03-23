import React from 'react';
import S from './StorageFile.module.css';
import type { FileListItem } from '../../../types';
import { formatDate } from '../../../utils/formatNumber';
import Icon from '../Icon/Icon';

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
    if (!content_type) return <Icon name='file' />;
    if (content_type.startsWith('image/')) return <Icon name='imageFile' />;
    if (content_type.startsWith('video/')) return <Icon name='videoFile' />;
    if (content_type.startsWith('audio/')) return <Icon name='audioFile' />;
    if (content_type.includes('pdf')) return <Icon name='pdfFile' />;
    if (content_type.includes('text') || content_type.includes('msword')) return <Icon name='textFile' />;
    if (content_type.includes('zip') || content_type.includes('rar')) return <Icon name='zipFile' />;
    return <Icon name='file' />;
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
          <div>{formatDate(last_downloaded_at, true)}</div>
        )}
      </div>
      <div className={S.itemActions}>
        <button 
          className={S.actionButton}
          onClick={() => onShare(file)}
          title="Поделиться"
        >
          <Icon name='share' />
        </button>
        <button 
          className={S.actionButton}
          onClick={() => onRename?.(file)}
          title="Переименовать"
        >
          <Icon name='edit' />
        </button>
        <button 
          className={S.actionButton}
          onClick={() => onDelete(file)}
          title="Удалить"
        >
          <Icon name='delete' />
        </button>
        <button 
          className={S.actionButton} 
          onClick={() => onDownload(file)}
          title="Скачать">
          <Icon name='download' />
        </button>
      </div>
    </div>
  );
};

export default StorageFile;