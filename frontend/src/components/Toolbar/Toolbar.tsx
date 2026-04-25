import React from 'react';
import { useMediaQuery } from 'react-responsive';

import S from './Toolbar.module.css';
import Breadcrumbs from '../Breadcrumbs/Breadcrumbs';
import Icon from '../ui/Icon/Icon';

interface ToolbarProps {
    onUpload: () => void;
    onCreateFolder: () => void;
    breadcrumbsPath: string[];
    handleBreadcrumbClick?: (index: number) => void;
}

const Toolbar: React.FC<ToolbarProps> = ({
    onUpload,
    onCreateFolder,
    breadcrumbsPath = [],
    handleBreadcrumbClick
}) => {
    const isMobile = useMediaQuery({ maxWidth: 640 });

    return (
        <div className={S.toolbar}>
            <div className={S.leftButtons}>
                {/* Хлебные крошки */}
                <Breadcrumbs 
                    path={breadcrumbsPath} 
                    onCrumbClick={handleBreadcrumbClick}
                />
            </div>

            <div className={S.rightButtons}>
                <button className={S.primaryButton} onClick={onUpload} title='Загрузить новый файл'>
                    {isMobile ? <Icon name='newFile' size={34}/> : 'Загрузить файл'}
                </button>
                <button className={S.secondaryButton} onClick={onCreateFolder} title='Создать новую папку'>
                    {isMobile ? <Icon name='newFolder' size={34}/> : 'Создать папку'}
                </button>
            </div>
        </div>
    );
};

export default Toolbar;