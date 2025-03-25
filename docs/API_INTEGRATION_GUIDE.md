# API 통합 가이드

## Google Gemini API 통합

### 개요
상새(Sangsae) 프로젝트는 Google의 Gemini API를 활용하여 상품 상세 페이지 콘텐츠를 자동으로 생성합니다. 이 문서는 API 통합 방법과 주요 기능에 대한 상세 설명을 제공합니다.

### API 키 설정

1. **환경 변수 설정**
   ```
   NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
   ```

2. **API 키 로테이션 시스템**
   여러 API 키를 사용하여 요청 제한을 관리할 수 있습니다. `gemini.ts` 파일의 `apiKeys` 배열에 여러 키를 추가하세요.
   ```typescript
   const apiKeys = [
     process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
     process.env.NEXT_PUBLIC_GEMINI_API_KEY_2 || '',
     // 추가 API 키
   ];
   ```

### 주요 함수

#### 1. 상품 상세 페이지 생성
```typescript
async function generateProductDetail(productData: ProductData): Promise<ProductDetailContent>
```

**설명**: 상품 정보를 바탕으로 완전한 상세 페이지 콘텐츠를 생성합니다.

**매개변수**:
- `productData`: 상품 정보 (이름, 카테고리, 가격, 설명 등)

**반환값**:
- `ProductDetailContent`: 생성된 섹션별 콘텐츠

**예제**:
```typescript
const productData = {
  name: "울트라 HD 스마트 TV",
  category: "전자제품",
  price: "899,000원",
  description: "4K 해상도와 AI 화질 개선 기술이 적용된 스마트 TV"
};

const detailContent = await generateProductDetail(productData);
```

#### 2. 섹션 재생성
```typescript
async function regenerateSection(
  sectionId: string, 
  productData: ProductData, 
  existingContent: ProductDetailContent
): Promise<ProductDetailSection>
```

**설명**: 특정 섹션만 선택적으로 재생성합니다.

**매개변수**:
- `sectionId`: 재생성할 섹션의 ID
- `productData`: 상품 정보
- `existingContent`: 기존 생성된 콘텐츠

**반환값**:
- `ProductDetailSection`: 재생성된 섹션 데이터

**예제**:
```typescript
const updatedSection = await regenerateSection(
  "main_feature", 
  productData, 
  existingContent
);
```

### 프롬프트 엔지니어링

#### 기본 프롬프트 구조
```typescript
function buildPrompt(productData: ProductData): string {
  return `
    상품명: ${productData.name}
    카테고리: ${productData.category}
    가격: ${productData.price || '정보 없음'}
    설명: ${productData.description || '정보 없음'}
    추가 정보: ${productData.additionalInfo || '정보 없음'}
    
    위 상품에 대한 상세 페이지 콘텐츠를 생성해주세요. 
    다음 섹션들을 포함해야 합니다: 제품 타이틀, 제품 소개, 주요 특징, 사용 방법, 상세 스펙...
  `;
}
```

#### 섹션별 프롬프트
각 섹션에 대한 특별한 프롬프트를 생성하여 더 정확한 콘텐츠를 얻을 수 있습니다.

```typescript
function getPromptForSection(sectionId: string, productData: ProductData): string {
  switch(sectionId) {
    case 'main_feature':
      return `${productData.name}의 주요 특징을 5-7개 항목으로 작성해주세요. 각 항목은 • 기호로 시작하고, 핵심 키워드는 강조해주세요.`;
    case 'how_to_use':
      return `${productData.name}의 사용 방법을 단계별로 설명해주세요. 1, 2, 3... 형식으로 번호를 매겨주세요.`;
    // 기타 섹션별 프롬프트
  }
}
```

### 오류 처리

#### API 호출 실패 처리
```typescript
try {
  const result = await generateContent(prompt);
  return parseResponse(result);
} catch (error) {
  console.error('API 호출 오류:', error);
  
  // API 키 로테이션
  rotateApiKey();
  
  // 재시도 로직
  if (retryCount < MAX_RETRIES) {
    return generateWithRetry(prompt, retryCount + 1);
  }
  
  throw new Error('콘텐츠 생성에 실패했습니다. 나중에 다시 시도해주세요.');
}
```

### 응답 파싱

#### 섹션 구조화
```typescript
function parseResponse(result: GenerateContentResult): ProductDetailContent {
  const text = result.response.text();
  const sections = [];
  
  // 정규식을 사용하여 섹션 분리
  const sectionMatches = text.match(/\[([a-z_]+)\]([\s\S]*?)(?=\[[a-z_]+\]|$)/g) || [];
  
  for (const match of sectionMatches) {
    const idMatch = match.match(/\[([a-z_]+)\]/);
    if (idMatch && idMatch[1]) {
      const id = idMatch[1];
      const content = match.replace(/\[[a-z_]+\]/, '').trim();
      sections.push({ id, content });
    }
  }
  
  return { sections };
}
```

### 캐싱 전략

서버 사이드에서는 Google AI Cache Manager를 활용하여 API 호출을 최적화할 수 있습니다.

```typescript
// 서버 사이드에서만 임포트
let GoogleAICacheManager: any;
if (typeof window === 'undefined') {
  import('@google/generative-ai/server').then(module => {
    GoogleAICacheManager = module.GoogleAICacheManager;
  });
}

// 캐시 설정
const cacheManager = new GoogleAICacheManager({
  ttl: 3600 * 1000, // 1시간 캐시
  maxEntries: 100
});

// 캐시 적용
const genAI = new GoogleGenerativeAI(apiKey, { cacheManager });
```

## 향후 API 통합 계획

### 1. Google OAuth 인증
사용자 인증을 위한 Google OAuth 통합 계획입니다.

### 2. Toss Payments API
결제 처리를 위한 Toss Payments API 통합 계획입니다.

### 3. 이미지 생성 API
상품 이미지 자동 생성을 위한 이미지 생성 API 통합 계획입니다.
