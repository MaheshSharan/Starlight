import React from 'react';
import { cn } from '../../utils/cn.utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  textClassName?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  className, 
  size = 'md', 
  showText = true,
  textClassName 
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl'
  };

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      {/* Logo SVG */}
      <div className={cn(sizeClasses[size], 'flex-shrink-0')}>
        <svg viewBox="0 0 192 192" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Primary color background with rounded corners */}
          <rect width="192" height="192" rx="24" ry="24" fill="#ef4444"/>
          
          {/* Google Play icon centered and white */}
          <g transform="translate(24, 24) scale(2.25, 2.25)" fill="white">
            <path d="M37.289,28.973l7.139,-7.313l-29.027,-15.335c-0.701,-0.37 -1.451,-0.427 -2.131,-0.253zM11.084,8.284c-0.051,0.221 -0.084,0.452 -0.084,0.694v46.044c0,0.272 0.036,0.531 0.101,0.777l22.911,-23.469zM37.248,35.723l-23.893,22.226c0.657,0.147 1.374,0.081 2.046,-0.274l28.447,-15.029zM58.979,29.347l-9.489,-5.013l-8.638,8.036l8.003,7.631l10.124,-5.349c2.132,-1.126 2.132,-4.178 0,-5.305z"/>
          </g>
        </svg>
      </div>
      
      {/* Brand Text */}
      {showText && (
        <span className={cn(
          'font-bold text-white',
          textSizeClasses[size],
          textClassName
        )}>
          Starlight
        </span>
      )}
    </div>
  );
};

export default Logo;