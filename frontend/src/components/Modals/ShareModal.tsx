import React, { useState } from 'react';
import styles from './Modals.module.css';
import type { ShareModalProps, Permission } from '../../types';

const ShareModal: React.FC<ShareModalProps> = ({ 
  isOpen, 
  onClose, 
  onShare, 
  itemName 
}) => {
  const [email, setEmail] = useState('');
  const [permission, setPermission] = useState<Permission>('view');
  
  if (!isOpen) return null;
  
  const handleShare = () => {
    if (email.trim()) {
      onShare({ email, permission });
      setEmail('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter' && email.trim()) {
      handleShare();
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText('https://storage.example.com/share/abc123');

    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Поделиться "{itemName}"</h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.modalContent}>
          <label className={styles.label} htmlFor="shareEmail">Email получателя</label>
          <input
            id="shareEmail"
            type="email"
            className={styles.input}
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="user@example.com"
          />
          
          <label className={styles.label} htmlFor="permission">Права доступа</label>
          <select 
            id="permission"
            className={styles.select}
            value={permission}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => 
              setPermission(e.target.value as Permission)
            }
          >
            <option value="view">Только просмотр</option>
            <option value="edit">Редактирование</option>
            <option value="comment">Комментирование</option>
          </select>
          
          <div className={styles.linkSection}>
            <p className={styles.linkLabel}>Или скопируйте ссылку:</p>
            <div className={styles.linkBox}>
              <input 
                type="text" 
                readOnly 
                value="https://storage.example.com/share/abc123"
                className={styles.linkInput}
              />
              <button 
                className={styles.copyButton} 
                onClick={handleCopyLink}
                type="button"
              >
                📋
              </button>
            </div>
          </div>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Закрыть
          </button>
          <button 
            className={styles.shareButton} 
            onClick={handleShare}
            disabled={!email.trim()}
          >
            Отправить приглашение
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareModal;