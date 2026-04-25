import React, { useState } from 'react';
import S from './Modals.module.css';
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
    <div className={S.modalOverlay} onClick={onClose}>
      <div className={S.modal} onClick={(e) => e.stopPropagation()}>
        <div className={S.modalHeader}>
          <h3>Создать новую папку</h3>
          <button 
            className={S.closeButton} 
            title='Закрыть окно' 
            onClick={onClose}>✕</button>
        </div>
        
        <div className={S.modalContent}>
          <label className={S.label} htmlFor="folderName">Название папки</label>
          <input
            id="folderName"
            type="text"
            className={S.input}
            value={folderName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFolderName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите название папки"
            autoFocus
          />
        </div>
        
        <div className={S.modalFooter}>
          <button 
            className={S.cancelButton} 
            title='Отменить действие' 
            onClick={onClose}>
            Отмена
          </button>
          <button 
            className={S.createButton} 
            title='Создать новую папку' 
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