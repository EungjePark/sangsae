import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'; 
import {
  createGeminiApi, 
  getCurrentApiKey, 
  rotateApiKey, 
} from '@/lib/api/keys';
import { getKoreanTitle } from '@/lib/sections/section-manager'; 
import { recordTokenUsage, estimateTokenCount } from '@/lib/tokens/usage-tracker'; 
import { ProductData, ProductDetailContent, ProductDetailSection, TokenUsage } from '@/types/product';
import { apiCache } from '../api/cacheManager';

// 섹션 지시사항 가져오기 
export const getSectionInstruction = (sectionId: string, productData: ProductData): string => {
  const instructions: Record<string, string> = {
    main_feature: '제품의 주요 특징을 설명하세요. 핵심 기능과 장점을 중심으로 작성하세요.',
    usage: '제품의 사용 방법을 설명하세요. 단계별로 명확하게 작성하세요.',
    target_customer: '이 제품이 적합한 고객층을 설명하세요. 구체적인 사용자 프로필과 니즈를 포함하세요.',
    product_spec: '제품의 상세 스펙을 설명하세요. 기술적 사양과 물리적 특성을 포함하세요.',
    caution: '제품 사용 시 주의사항을 설명하세요. 안전 관련 정보와 주의점을 포함하세요.',
    faq: '자주 묻는 질문과 답변을 작성하세요. 고객이 가장 궁금해할 만한 내용을 포함하세요.',
  };
  return instructions[sectionId] || '섹션 내용을 작성하세요.';
};

// 섹션 토큰 제한 가져오기 
export const getSectionTokenLimit = (sectionId: string): number => {
  const limits: Record<string, number> = {
    main_feature: 800,
    usage: 600,
    target_customer: 500,
    product_spec: 700,
    caution: 400,
    faq: 900,
  };
  return limits[sectionId] || 600;
};

// 모델 설정
const MODEL_NAME = "gemini-1.5-flash-001"; 
const generationConfig = {
  temperature: 0.7, 
  topP: 0.95,     
  topK: 40,
  maxOutputTokens: 1000, 
};

// 재시도 설정
const MAX_RETRIES = 3;
const RETRY_DELAY = 1500; 

// 섹션 ID 제거 및 내용 정리 함수 추가
const cleanSectionContent = (content: string, sectionId: string): string => {
  let cleanedContent = content;
  
  const knownSectionIds = [
    'title_block', 'hero_section', 'main_feature', 'product_info',
    'how_to_use', 'shipping_returns', 'faq', 'ingredients',
    'material_care', 'size_fit', 'benefits'
  ];
  
  knownSectionIds.forEach(id => {
    const exactMatch = new RegExp(`^\\s*${id}\\s*$`, 'gm');
    cleanedContent = cleanedContent.replace(exactMatch, '');
    
    const startMatch = new RegExp(`^\\s*${id}\\b`, 'gm');
    cleanedContent = cleanedContent.replace(startMatch, '');
    
    const bracketMatch = new RegExp(`\\[${id}\\]\\s*`, 'g');
    cleanedContent = cleanedContent.replace(bracketMatch, '');
  });
  
  cleanedContent = cleanedContent
    .replace(/^\[.*?\]\s*/gm, '') 
    .replace(/^#\s+/gm, '') 
    .replace(/^#{1,6}\s+/gm, '') 
    .replace(/^✨\s*/gm, '') 
    .replace(/\n{3,}/g, '\n\n') 
    .replace(/^\s*•?\s*$/gm, '') 
    .trim();
  
  // FAQ 섹션에 대한 특별 처리 추가
  if (sectionId === 'faq') {
    // 잘못된 FAQ 형식 수정 (Q 뒤에 쉼표가 있는 경우: "Q 질문, 답변" 형식)
    cleanedContent = cleanedContent
      // 'Q ' 뒤에 쉼표로 구분된 질문/답변 패턴 수정
      .replace(/Q\s+(.*?)\s*,\s*(.*?)(?=\n*Q\s+|$)/g, 'Q: $1\n\nA: $2\n\n')
      // 숫자 뒤에 오는 쉼표 구분 패턴 수정 (예: "1. 질문, 답변")
      .replace(/(\d+)\.\s+(.*?)\s*,\s*(.*?)(?=\n*\d+\.\s+|$)/g, 'Q: $2\n\nA: $3\n\n')
      // "질문" 패턴 수정
      .replace(/"(.*?)"\s*,\s*(.*?)(?=\n*"|$)/g, 'Q: $1\n\nA: $2\n\n')
      // Q: 뒤에 쉼표가 있는 경우 수정
      .replace(/Q:\s+(.*?)\s*,\s*(.*?)(?=\n*Q:|$)/g, 'Q: $1\n\nA: $2\n\n')
      // 형식이 올바르지 않은 Q&A 형식 수정
      .replace(/Q\s*&\s*A\s*:?\s*(.*?)\s*,\s*(.*?)(?=\n|$)/g, 'Q: $1\n\nA: $2\n\n')
      // 불필요한 연속 공백 제거
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    // FAQ 형식이 아직 올바르지 않은 경우, 기본 Q&A 형식으로 변환을 시도
    if (!cleanedContent.includes('Q:') || !cleanedContent.includes('A:')) {
      // 줄바꿈으로 구분된 문단을 Q&A 쌍으로 변환
      const paragraphs = cleanedContent.split(/\n{2,}/);
      let formattedContent = '';
      
      for (let i = 0; i < paragraphs.length; i += 2) {
        if (paragraphs[i] && paragraphs[i + 1]) {
          formattedContent += `Q: ${paragraphs[i].trim()}\n\nA: ${paragraphs[i + 1].trim()}\n\n`;
        } else if (paragraphs[i]) {
          // 짝이 맞지 않는 경우, 질문만 있는 것으로 간주
          formattedContent += `Q: ${paragraphs[i].trim()}\n\nA: 자세한 내용은 고객센터로 문의해주세요.\n\n`;
        }
      }
      
      if (formattedContent) {
        cleanedContent = formattedContent.trim();
      }
    }
  }
  
  return cleanedContent;
};

// 섹션 콘텐츠 재생성
export async function regenerateSection(
  sectionId: string,
  productData: ProductData,
  currentContent: ProductDetailContent,
  cacheName?: string 
): Promise<{ success: boolean, sections?: Record<string, ProductDetailSection>, error?: string, tokenUsage?: TokenUsage }> {

  try {
    // 캐시 키 생성
    const cacheKey = apiCache.generateKey({
      action: 'regenerateSection',
      sectionId,
      productName: productData.name,
      productCategory: productData.category,
      additionalContext: cacheName || ''
    });
    
    // 캐시 확인 (동일한 섹션, 제품, 추가 컨텍스트에 대한 이전 생성 결과)
    const cachedResult = apiCache.get<string>(cacheKey);
    if (cachedResult) {
      console.log(`캐시된 섹션 콘텐츠 사용: ${sectionId}, 제품: ${productData.name}`);
      return {
        success: true,
        sections: {
          [sectionId]: {
            id: sectionId,
            content: cachedResult
          }
        }
      };
    }
    
    // @ts-ignore - 타입 호환성 문제 우회
    let genAI: any = createGeminiApi(); 
    
    const sectionTitle = getKoreanTitle(sectionId); 
    
    let existingContent = '';
    if (Array.isArray(currentContent.sections)) {
      const section = currentContent.sections.find((s: {id: string, content?: string}) => s.id === sectionId);
      existingContent = section?.content || '';
    } else if (currentContent.sections && typeof currentContent.sections === 'object') {
      existingContent = (currentContent.sections as Record<string, { content?: string }>)[sectionId]?.content || '';
    }

    let retryCount = MAX_RETRIES; 
    let errorMessage = '';

    // 안전 설정 정의
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    if (sectionId === 'faq') {
      const regenerationPromptText = `
### 원본 텍스트 (참고용)
"""
${existingContent?.trim() || '내용 없음'}
"""

### 상품 기본 정보
제품 이름: ${productData.name}
카테고리: ${productData.category}
섹션: ${sectionTitle}

### 작업 지침
위의 원본 텍스트를 참고하여 ${sectionTitle} 섹션을 완전히 새롭게 작성해주세요.
매력적이고 실용적인 FAQ(자주 묻는 질문)을 작성하되, 다음 지침을 엄격히 따라주세요:

1. 내용 지침:
- 반드시 제품의 특성과 직접 관련된 질문만 작성하세요 (제품 카테고리: ${productData.category})
- 제품과 관련 없는 질문(예: 의류 제품의 경우 요리법, 식품의 경우 착용감 등)은 절대 포함하지 마세요
- 제품의 사용, 관리, 성능, 특징 등에 관련된 실질적인 질문을 포함하세요
- 제품 구매 결정에 도움이 되는 정보를 담은 질문을 포함하세요
- 일반적인 고객 우려사항이나 오해를 해소하는 질문을 포함하세요
- 각 질문의 답변에는 최소 1개 이상의 실제 사용자 경험이나 후기를 포함하세요 (예: "많은 고객들이 ~했다고 합니다", "실제 사용자 A씨는 ~라고 후기를 남겼습니다")
- 가격 관련 정보는 포함하지 말고, 대신 제품의 가치와 혜택을 강조하세요

2. 형식 지침:
- 다음과 같은 명확한 질문-답변 형식을 반드시 사용하세요:
  Q: 질문내용
  A: 답변내용
- 각 질문과 답변 쌍 사이에는 빈 줄을 넣어 구분하세요
- 각 질문은 간결하고 명확하게 작성하세요
- 각 답변은 친절하고 도움이 되는 톤으로 작성하세요
- 쉼표나 다른 구분자를 Q와 질문 사이에 사용하지 마세요
- 마크다운 대신 일반 텍스트 형식을 사용하세요

### 매우 중요
- Q와 A 사이에 쉼표(,)를 넣지 말고, 명확히 분리된 줄에 표시하세요
- 질문은 반드시 제품 특성에 맞게 관련성 있는 내용이어야 합니다
- 예를 들어 '식품' 카테고리라면 식품 관련 질문만, '의류' 카테고리라면 의류 관련 질문만 작성하세요
- 제품과 무관한 허리둘레, 체중, 다이어트 등의 질문은 절대 포함하지 마세요
- 더미 텍스트나 샘플 텍스트가 아닌 실제 내용으로 작성하세요
`;

      while (retryCount >= 0) {
        try {
          let prompt = regenerationPromptText;
          
          if (!cacheName) {
            const initialContextForNoCache = `제품 이름: ${productData.name}\n가격: ${productData.price || "정보 없음"}\n카테고리: ${productData.category}\n키워드: ${Array.isArray(productData.keywords) ? productData.keywords.join(", ") : productData.keywords || ""}\n제품 설명: ${productData.description || ""}\n추가 정보: ${productData.additionalInfo || ""}`;
            const systemPromptForNoCache = `당신은 쇼핑몰 상품 FAQ 작성 전문가입니다. 제공된 제품 정보를 바탕으로 고객들이 실제로 궁금해할 만한 질문과 그에 대한 답변을 작성해주세요. 답변은 도움이 되면서도 판매를 촉진하는 내용이어야 합니다. FAQ는 Q&A 형식으로 작성해주세요.`;
            prompt = `초기 제품 정보:\n${initialContextForNoCache}\n\n시스템 안내:\n${systemPromptForNoCache}\n\n이제 다음 내용을 개선해주세요:\n${regenerationPromptText}`;
          }

          // API 호출
          const result = await genAI.generateContent(prompt, {
            generationConfig: {
              ...generationConfig,
              temperature: 0.8, // FAQ에 더 다양성 부여
              maxOutputTokens: 1500, // FAQ에 더 많은 토큰 할당
            },
            model: "gemini-1.5-flash"
          });

          // 최신 Gemini API(0.24.0) 방식으로 응답 텍스트 추출
          let responseText = '';
          try {
            responseText = result.response.text();

            // 응답 텍스트가 있으면 성공 처리
            if (responseText) {
              const cleanedResponseText = cleanSectionContent(responseText, sectionId);
              
              const inputTokens = estimateTokenCount(prompt);
              const outputTokens = estimateTokenCount(cleanedResponseText);
              recordTokenUsage(inputTokens, outputTokens);
              
              // 결과 캐싱 (15분간 유효, 짧게 설정하여 다양성 보장)
              apiCache.set(cacheKey, cleanedResponseText, 15 * 60 * 1000);
              
              return {
                success: true,
                sections: {
                  [sectionId]: {
                    id: sectionId,
                    content: cleanedResponseText
                  }
                }
              };
            }
          } catch (err: any) {
            console.error("응답에서 텍스트 추출 오류:", err);
            throw new Error(`텍스트 추출 실패: ${err.message}`);
          }

          // 응답이 없거나 안전 필터에 걸렸을 경우
          const blockReason = result?.promptFeedback?.blockReason;
          if (blockReason) {
             return { 
               success: false, 
               error: `API 응답 오류: ${blockReason}` 
             };
          }
          
          throw new Error("API로부터 유효한 응답을 받지 못했습니다.");
        } catch (error: any) {
          errorMessage = error.message || '알 수 없는 오류';

          const status = error?.status || (error?.cause as any)?.status; 

          // 속도 제한 또는 서버 오류 처리
          if (status === 429 || status === 503 || (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('503'))) {
            rotateApiKey();
            const nextKey = getCurrentApiKey();

            if (nextKey) {
              // @ts-ignore - 타입 호환성 문제 우회
              genAI = createGeminiApi(); 
            } else {
              return {
                success: false,
                error: '모든 API 키의 할당량이 초과되었거나 리소스가 부족합니다. 잠시 후 다시 시도해주세요.'
              };
            }
          } else if (errorMessage.includes("SAFETY")) { 
              return { success: false, error: `콘텐츠 생성 중 안전 관련 문제가 발생했습니다: ${errorMessage}` };
          }

          retryCount--;

          if (retryCount >= 0) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          } else {
            return {
              success: false,
              error: "여러 번 시도했으나 콘텐츠를 생성할 수 없습니다."
            };
          }
        }
      }
    } else {
      const regenerationPromptText = `
### 원본 텍스트 (참고용)
"""
${existingContent?.trim() || '내용 없음'}
"""

### 상품 기본 정보
제품 이름: ${productData.name}
카테고리: ${productData.category}
섹션: ${sectionTitle}

### 작업 지침
위의 원본 텍스트를 참고하여 ${sectionTitle} 섹션을 완전히 새롭게 작성해주세요.
더 매력적이고 구매욕을 자극하는 내용으로 작성하되, 다음 지침을 엄격히 따라주세요:

1. 내용 지침:
- 제품의 핵심 가치와 차별점을 부각시키세요
- 고객이 얻을 수 있는 구체적인 혜택을 명확하게 서술하세요
- 감성적이고 설득력 있는 문구를 사용하세요
- 제품 특징을 구체적이고 생생하게 묘사하세요
- 타겟 고객층의 니즈와 연결시키세요

2. 형식 지침:
- 제목 없이 본문만 작성하세요
- 마크다운 형식을 사용하지 마세요
- 2-3개 문단으로 간결하게 작성하세요
- 가격 정보를 직접 언급하지 마세요
- 일관된 어조와 스타일을 유지하세요
- 읽기 쉽고 친근한 문체를 사용하세요

### 매우 중요
- 기존 내용보다 품질이 훨씬 좋은 내용을 작성해주세요
- 원본의 핵심 내용은 유지하되 표현을 완전히 새롭게 작성해주세요
- 광고성 텍스트처럼 매력적이고 설득력 있게 작성해주세요
- 각 문장이 가치 있고 설득력 있게 만들어주세요
`;

      while (retryCount >= 0) {
        try {
          let prompt = regenerationPromptText;
          
          if (!cacheName) {
            const initialContextForNoCache = `제품 이름: ${productData.name}\n가격: ${productData.price || "정보 없음"}\n카테고리: ${productData.category}\n키워드: ${Array.isArray(productData.keywords) ? productData.keywords.join(", ") : productData.keywords || ""}\n제품 설명: ${productData.description || ""}\n추가 정보: ${productData.additionalInfo || ""}`;
            let systemPromptForNoCache = '';
            
            // sectionId에 따라 다른 프롬프트 제공
            if (sectionId === 'faq') {
              systemPromptForNoCache = `당신은 쇼핑몰 상품 FAQ 작성 전문가입니다. 제공된 제품 정보를 바탕으로 고객들이 실제로 궁금할 만한 질문과 그에 대한 답변을 작성해주세요. 답변은 도움이 되면서도 판매를 촉진하는 내용이어야 합니다. FAQ는 Q&A 형식으로 작성해주세요.`;
            } else if (sectionId === 'main_feature' || sectionId === '2') {
              systemPromptForNoCache = `# 역할: 제품 기능 및 장점 전문가

## 작업 목표
${productData.name} 제품의 핵심 기능과 장점을 명확하고 매력적으로 설명하여 고객이 제품의 가치를 쉽게 이해하도록 합니다.

## 출력 형식 가이드라인
- 가장 중요한 기능/장점부터 서술
- 각 기능은 하나의 단락으로 구성하되, 기능명을 볼드체로 강조
- 각 장점은 고객에게 실질적인 혜택을 중심으로 설명
- 구체적인 수치와 비교를 통해 장점을 객관적으로 입증
- 기술적 용어는 일반 소비자도 이해할 수 있게 설명

## 콘텐츠 구성 요소
1. 제품 핵심 가치 요약 (1-2문장)
2. 3-5개의 주요 기능 및 장점 (각 1-2문단)
3. 차별화 포인트 강조
4. 실제 사용 시나리오나 활용 방법

## 포함할 키워드: ${Array.isArray(productData.keywords) ? productData.keywords.join(", ") : productData.keywords || ""}`;
            } else if (sectionId === 'how_to_use' || sectionId === '4') {
              systemPromptForNoCache = `# 역할: 제품 사용법 설명 전문가

## 작업 목표
${productData.name} 제품의 사용 방법을 명확하고 단계별로 설명하여 고객이 쉽게 따라할 수 있도록 합니다.

## 출력 형식 가이드라인
- 단계별 사용법 (1, 2, 3...)
- 주요 사용 팁과 요령
- 일반적인 실수나 주의사항
- 최적의 결과를 얻기 위한 제안

## 콘텐츠 구성 요소
1. 간략한 소개 (제품 사용 목적)
2. 사전 준비사항 (필요한 경우)
3. 단계별 사용 지침 (최소 3단계, 최대 7단계)
4. 팁과 추가 사용법
5. 유지관리 방법 (해당되는 경우)`;
            } else {
              // 기본 프롬프트
              systemPromptForNoCache = `당신은 재미있고 매력적인 상품 소개 페이지를 만드는 전문가입니다. 제공된 제품 정보를 바탕으로 페이지의 각 섹션별 콘텐츠를 제작해 주세요. 콘텐츠는 읽기 쉽고, 친근하고, 구매욕을 자극하는 스타일로 작성해주세요. 각 섹션별 콘텐츠를 분리해서 제공해 주세요. 섹션 형식은 다음과 같습니다:\n\n[섹션 제목]\n섹션 내용\n\n여러 섹션을 작성할 때 각 섹션은 완전히 분리되어 있어야 합니다.`;
            }
            
            prompt = `초기 제품 정보:\n${initialContextForNoCache}\n\n시스템 안내:\n${systemPromptForNoCache}\n\n이제 다음 내용을 개선해주세요:\n${regenerationPromptText}`;
          }

          // API 호출
          const result = await genAI.generateContent(prompt, {
            generationConfig,
            model: "gemini-1.5-flash"
          });

          // 최신 Gemini API(0.24.0) 방식으로 응답 텍스트 추출
          let responseText = '';
          try {
            responseText = result.response.text();

            // 응답 텍스트가 있으면 성공 처리
            if (responseText) {
              const cleanedResponseText = cleanSectionContent(responseText, sectionId);
              
              const inputTokens = estimateTokenCount(prompt);
              const outputTokens = estimateTokenCount(cleanedResponseText);
              recordTokenUsage(inputTokens, outputTokens);
              
              // 결과 캐싱 (15분간 유효, 짧게 설정하여 다양성 보장)
              apiCache.set(cacheKey, cleanedResponseText, 15 * 60 * 1000);
              
              return {
                success: true,
                sections: {
                  [sectionId]: {
                    id: sectionId,
                    content: cleanedResponseText
                  }
                }
              };
            }
          } catch (err: any) {
            console.error("응답에서 텍스트 추출 오류:", err);
            throw new Error(`텍스트 추출 실패: ${err.message}`);
          }

          // 응답이 없거나 안전 필터에 걸렸을 경우
          const blockReason = result?.promptFeedback?.blockReason;
          if (blockReason) {
             return { 
               success: false, 
               error: `API 응답 오류: ${blockReason}` 
             };
          }
          
          throw new Error("API로부터 유효한 응답을 받지 못했습니다.");
        } catch (error: any) {
          errorMessage = error.message || '알 수 없는 오류';

          const status = error?.status || (error?.cause as any)?.status; 

          // 속도 제한 또는 서버 오류 처리
          if (status === 429 || status === 503 || (errorMessage.includes('429') || errorMessage.includes('RESOURCE_EXHAUSTED') || errorMessage.includes('503'))) {
            rotateApiKey();
            const nextKey = getCurrentApiKey();

            if (nextKey) {
              // @ts-ignore - 타입 호환성 문제 우회
              genAI = createGeminiApi(); 
            } else {
              return {
                success: false,
                error: '모든 API 키의 할당량이 초과되었거나 리소스가 부족합니다. 잠시 후 다시 시도해주세요.'
              };
            }
          } else if (errorMessage.includes("SAFETY")) { 
              return { success: false, error: `콘텐츠 생성 중 안전 관련 문제가 발생했습니다: ${errorMessage}` };
          }

          retryCount--;

          if (retryCount >= 0) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          } else {
            return {
              success: false,
              error: "여러 번 시도했으나 콘텐츠를 생성할 수 없습니다."
            };
          }
        }
      }
    }

    return {
      success: false,
      error: "여러 번 시도했으나 콘텐츠를 생성할 수 없습니다."
    };
    
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "섹션 재생성 중 오류가 발생했습니다."
    };
  }
}

// 토큰 비용 계산 헬퍼 함수
export function calculateCost(inputTokens: number, outputTokens: number): number {
  const inputCostPer1M = 0.35;
  const outputCostPer1M = 1.05;
  
  return (inputTokens / 1000000) * inputCostPer1M + (outputTokens / 1000000) * outputCostPer1M;
}
