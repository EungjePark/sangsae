import { createGeminiApi, rotateApiKey, getApiKeyCount, safetySettings } from '@/lib/api/keys';
import { getSectionIds, getKoreanTitle, getSectionInstruction } from '@/lib/sections/section-manager';
import { estimateTokenCount, recordTokenUsage } from '@/lib/tokens/usage-tracker';
import { ProductCategory, ProductData, ProductDetailContent, ProductDetailSection } from '@/types/product';

// 모델 설정
const MODEL_CONFIG = {
  temperature: 1,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};

// Gemini API 클라이언트 생성
const getApiClient = async () => {
  try {
    const genAI = createGeminiApi();
    return genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: MODEL_CONFIG,
      safetySettings,
    });
  } catch (error) {
    console.error('API 클라이언트 생성 중 오류:', error);
    throw error;
  }
};

// 콘텐츠 정리 및 가독성 개선 함수
function formatContent(content: string): string {
  // 마크다운 문법 제거 및 가독성 개선
  let formatted = content
    .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>') // 볼드 이탤릭을 HTML 태그로 변환
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')  // 볼드를 HTML 태그로 변환
    .replace(/\*(.*?)\*/g, '<em>$1</em>')  // 이탤릭을 HTML 태그로 변환
    .replace(/^# (.*?)$/gm, '<h1>$1</h1>') // h1 변환
    .replace(/^## (.*?)$/gm, '<h2>$1</h2>') // h2 변환
    .replace(/^### (.*?)$/gm, '<h3>$1</h3>') // h3 변환
    .replace(/^#### (.*?)$/gm, '<h4>$1</h4>') // h4 변환
    .replace(/^##### (.*?)$/gm, '<h5>$1</h5>') // h5 변환
    .replace(/^###### (.*?)$/gm, '<h6>$1</h6>') // h6 변환
    .replace(/^- (.*?)$/gm, '• $1') // 글머리 기호 통일
    .replace(/^[*+] (.*?)$/gm, '• $1') // 다른 글머리 기호도 통일
    .replace(/^(\d+)\. (.*?)$/gm, '$1. $2') // 번호 목록 유지
    .replace(/\n{3,}/g, '\n\n'); // 여러 줄바꿈 통일

  // 글머리 기호 목록을 HTML 리스트로 변환
  const lines = formatted.split('\n');
  let inList = false;
  let result = '';

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const isListItem = line.startsWith('• ') || /^\d+\. /.test(line);

    if (isListItem && !inList) {
      // 새 목록 시작
      inList = true;
      result += '<ul>\n';
    } else if (!isListItem && inList) {
      // 목록 종료
      inList = false;
      result += '</ul>\n';
    }

    if (isListItem) {
      const content = line.startsWith('• ') ? line.substring(2) : line.replace(/^\d+\. /, '');
      result += `<li>${content}</li>\n`;
    } else {
      result += line + '\n';
    }
  }

  // 마지막 목록이 닫히지 않은 경우 처리
  if (inList) {
    result += '</ul>\n';
  }

  return result;
}

// 응답 처리 후에 콘텐츠 가독성 개선
function postProcessResponse(response: any): any {
  if (response && response.sections) {
    // 각 섹션의 콘텐츠 포맷팅 개선
    for (const key in response.sections) {
      if (response.sections[key] && response.sections[key].content) {
        response.sections[key].content = formatContent(response.sections[key].content);
      }
    }
  }
  return response;
}

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
    const systemPrompt = `# 역할: 상품 소개 페이지 콘텐츠 스페셜리스트

## 제품 기본 정보
- 제품명: ${productData.name}
- 카테고리: ${productData.category}
- 핵심 키워드: ${Array.isArray(productData.keywords) ? productData.keywords.join(", ") : productData.keywords || ""}
- 제품 설명: ${productData.description || ""}
- 추가 정보: ${productData.additionalInfo || ""}
- 타겟 고객: ${productData.targetAudience || productData.targetCustomers || ""}

## 작업 목표
매력적이고 판매를 촉진하는 상품 상세 페이지의 각 섹션별 콘텐츠를 생성해주세요.

## 설득 구조 가이드라인
다음 14가지 설득 구조를 활용하여 각 섹션에 적합한 설득 방식을 적용해주세요:

1. 문제 제기와 해결 방안(PS 구조) - 고객의 문제를 제시하고 제품이 어떻게 해결하는지 보여주세요
2. 호기심 유발(CA 구조) - 고객의 호기심을 자극하는 흥미로운 내용을 포함하세요
3. 스토리텔링(SS 구조) - 제품 개발 배경이나 브랜드 스토리를 통해 신뢰를 구축하세요
4. 가치 입증 - 전문가 추천, 품질 인증, 사용자 후기 등으로 제품 가치를 증명하세요
5. 긍정 세트 - 고객이 공감할 수 있는 상황을 나열하여 제품의 필요성을 강조하세요
6. 사회적 증거 - 다른 사용자들의 경험과 후기를 통해 신뢰를 구축하세요
7. 요약 - 제품의 핵심 특징을 간결하게 요약하여 한눈에 파악할 수 있게 하세요
8. 소구점 구체화 - 각 특징/장점을 구체적으로 설명하여 이해도를 높이세요
9. 나열 - 제품의 구성 요소나 특징을 명확하게 나열하여 정보를 구조화하세요
10. 인증 - 제품의 품질이나 안전성 관련 인증 정보를 제공하여 신뢰를 높이세요
11. 순서 - 제품 사용 방법이나 과정을 단계별로 안내하여 명확하게 전달하세요
12. 비교 - 경쟁 제품과의 차별점을 간접적으로 비교하여 우수성을 강조하세요
13. 반박 제거 - 고객이 가질 수 있는 의문이나 우려사항을 미리 해소하세요
14. 상세 설명 - 고객이 궁금해할 수 있는 세부 사항을 충분히 설명하세요

## 콘텐츠 스타일 가이드라인
- 읽기 쉽고 명확한 문장 구조 사용
- 감성적이면서도 정보가 풍부한 설명
- 고객의 문제와 제품의 해결책을 연결
- 구체적인 혜택과 기능 강조
- 전문 용어와 일상 언어의 균형
- 구매욕구를 자극하는 표현 적절히 활용
- 각 섹션의 특성에 맞는 톤과 스타일 사용
- 강조하고 싶은 내용은 '중요' 접두사를 붙여서 표현 (마크다운 대체)

## 출력 형식
각 섹션은 다음 형식으로 작성해주세요:

[섹션 제목]
섹션 내용

- 각 섹션은 두 줄 띄워 완전히 분리해 주세요
- 섹션 제목은 대괄호([])로 감싸주세요
- 제목과 내용 사이에 빈 줄 없이 바로 내용 시작
- 내용은 읽기 쉽게 적절한 문단 구분 사용
- 마크다운 형식(*, **, ##, >, _ 등)을 절대 사용하지 마세요
- 강조하고 싶은 내용은 '중요: ' 접두사를 붙여 표현하세요 (마크다운 대신)
- 목록은 1. 2. 3. 또는 • 기호를 사용하여 표시해주세요
- 제목이나 소제목은 별도 줄에 배치하고 마지막에 ':' 콜론을 추가하세요

## 주의사항
- 해당 제품 카테고리에 적합한 내용만 작성
- 필요 이상의 과장된 표현이나 허위 정보 포함 금지
- 가격 정보는 포함하지 말고 가치와 혜택에 집중하세요
- 구체적이고 상세한 정보 제공 (일반적이고 모호한 내용 지양)
- 각 섹션별 지시사항을 철저히 준수
- 반드시 실제 사용자 경험과 후기 사례를 포함하세요
- 결과물에 별표(*), 해시태그(#), 언더바(_), 코드 블록 기호 등의 마크다운 형식을 절대 사용하지 마세요
- 중요한 점은 마크다운 대신 '중요: '라는 접두사를 문장 앞에 붙이세요`;

    // 콘텐츠 생성 요청
    const userPrompt = sectionIds.map(id => {
      const title = getKoreanTitle(id);
      const instruction = getSectionInstruction(id, productData);
      return `[${title}]\n${instruction}`;
    }).join('\n\n');

    // 모델 호출
    const modelResult = await model.generateContent(
      systemPrompt + '\n\n' + userPrompt
    );

    // 응답 텍스트 추출
    const responseText = modelResult.response.text();

    // 토큰 사용량 추적
    const inputTokens = estimateTokenCount(systemPrompt + userPrompt);
    const outputTokens = estimateTokenCount(responseText);
    recordTokenUsage(inputTokens, outputTokens);

    // 섹션 콘텐츠 파싱 및 정리
    const sectionsRecord: Record<string, ProductDetailSection> = {};
    const sectionRegex = /\[([^\]]+)\]\s*\n([\s\S]*?)(?=\n\[[^\]]+\]|\n###|$)/g;
    
    let match;
    while ((match = sectionRegex.exec(responseText)) !== null) {
      const sectionTitle = match[1].trim();
      const sectionContent = match[2].trim();
      
      // 제목에 해당하는 섹션 ID 찾기
      const sectionId = sectionIds.find(id => {
        const koreanTitle = getKoreanTitle(id);
        return koreanTitle === sectionTitle;
      }) || sectionTitle.toLowerCase().replace(/\s+/g, '_');
      
      sectionsRecord[sectionId] = {
        id: sectionId,
        title: sectionTitle,
        content: sectionContent
      };
    }

    // 섹션 콘텐츠 정리된 결과 생성
    const outputResult: ProductDetailContent = {
      cacheName: `${productData.name}_${productData.category}`,
      sections: Object.values(sectionsRecord)
    };

    // 결과 반환 전 포맷팅 적용 (마크다운 제거, HTML 적용 등)
    const formattedResult = postProcessResponse(outputResult);

    return formattedResult;
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