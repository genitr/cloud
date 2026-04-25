import S from './Modals.module.css'

const ConfirmActionModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onConfirm: () => void; 
  title: string; 
  message: string;
}) => {
  if (!isOpen) return null;

  return (
    <div className={S.modalOverlay} onClick={onClose}>
      <div className={S.modal} onClick={e => e.stopPropagation()}>
        <div className={S.modalHeader}>
          <h3>{title}</h3>
          <button 
            className={S.closeButton} 
            title='Закрыть окно' 
            onClick={onClose}>✕</button>
        </div>
        <div className={S.modalContent}>
          <p className={S.warningText}>{message}</p>
        </div>
        <div className={S.modalFooter}>
          <button 
            className={S.cancelButton} 
            title='Отменить действие' 
            onClick={onClose}>Отмена</button>
          <button 
            className={S.saveButton} 
            title='Подтвердить действие' 
            onClick={onConfirm}>Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmActionModal;