import React from 'react';
import S from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
  fullScreen?: boolean;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  text = 'Загрузка...',
  fullScreen = false
}) => {
  const spinnerSize = {
    small: 'spinner-sm',
    medium: 'spinner',
    large: 'spinner-lg'
  };

  const content = (
    <div className={S.container}>
      <div className={S[spinnerSize[size]]}></div>
      {text && <p className={S.text}>{text}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className={S.fullScreen}>{content}</div>;
  }

  return content;
};

export default LoadingSpinner;