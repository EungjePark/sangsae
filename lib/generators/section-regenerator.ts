import { GoogleGenerativeAI, GenerateContentResult } from '@google/generative-ai';
import { 
  createGeminiApi, 
  rotateApiKey, 
  getApiKeyCount,
  getCurrentApiKey
} from '@/lib/api/keys';
import { getKoreanTitle } from '@/lib/clipboard-helper';
import { ProductCategory, ProductData, ProductDetailContent, ProductDetailSection, TokenUsage } from '@/types/product';

// 섹션 지시사항 가져오기 (임시 구현)
export const getSectionInstruction = (sectionId: string): string => {
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

// 섹션 토큰 제한 가져오기 (임시 구현)
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

// 토큰 수 추정 (임시 구현)
export const estimateTokenCount = (text: string): number => {
  // 한글은 영어보다 토큰을 더 많이 사용하므로 대략적인 추정
  return Math.ceil(text.length * 0.6);
};

// 토큰 사용량 기록 (임시 구현)
export const recordTokenUsage = (inputTokens: number, outputTokens: number): TokenUsage => {
  const usage: TokenUsage = {
    inputTokens,
    outputTokens,
    date: new Date().toISOString(),
    cost: calculateCost(inputTokens, outputTokens)
  };
  console.log('토큰 사용량 기록:', usage);
  return usage;
};

// 모델 설정
const generationConfig = {
  temperature: 0.8,
  topP: 0.9,
  topK: 40,
  maxOutputTokens: 2048,
};

// 재시도 설정
const MAX_RETRIES = 3;
const RETRY_DELAY = 1500; // 1.5초

// 섹션 콘텐츠 재생성
export async function regenerateSection(
  sectionId: string,
  productData: ProductData,
  currentContent: ProductDetailContent
): Promise<{ success: boolean, sections?: Record<string, ProductDetailSection>, error?: string, tokenUsage?: TokenUsage }> {
  
  try {
    console.log(`섹션 재생성 시작 - 섹션 ID: ${sectionId}`);
    console.log(`현재 사용 중인 API 키: ${getCurrentApiKey().substring(0, 8)}...`);
    
    // Gemini API 모델 초기화
    let genAI = new GoogleGenerativeAI(getCurrentApiKey());
    let model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig,
    });

    // 섹션 제목 가져오기
    const sectionTitle = getKoreanTitle(sectionId);
    
    // 현재 섹션의 기존 내용 가져오기
    let existingContent = '';
    if (Array.isArray(currentContent.sections)) {
      const section = currentContent.sections.find((s: {id: string, content?: string}) => s.id === sectionId);
      existingContent = section?.content || '';
    } else if (currentContent.sections && typeof currentContent.sections === 'object') {
      existingContent = (currentContent.sections as Record<string, {content?: string}>)[sectionId]?.content || '';
    }
    
    // 다른 섹션 내용으로 컨텍스트 제공 (배열 또는 객체 형태 모두 처리)
    let otherSectionsContext = "";
    if (Array.isArray(currentContent.sections)) {
      otherSectionsContext = currentContent.sections
        .filter((section) => section.id !== sectionId)
        .map((section) => `[${getKoreanTitle(section.id)}]\n${section.content}`)
        .join("\n\n");
    } else if (currentContent.sections && typeof currentContent.sections === 'object') {
      otherSectionsContext = Object.entries(currentContent.sections as Record<string, {content: string}>)
        .filter(([id]) => id !== sectionId)
        .map(([id, section]) => `[${getKoreanTitle(id)}]\n${section.content}`)
        .join("\n\n");
    }
    
    // 시스템 프롬프트 구성
    const systemPrompt = `당신은 전문 카피라이터이자 상세페이지 최적화 전문가입니다.
당신의 임무는 기존 텍스트의 핵심 내용과 메시지를 유지하면서 표현을 더 세련되게 다듬는 것입니다.

**반드시 다음 규칙을 지켜주세요:**
1. 원본 텍스트의 핵심 내용, 핵심 아이디어, 주요 포인트를 보존하세요
2. 동일한 제품과 주제에 대해 작성하고 있음을 유지하세요
3. 원본 텍스트의 구조와 흐름을 최대한 유지하세요
4. 완전히 새로운 내용을 만들지 말고, 기존 내용을 개선하는 데 집중하세요
5. 과장되거나 허위 주장은 피하세요
6. 가격 정보는 언급하지 마세요
7. 글의 목소리와 톤을 일관되게 유지하세요
8. 전문적이고 설득력 있는 글쓰기 스타일을 사용하세요`;

    // 섹션 지침 가져오기
    const sectionInstruction = getSectionInstruction(sectionId, productData);
    
    // 컨텍스트 프롬프트 - 좀 더 명확하게
    const contextPrompt = `
### 원본 텍스트 (반드시 이 내용을 참조하세요)
"""
${existingContent?.trim() || '내용 없음'}
"""

### 제품 정보
- 제품명: ${productData.name}
- 카테고리: ${productData.category}
- 주요 특징: ${productData.features || '정보 없음'}
- 대상 고객: ${productData.targetAudience || '정보 없음'}

### 작업 지침
위의 원본 텍스트를 개선해주세요. 원본 텍스트의 핵심 아이디어, 주요 포인트, 내용 구조는 유지하면서 더 매력적이고 세련되게 다듬어주세요.

### 매우 중요
- 완전히 새로운 내용을 작성하지 마세요
- 원본 텍스트와 동일한 제품에 대해 동일한 메시지를 전달해야 합니다
- 원본 텍스트에서 언급된 제품의 특징과 이점은 반드시 포함해야 합니다
- 원본의 핵심 키워드와 주요 문구는 가능한 유지하세요
`;

    // 추가 가이드라인을 더 명확하게
    const additionalGuidance = `
### 출력 형식 요구사항
- 제목 없이 본문만 작성하세요
- 마크다운 형식을 사용하지 마세요
- 2-3개 문단 정도로 간결하게 작성하세요
- 가격이나 비용 정보는 절대 언급하지 마세요
- 원본 텍스트에서 다루지 않은 새로운 주제나 기능을 추가하지 마세요
- 원본 텍스트의 좋은 부분은 거의 그대로 유지하되, 표현만 개선하세요
- 문장 구조와 단락 구성은 원본과 유사하게 유지하세요

### 이것은 리라이트 작업입니다
- 번역이 아닌 리라이트를 수행하세요
- 원본을 완전히 새롭게 작성하는 것이 아니라, 기존 내용을 더 잘 다듬는 것입니다
- 70-80%는 원본 내용을 기반으로 해야 합니다
`;

    // 컨텍스트 캐싱 시도
    try {
      const cacheResult = await cacheProductContext(productData, systemPrompt);
      if (cacheResult) {
        const cachedModel = getModelWithCachedContext(cacheResult);
        if (cachedModel) {
          model = cachedModel;
          console.log('캐시된 컨텍스트로 모델을 성공적으로 업데이트했습니다.');
        }
      }
    } catch (error) {
      console.error('캐시된 컨텍스트 적용 중 오류 발생:', error);
      console.log('기본 모델을 사용하여 계속 진행합니다.');
    }

    // 모델 호출 (재시도 로직 추가)
    let response: GenerateContentResult | null = null;
    let retryCount = MAX_RETRIES; // 최대 3번 재시도
    let errorMessage = '';
    
    while (retryCount >= 0) {
      try {
        response = await model.generateContent({
          contents: [
            {
              role: "system",
              parts: [{ text: systemPrompt }]
            },
            {
              role: "user", 
              parts: [{ text: contextPrompt + "\n\n" + additionalGuidance }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1000,
          }
        });
        
        if (response && response.response) {
          break; // 성공시 루프 종료
        } else {
          throw new Error("API 응답에 텍스트가 없습니다");
        }
      } catch (error: any) { // 명시적 타입 지정
        console.error(`요청 실패 (남은 재시도: ${retryCount}):`, error.message || error);
        errorMessage = error.message || '알 수 없는 오류';
        
        // 429 에러(할당량 초과) 처리
        if (error.message && error.message.includes('429')) {
          console.log('API 할당량 초과로 다음 API 키로 전환합니다...');
          rotateApiKey();
          const nextKey = getCurrentApiKey();
          
          if (nextKey) {
            console.log(`새 API 키로 전환: ${nextKey.substring(0, 8)}...`);
            genAI = new GoogleGenerativeAI(nextKey);
            model = genAI.getGenerativeModel({
              model: "gemini-1.5-pro",
              generationConfig,
            });
          } else {
            console.error('사용 가능한 API 키가 없습니다.');
            return { 
              success: false, 
              error: '모든 API 키의 할당량이 초과되었습니다. 잠시 후 다시 시도해주세요.' 
            };
          }
        }
        
        retryCount--;
        
        // 재시도 전 잠시 대기
        if (retryCount >= 0) {
          console.log(`${RETRY_DELAY}ms 후 재시도합니다...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
        } else {
          return { 
            success: false, 
            error: '여러 번 시도했으나 콘텐츠를 생성할 수 없습니다. 잠시 후 다시 시도해주세요.' 
          };
        }
      }
    }
    
    // 응답이 없는 경우
    if (!response || !response.response) {
      console.error('Gemini API로부터 유효한 응답을 받지 못했습니다:', response);
      return {
        success: false,
        error: errorMessage || '콘텐츠를 생성할 수 없습니다. 잠시 후 다시 시도해주세요.'
      };
    }

    // 응답 텍스트 추출
    const responseText = response.response.text?.trim() || '';
    
    // 응답 텍스트가 비어있는 경우
    if (!responseText) {
      console.error('Gemini API가 빈 텍스트를 반환했습니다');
      return {
        success: false,
        error: '콘텐츠를 생성할 수 없습니다. 잠시 후 다시 시도해주세요.'
      };
    }
    
    // 응답 텍스트 후처리
    let processedText = responseText;
    
    // 불필요한 제목이나 마크다운 제거
    processedText = processedText
      .replace(/^#+ .*$/gm, '') // 마크다운 제목 제거
      .replace(/^\*\*.*\*\*$/gm, '') // 볼드 텍스트로만 된 줄 제거
      .replace(/^- /gm, '• ') // 불릿 포인트 통일
      .replace(/\d+,\d+원|₩\d+,\d+|\d+원|₩\d+|\d+,\d+₩|\d+₩/g, '') // 가격 정보 제거
      .replace(/할인가|정가|판매가|특가|세일가|프로모션 가격/g, '') // 가격 관련 단어 제거
      .replace(/단돈|저렴한 가격|합리적인 가격|경제적인|비용 효율적/g, '') // 가격 관련 표현 제거
      .replace(/\s{2,}/g, ' ') // 중복 공백 제거
      .trim();
    
    // 너무 긴 경우 내용 잘라내기
    const maxChars = 800;
    if (processedText.length > maxChars) {
      // 마지막 문장이 완성되는 지점 찾기
      const lastSentenceEnd = processedText.substring(0, maxChars).lastIndexOf('.');
      if (lastSentenceEnd > 0) {
        processedText = processedText.substring(0, lastSentenceEnd + 1);
      } else {
        processedText = processedText.substring(0, maxChars);
      }
    }

    // 토큰 사용량 추적
    const inputTokens = estimateTokenCount(systemPrompt + contextPrompt + sectionInstruction + additionalGuidance);
    const outputTokens = estimateTokenCount(processedText);
    recordTokenUsage(inputTokens, outputTokens);

    // 반환 객체 생성
    const regeneratedSection: ProductDetailSection = {
      id: sectionId,
      title: sectionTitle,
      content: processedText
    };

    console.log(`섹션 [${sectionId}] 재생성 완료`);

    return {
      success: true,
      sections: {  
        [sectionId]: regeneratedSection
      },
      tokenUsage: {
        inputTokens,
        outputTokens,
        date: new Date().toISOString(),
        cost: calculateCost(inputTokens, outputTokens)
      }
    };
  } catch (error: any) {
    console.error('섹션 재생성 중 오류 발생:', error);
    return {
      success: false,
      error: error?.message || '알 수 없는 오류가 발생했습니다.'
    };
  }
}

// 토큰 비용 계산 헬퍼 함수
export function calculateCost(inputTokens: number, outputTokens: number): number {
  // Gemini 1.5 Flash 모델 기준 가격 (1M 토큰당 $0.35 입력, $1.05 출력)
  const inputCostPer1M = 0.35;
  const outputCostPer1M = 1.05;
  
  return (inputTokens / 1000000) * inputCostPer1M + (outputTokens / 1000000) * outputCostPer1M;
}