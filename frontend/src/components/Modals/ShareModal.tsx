import React, { useState } from 'react';
import styles from './Modals.module.css';
import type { ShareModalProps } from '../../types';
import Icon from '../ui/Icon/Icon';

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  itemName,
  shareUrl,
  viewUrl,
}) => {
  const [copied, setCopied] = useState<'download' | 'view' | null>(null);
  
  if (!isOpen) return null;
  
  const handleCopyLink = async (url: string, type: 'download' | 'view') => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleTestLink = (url: string) => {
    window.open(url, '_blank');
  };


  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.modal} ${styles.shareModal}`} 
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalHeader}>
          <h3>Поделиться файлом</h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.fileInfo}>
            <div className={styles.fileIcon}><Icon name='file' size={24} /></div>
            <div className={styles.fileDetails}>
              <div className={styles.fileName}>{itemName}</div>
            </div>
          </div>

          {/* Ссылка для скачивания */}
          <div className={styles.linkSection}>
            <div className={styles.linkLabel}>
              <span className={styles.linkIcon}><Icon name='download' size={16} /></span>
              Ссылка для скачивания:
            </div>
            <div className={styles.linkBox}>
              <input 
                type="text" 
                readOnly 
                value={shareUrl || ''}
                className={styles.linkInput}
                onClick={(e) => e.currentTarget.select()}
              />
              <button 
                className={`${styles.copyButton} ${copied === 'download' ? styles.copied : ''}`} 
                onClick={() => handleCopyLink(shareUrl || '', 'download')}
                title="Копировать ссылку"
              >
                {copied === 'download' ? '✓' : <Icon name='clipboard' size={20} />}
              </button>
              <button 
                className={styles.testButton}
                onClick={() => handleTestLink(shareUrl || '')}
                title="Открыть в новой вкладке"
              >
                <Icon name='link' size={16} />
              </button>
            </div>
            <div className={styles.linkHint}>
              Прямая ссылка на скачивание файла
            </div>
          </div>

          {/* Ссылка для просмотра информации */}
          {viewUrl && (
            <div className={styles.linkSection}>
              <div className={styles.linkLabel}>
                <span className={styles.linkIcon}><Icon name='eye' size={18} /></span>
                Ссылка для просмотра:
              </div>
              <div className={styles.linkBox}>
                <input 
                  type="text" 
                  readOnly 
                  value={viewUrl}
                  className={styles.linkInput}
                  onClick={(e) => e.currentTarget.select()}
                />
                <button 
                  className={`${styles.copyButton} ${copied === 'view' ? styles.copied : ''}`} 
                  onClick={() => handleCopyLink(viewUrl, 'view')}
                  title="Копировать ссылку"
                >
                  {copied === 'view' ? '✓' : <Icon name='clipboard' size={20} />}
                </button>
                <button 
                  className={styles.testButton}
                  onClick={() => handleTestLink(viewUrl)}
                  title="Открыть в новой вкладке"
                >
                  <Icon name='link' size={16} />
                </button>
              </div>
              <div className={styles.linkHint}>
                Страница с информацией о файле
              </div>
            </div>
          )}
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.closeButton} onClick={onClose}>
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;