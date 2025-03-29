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
  // 추가 필드가 필요한 경우 여기에 정의
}

// 제품 카테고리 타입 정의
export type ProductCategory = 
  'cosmetics' | 'food' | 'fashion' | 'home' | 'electronics' | 
  'furniture' | 'pet' | 'baby' | 'health' | 'sports' | 'outdoor' | 
  'digital' | 'books' | 'toys' | 'craft' | 'stationery' | 'etc';

// 시장 경쟁 수준 타입
export type MarketCompetitionLevel = 'LOW' | 'MEDIUM' | 'HIGH';

// 상품 기본 정보 인터페이스 (생성 API 호출용)
export interface ProductInfo {
  name: string;
  category: ProductCategory;
  description?: string;
  additionalInfo?: string;
  price?: string;
  keywords?: string[];
  shippingInfo?: string;
  returnPolicy?: string;
  targetCustomers?: string;
}

// API 요청에 사용되는 확장된 제품 정보 타입
export interface ProductDetailParams {
  name: string;
  category: ProductCategory;
  description?: string;
  price?: string;
  keywords?: string[];
  targetCustomers?: string;
  additionalInfo?: string;
}

// 입력 폼에서 사용하는 ProductData 타입 정의
export interface ProductData {
  name: string;
  category: ProductCategory;
  description?: string;
  additionalInfo?: string;
  shippingInfo?: string;
  returnPolicy?: string;
  keywords?: string[];
  targetCustomers?: string;
  targetAudience?: string;  // 타겟 고객층 필드 추가
  // section-manager.ts와 product-detail.ts에서 사용하는 추가 필드
  features?: string[] | string;
  mainBenefits?: string;
  usageTips?: string;
  materialInfo?: string;
  sizeInfo?: string;
  reviewContent?: string;
  price?: string;
  competitionLevel?: string;
}

// 상품 데이터 인터페이스
export interface ProductDataOriginal {
  name: string;
  price?: string;  // 가격을 선택적 필드로 변경
  features?: string[] | string;  // 타입을 string[] 또는 string으로 변경
  brand?: string;  // 브랜드명 추가
  bulletPoints?: string[];  // 주요 포인트 추가
  specifications?: Record<string, any>;  // 제품 사양 추가
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
  sections: ProductDetailSection[];
  cacheName?: string;
  rawContent?: string;
  updatedAt?: string;
  tokenUsage?: { 
    input: number; 
    output: number;
  };
  html?: string;
  markdown?: string;
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
