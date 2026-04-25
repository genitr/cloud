import React from 'react';
import S from './Skeleton.module.css';

const SkeletonFileList: React.FC = () => {
  return (
    <div className={S.skeletonFileList}>
      {/* Заголовок */}
      <div className={S.skeletonHeader}>
        <div className={S.skeletonLine}></div>
        <div className={S.skeletonLineShort}></div>
        <div className={S.skeletonLineShort}></div>
        <div className={S.skeletonLineShort}></div>
      </div>

      {/* Строки файлов */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className={S.skeletonRow}>
          <div className={S.skeletonIcon}></div>
          <div className={S.skeletonInfo}>
            <div className={S.skeletonName}></div>
            <div className={S.skeletonMeta}></div>
          </div>
          <div className={S.skeletonActions}>
            <div className={S.skeletonButton}></div>
            <div className={S.skeletonButton}></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default SkeletonFileList;