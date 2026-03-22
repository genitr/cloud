// components/Modals/RenameFileModal.tsx
import React, { useState, useEffect } from 'react';
import styles from './Modals.module.css';
import type { FileListItem } from '../../types';

interface RenameFileModalProps {
  isOpen: boolean;
  onClose: () => void;
  file: FileListItem | null;
  onRename: (newName: string, newComment?: string) => Promise<void>;
}

const RenameFileModal: React.FC<RenameFileModalProps> = ({
  isOpen,
  onClose,
  file,
  onRename
}) => {
  const [newName, setNewName] = useState('');
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (file && isOpen) {
      // Получаем имя файла без расширения
      const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
      setNewName(nameWithoutExt);
      setNewComment(file.comment || '');
      setError('');
    }
  }, [file, isOpen]);

  const handleSave = async () => {
    if (!newName.trim() || newName === file?.name.replace(/\.[^/.]+$/, "")) {
      // Если имя не изменилось, но комментарий изменился - сохраняем комментарий
      if (newComment !== file?.comment) {
        setLoading(true);
        try {
          await onRename(file!.name, newComment);
          onClose();
        } catch (error) {
          setError('Ошибка при сохранении комментария: ' + error);
        } finally {
          setLoading(false);
        }
      } else {
        onClose();
      }
      return;
    }
    
    // Сохраняем расширение файла
    const extension = file?.name.substring(file.name.lastIndexOf('.'));
    const fullName = newName.trim() + (extension || '');
    
    setLoading(true);
    setError('');
    try {
      await onRename(fullName, newComment);
      onClose();
    } catch (err) {
      setError('Ошибка при сохранении');
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen || !file) return null;

  const extension = file.name.substring(file.name.lastIndexOf('.'));

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modal} ${styles.renameModal}`} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3>Редактировать файл</h3>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>
        
        <div className={styles.modalContent}>
          <div className={styles.fileInfo}>
            <div className={styles.fileIcon}>📄</div>
            <div className={styles.fileDetails}>
              <div className={styles.fileName}>{file.name}</div>
            </div>
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>✏️</span>
              Имя файла
            </label>
            <div className={styles.nameInputWrapper}>
              <input
                type="text"
                className={styles.nameInput}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                disabled={loading}
                placeholder="Введите новое имя"
              />
              <span className={styles.extension}>{extension}</span>
            </div>
            <p className={styles.hint}>
              Расширение файла {extension} сохранится автоматически
            </p>
          </div>
          
          <div className={styles.inputGroup}>
            <label className={styles.label}>
              <span className={styles.labelIcon}>💬</span>
              Комментарий
            </label>
            <textarea
              className={styles.commentInput}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
              }}
              disabled={loading}
              placeholder="Добавьте комментарий к файлу..."
              rows={3}
            />
            <p className={styles.hint}>
              Комментарий будет виден при просмотре файла
            </p>
          </div>
          
          {error && <div className={styles.errorMessage}>{error}</div>}
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose} disabled={loading}>
            Отмена
          </button>
          <button 
            className={styles.saveButton} 
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RenameFileModal;