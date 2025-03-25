import { createGeminiApi, rotateApiKey, getApiKeyCount, safetySettings } from '@/lib/api/keys';
import { getSectionIds, getKoreanTitle, getSectionInstruction } from '@/lib/sections/section-manager';
import { formatPrice } from '@/lib/sections/section-manager';
import { estimateTokenCount, recordTokenUsage } from '@/lib/tokens/usage-tracker';
import { ProductCategory, ProductData, ProductDetailContent, ProductDetailSection } from '@/types/product';

// 모델 설정
const MODEL_CONFIG = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 4096,
};

// Gemini API 클라이언트 생성
const getApiClient = async () => {
  try {
    const genAI = createGeminiApi();
    return genAI.getGenerativeModel({
      model: 'gemini-pro',
      generationConfig: MODEL_CONFIG,
      safetySettings,
    });
  } catch (error) {
    console.error('API 클라이언트 생성 중 오류:', error);
    throw error;
  }
};

// 제품 상세 정보 생성 함수
export const generateProductDetailContent = async (
  productData: ProductData
): Promise<ProductDetailContent> => {
  try {
    // API 클라이언트 가져오기
    const model = await getApiClient();
    
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
    const result = await model.generateContent(
      systemPrompt + '\n\n' + userPrompt
    );

    // 응답 텍스트 추출
    const responseText = result.response.text();

    // 토큰 사용량 추적
    const inputTokens = estimateTokenCount(systemPrompt + userPrompt);
    const outputTokens = estimateTokenCount(responseText);
    recordTokenUsage(inputTokens, outputTokens);

    // 섹션 콘텐츠 파싱
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

    // Record를 배열로 변환
    const sections = Object.values(sectionsRecord);

    // 결과 반환
    return {
      productName: productData.name,
      productCategory: productData.category,
      productDescription: productData.description || "",
      keywords: Array.isArray(productData.keywords) ? productData.keywords : [],
      targetPrice: productData.price || "",
      marketCompetitionLevel: productData.competitionLevel || "",
      targetAudience: productData.targetAudience || "",
      additionalInfo: productData.additionalInfo || "",
      sections
    };
  } catch (error) {
    console.error('제품 상세 정보 생성 중 오류 발생:', error);
    // API 키 순환 후 재시도
    if (getApiKeyCount() > 1) {
      rotateApiKey();
      console.log('API 키를 교체하여 다시 시도합니다.');
      return generateProductDetailContent(productData);
    }
    throw error;
  }
};