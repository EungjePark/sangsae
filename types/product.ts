// 토큰 사용량 추적을 위한 인터페이스
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  date: string;
  cost: number;
}

// 섹션별 가중치 및 토큰 할당 설정
export interface SectionWeight {
  id: string;
  weight: number;  // 1-10 사이의 값, 높을수록 더 중요한 섹션
  minTokens?: number; // 최소 토큰 수
  maxTokens?: number; // 최대 토큰 수
}

// 토큰 제한 설정
export interface TokenLimits {
  totalMaxTokens: number;     // 전체 콘텐츠의 최대 토큰 수
  sectionMaxTokens: number;   // 개별 섹션의 최대 토큰 수 
  sectionMinTokens: number;   // 개별 섹션의 최소 토큰 수
}

// 콘텐츠 재생성 관련 설정
export interface RegenerationOptions {
  preserveStructure: boolean;  // 구조(섹션 ID) 유지 여부
  preserveContent: boolean;    // 기존 콘텐츠 일부 유지 여부
  regenerateOnlySection?: string; // 특정 섹션만 재생성 (ID)
  maxRetries: number;          // 최대 재시도 횟수
  contextFromPreviousContent: boolean; // 이전 콘텐츠의 맥락 사용 여부
}

// 상세페이지 섹션 타입 정의
export interface ProductDetailSection {
  id: string;
  title?: string;  // title을 선택적 속성으로 변경
  content: string;
}

// 제품 카테고리 타입 정의
export type ProductCategory = 
  | 'FASHION' 
  | 'BEAUTY' 
  | 'FOOD' 
  | 'HOME_LIVING' 
  | 'ELECTRONICS' 
  | 'SPORTS' 
  | 'BABY' 
  | 'PET' 
  | 'BOOKS' 
  | 'STATIONERY' 
  | 'TOYS' 
  | 'HEALTH' 
  | 'KITCHEN' 
  | 'OTHER';

// 시장 경쟁 수준 타입
export type MarketCompetitionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// 상품 데이터 인터페이스
export interface ProductData {
  name: string;
  price?: string;  // 가격을 선택적 필드로 변경
  features?: string;
  description?: string;
  category: ProductCategory;
  additionalInfo?: string;
  keywords?: string[];
  // 배송 및 정책 정보
  shippingInfo?: string;         // 배송 정보
  returnPolicy?: string;         // 반품/교환 정책
  deliveryPolicy?: string;       // 배송 정책 (기존 필드 유지)
  // 제품 설명 세분화 필드
  targetAudience?: string;       // 타겟 고객층
  usageTips?: string;            // 사용 팁
  materialInfo?: string;         // 소재/재질 정보
  sizeInfo?: string;             // 크기/치수 정보
  mainBenefits?: string;         // 주요 혜택/효과
  differentiation?: string;      // 차별화 포인트
  // SEO 관련
  // keywords?: string[];             // SEO 키워드 (배열) - 이미 위에 정의됨
  // 인증 및 리뷰
  certifications?: string;       // 인증/검증 정보
  reviewContent?: string;        // 리뷰 내용
  // 마케팅 관련
  competitionLevel?: string;     // 경쟁 수준
  // 페이지 구조 정보
  pageStructure?: {
    structure: Array<{
      section: string;
      description: string;
      elements: string[];
    }>;
    style: {
      tone: string;
      writing: string;
      emphasis: string;
    }
  }
}

// 생성된 콘텐츠 인터페이스
export interface ProductDetailContent {
  productName: string;
  productCategory: string;
  productDescription: string;
  keywords?: string[];
  targetPrice?: string;
  marketCompetitionLevel?: string;
  targetAudience?: string;
  additionalInfo?: string;
  sections: ProductDetailSection[];
}

// 섹션 재생성 요청 인터페이스
export interface RegenerateSectionRequest {
  sectionId: string;
  productName: string;
  productCategory: string;
  productDescription: string;
  sections: ProductDetailSection[];
  keywords?: string[];
  targetPrice?: string;
  marketCompetitionLevel?: string;
  targetAudience?: string;
  additionalInfo?: string;
}

// 섹션 재생성 응답 인터페이스
export interface RegenerateSectionResponse {
  newSectionContent: string;
} 