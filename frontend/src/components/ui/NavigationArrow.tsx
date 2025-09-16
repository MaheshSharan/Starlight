import React from 'react';
import { cn } from '../../utils/cn.utils';

interface NavigationArrowProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
  className?: string;
}

const NavigationArrow: React.FC<NavigationArrowProps> = ({
  direction,
  onClick,
  disabled,
  className
}) => {
  const isLeft = direction === 'left';
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Base styles
        'absolute top-1/2 -translate-y-1/2 z-10',
        'w-12 h-12 rounded-full',
        'bg-black/70 hover:bg-black/90',
        'border border-gray-600 hover:border-gray-400',
        'flex items-center justify-center',
        'transition-all duration-200 ease-in-out',
        'focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-black',
        
        // Position
        isLeft ? 'left-2' : 'right-2',
        
        // Disabled state
        disabled && 'opacity-30 cursor-not-allowed hover:bg-black/70 hover:border-gray-600',
        
        // Hover effects
        !disabled && 'hover:scale-110 active:scale-95',
        
        className
      )}
      aria-label={`Scroll ${direction}`}
    >
      <svg
        className={cn(
          'w-6 h-6 text-white transition-transform duration-200',
          isLeft ? 'rotate-180' : ''
        )}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </button>
  );
};

export default NavigationArrow;