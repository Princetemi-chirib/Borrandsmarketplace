'use client';

import { RefreshCw } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  className?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  text, 
  fullScreen = false,
  className = '' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  };

  const spinner = (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <RefreshCw className={`${sizeClasses[size]} animate-spin text-brand-primary`} />
      {text && (
        <p className={`mt-3 text-gray-600 ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-lg' : 'text-sm'}`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        {spinner}
      </div>
    );
  }

  return spinner;
}
