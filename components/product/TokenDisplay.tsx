import React from 'react';
import { TokenInfo } from '@/lib/modules/tokenUtils';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

interface TokenDisplayProps {
  tokenInfo: TokenInfo | null;
}

const TokenDisplay: React.FC<TokenDisplayProps> = ({ tokenInfo }) => {
  if (!tokenInfo) return null;

  const { remaining, resetTime } = tokenInfo;
  const totalTokens = 500000; // 예시값, 실제 토큰 한도에 맞게 조정
  const usedTokens = totalTokens - remaining;
  const percentage = Math.round((remaining / totalTokens) * 100);
  
  // resetTime을 읽기 쉬운 형식으로 변환
  const formatResetTime = (resetTime: string) => {
    try {
      const resetDate = new Date(resetTime);
      return resetDate.toLocaleString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return '불명';
    }
  };

  // 퍼센트에 따른 색상 설정
  const getColorByPercentage = (percent: number) => {
    if (percent > 70) return '#10b981'; // 녹색
    if (percent > 30) return '#f59e0b'; // 주황색
    return '#ef4444'; // 빨간색
  };

  const color = getColorByPercentage(percentage);

  return (
    <div className="mt-6 p-4 bg-white border border-gray-100 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium mb-4">API 토큰 사용량</h3>
      
      <div className="flex items-center">
        <div className="w-16 h-16 mr-4">
          <CircularProgressbar
            value={percentage}
            text={`${percentage}%`}
            styles={buildStyles({
              textSize: '1.5rem',
              pathColor: color,
              textColor: color,
              trailColor: '#f1f5f9'
            })}
          />
        </div>
        
        <div className="flex-1">
          <div className="mb-1">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">사용 가능 토큰</span>
              <span className="font-medium">{remaining.toLocaleString()}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="h-2 rounded-full" 
                style={{ 
                  width: `${percentage}%`, 
                  backgroundColor: color 
                }}
              />
            </div>
          </div>
          
          <div className="text-xs text-gray-500">
            토큰 리셋 시간: {formatResetTime(resetTime)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenDisplay; 