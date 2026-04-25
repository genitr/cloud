import React, { useState, useEffect, useRef } from 'react';
import S from './Modals.module.css';
import type { FileListItem, FileItem } from '../../types';
import { formatFileSize, formatDate } from '../../utils/formatNumber';
import { useAppDispatch } from '../../store/hooks';
import { downloadFile } from '../../store/slices/filesSlice';
import { getCSRFToken } from '../../utils/csrf';
import { store } from '../../store/store';
import Icon from '../ui/Icon/Icon';

const API_URL = import.meta.env.VITE_API_URL;

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileListItem | null;
  userId?: number;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  isOpen,
  onClose,
  file,
  userId
}) => {
  const [fileData, setFileData] = useState<FileItem | null>(null);
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const viewRecorded = useRef(false);

  const dispatch = useAppDispatch();

  // Функция для записи просмотра
  const recordView = async () => {
    if (viewRecorded.current || !file) return;

    try {
      const state = store.getState();
      const isAdmin = state.auth.user?.is_staff || state.auth.user?.is_superuser;

      let url = `${API_URL}/files/${file.id}/record_view/`;
      if (isAdmin && userId) {
        url += `?user_id=${userId}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-CSRFToken': getCSRFToken(),
        },
        credentials: 'include',
      });

      if (response.ok) {
        viewRecorded.current = true;
        const data = await response.json();
        console.log('Просмотр записан:', data);
      } else {
        console.error('Failed to record view:', response.status);
      }
    } catch (err) {
      console.error('Error recording view:', err);
    }
  };

  // Функция для загрузки содержимого для предпросмотра
  const loadPreviewContent = async (fileId: number, type: string, userId?: number) => {
    try {
      const state = store.getState();
      const isAdmin = state.auth.user?.is_staff || state.auth.user?.is_superuser;

      let url = `${API_URL}/files/${fileId}/preview/`;
      if (isAdmin && userId) {
        url += `?user_id=${userId}`;
      }

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Failed to load ${type}`);
      }

      const blob = await response.blob();
      const urlPreview = URL.createObjectURL(blob);

      if (type === 'image') setImageUrl(urlPreview);
      if (type === 'video') setVideoUrl(urlPreview);
      if (type === 'audio') setAudioUrl(urlPreview);
      if (type === 'pdf') setPdfUrl(urlPreview);

    } catch (err) {
      console.error(`Error loading ${type}:`, err);
      setError(`Не удалось загрузить файл для просмотра`);
    }
  };

  useEffect(() => {
    if (file && isOpen) {
      // Записываем просмотр
      recordView();

      // Загружаем детальную информацию о файле
      const fetchFileDetails = async () => {
        setLoading(true);
        setError(null);
        try {
          const state = store.getState();
          const isAdmin = state.auth.user?.is_staff || state.auth.user?.is_superuser;

          let url = `${API_URL}/files/${file.id}/`;
          if (isAdmin && userId) {
            url += `?user_id=${userId}`;
          }

          const response = await fetch(url, {
            credentials: 'include',
          });

          if (response.ok) {
            const data = await response.json();
            setFileData(data);

            // Загружаем содержимое для предпросмотра
            if (data.content_type.startsWith('image/')) {
              await loadPreviewContent(file.id, 'image', userId);
            } else if (data.content_type.startsWith('video/')) {
              await loadPreviewContent(file.id, 'video', userId);
            } else if (data.content_type.startsWith('audio/')) {
              await loadPreviewContent(file.id, 'audio', userId);
            } else if (data.content_type.includes('pdf')) {
              await loadPreviewContent(file.id, 'pdf', userId);
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
      viewRecorded.current = false;  // Сбрасываем при закрытии
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, isOpen]);

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
      await dispatch(downloadFile({
        fileId: file.id,
        userId: Number(userId)
      })).unwrap();
    } catch (error) {
      console.error('Ошибка при скачивании файла:', error);
    }
  };

  if (!isOpen || !file) return null;

  const fileType = fileData ? getFileType(fileData.content_type) : 'other';
  const downloadUrl = getDownloadUrl(file.id);
  const displayName = fileData?.name || file.name;

  return (
    <div className={S.modalOverlay} onClick={onClose}>
      <div className={`${S.modal} ${S.previewModal}`} onClick={(e) => e.stopPropagation()}>
        <div className={S.modalHeader}>
          <h3 className={S.fileName}>{displayName}</h3>
          <button 
            className={S.closeButton} 
            title='Закрыть окно' 
            onClick={onClose}>✕</button>
        </div>

        <div className={S.modalContent}>
          {loading ? (
            <div className={S.loaderContainer}>
              <div className={S.spinner}></div>
              <p>Загрузка...</p>
            </div>
          ) : error ? (
            <div className={S.errorContainer}>
              <div className={S.errorIcon}>⚠️</div>
              <p>{error}</p>
            </div>
          ) : (
            <>
              <div className={S.previewContainer}>
                {fileType === 'image' && imageUrl && (
                  <img
                    src={imageUrl}
                    alt={displayName}
                    className={S.previewImage}
                    onLoad={() => null}
                    onError={() => console.error('Image failed to load')}
                  />
                )}

                {fileType === 'video' && videoUrl && (
                  <video
                    controls
                    className={S.previewVideo}
                    src={videoUrl}
                  >
                    Ваш браузер не поддерживает видео
                  </video>
                )}

                {fileType === 'audio' && audioUrl && (
                  <div className={S.audioPreview}>
                    <div className={S.audioIcon}>🎵</div>
                    <audio controls className={S.previewAudio} src={audioUrl} />
                  </div>
                )}

                {fileType === 'pdf' && pdfUrl && (
                  <iframe
                    src={pdfUrl}
                    className={S.previewPdf}
                    title={displayName}
                  />
                )}

                {fileType === 'text' && (
                  <div className={S.textPreview}>
                    <div className={S.textIcon}>📝</div>
                    <a
                      href={downloadUrl}
                      download={displayName}
                      className={S.downloadLink}
                    >
                      Скачать для просмотра
                    </a>
                  </div>
                )}

                {fileType === 'other' && (
                  <div className={S.otherPreview}>
                    <div className={S.fileIconLarge}>📄</div>
                    <a
                      href={downloadUrl}
                      download={displayName}
                      className={S.downloadLink}
                    >
                      Скачать файл
                    </a>
                  </div>
                )}

                {/* Если контент не загружен */}
                {fileType === 'image' && !imageUrl && !error && (
                  <div className={S.loaderContainer}>
                    <div className={S.spinner}></div>
                    <p>Загрузка изображения...</p>
                  </div>
                )}
              </div>

              {fileData && (
                <div className={S.filePreviewInfo}>
                  <div className={S.filePreviewInfoRow1}>
                    <div className={S.infoRow}>
                    <span className={S.infoLabel}>Размер:</span>
                    <span className={S.infoValue}>{formatFileSize(fileData.size)}</span>
                  </div>
                  <div className={S.infoRow}>
                    <span className={S.infoLabel}>Тип:</span>
                    <span className={S.infoValue}>{fileData.content_type}</span>
                  </div>
                  <div className={S.infoRow}>
                    <span className={S.infoLabel}>Загружен:</span>
                    <span className={S.infoValue}>{formatDate(fileData.uploaded_at, true)}</span>
                  </div>
                  </div>
                  <div className={S.filePreviewInfoRow2}>
                    {fileData.comment && (
                    <div className={S.infoRow}>
                      <span className={S.infoLabel}><Icon name='comment' size={16}/> Комментарий:</span>
                      <span className={S.infoValue}>{fileData.comment}</span>
                    </div>
                  )}

                  {fileData.last_downloaded_at && (
                    <div className={S.infoRow}>
                      <span className={S.infoLabel}><Icon name='accessTime' size={16}/> Последнее скачивание:</span>
                      <span className={S.infoValue}>
                        {new Date(fileData.last_downloaded_at).toLocaleString('ru-RU')}
                      </span>
                    </div>
                  )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className={S.modalFooter}>
          <button
            className={S.downloadButton}
            onClick={() => handleFileDownload(file)}
            title="Скачать файл">
            Скачать
          </button>
          <button 
            className={S.cancelButton} 
            title='Закрыть окно' 
            onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilePreviewModal;