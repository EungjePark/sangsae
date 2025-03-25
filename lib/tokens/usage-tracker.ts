import { TokenUsage } from '@/types/product';

// 토큰 사용량 로컬 스토리지 키
const TOKEN_USAGE_KEY = 'gemini-token-usage';

// 토큰당 비용 (달러)
const TOKEN_COST = {
  input: 0.000125 / 1000,   // 입력 토큰 1,000개당 $0.000125
  output: 0.000375 / 1000,  // 출력 토큰 1,000개당 $0.000375
};

// 전체 토큰 사용량 조회
export function getTokenUsage(): TokenUsage[] {
  if (typeof window === 'undefined') {
    return [];
  }
  
  const usageStr = localStorage.getItem(TOKEN_USAGE_KEY);
  if (!usageStr) {
    return [];
  }
  
  try {
    return JSON.parse(usageStr) as TokenUsage[];
  } catch (e) {
    console.error('Failed to parse token usage:', e);
    return [];
  }
}

// 토큰 사용량 기록
export function recordTokenUsage(inputTokens: number, outputTokens: number): void {
  if (typeof window === 'undefined') {
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const cost = (inputTokens * TOKEN_COST.input) + (outputTokens * TOKEN_COST.output);
  
  const usage = getTokenUsage();
  
  // 오늘 날짜의 기존 사용량 찾기
  const todayIndex = usage.findIndex(item => item.date === today);
  
  if (todayIndex >= 0) {
    // 기존 사용량에 추가
    usage[todayIndex].inputTokens += inputTokens;
    usage[todayIndex].outputTokens += outputTokens;
    usage[todayIndex].cost += cost;
  } else {
    // 새 사용량 항목 추가
    usage.push({
      date: today,
      inputTokens,
      outputTokens,
      cost
    });
  }
  
  // 최신 데이터가 앞에 오도록 정렬
  usage.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  // 최대 30일까지만 보관
  const limitedUsage = usage.slice(0, 30);
  
  // 로컬 스토리지에 저장
  localStorage.setItem(TOKEN_USAGE_KEY, JSON.stringify(limitedUsage));
}

// 오늘의 토큰 사용량 조회
export function getTodayTokenUsage(): TokenUsage {
  const today = new Date().toISOString().split('T')[0];
  const usage = getTokenUsage();
  
  const todayUsage = usage.find(item => item.date === today);
  
  if (!todayUsage) {
    return {
      date: today,
      inputTokens: 0,
      outputTokens: 0,
      cost: 0
    };
  }
  
  return todayUsage;
}

// 텍스트의 대략적인 토큰 수 추정
export function estimateTokenCount(text: string): number {
  if (!text) return 0;
  
  // 한글은 대략 토큰당 1-2자, 영어는 토큰당 4자 정도로 계산
  // 혼합된 텍스트를 위한 단순 추정식
  const koreanCharCount = (text.match(/[가-힣]/g) || []).length;
  const otherCharCount = text.length - koreanCharCount;
  
  // 한글은 문자당 약 0.7 토큰, 영어 및 기타 문자는 0.25 토큰으로 대략 계산
  return Math.ceil((koreanCharCount * 0.7) + (otherCharCount * 0.25));
} 