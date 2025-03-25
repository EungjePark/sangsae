import React, { ReactNode, useState } from 'react';

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible && (
        <div
          className="absolute z-10 px-2 py-1 text-xs text-white bg-gray-800 rounded shadow-lg bottom-full left-1/2 transform -translate-x-1/2 -translate-y-1 mb-1"
          style={{ 
            minWidth: '150px',
            maxWidth: '300px'
          }}
        >
          {content}
          <div
            className="absolute w-2 h-2 bg-gray-800 transform rotate-45 left-1/2 -translate-x-1/2 -bottom-1"
          ></div>
        </div>
      )}
    </div>
  );
}

export const TooltipProvider = ({ children }: { children: ReactNode }) => children;
export const TooltipTrigger = ({ children }: { children: ReactNode }) => children;
export const TooltipContent = ({ children }: { children: ReactNode }) => children; 