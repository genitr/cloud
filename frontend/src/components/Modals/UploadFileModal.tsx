import React, { useState, useRef } from 'react';
import styles from './Modals.module.css';
import type { UploadFileModalProps, UploadFileData } from '../../types';

const UploadFileModal: React.FC<UploadFileModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpload 
}) => {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [customNames, setCustomNames] = useState<Map<File, string>>(new Map());
  const [comments, setComments] = useState<Map<File, string>>(new Map());
  const [expandedFile, setExpandedFile] = useState<File | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files?.length) {
      setSelectedFiles(files);
      const newNames = new Map();
      const newComments = new Map();
      Array.from(files).forEach(file => {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        newNames.set(file, nameWithoutExt);
        newComments.set(file, '');
      });
      setCustomNames(newNames);
      setComments(newComments);
    }
  };

  const handleBrowseClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleUpload = () => {
    if (selectedFiles?.length) {
      const filesToUpload: UploadFileData[] = Array.from(selectedFiles).map(file => ({
        file,
        name: customNames.get(file) || file.name.replace(/\.[^/.]+$/, ""),
        comment: comments.get(file) || ''
      }));
      
      onUpload(filesToUpload);
      resetState();
      onClose();
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files?.length) {
      setSelectedFiles(files);
      const newNames = new Map();
      const newComments = new Map();
      Array.from(files).forEach(file => {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
        newNames.set(file, nameWithoutExt);
        newComments.set(file, '');
      });
      setCustomNames(newNames);
      setComments(newComments);
    }
  };

  const resetState = () => {
    setSelectedFiles(null);
    setCustomNames(new Map());
    setComments(new Map());
    setExpandedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleNameChange = (file: File, newName: string) => {
    const newNames = new Map(customNames);
    newNames.set(file, newName);
    setCustomNames(newNames);
  };

  const handleCommentChange = (file: File, newComment: string) => {
    const newComments = new Map(comments);
    newComments.set(file, newComment);
    setComments(newComments);
  };

  const clearSelection = () => {
    resetState();
  };

  const toggleExpand = (file: File) => {
    if (expandedFile === file) {
      setExpandedFile(null);
    } else {
      setExpandedFile(file);
    }
  };

  // Форматирование размера файла
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  // Получаем список выбранных файлов для отображения
  const getSelectedFilesList = () => {
    if (!selectedFiles) return [];
    const filesList = [];
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      filesList.push({
        file,
        name: customNames.get(file) || file.name.replace(/\.[^/.]+$/, ""),
        size: formatFileSize(file.size),
        comment: comments.get(file) || '',
        isExpanded: expandedFile === file,
        extension: file.name.substring(file.name.lastIndexOf('.'))
      });
    }
    return filesList;
  };

  const selectedFilesList = getSelectedFilesList();
  
  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div 
        className={`${styles.modal} ${styles.uploadModal}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>Загрузить файлы</h3>
          <button className={styles.closeButton} onClick={handleClose}>✕</button>
        </div>
        
        <div className={styles.modalContent}>
          {!selectedFiles ? (
            // Область для выбора файлов
            <div 
              className={styles.uploadArea}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <div className={styles.uploadIcon}>⬆️</div>
              <p>Перетащите файлы сюда или</p>
              <button 
                className={styles.browseButton}
                onClick={handleBrowseClick}
                type="button"
              >
                Выберите файлы
              </button>
            </div>
          ) : (
            // Список выбранных файлов с возможностью редактирования
            <div className={styles.selectedFilesContainer}>
              <div className={styles.selectedFilesHeader}>
                <span className={styles.selectedFilesCount}>
                  Выбрано файлов: {selectedFiles.length}
                </span>
                <button 
                  className={styles.clearAllButton}
                  onClick={clearSelection}
                  type="button"
                >
                  ✕ Очистить все
                </button>
              </div>
              
              <div className={styles.selectedFilesList}>
                {selectedFilesList.map((item, index) => (
                  <div key={index} className={styles.selectedFileItem}>
                    <div 
                      className={styles.selectedFileHeader}
                      onClick={() => toggleExpand(item.file)}
                    >
                      <div className={styles.selectedFileIcon}>
                        {item.isExpanded ? '▼' : '▶'}
                      </div>
                      <div className={styles.selectedFileMainInfo}>
                        <span className={styles.selectedFileName}>{item.name}</span>
                        <span className={styles.selectedFileSize}>{item.size}</span>
                      </div>
                    </div>
                    
                    {item.isExpanded && (
                      <div className={styles.selectedFileDetails}>
                        <div className={styles.fileDetailRow}>
                          <label className={styles.fileDetailLabel}>
                            Имя файла (без расширения):
                          </label>
                          <div className={styles.fileNameInputGroup}>
                            <input
                              type="text"
                              className={styles.fileDetailInput}
                              value={item.name}
                              onChange={(e) => handleNameChange(item.file, e.target.value)}
                              placeholder="Введите имя файла"
                            />
                            <span className={styles.fileExtension}>
                              {item.extension}
                            </span>
                          </div>
                        </div>
                        
                        <div className={styles.fileDetailRow}>
                          <label className={styles.fileDetailLabel}>
                            Комментарий (опционально):
                          </label>
                          <textarea
                            className={styles.fileDetailTextarea}
                            value={item.comment}
                            onChange={(e) => handleCommentChange(item.file, e.target.value)}
                            placeholder="Добавьте комментарий к файлу"
                            rows={2}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <input 
            ref={fileInputRef}
            type="file" 
            multiple 
            className={styles.fileInput}
            onChange={handleFileSelect}
          />
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={handleClose}>
            Отмена
          </button>
          <button 
            className={styles.uploadButton} 
            onClick={handleUpload}
            disabled={!selectedFiles?.length}
          >
            Загрузить {selectedFiles?.length ? `(${selectedFiles.length})` : ''}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UploadFileModal;