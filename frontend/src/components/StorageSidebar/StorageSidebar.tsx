import React from 'react';
import S from './StorageSidebar.module.css';
import type { StorageInfo, UserDetail } from '../../types';
import { formatAvgSize } from '../../utils/formatNumber';

interface StorageSidebarProps {
  storageInfo?: StorageInfo | null;
  user?: UserDetail | null;
  foldersCount?: number;
  filesCount?: number;
  className?: string;
}

const StorageSidebar: React.FC<StorageSidebarProps> = ({
  storageInfo,
  user,
  className = '',
}) => {


  // Расчет процента использования
  const totalSpace = 1073741824; // 1GB в байтах
  const usedSpace = storageInfo?.statistics?.total_size || 0;
  const usedPercentage = Math.min((usedSpace / totalSpace) * 100, 100);

  return (
    <aside className={`${S.sidebar} ${className}`}>
      {/* Заголовок */}
      <div className={S.header}>
        <h3 className={S.title}>Хранилище</h3>
        {user && (
          <div className={S.userBadge}>
            <span className={S.userAvatar}>
              {user.first_name?.[0] || user.username[0]}
            </span>
            <span className={S.userName}>{user.first_name || user.username}</span>
          </div>
        )}
      </div>

      {/* Индикатор использования */}
      <div className={S.usageSection}>
        <div className={S.usageHeader}>
          <span className={S.usageTitle}>Использовано диска</span>
          <span className={S.usageValue}>
            {storageInfo?.statistics?.used_space?.human_readable || '0 Б'} / 1 ГБ
          </span>
        </div>
        <div className={S.progressBar}>
          <div
            className={`${S.progressFill} ${usedPercentage > 90 ? S.warning : ''} ${usedPercentage > 95 ? S.danger : ''}`}
            style={{ width: `${usedPercentage}%` }}
          />
        </div>
        <div className={S.usageDetails}>
          <span>Свободно: {formatAvgSize(totalSpace - usedSpace)}</span>
          <span>{usedPercentage.toFixed(1)}%</span>
        </div>
      </div>
    </aside>
  );
};

export default StorageSidebar;