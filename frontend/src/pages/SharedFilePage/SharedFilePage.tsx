import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import S from './SharedFilePage.module.css';
import { API_URL } from '../../types';

interface FileInfo {
  name: string;
  original_name: string;
  size: number;
  content_type: string;
  comment?: string;
  uploaded_at: string;
}

interface ShareData {
  share_token: string;
  file_info: FileInfo;
  created_by_username: string;
  created_at: string;
}

const SharedFilePage = () => {
  const { token } = useParams<{ token: string }>();
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const fetchShareInfo = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/public/${token}/`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Файл не найден или ссылка недействительна');
          }
          throw new Error('Ошибка загрузки информации');
        }
        
        const data = await response.json();
        setShareData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchShareInfo();
    }
  }, [token]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const downloadUrl = `${API_URL}/public/${token}/download/`;
      
      // Создаем временную ссылку для скачивания
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = shareData?.file_info.original_name || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Обновляем информацию о файле (для обновления счетчика скачиваний)
      setTimeout(() => {
        const refreshInfo = async () => {
          const response = await fetch(`${API_URL}/public/${token}/`);
          const data = await response.json();
          setShareData(data);
        };
        refreshInfo();
      }, 1000);
      
    } catch (err) {
      console.error('Download error:', err);
      alert('Ошибка при скачивании файла');
    } finally {
      setDownloading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Б';
    const k = 1024;
    const sizes = ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileIcon = (contentType: string): string => {
    if (contentType.startsWith('image/')) return '🖼️';
    if (contentType.startsWith('video/')) return '🎬';
    if (contentType.startsWith('audio/')) return '🎵';
    if (contentType.startsWith('text/')) return '📝';
    if (contentType.includes('pdf')) return '📕';
    if (contentType.includes('word') || contentType.includes('document')) return '📘';
    if (contentType.includes('excel') || contentType.includes('spreadsheet')) return '📊';
    if (contentType.includes('zip') || contentType.includes('rar') || contentType.includes('tar')) return '🗜️';
    return '📄';
  };

  if (loading) {
    return (
      <div className={S.container}>
        <div className={S.loaderContainer}>
          <div className={S.spinner}></div>
          <p>Загрузка информации о файле...</p>
        </div>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className={S.container}>
        <div className={S.errorContainer}>
          <div className={S.errorIcon}>⚠️</div>
          <h1>Файл не найден</h1>
          <p>{error || 'Ссылка недействительна или файл был удален'}</p>
          <Link to="/" className={S.homeButton}>
            На главную
          </Link>
        </div>
      </div>
    );
  }

  const { file_info, created_by_username, created_at } = shareData;
  const fileSize = formatFileSize(file_info.size);
  const uploadDate = formatDate(file_info.uploaded_at);
  const shareDate = formatDate(created_at);
  const fileIcon = getFileIcon(file_info.content_type);

  return (
    <div className={S.container}>
      <div className={S.card}>
        {/* Шапка */}
        <div className={S.header}>
          <div className={S.fileIcon}>{fileIcon}</div>
          <div className={S.fileTitle}>
            <h1>{file_info.original_name}</h1>
            <div className={S.fileMeta}>
              <span className={S.fileSize}>{fileSize}</span>
              <span className={S.fileType}>{file_info.content_type}</span>
            </div>
          </div>
        </div>

        {/* Информация о файле */}
        <div className={S.infoGrid}>
          <div className={S.infoItem}>
            <span className={S.infoLabel}>📅 Загружен</span>
            <span className={S.infoValue}>{uploadDate}</span>
          </div>
          
          <div className={S.infoItem}>
            <span className={S.infoLabel}>👤 Автор</span>
            <span className={S.infoValue}>{created_by_username}</span>
          </div>
          
          <div className={S.infoItem}>
            <span className={S.infoLabel}>🔗 Расшарен</span>
            <span className={S.infoValue}>{shareDate}</span>
          </div>
          
          {file_info.comment && (
            <div className={S.infoItemFull}>
              <span className={S.infoLabel}>💬 Комментарий</span>
              <span className={S.infoValue}>{file_info.comment}</span>
            </div>
          )}
        </div>

        {/* Действия */}
        <div className={S.actions}>
          <button 
            className={S.downloadButton}
            onClick={handleDownload}
            disabled={downloading}
          >
            {downloading ? (
              <>
                <span className={S.spinnerSmall}></span>
                Скачивание...
              </>
            ) : (
              <>
                ⬇️ Скачать файл
              </>
            )}
          </button>
          
          <button 
            className={S.copyButton}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              alert('Ссылка скопирована!');
            }}
          >
            🔗 Копировать ссылку
          </button>
        </div>

        {/* Предпросмотр для изображений */}
        {file_info.content_type.startsWith('image/') && (
          <div className={S.preview}>
            <img 
              src={`${API_URL}/public/${token}/download/`} 
              alt={file_info.original_name}
              className={S.previewImage}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Футер */}
        <div className={S.footer}>
          <Link to="/" className={S.homeLink}>
            ← На главную
          </Link>
          <p className={S.disclaimer}>
            Файл доступен по ссылке. Не передавайте её посторонним.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedFilePage;