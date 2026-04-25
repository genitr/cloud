import React from 'react';
import S from './Modals.module.css';
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
    <div className={S.modalOverlay} onClick={onClose}>
      <div 
        className={`${S.modal} ${S.confirmModal}`} 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className={S.modalHeader}>
          <h3>Подтверждение удаления</h3>
          <button 
            className={S.closeButton} 
            title='Закрыть окно' 
            onClick={onClose}>✕</button>
        </div>
        
        <div className={S.modalContent}>
          <p className={S.confirmText}>
            Вы действительно хотите удалить
          </p>
          <p className={S.confirmName}>
            <strong>"{itemName}"</strong> ?
          </p>
          
          <p className={S.warningText}>
            Это действие нельзя будет отменить.
          </p>
        </div>
        
        <div className={S.modalFooter}>
          <button 
            className={S.cancelButton} 
            title='Отменить удаление' 
            onClick={onClose}>
            Отмена
          </button>
          <button 
            className={S.deleteButton} 
            title='Удалить файл' 
            onClick={onConfirm}>
            Удалить
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;