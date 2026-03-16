import React, { useState } from 'react';
import styles from './Modals.module.css';
import type { CreateFolderModalProps } from '../../types';

const CreateFolderModal: React.FC<CreateFolderModalProps> = ({ 
  isOpen, 
  onClose, 
  onCreate 
}) => {
  const [folderName, setFolderName] = useState('');
  
  if (!isOpen) return null;
  
  const handleCreate = () => {
    if (folderName.trim()) {
      onCreate(folderName);
      setFolderName('');
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && folderName.trim()) {
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Создать новую папку</h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.modalContent}>
          <label className={styles.label} htmlFor="folderName">Название папки</label>
          <input
            id="folderName"
            type="text"
            className={styles.input}
            value={folderName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите название папки"
            autoFocus
          />
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Отмена
          </button>
          <button 
            className={styles.createButton} 
            onClick={handleCreate}
            disabled={!folderName.trim()}
          >
            Создать
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateFolderModal;