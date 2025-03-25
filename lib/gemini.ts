import { 
  GoogleGenerativeAI, 
  HarmCategory, 
  HarmBlockThreshold, 
  GenerativeModel,
  GenerateContentResult
} from '@google/generative-ai';

// 서버 사이드에서만 임포트
let GoogleAICacheManager: any;
if (typeof window === 'undefined') {
  import('@google/generative-ai/server').then(module => {
    GoogleAICacheManager = module.GoogleAICacheManager;
  }).catch(err => {
    console.error('서버 모듈 임포트 오류:', err);
  });
}

// 타입 정의
export type ProductCategory = '전자제품' | '패션의류' | '뷰티' | '식품' | '홈/리빙' | '스포츠/레저' | '장난감/취미' | '도서/음반' | '건강/의료' | '기타';

export interface ProductData {
  name: string;
  category: string;
  price?: string;
  description?: string;
  additionalInfo?: string;
  keywords?: string[] | string;
  shippingInfo?: string;
  returnPolicy?: string;
}

export interface ProductDetailSection {
  id: string;
  content: string;
}

export interface ProductDetailContent {
  sections: ProductDetailSection[];
}

// API 키 관리 및 로테이션
const apiKeys = [
  process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',
  // 여러 API 키를 추가할 수 있음
];

let currentKeyIndex = 0;

// 현재 API 키 가져오기
export const getCurrentApiKey = () => {
  if (!apiKeys[currentKeyIndex] || apiKeys[currentKeyIndex].length === 0) {
    console.error('API 키가 설정되지 않았거나 유효하지 않습니다.');
    return '';
  }
  return apiKeys[currentKeyIndex];
};

// API 키 개수 가져오기
export const getApiKeyCount = () => {
  return apiKeys.filter(key => key.length > 0).length;
};

// API 키 로테이션
export const rotateApiKey = () => {
  currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
  return getCurrentApiKey();
};

// Gemini API 인스턴스 생성
export const createGeminiApi = () => {
  const apiKey = getCurrentApiKey();
  if (!apiKey) {
    throw new Error('API 키가 설정되지 않았습니다.');
  }
  console.log('Gemini API 인스턴스 생성 중...');
  return new GoogleGenerativeAI(apiKey);
};

// 안전 설정
export const safetySettings = [
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

// 토큰 사용량 관련 기능
let totalTokensUsed = 0;
let todayTokensUsed = 0;

// 토큰 수 예상 (단순 추정)
export const countTokens = (text: string): number => {
  // 영어 단어는 약 4글자, 한글은 약 2글자당 1토큰으로 대략 추정
  const englishTokens = text.replace(/[^\x00-\x7F]/g, '').length / 4;
  const koreanTokens = text.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, '').length / 2;
  return Math.ceil(englishTokens + koreanTokens);
};

// 토큰 사용량 기록
export const recordTokenUsage = (inputTokens: number, outputTokens: number): void => {
  const total = inputTokens + outputTokens;
  totalTokensUsed += total;
  todayTokensUsed += total;
  console.log(`토큰 사용: 입력=${inputTokens}, 출력=${outputTokens}, 합계=${total}, 누적=${totalTokensUsed}`);
};

// 누적 토큰 사용량 조회
export const getTokenUsage = (): number => {
  return totalTokensUsed;
};

// 오늘 토큰 사용량 조회
export const getTodayTokenUsage = (): number => {
  return todayTokensUsed;
};

// 가격 포맷팅
export const formatPrice = (price: string): string => {
  const numPrice = parseFloat(price.replace(/,/g, ''));
  return isNaN(numPrice) ? price : `${numPrice.toLocaleString('ko-KR')}원`;
};

// 섹션 ID에 따른 한글 제목 매핑
export const getKoreanTitle = (sectionId: string): string => {
  const titleMap: Record<string, string> = {
    'title_block': '제품 핵심 타이틀',
    'hero_section': '제품 소개',
    'main_feature': '주요 기능',
    'sub_features': '추가 기능',
    'how_to_use': '사용 방법',
    'specifications': '제품 사양',
    'warranty_info': '보증 정보',
    'shipping_return': '배송 및 반품 정보',
    'faq': '자주 묻는 질문',
    'style_guide': '스타일 가이드',
    'material_details': '소재 정보',
    'size_chart': '사이즈 차트',
    'care_instructions': '관리 방법',
    'coordination_suggestions': '코디 제안',
    'ingredients': '성분 정보',
    'effect_description': '효과 설명',
    'recommended_skin_type': '추천 피부 타입',
    'safety_features': '안전 기능',
    'age_recommendation': '연령 추천',
    'taste_description': '맛 설명',
    'nutrition_facts': '영양 정보',
    'storage_instructions': '보관 방법',
    'serving_suggestions': '서빙 제안',
    'size_specifications': '크기 명세',
    'installation_guide': '설치 가이드',
    'tech_specifications': '기술 사양',
    'unique_technology': '독특한 기술',
    'compatibility_info': '호환성 정보',
    'performance_features': '성능 특징',
    'content_summary': '내용 요약',
    'author_artist_info': '작가/아티스트 정보',
    'edition_details': '에디션 세부정보',
    'highlight_features': '하이라이트 특징',
    'creative_possibilities': '창의적 활용법'
  };

  return titleMap[sectionId] || sectionId;
};

// 카테고리별 섹션 ID 목록
export const getSectionIds = (category: ProductCategory): string[] => {
  const commonSections = ['title_block', 'hero_section', 'main_feature', 'sub_features', 'how_to_use', 'specifications', 'warranty_info', 'shipping_return', 'faq'];
  
  const categorySections: Record<ProductCategory, string[]> = {
    '전자제품': ['tech_specifications', 'unique_technology', 'compatibility_info', 'performance_features'],
    '패션의류': ['style_guide', 'material_details', 'size_chart', 'care_instructions', 'coordination_suggestions'],
    '뷰티': ['ingredients', 'effect_description', 'recommended_skin_type'],
    '식품': ['taste_description', 'nutrition_facts', 'storage_instructions', 'serving_suggestions'],
    '홈/리빙': ['size_specifications', 'installation_guide'],
    '스포츠/레저': ['performance_features', 'material_details', 'size_chart'],
    '장난감/취미': ['creative_possibilities', 'age_recommendation', 'safety_features'],
    '도서/음반': ['content_summary', 'author_artist_info', 'edition_details'],
    '건강/의료': ['effect_description', 'ingredients', 'safety_features'],
    '기타': ['highlight_features']
  };
  
  return [...commonSections, ...(categorySections[category as ProductCategory] || [])];
};

// 섹션별 토큰 제한
export const getSectionTokenLimit = (sectionId: string): number => {
  const limits: Record<string, number> = {
    'title_block': 50,
    'hero_section': 300,
    'main_feature': 400,
    'sub_features': 400,
    'how_to_use': 350,
    'specifications': 300,
    'warranty_info': 200,
    'shipping_return': 200,
    'faq': 500,
  };
  
  return limits[sectionId] || 300;
};

// 섹션별 지시사항
export const getSectionInstruction = (sectionId: string, productData: ProductData): string => {
  const instructions: Record<string, string> = {
    'title_block': `${productData.name}의 매력을 한 문장으로 강조하는 타이틀 문구를 작성해주세요.`,
    'hero_section': `${productData.name}을(를) 소개하는 첫인상을 결정하는 매력적인 소개문을 작성해주세요.`,
    'main_feature': `${productData.name}의 가장 중요한 3-5가지 핵심 기능을 상세히 설명해주세요.`,
    'sub_features': `${productData.name}의 부가적인 기능들을 설명해주세요.`,
    'how_to_use': `${productData.name}의 효과적인 사용 방법을 단계별로 설명해주세요.`,
    'specifications': `${productData.name}의 기술적 사양과 제원을 목록 형식으로 작성해주세요.`,
    'warranty_info': `${productData.name}의 보증 기간 및 관련 정보를 설명해주세요.`,
    'shipping_return': `배송 정보와 교환/반품 정책을 명확하게 설명해주세요.`,
    'faq': `${productData.name}에 대해 고객들이 자주 묻는 질문 5개와, 그에 대한 명확한 답변을 작성해주세요.`,
    'style_guide': `${productData.name}의 스타일링 가이드와 패션 제안을 제공해주세요.`,
    'material_details': `${productData.name}에 사용된 소재의 종류, 품질, 특성을 자세히 설명해주세요.`,
    'size_chart': `${productData.name}의 정확한 사이즈 정보를 표 형식으로 제공해주세요.`,
    'care_instructions': `${productData.name}의 올바른 관리 및 세탁 방법을 안내해주세요.`,
    'coordination_suggestions': `${productData.name}과(와) 어울리는 다른 아이템 또는 코디네이션 방법을 제안해주세요.`,
    'ingredients': `${productData.name}에 포함된 주요 성분과 각 성분의 효능을 설명해주세요.`,
    'effect_description': `${productData.name}의 효과와 사용 시 기대할 수 있는 결과를 상세히 설명해주세요.`,
    'recommended_skin_type': `${productData.name}이(가) 적합한 피부 타입과 상태를 설명해주세요.`,
    'safety_features': `${productData.name}의 안전 기능과 관련 인증을 설명해주세요.`,
    'age_recommendation': `${productData.name}이(가) 적합한 연령대와 그 이유를 설명해주세요.`,
    'taste_description': `${productData.name}의 맛과 풍미를 상세히 묘사해주세요.`,
    'nutrition_facts': `${productData.name}의 영양 성분과 건강상 이점을 설명해주세요.`,
    'storage_instructions': `${productData.name}의 최적 보관 방법 및 유통기한 정보를 제공해주세요.`,
    'serving_suggestions': `${productData.name}을(를) 활용한 조리법이나 서빙 아이디어를 제안해주세요.`,
    'size_specifications': `${productData.name}의 정확한 크기, 무게, 용량 등의 명세를 제공해주세요.`,
    'installation_guide': `${productData.name}의 설치 가이드와 필요한 도구, 과정을 단계별로 설명해주세요.`,
    'tech_specifications': `${productData.name}의 기술적 사양과 성능 데이터를 상세히 설명해주세요.`,
    'unique_technology': `${productData.name}만의 독특한 기술과 혁신적인 특징을 설명해주세요.`,
    'compatibility_info': `${productData.name}과(와) 호환되는 기기, 시스템, 액세서리 정보를 제공해주세요.`,
    'performance_features': `${productData.name}의 성능 관련 특징과 장점을 설명해주세요.`,
    'content_summary': `${productData.name}의 주요 내용과 하이라이트를 요약해주세요.`,
    'author_artist_info': `${productData.name}의 창작자/작가/아티스트에 대한 정보와 배경을 소개해주세요.`,
    'edition_details': `${productData.name}의 에디션 정보, 특별판 여부, 한정판 정보 등을 설명해주세요.`,
    'highlight_features': `${productData.name}의 가장 뛰어난 특징 3-5가지를 강조하여 설명해주세요.`,
    'creative_possibilities': `${productData.name}으로 가능한 다양한 창의적 활용법을 제안해주세요.`
  };

  return instructions[sectionId] || `${productData.name}에 대한 정보를 제공해주세요.`;
};

// 응답 텍스트에서 섹션 파싱
export const parseSectionsFromText = (responseText: string, sectionIds: string[]): Record<string, ProductDetailSection> => {
  const sectionsRecord: Record<string, ProductDetailSection> = {};
  const sectionRegex = /\[([^\]]+)\]\s*\n([\s\S]*?)(?=\n\[[^\]]+\]|\n###|$)/g;
  
  let match;
  while ((match = sectionRegex.exec(responseText)) !== null) {
    const sectionTitle = match[1].trim();
    const content = match[2].trim();
    
    // 섹션 타이틀에 해당하는 ID 찾기
    const sectionId = sectionIds.find(id => {
      const title = getKoreanTitle(id);
      return sectionTitle === title || sectionTitle.includes(title) || title.includes(sectionTitle);
    });
    
    if (sectionId) {
      sectionsRecord[sectionId] = {
        id: sectionId,
        content: content
      };
    }
  }
  
  return sectionsRecord;
};

// Gemini API 컨텍스트 캐싱 관리자
let cacheManager: any = null;

// 캐싱 관리자 초기화 함수
export function initCacheManager() {
  // 클라이언트 사이드에서는 실행하지 않음
  if (typeof window !== 'undefined' || !GoogleAICacheManager) {
    console.log('클라이언트 사이드에서는 캐시 관리자를 초기화할 수 없습니다.');
    return null;
  }
  
  try {
    const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
    cacheManager = new GoogleAICacheManager(apiKey);
    console.log('캐시 관리자가 성공적으로 초기화되었습니다.');
    return cacheManager;
  } catch (error) {
    console.error('캐시 관리자 초기화 중 오류 발생:', error);
    return null;
  }
}

// 캐싱 관리자 가져오기 (필요시 초기화)
export function getCacheManager() {
  if (!cacheManager) {
    return initCacheManager();
  }
  return cacheManager;
}

// 제품 정보 캐싱하기
export async function cacheProductContext(productData: any, systemPrompt: string) {
  // 클라이언트 사이드에서는 실행하지 않음
  if (typeof window !== 'undefined') {
    console.log('클라이언트 사이드에서는 캐싱을 사용할 수 없습니다.');
    return null;
  }
  
  try {
    const cache = getCacheManager();
    if (!cache) {
      console.error('캐시 관리자를 사용할 수 없습니다.');
      return null;
    }

    // 제품 정보 및 시스템 프롬프트 캐싱
    const cacheResult = await cache.create({
      model: "models/gemini-1.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            { text: JSON.stringify(productData) }
          ]
        },
        {
          role: "system",
          parts: [
            { text: systemPrompt }
          ]
        }
      ]
    });

    console.log('컨텍스트가 성공적으로 캐시되었습니다:', cacheResult.name);
    return cacheResult;
  } catch (error) {
    console.error('컨텍스트 캐싱 중 오류 발생:', error);
    return null;
  }
}

// 캐시된 컨텍스트로 모델 생성
export function getModelWithCachedContext(cacheResult: any) {
  // 클라이언트 사이드에서는 실행하지 않음
  if (typeof window !== 'undefined') {
    console.log('클라이언트 사이드에서는 캐시된 컨텍스트를 사용할 수 없습니다.');
    return null;
  }
  
  try {
    const genAI = new GoogleGenerativeAI(getCurrentApiKey());
    return genAI.getGenerativeModelFromCachedContent(cacheResult);
  } catch (error) {
    console.error('캐시된 컨텍스트로 모델 생성 중 오류 발생:', error);
    return null;
  }
}

// 상품 상세 정보 생성 함수
export const generateProductDetailContent = async (
  productData: ProductData
): Promise<ProductDetailContent> => {
  try {
    // API 클라이언트 가져오기
    const genAI = createGeminiApi();
    console.log('API 키 및 설정 확인:', !!getCurrentApiKey(), getApiKeyCount());
    
    // 모델 초기화 
    let geminiModel = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      },
      safetySettings,
    });
    
    // 캐시된 컨텍스트 사용
    const systemPromptForCache = `당신은 재미있고 매력적인 상품 소개 페이지를 만드는 전문가입니다.
다음 제품에 대한 페이지의 각 섹션별 콘텐츠를 제작해 주세요.
제품 이름: ${productData.name}
가격: ${formatPrice(productData.price || "0")}
카테고리: ${productData.category}
키워드: ${Array.isArray(productData.keywords) ? productData.keywords.join(", ") : productData.keywords || ""}
제품 설명: ${productData.description || ""}
추가 정보: ${productData.additionalInfo || ""}
배송 정보: ${productData.shippingInfo || ""}
반품 정책: ${productData.returnPolicy || ""}

콘텐츠는 읽기 쉽고, 친근하고, 구매욕을 자극하는 스타일로 작성해주세요.
각 섹션별 콘텐츠를 분리해서 제공해 주세요. 섹션 형식은 다음과 같습니다:

[섹션 제목]
섹션 내용

여러 섹션을 작성할 때 각 섹션은 완전히 분리되어 있어야 합니다.`;

    try {
      const cacheResult = await cacheProductContext(productData, systemPromptForCache);
      if (cacheResult) {
        const cachedModel = getModelWithCachedContext(cacheResult);
        if (cachedModel) {
          geminiModel = cachedModel;
          console.log('캐시된 컨텍스트로 모델을 성공적으로 업데이트했습니다.');
        }
      }
    } catch (error) {
      console.error('캐시된 컨텍스트 적용 중 오류 발생:', error);
      console.log('기본 모델을 사용하여 계속 진행합니다.');
    }
    
    // 카테고리에 맞는 섹션 ID 목록 가져오기
    const sectionIds = getSectionIds(productData.category as ProductCategory);
    
    if (!sectionIds || sectionIds.length === 0) {
      throw new Error('유효한 섹션을 찾을 수 없습니다');
    }
    
    // 시스템 프롬프트 생성
    const systemPrompt = `당신은 재미있고 매력적인 상품 소개 페이지를 만드는 전문가입니다.
다음 제품에 대한 페이지의 각 섹션별 콘텐츠를 제작해 주세요.
제품 이름: ${productData.name}
가격: ${formatPrice(productData.price || "0")}
카테고리: ${productData.category}
키워드: ${Array.isArray(productData.keywords) ? productData.keywords.join(", ") : productData.keywords || ""}
제품 설명: ${productData.description || ""}
추가 정보: ${productData.additionalInfo || ""}
배송 정보: ${productData.shippingInfo || ""}
반품 정책: ${productData.returnPolicy || ""}

콘텐츠는 읽기 쉽고, 친근하고, 구매욕을 자극하는 스타일로 작성해주세요.
각 섹션별 콘텐츠를 분리해서 제공해 주세요. 섹션 형식은 다음과 같습니다:

[섹션 제목]
섹션 내용

여러 섹션을 작성할 때 각 섹션은 완전히 분리되어 있어야 합니다.`;

    // 콘텐츠 생성 요청
    const userPrompt = sectionIds.map(id => {
      const title = getKoreanTitle(id);
      const instruction = getSectionInstruction(id, productData);
      return `[${title}]\n${instruction}`;
    }).join('\n\n');

    // 모델 호출
    const result = await geminiModel.generateContent(
      systemPrompt + '\n\n' + userPrompt
    );

    // 응답 텍스트 추출
    const responseText = result.response.text();

    // 토큰 사용량 추적
    const inputTokens = countTokens(systemPrompt + userPrompt);
    const outputTokens = countTokens(responseText);
    recordTokenUsage(inputTokens, outputTokens);

    // 섹션 콘텐츠 파싱
    const sectionsRecord = parseSectionsFromText(responseText, sectionIds);
    
    // 결과를 배열로 변환
    const sectionsArray = Object.values(sectionsRecord);
    
    // 결과 반환
    return {
      sections: sectionsArray
    };
  } catch (error) {
    console.error('상세 페이지 생성 중 오류:', error);
    throw error;
  }
};

// app.tsx에서 사용하는 함수 이름과 일치하도록 별칭 내보내기
export const generateProductDetail = generateProductDetailContent;

// 섹션 재생성 함수
export const regenerateSection = async (
  sectionId: string,
  productData: ProductData,
  currentContent: ProductDetailContent
): Promise<{ sections: Record<string, ProductDetailSection> }> => {
  try {
    // API 클라이언트 가져오기
    const genAI = createGeminiApi();
    
    // API 키 확인 및 로깅
    console.log('섹션 재생성 - API 키 및 설정 확인:', !!getCurrentApiKey(), getApiKeyCount());
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-pro',
      generationConfig: {
        temperature: 1.0,  // 창의성 증가를 위해 온도 상승
        topP: 0.99,        // 더 다양한 표현을 위해 topP 상승
        topK: 40,          // 다양한 단어 선택 보장
        maxOutputTokens: 4096,
      },
      safetySettings,
    });

    // 섹션 제목 가져오기
    const sectionTitle = getKoreanTitle(sectionId);
    
    // 현재 섹션 데이터 추출 (배열 또는 객체 형태 모두 처리)
    let otherSections: ProductDetailSection[] = [];
    if (Array.isArray(currentContent.sections)) {
      otherSections = currentContent.sections.filter(section => section.id !== sectionId);
    } else if (typeof currentContent.sections === 'object') {
      otherSections = Object.values(currentContent.sections)
        .filter((section: any) => section.id !== sectionId)
        .map((section: any): ProductDetailSection => ({
          id: section.id,
          content: section.content
        }));
    }
    
    // 다른 섹션 내용으로 컨텍스트 제공
    const otherSectionsContext = otherSections
      .map((section: ProductDetailSection) => `[${getKoreanTitle(section.id)}]\n${section.content.substring(0, 250)}...`)
      .join('\n\n');
    
    // 시스템 프롬프트 개선
    const systemPrompt = `당신은 전문적인 상품 소개 페이지를 작성하는 최고의 카피라이터입니다.
다음 제품의 "${sectionTitle}" 섹션을 매력적이고 설득력 있게 새롭게 작성해 주세요.

제품 이름: ${productData.name}
카테고리: ${productData.category}
제품 설명: ${productData.description || ""}
추가 정보: ${productData.additionalInfo || ""}
배송 정보: ${productData.shippingInfo || ""}
반품 정책: ${productData.returnPolicy || ""}

다른 섹션들의 내용은 다음과 같습니다. 이 내용과 일관성을 유지하면서 새로운 "${sectionTitle}" 섹션을 작성해 주세요:

${otherSectionsContext}`;

    // 섹션별 맞춤 지침 가져오기
    const sectionInstruction = getSectionInstruction(sectionId, productData);
    
    // 품질 개선을 위한 추가 지침
    const additionalGuidance = `
이전과는 완전히 다른 새로운 내용으로 작성해 주세요. 다음 가이드라인을 따라주세요:

1. 감성적인 스토리텔링과 설득력 있는 표현을 사용하세요
2. 소비자의 감정에 호소하는 언어를 활용하세요
3. 구체적이고 생생한 묘사로 제품의 장점을 강조하세요
4. 간결하면서도 강력한 문장으로 독자의 관심을 끌어당기세요
5. 제목은 제거하고 본문 내용만 작성해 주세요
6. 전문 카피라이터가 작성한 것처럼 세련되고 매력적인 문체를 사용하세요
7. 독자가 제품을 구매하고 싶게 만드는 설득력 있는 내용을 담아주세요`;

    // 모델 호출
    const result = await model.generateContent(
      systemPrompt + '\n\n' + sectionInstruction + '\n\n' + additionalGuidance
    );

    // 응답 텍스트 추출 및 정리
    const responseText = result.response.text().trim();

    // 토큰 사용량 추적
    const inputTokens = countTokens(systemPrompt + sectionInstruction + additionalGuidance);
    const outputTokens = countTokens(responseText);
    recordTokenUsage(inputTokens, outputTokens);

    // 반환 객체 생성
    const regeneratedSection: ProductDetailSection = {
      id: sectionId,
      content: responseText
    };

    return {
      sections: {
        [sectionId]: regeneratedSection
      }
    };
  } catch (error) {
    console.error('섹션 재생성 중 오류 발생:', error);
    throw new Error('섹션 재생성에 실패했습니다. 다시 시도해 주세요.');
  }
};
