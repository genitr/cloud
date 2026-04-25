import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import S from './SharedFilePage.module.css';
import { formatDate, formatFileSize } from '../../utils/formatNumber';
import { getCSRFToken } from '../../utils/csrf';
import Icon from '../../components/ui/Icon/Icon';
import { copyToClipboard } from '../../utils/clipboard';
import { useMediaQuery } from 'react-responsive';

const API_URL = import.meta.env.VITE_API_URL;

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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const viewRecorded = useRef(false);
  const [copied, setCopied] = useState<boolean>(false);
  const isMobile = useMediaQuery({ maxWidth: 640 });
  useEffect(() => {
    const fetchShareInfo = async () => {
      if (!token) return;

      try {
        setLoading(true);

        // Получаем информацию о файле
        const infoResponse = await fetch(`${API_URL}/public/${token}/`, {
          credentials: 'include',
        });

        if (!infoResponse.ok) {
          throw new Error('Файл не найден');
        }

        const data = await infoResponse.json();
        setShareData(data);

        // Записываем просмотр
        if (!viewRecorded.current) {
          viewRecorded.current = true;

          try {
            const viewResponse = await fetch(`${API_URL}/public/${token}/record_view/`, {
              method: 'POST',
              headers: {
                'X-CSRFToken': getCSRFToken(),
              },
              credentials: 'include',
            });
            const result = await viewResponse.json();
            console.log('Просмотр записан:', result);
          } catch (err) {
            console.error('Error recording view:', err);
          }
        }

        if (!viewRecorded.current) {
          viewRecorded.current = true;

          console.log('📝 Отправка запроса на запись просмотра...');

          try {
            const viewResponse = await fetch(`${API_URL}/public/${token}/record_view/`, {
              method: 'POST',
              credentials: 'include',
            });

            console.log('📡 Ответ от record_view:', viewResponse.status);

            const result = await viewResponse.json();
            console.log('📊 Результат записи просмотра:', result);

            if (viewResponse.ok) {
              console.log('✅ Просмотр успешно записан! Новое значение:', result.views_count);
            } else {
              console.error('❌ Ошибка при записи просмотра:', result);
            }
          } catch (err) {
            console.error('❌ Исключение при записи просмотра:', err);
          }
        }

        // Для изображений - загружаем preview через отдельный эндпоинт
        if (data.file_info.content_type.startsWith('image/')) {
          console.log('Загрузка preview для изображения...');

          const previewResponse = await fetch(`${API_URL}/public/${token}/preview/`, {
            credentials: 'include',
          });

          if (previewResponse.ok) {
            const blob = await previewResponse.blob();
            const url = URL.createObjectURL(blob);
            setPreviewUrl(url);
            console.log('Preview загружен');
          } else {
            console.error('Failed to load preview:', previewResponse.status);
          }
        }

      } catch (err) {
        console.error('Error:', err);
        setError(err instanceof Error ? err.message : 'Произошла ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchShareInfo();

    // Очистка URL при размонтировании
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleCopyLink = async (url: string) => {
    const success = await copyToClipboard(url);

    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } else {
      console.error('Failed to copy');
      alert(`Не удалось скопировать. Скопируйте ссылку вручную:\n${url}`);
    }
  };

  const handleDownload = async () => {
    if (!token) return;

    try {
      setDownloading(true);
      const response = await fetch(`${API_URL}/public/${token}/download/`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Ошибка скачивания');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = shareData?.file_info.original_name || 'file';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error('Download error:', err);
    } finally {
      setDownloading(false);
    }
  };

  let fileIcon = <Icon name='file' size={48} />;
  const getFileIcon = (contentType: string): void => {
    if (contentType.startsWith('image/')) fileIcon = <Icon name='imageFile' size={48} />;
    if (contentType.startsWith('video/')) fileIcon = <Icon name='videoFile' size={48} />;
    if (contentType.startsWith('audio/')) fileIcon = <Icon name='audioFile' size={48} />;
    if (contentType.startsWith('text/')) fileIcon = <Icon name='textFile' size={48} />;
    if (contentType.includes('pdf')) fileIcon = <Icon name='pdfFile' size={48} />;
    if (contentType.includes('word')) fileIcon = <Icon name='docFile' size={48} />;
    if (contentType.includes('zip')) fileIcon = <Icon name='zipFile' size={48} />;
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
  const uploadDate = formatDate(file_info.uploaded_at, true);
  const shareDate = formatDate(created_at, true);

  getFileIcon(file_info.content_type);

  const isImage = file_info.content_type.startsWith('image/');
  return (
    <div className={S.container}>
      <div className={S.card}>
        <div className={S.header}>
          {!isMobile && (<div className={S.fileIcon}>{fileIcon}</div>)}
          
          <div className={S.fileTitle}>
            <h1>{file_info.original_name}</h1>
            <div className={S.fileMeta}>
              <span className={S.fileSize} title='Размер файла'>{fileSize} </span>
              <span className={S.fileType} title='Тип файла'>{file_info.content_type}</span>
            </div>
          </div>
        </div>

        <div className={S.infoGrid}>
          <div className={S.infoItem}>
            <span className={S.infoLabel} title='Дата загрузки'>
              <Icon name='accessTime' size={24} /> {isMobile ? '' : 'Загружен'}
            </span>
            <span className={S.infoValue}>{uploadDate}</span>
          </div>

          <div className={S.infoItem}>
            <span className={S.infoLabel} title='Автор'>
              <Icon name='user' size={24} /> {isMobile ? '' : 'Автор'}
            </span>
            <span className={S.infoValue}>{created_by_username}</span>
          </div>

          <div className={S.infoItem}>
            <span className={S.infoLabel} title='Расшарен'>
              <Icon name='link' size={24} /> {isMobile ? '' : 'Расшарен'}
            </span>
            <span className={S.infoValue}>{shareDate}</span>
          </div>
          
          {file_info.comment && !isMobile && (
            <div className={S.infoItemFull}>
              <span className={S.infoLabel} title='Комментарий'>
                <Icon name='comment' size={24} /> Комментарий
              </span>
              <span className={S.infoValue}>{file_info.comment}</span>
            </div>
          )}
          
        </div>
        {isMobile ? (
            <div className={S.actions}>
            <button
              className={S.downloadButton}
              onClick={handleDownload}
              disabled={downloading}
              title='Скачать файл'
            >
              <Icon name='download'/>
            </button>

            <button
              className={S.copyButton}
              onClick={async () => handleCopyLink(window.location.href)}
              title='Скопировать ссылку на файл'
            >
              {copied ? <Icon name='ok'/> : <Icon name='link'/>}
            </button>
          </div>
        ) : (
          
          <div className={S.actions}>
            
            <button
              className={S.downloadButton}
              onClick={handleDownload}
              disabled={downloading}
              title='Скачать файл'
            >
              {downloading ? (
                <>Скачивание...</>
              ) : (
                <>Скачать файл</>
              )}
            </button>

            <button
              className={S.copyButton}
              onClick={async () => handleCopyLink(window.location.href)}
              title='Скопировать ссылку на файл'
            >
              {copied ? 'Скопировано!' : 'Копировать ссылку'}
            </button>
          </div>
        )}
            
        {isImage && previewUrl && (
          <div className={S.preview}>
            <img
              src={previewUrl}
              alt={file_info.original_name}
              className={S.previewImage}
            />
          </div>
        )}

        <div className={S.footer}>
          <p className={S.disclaimer}>
            Файл доступен по ссылке. Не передавайте её посторонним.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SharedFilePage;