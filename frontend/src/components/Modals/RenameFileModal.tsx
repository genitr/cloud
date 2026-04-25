import React, { useState, useEffect } from 'react';
import S from './Modals.module.css';
import type { FileListItem } from '../../types';
import Icon from '../ui/Icon/Icon';

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
    <div className={S.modalOverlay} onClick={onClose}>
      <div className={`${S.modal} ${S.renameModal}`} onClick={(e) => e.stopPropagation()}>
        <div className={S.modalHeader}>
          <h3>Редактировать файл</h3>
          <button
            className={S.closeButton}
            title='Закрыть окно'
            onClick={onClose}>✕</button>
        </div>

        <div className={S.modalContent}>
          <div className={S.fileInfo}>
            <div className={S.fileIcon}><Icon name='file' size={32} /></div>
            <div className={S.fileDetails}>
              <div className={S.fileName}>{file.name}</div>
            </div>
          </div>

          <div className={S.inputGroup}>
            <label className={S.label}>
              <span className={S.labelIcon}><Icon name='pencil' size={16} /></span>
              Имя файла
            </label>
            <div className={S.nameInputWrapper}>
              <input
                type="text"
                className={S.nameInput}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                disabled={loading}
                placeholder="Введите новое имя"
              />
              <span className={S.extension}>{extension}</span>
            </div>
            <p className={S.hint}>
              Расширение файла {extension} сохранится автоматически
            </p>
          </div>

          <div className={S.inputGroup}>
            <label className={S.label}>
              <span className={S.labelIcon}><Icon name='comment' size={16} /></span>
              Комментарий
            </label>
            <textarea
              className={S.commentInput}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
              }}
              disabled={loading}
              placeholder="Добавьте комментарий к файлу..."
              rows={3}
            />
            <p className={S.hint}>
              Комментарий будет виден при просмотре файла
            </p>
          </div>

          {error && <div className={S.errorMessage}>{error}</div>}
        </div>

        <div className={S.modalFooter}>
          <button
            className={S.cancelButton}
            title='Отменить изменения'
            onClick={onClose} disabled={loading}>
            Отмена
          </button>
          <button
            className={S.saveButton}
            title='Сохранить изменения'
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