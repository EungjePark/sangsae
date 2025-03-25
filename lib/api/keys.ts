import { 
  GoogleGenerativeAI, 
  HarmCategory, 
  HarmBlockThreshold 
} from '@google/generative-ai';

// API 키 목록 및 현재 사용 중인 키 인덱스
const API_KEYS: string[] = [
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_2 || '',
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_3 || '',
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_4 || '',
  process.env.NEXT_PUBLIC_GEMINI_API_KEY_5 || '',
].filter(key => key.length > 0);

let currentKeyIndex = 0;

// 다음 유효한 API 키로 전환
export function rotateApiKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error('API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
  }

  currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
  return API_KEYS[currentKeyIndex];
}

// 현재 활성화된 API 키 반환
export function getCurrentApiKey(): string {
  if (API_KEYS.length === 0) {
    throw new Error('API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
  }
  
  return API_KEYS[currentKeyIndex];
}

// API 키의 총 개수 반환
export function getApiKeyCount(): number {
  return API_KEYS.length;
}

// Gemini API 인스턴스 생성
export function createGeminiApi() {
  const apiKey = getCurrentApiKey();
  
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
  }
  
  return new GoogleGenerativeAI(apiKey);
}

// 안전 설정 구성
export const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
]; 