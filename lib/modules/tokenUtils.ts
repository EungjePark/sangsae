export interface TokenInfo {
  remaining: number;
  resetTime: string;
}

// 서버에서 남은 토큰 수를 가져오는 함수
export const getTokensRemaining = async (): Promise<number> => {
  try {
    const response = await fetch('/api/tokens/remaining');
    if (!response.ok) {
      // API가 존재하지 않거나 오류가 발생한 경우 기본값 반환
      return 400000; // 기본값으로 400,000 제공
    }
    const data = await response.json();
    return data.remaining;
  } catch (error) {
    console.error('토큰 정보를 가져오는 중 오류 발생:', error);
    return 400000; // 오류 발생 시 기본값 반환
  }
};

// 토큰 리셋 시간을 가져오는 함수
export const getResetTime = async (): Promise<string> => {
  try {
    const response = await fetch('/api/tokens/reset-time');
    if (!response.ok) {
      // API가 존재하지 않거나 오류가 발생한 경우 기본값 반환
      // 현재 시간에서 24시간 후로 설정
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow.toISOString();
    }
    const data = await response.json();
    return data.resetTime;
  } catch (error) {
    console.error('토큰 리셋 시간을 가져오는 중 오류 발생:', error);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString();
  }
}; 