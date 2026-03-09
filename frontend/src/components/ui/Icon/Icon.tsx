import React, { forwardRef } from 'react';
import type { CSSProperties } from 'react';

// Импортируем все иконки
import * as Icons from '../../icons';
import type { IconProps, IconName } from '../../../types'

// Карта иконок с типизацией
interface IconComponentsMap {
  // Основные
  'home': typeof Icons.Home;

  [key: string]: React.ComponentType<React.SVGAttributes<SVGElement>>;
}

// Карта иконок
const iconComponents: IconComponentsMap = {
  // Основные
  'home': Icons.Home,
};

// Список всех доступных иконок (для отладки)
const availableIcons: IconName[] = Object.keys(iconComponents);

// Типизация для ref
type IconRef = HTMLSpanElement;

const Icon = forwardRef<IconRef, IconProps>(function Icon(props, ref) {
  const {
    name,
    size = 24,
    color,
    className = '',
    style,
    onClick,
    spin = false,
    rotate,
    flip,
    title,
    disabled = false,
    ...svgProps
  } = props;

  // Получаем компонент иконки по имени
  const IconComponent = iconComponents[name as IconName];

  // Если иконка не найдена
  if (!IconComponent) {
    console.warn(
      `Иконка "${name}" не найдена. Доступные иконки:`,
      availableIcons.join(', ')
    );
    
    return (
      <span
        className={`icon-not-found ${className}`}
        style={{
          display: 'inline-flex',
          width: size,
          height: size,
          backgroundColor: '#f0f0f0',
          borderRadius: '4px',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#999',
          fontSize: Math.max(size / 2, 10),
          ...style,
        }}
        title={`Иконка "${name}" не найдена`}
      >
        ?
      </span>
    );
  }

  // Стили для враппера
  const wrapperStyle: CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: size,
    height: size,
    cursor: onClick && !disabled ? 'pointer' : 'default',
    opacity: disabled ? 0.5 : 1,
    userSelect: 'none',
    ...style,
  };

  // Трансформации
  if (rotate) {
    wrapperStyle.transform = `rotate(${rotate}deg)`;
  }
  
  if (flip === 'horizontal') {
    wrapperStyle.transform = 'scaleX(-1)';
  } else if (flip === 'vertical') {
    wrapperStyle.transform = 'scaleY(-1)';
  }

  // Анимация спин
  if (spin) {
    wrapperStyle.animation = 'icon-spin 1s linear infinite';
    
    // Добавляем стили для анимации
    if (!document.getElementById('icon-spin-styles')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'icon-spin-styles';
      styleTag.innerHTML = `
        @keyframes icon-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styleTag);
    }
  }

  const wrapperClassName = `icon icon-${name} ${spin ? 'icon-spin' : ''} ${className}`;

  return (
    <span
      ref={ref}
      className={wrapperClassName}
      style={wrapperStyle}
      onClick={!disabled ? onClick : undefined}
      title={title}
      role={onClick ? 'button' : 'img'}
      aria-label={title || `Иконка ${name}`}
      aria-disabled={disabled}
      tabIndex={onClick && !disabled ? 0 : undefined}
    >
      <IconComponent
        width="100%"
        height="100%"
        color={color}
        onClick={undefined}
        {...svgProps}
      />
    </span>
  );
});

Icon.displayName = 'Icon';
export default Icon;