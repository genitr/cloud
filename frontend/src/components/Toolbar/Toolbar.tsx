import React from 'react';
import S from './Toolbar.module.css';

interface ToolbarProps {
    onUpload: () => void;
    onCreateFolder: () => void;
    onNavigateUp?: () => void;
    showNavigateUp?: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
    onUpload,
    onCreateFolder,
    onNavigateUp,
    showNavigateUp = false,
}) => {
    return (
        <div className={S.toolbar}>
            <div className={S.leftButtons}>
                {showNavigateUp && (
                    <button 
                        className={S.navButton} 
                        onClick={onNavigateUp}
                        title="На уровень вверх"
                    >
                        ⬆️ Наверх
                    </button>
                )}
            </div>
            <div className={S.rightButtons}>
                <button className={S.primaryButton} onClick={onUpload}>
                    ⬆️ Загрузить файл
                </button>
                <button className={S.secondaryButton} onClick={onCreateFolder}>
                    📁 Создать папку
                </button>
            </div>
        </div>
    );
};

export default Toolbar;