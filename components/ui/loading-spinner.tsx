import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  text?: string;
  className?: string;
}

export function LoadingSpinner({
  size = 'md',
  showText = true,
  text = 'AI가 콘텐츠 생성 중',
  className
}: LoadingSpinnerProps) {
  // 사이즈별 설정
  const sizeConfig = {
    sm: {
      wrapper: 'w-4 h-4',
      border: 'border-2',
      icon: 'w-2 h-2',
      text: 'text-xs'
    },
    md: {
      wrapper: 'w-6 h-6',
      border: 'border-2',
      icon: 'w-3 h-3',
      text: 'text-sm'
    },
    lg: {
      wrapper: 'w-12 h-12',
      border: 'border-3',
      icon: 'w-6 h-6',
      text: 'text-base'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="flex items-center space-x-2">
        <div className={cn('relative', config.wrapper)}>
          {/* 외부 원 */}
          <div className={cn('absolute inset-0 rounded-full', config.border, 'border-[#ff68b4] border-opacity-15')}></div>
          
          {/* 회전하는 원 */}
          <div className={cn('absolute inset-0 rounded-full', config.border, 'border-transparent border-t-[#ff68b4] animate-spin')}></div>
          
          {/* 중앙 아이콘 */}
          {size === 'lg' && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <Sparkles className={cn(config.icon, 'text-[#ff68b4] animate-pulse')} />
            </div>
          )}
        </div>
        
        {showText && (
          <span className={cn(config.text, 'font-medium text-gray-700')}>{text}</span>
        )}
      </div>
    </div>
  );
}

export function FullPageLoader() {
  return (
    <div className="flex flex-col items-center justify-center w-full py-16 px-4">
      <div className="relative w-20 h-20 mb-6">
        <div className="absolute inset-0 rounded-full border-4 border-[#ff68b4] border-opacity-10"></div>
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ff68b4] animate-spin"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Sparkles className="w-8 h-8 text-[#ff68b4] animate-pulse" />
        </div>
      </div>
      <h3 className="text-lg font-medium text-gray-800 mb-2">AI가 놀라운 상세페이지를 만들고 있어요</h3>
      <p className="text-sm text-gray-500 text-center max-w-xs">
        창의적인 아이디어를 정리하고 멋진 콘텐츠를 생성하는 중이에요. 잠시만 기다려주세요.
      </p>
    </div>
  );
}
