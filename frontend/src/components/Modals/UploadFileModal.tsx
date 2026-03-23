import React, { useState, useRef } from 'react';
import S from './Modals.module.css';
import type { UploadFileModalProps, UploadFileData } from '../../types';
import { formatFileSize } from '../../utils/formatNumber';
import Icon from '../ui/Icon/Icon';

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
    <div className={S.modalOverlay} onClick={handleClose}>
      <div
        className={`${S.modal} ${S.uploadModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={S.modalHeader}>
          <h3>Загрузить файлы</h3>
          <button className={S.closeButton} onClick={handleClose}>✕</button>
        </div>

        <div className={S.modalContent}>
          {!selectedFiles ? (
            <div
              className={S.uploadArea}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <Icon name='uploadFile' size={64} className={S.uploadIcon} />
              <p>Перетащите файлы сюда или</p>
              <button
                className={S.browseButton}
                onClick={handleBrowseClick}
                type="button"
              >
                Выберите файлы
              </button>
            </div>
          ) : (

            <div className={S.selectedFilesContainer}>
              <div className={S.selectedFilesHeader}>
                <span className={S.selectedFilesCount}>
                  Выбрано файлов: {selectedFiles.length}
                </span>
                <button
                  className={S.clearAllButton}
                  onClick={clearSelection}
                  type="button"
                >
                  ✕ Очистить все
                </button>
              </div>

              <div className={S.selectedFilesList}>
                {selectedFilesList.map((item, index) => (
                  <div key={index} className={S.selectedFileItem}>
                    <div
                      className={S.selectedFileHeader}
                      onClick={() => toggleExpand(item.file)}
                    >
                      <div className={S.selectedFileIcon}>
                        {item.isExpanded ? '▼' : '▶'}
                      </div>
                      <div className={S.selectedFileMainInfo}>
                        <span className={S.selectedFileName}>{item.name}</span>
                        <span className={S.selectedFileSize}>{item.size}</span>
                      </div>
                    </div>

                    {item.isExpanded && (
                      <div className={S.selectedFileDetails}>
                        <div className={S.fileDetailRow}>
                          <label className={S.fileDetailLabel}>
                            Имя файла (без расширения):
                          </label>
                          <div className={S.fileNameInputGroup}>
                            <input
                              type="text"
                              className={S.fileDetailInput}
                              value={item.name}
                              onChange={(e) => handleNameChange(item.file, e.target.value)}
                              placeholder="Введите имя файла"
                            />
                            <span className={S.fileExtension}>
                              {item.extension}
                            </span>
                          </div>
                        </div>

                        <div className={S.fileDetailRow}>
                          <label className={S.fileDetailLabel}>
                            Комментарий (опционально):
                          </label>
                          <textarea
                            className={S.fileDetailTextarea}
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
            className={S.fileInput}
            onChange={handleFileSelect}
          />
        </div>

        <div className={S.modalFooter}>
          <button className={S.cancelButton} onClick={handleClose}>
            Отмена
          </button>
          <button
            className={S.uploadButton}
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