import React from 'react';
import styles from './Modals.module.css';
import type { DeleteConfirmModalProps } from '../../types';

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  itemName 
}) => {
  if (!isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      onConfirm();
    }
  };
  
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div 
        className={`${styles.modal} ${styles.confirmModal}`} 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className={styles.modalHeader}>
          <h3>Подтверждение удаления</h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.warningIcon}>⚠️</div>
          <p className={styles.confirmText}>
            Вы действительно хотите удалить <strong>"{itemName}"</strong>?
          </p>
          <p className={styles.warningText}>
            Это действие нельзя будет отменить.
          </p>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Отмена
          </button>
          <button className={styles.deleteButton} onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;