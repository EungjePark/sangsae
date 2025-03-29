import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingIndicatorProps {
  progress: number;
  message: string;
}

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  progress,
  message
}) => {
  // Only render if progress is > 0 and < 100, or based on a specific loading flag if preferred
  // if (progress <= 0 || progress >= 100) return null; // Example condition

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-[2px]"> {/* Ensure high z-index */}
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-11/12 p-6 mx-auto animate-in fade-in zoom-in-95 duration-300"> {/* Use zoom-in-95 */}
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-[#fff8fb] mr-4"> {/* Brand color background */}
              <Loader2 className="h-7 w-7 text-[#ff68b4] animate-spin" /> {/* Brand color icon */}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{message}</h3>
              <p className="text-gray-500 text-sm">완료까지 잠시만 기다려주세요</p>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-2">
            <div
              className="bg-[#ff68b4] h-full rounded-full transition-all duration-300 ease-out" // Brand color progress
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }} // Ensure progress is within 0-100
            ></div>
          </div>
          {/* Progress Text */}
          <div className="flex justify-between text-sm text-gray-500">
            <span>생성 중...</span>
            <span className="font-medium">{Math.round(Math.max(0, Math.min(100, progress)))}%</span> {/* Display rounded percentage */}
          </div>
        </div>
      </div>
    </div>
  );
};
