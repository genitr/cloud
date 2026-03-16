import React from 'react';
import S from './Breadcrumbs.module.css';

interface BreadcrumbsProps {
  path: string[];
  onCrumbClick?: (index: number) => void;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path = [], onCrumbClick }) => {
  return (
    <div className={S.breadcrumbs}>
      {path.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && <span className={S.separator}>/</span>}
          <button 
            className={S.crumb}
            onClick={() => onCrumbClick?.(index)}
          >
            {item}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumbs;