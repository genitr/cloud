import React, { useState } from 'react';
import S from './Modals.module.css';
import type { ShareModalProps } from '../../types';
import Icon from '../ui/Icon/Icon';
import { copyToClipboard } from '../../utils/clipboard';

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
    const success = await copyToClipboard(url);

    if (success) {
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } else {
      console.error('Failed to copy');
      alert(`Не удалось скопировать. Скопируйте ссылку вручную:\n${url}`);
    }
  };

  const handleTestLink = (url: string) => {
    window.open(url, '_blank');
  };


  return (
    <div className={S.modalOverlay} onClick={onClose}>
      <div
        className={`${S.modal} ${S.shareModal}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={S.modalHeader}>
          <h3>Поделиться файлом</h3>
          <button
            className={S.closeButton}
            title='Закрыть окно'
            onClick={onClose}>✕</button>
        </div>

        <div className={S.modalContent}>
          <div className={S.fileInfo}>
            <div className={S.fileIcon}><Icon name='file' size={32} /></div>
            <div className={S.fileDetails}>
              <div className={S.fileName}>{itemName}</div>
            </div>
          </div>

          {/* Ссылка для скачивания */}
          <div className={S.linkSection}>
            <div className={S.linkLabel}>
              <span className={S.linkIcon}><Icon name='download' size={16} /></span>
              Ссылка для скачивания:
            </div>
            <div className={S.linkBox}>
              <input
                type="text"
                readOnly
                value={shareUrl || ''}
                className={S.linkInput}
                onClick={(e) => e.currentTarget.select()}
              />
              <button
                className={`${S.copyButton} ${copied === 'download' ? S.copied : ''}`}
                onClick={() => handleCopyLink(shareUrl || '', 'download')}
                title="Копировать ссылку"
              >
                {copied === 'download' ? <Icon name='linkCopied' /> : <Icon name='linkCopy' />}
              </button>
              <button
                className={S.testButton}
                onClick={() => handleTestLink(shareUrl || '')}
                title="Открыть в новой вкладке"
              >
                <Icon name='link' />
              </button>
            </div>
            <div className={S.linkHint}>
              Прямая ссылка на скачивание файла
            </div>
          </div>

          {/* Ссылка для просмотра информации */}
          {viewUrl && (
            <div className={S.linkSection}>
              <div className={S.linkLabel}>
                <span className={S.linkIcon}><Icon name='eye' size={18} /></span>
                Ссылка для просмотра:
              </div>
              <div className={S.linkBox}>
                <input
                  type="text"
                  readOnly
                  value={viewUrl}
                  className={S.linkInput}
                  onClick={(e) => e.currentTarget.select()}
                />
                <button
                  className={`${S.copyButton} ${copied === 'view' ? S.copied : ''}`}
                  onClick={() => handleCopyLink(viewUrl, 'view')}
                  title="Копировать ссылку"
                >
                  {copied === 'view' ? <Icon name='linkCopied' /> : <Icon name='linkCopy' />}
                </button>
                <button
                  className={S.testButton}
                  onClick={() => handleTestLink(viewUrl)}
                  title="Открыть в новой вкладке"
                >
                  <Icon name='link' />
                </button>
              </div>
              <div className={S.linkHint}>
                Страница с информацией о файле
              </div>
            </div>
          )}
        </div>

        <div className={S.modalFooter}>
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

export default ShareModal;