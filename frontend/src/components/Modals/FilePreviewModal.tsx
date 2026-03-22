// components/Modals/FilePreviewModal.tsx
import React, { useState, useEffect } from 'react';
import styles from './Modals.module.css';
import { API_URL } from '../../types';
import type { FileListItem, FileItem } from '../../types';
import { formatFileSize } from '../../utils/formatNumber';
import { useAppDispatch } from '../../store/hooks';
import { downloadFile } from '../../store/slices/filesSlice';


interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileListItem | null;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file
}) => {
  const [fileData, setFileData] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  
  useEffect(() => {
    if (file && isOpen) {
      // Загружаем детальную информацию о файле
      const fetchFileDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const token = localStorage.getItem('auth_token');
          const response = await fetch(`${API_URL}/files/${file.id}/`, {
            headers: {
              'Authorization': `Token ${token}`,
              'Content-Type': 'application/json',
            }
          });
          if (response.ok) {
            const data = await response.json();
            console.log('File details loaded:', data);
            setFileData(data);
            
            // Для изображений, видео, аудио и PDF загружаем файл через fetch
            if (data.content_type.startsWith('image/')) {
              await loadFileContent(file.id, 'image');
            } else if (data.content_type.startsWith('video/')) {
              await loadFileContent(file.id, 'video');
            } else if (data.content_type.startsWith('audio/')) {
              await loadFileContent(file.id, 'audio');
            } else if (data.content_type.includes('pdf')) {
              await loadFileContent(file.id, 'pdf');
            }
          } else {
            console.error('Failed to load file details, status:', response.status);
            setError('Не удалось загрузить информацию о файле');
          }
        } catch (err) {
          console.error('Error loading file details:', err);
          setError('Ошибка при загрузке файла');
        } finally {
          setLoading(false);
        }
      };
      
      fetchFileDetails();
    }
    
    // Очистка blob URL при закрытии
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (videoUrl) URL.revokeObjectURL(videoUrl);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      if (pdfUrl) URL.revokeObjectURL(pdfUrl);
    };
  }, [file, isOpen]);

  const loadFileContent = async (fileId: number, type: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/files/${fileId}/download/`, {
        headers: {
          'Authorization': `Token ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to load ${type}`);
      }
      
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      if (type === 'image') setImageUrl(url);
      if (type === 'video') setVideoUrl(url);
      if (type === 'audio') setAudioUrl(url);
      if (type === 'pdf') setPdfUrl(url);
      
    } catch (err) {
      console.error(`Error loading ${type}:`, err);
      setError(`Не удалось загрузить ${type === 'image' ? 'изображение' : 'файл'}`);
    }
  };

  const getFileType = (contentType?: string): string => {
    if (!contentType) return 'other';
    if (contentType.startsWith('image/')) return 'image';
    if (contentType.startsWith('video/')) return 'video';
    if (contentType.startsWith('audio/')) return 'audio';
    if (contentType.includes('pdf')) return 'pdf';
    if (contentType.includes('text') || contentType.includes('json')) return 'text';
    return 'other';
  };

  const getDownloadUrl = (fileId: number): string => {
    const token = localStorage.getItem('auth_token');
    return `${API_URL}/files/${fileId}/download/?token=${token}`;
  };

  const handleFileDownload = async (file: FileListItem) => {
    try {
      await dispatch(downloadFile(file.id)).unwrap();
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
    }
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return 'Неизвестно';
    try {
      return new Date(dateString).toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  if (!isOpen || !file) return null;

  const fileType = fileData ? getFileType(fileData.content_type) : 'other';
  const downloadUrl = getDownloadUrl(file.id);
  const displayName = fileData?.name || file.name;

  console.log('File preview:', { fileType, displayName, fileData });

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.previewModal}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.fileName}>{displayName}</h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalContent}>
          {loading ? (
            <div className={styles.loaderContainer}>
              <div className={styles.spinner}></div>
              <p>Загрузка...</p>
            </div>
          ) : error ? (
            <div className={styles.errorContainer}>
              <div className={styles.errorIcon}>⚠️</div>
              <p>{error}</p>
            </div>
          ) : (
            <>
              {/* Preview */}
              <div className={styles.previewContainer}>
                {fileType === 'image' && imageUrl && (
                  <img
                    src={imageUrl}
                    alt={displayName}
                    className={styles.previewImage}
                    onLoad={() => console.log('Image loaded successfully')}
                    onError={() => console.error('Image failed to load')}
                  />
                )}
                
                {fileType === 'video' && videoUrl && (
                  <video
                    controls
                    className={styles.previewVideo}
                    src={videoUrl}
                  >
                    Ваш браузер не поддерживает видео
                  </video>
                )}
                
                {fileType === 'audio' && audioUrl && (
                  <div className={styles.audioPreview}>
                    <div className={styles.audioIcon}>🎵</div>
                    <audio controls className={styles.previewAudio} src={audioUrl} />
                  </div>
                )}
                
                {fileType === 'pdf' && pdfUrl && (
                  <iframe
                    src={pdfUrl}
                    className={styles.previewPdf}
                    title={displayName}
                  />
                )}
                
                {fileType === 'text' && (
                  <div className={styles.textPreview}>
                    <div className={styles.textIcon}>📝</div>
                    <a
                      href={downloadUrl}
                      download={displayName}
                      className={styles.downloadLink}
                    >
                      Скачать для просмотра
                    </a>
                  </div>
                )}
                
                {fileType === 'other' && (
                  <div className={styles.otherPreview}>
                    <div className={styles.fileIconLarge}>📄</div>
                    <a
                      href={downloadUrl}
                      download={displayName}
                      className={styles.downloadLink}
                    >
                      Скачать файл
                    </a>
                  </div>
                )}
                
                {/* Если контент не загружен */}
                {fileType === 'image' && !imageUrl && !error && (
                  <div className={styles.loaderContainer}>
                    <div className={styles.spinner}></div>
                    <p>Загрузка изображения...</p>
                  </div>
                )}
              </div>

              {/* File Info */}
              {fileData && (
                <div className={styles.fileInfo}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Размер:</span>
                    <span className={styles.infoValue}>{formatFileSize(fileData.size)}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Тип:</span>
                    <span className={styles.infoValue}>{fileData.content_type}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Загружен:</span>
                    <span className={styles.infoValue}>{formatDate(fileData.uploaded_at)}</span>
                  </div>
                  {fileData.comment && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>💬 Комментарий:</span>
                      <span className={styles.infoValue}>{fileData.comment}</span>
                    </div>
                  )}
                  
                  {fileData.last_downloaded_at && (
                    <div className={styles.infoRow}>
                      <span className={styles.infoLabel}>📅 Последнее скачивание:</span>
                      <span className={styles.infoValue}>
                        {new Date(fileData.last_downloaded_at).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles.modalFooter}>
          <button 
            className={styles.downloadButton} 
            onClick={() => handleFileDownload(file)}
            title="Скачать">
            Скачать
          </button>
          <button className={styles.closeButton} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;