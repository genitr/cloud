import iconMap from '../../icons';

type IconName = keyof typeof iconMap;

interface IconProps extends React.SVGProps<SVGSVGElement> {
  name: IconName;
  size?: number;
  color?: string;
}

const Icon: React.FC<IconProps> = ({ 
  name, 
  size = 24, 
  color, 
  className, 
  ...props 
}) => {
  const IconComponent = iconMap[name];
  
  if (!IconComponent) {
    console.warn(`Иконка "${name}" не найдена`);
    return null;
  }
  
  return (
    <IconComponent
      width={size}
      height={size}
      fill={color}
      className={className}
      {...props}
    />
  );
};

export default Icon;