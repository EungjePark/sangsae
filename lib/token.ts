// 토큰 관리 시스템

// 사용자 토큰 정보 타입
export interface TokenInfo {
  totalTokens: number;      // 총 부여된 토큰
  usedTokens: number;       // 사용한 토큰
  lastReset: number;        // 마지막 리셋 시간 (timestamp)
}

// 기본 토큰 설정
const DEFAULT_TOKENS = 10;
const TOKEN_RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24시간 (밀리초)
const TOKEN_COST_PER_GENERATION = 1; // 한 번 생성에 사용되는 토큰 수

// 로컬 스토리지 키
const TOKEN_STORAGE_KEY = 'detailcraft_token_info';

// 사용자 토큰 정보 가져오기
export function getTokenInfo(): TokenInfo {
  if (typeof window === 'undefined') {
    return {
      totalTokens: DEFAULT_TOKENS,
      usedTokens: 0,
      lastReset: Date.now()
    };
  }

  const storedInfo = localStorage.getItem(TOKEN_STORAGE_KEY);
  
  if (!storedInfo) {
    const defaultInfo: TokenInfo = {
      totalTokens: DEFAULT_TOKENS,
      usedTokens: 0,
      lastReset: Date.now()
    };
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(defaultInfo));
    return defaultInfo;
  }

  const tokenInfo: TokenInfo = JSON.parse(storedInfo);
  
  // 일일 리셋 확인
  const now = Date.now();
  if (now - tokenInfo.lastReset > TOKEN_RESET_INTERVAL) {
    tokenInfo.usedTokens = 0;
    tokenInfo.lastReset = now;
    localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenInfo));
  }
  
  return tokenInfo;
}

// 토큰 사용
export function useToken(amount: number = TOKEN_COST_PER_GENERATION): boolean {
  if (typeof window === 'undefined') return true;
  
  const tokenInfo = getTokenInfo();
  const remainingTokens = tokenInfo.totalTokens - tokenInfo.usedTokens;
  
  if (remainingTokens < amount) {
    return false; // 토큰 부족
  }
  
  // 토큰 사용 후 저장
  tokenInfo.usedTokens += amount;
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenInfo));
  
  return true;
}

// 토큰 추가 (예: 결제 후)
export function addTokens(amount: number): TokenInfo {
  if (typeof window === 'undefined') {
    return {
      totalTokens: DEFAULT_TOKENS,
      usedTokens: 0,
      lastReset: Date.now()
    };
  }
  
  const tokenInfo = getTokenInfo();
  tokenInfo.totalTokens += amount;
  localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokenInfo));
  
  return tokenInfo;
}

// 남은 토큰 수 계산
export function getRemainingTokens(): number {
  const tokenInfo = getTokenInfo();
  return tokenInfo.totalTokens - tokenInfo.usedTokens;
}

// 다음 리셋까지 남은 시간 (시간 단위)
export function getHoursUntilReset(): number {
  if (typeof window === 'undefined') return 24;
  
  const tokenInfo = getTokenInfo();
  const now = Date.now();
  const elapsed = now - tokenInfo.lastReset;
  const remaining = TOKEN_RESET_INTERVAL - elapsed;
  
  return Math.max(0, Math.floor(remaining / (60 * 60 * 1000)));
}
