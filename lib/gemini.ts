import { GoogleGenerativeAI } from "@google/generative-ai";
import { ProductInfo, ProductDetailSection, ProductData, ProductCategory } from '../types/product';
import { recordTokenUsage as recordTokenUsageFromTracker, estimateTokenCount } from '../lib/tokens/usage-tracker';
import { 
  getSectionIds as getSectionIdsFromManager, 
  getSectionInstruction as getSectionInstructionFromManager, 
  getKoreanTitle as getKoreanTitleFromManager, 
  getSectionTokenLimit as getSectionTokenLimitFromManager, 
  getSectionOrder 
} from '../lib/sections/section-manager';
import { createGeminiApi } from '../lib/api/keys';
import { getCurrentApiKey, rotateApiKey } from "../lib/api/keys";
import { createPrompt, cleanSectionContent } from './generators/product-detail';
import { 
  GoogleGenAI, 
  HarmCategory, 
  HarmBlockThreshold, 
  GenerationConfig 
} from '@google/genai';
import { apiCache } from './api/cacheManager';

// Re-export ProductDetailSection and ProductCategory types
export type { ProductDetailSection, ProductCategory };

// Define and export ProductDetailContent interface
export interface ProductDetailContent {
  sections: ProductDetailSection[];
  cacheName: string;
  rawContent: string;
  html: string;
  markdown: string;
  updatedAt: string;
}

export const countTokens = (text: string): number => {
  const englishTokens = text.replace(/[^\x00-\x7F]/g, '').length / 4;
  const koreanTokens = text.replace(/[^\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/g, '').length / 2;
  return Math.ceil(englishTokens + koreanTokens);
};

export const recordTokenUsageLocal = (inputTokens: number, outputTokens: number): void => {
  const total = inputTokens + outputTokens;
  let totalTokensUsed = 0;
  let todayTokensUsed = 0;
  totalTokensUsed += total;
  todayTokensUsed += total;
  console.log(`토큰 사용 (lib/gemini): 입력=${inputTokens}, 출력=${outputTokens}, 합계=${total}, 누적=${totalTokensUsed}`);
  recordTokenUsageFromTracker(inputTokens, outputTokens);
};

export const getTokenUsage = (): number => {
  return 0;
};

export const getTodayTokenUsage = (): number => {
  return 0;
};

export const formatPrice = (price: string): string => {
  const numPrice = parseFloat(price.replace(/,/g, ''));
  return isNaN(numPrice) ? price : `${numPrice.toLocaleString('ko-KR')}원`;
};

// cleanFaqContent 함수 추가 - FAQ 형식 정리 기능 포함
const cleanFaqContent = (content: string, sectionId: string): string => {
  let cleanedContent = content;
  
  // 제목 등 불필요한 태그 제거
  cleanedContent = cleanedContent
    .replace(/^\[.*?\]\s*/gm, '') // 대괄호로 둘러싸인 제목 제거
    .replace(/^#\s+/gm, '') // 단일 # 제목 제거
    .replace(/^#{1,6}\s+/gm, '') // 다양한 수준의 마크다운 제목 제거
    .replace(/\n{3,}/g, '\n\n') // 연속된 줄바꿈 정리
    .trim();
  
  // FAQ 섹션 특별 처리
  if (sectionId === 'faq') {
    // 잘못된 FAQ 형식 수정
    cleanedContent = cleanedContent
      // 'Q ' 뒤에 쉼표로 구분된 질문/답변 패턴 수정
      .replace(/Q\s+(.*?)\s*,\s*(.*?)(?=\n*Q\s+|$)/g, 'Q: $1\n\nA: $2\n\n')
      // Q: 뒤에 쉼표가 있는 경우 수정
      .replace(/Q:\s+(.*?)\s*,\s*(.*?)(?=\n*Q:|$)/g, 'Q: $1\n\nA: $2\n\n')
      // 숫자 뒤에 오는 쉼표 구분 패턴 수정 (예: "1. 질문, 답변")
      .replace(/(\d+)\.\s+(.*?)\s*,\s*(.*?)(?=\n*\d+\.\s+|$)/g, 'Q: $2\n\nA: $3\n\n')
      // 불필요한 연속 공백 제거
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }
  
  return cleanedContent;
};

export const getKoreanTitleLocal = (sectionId: string): string => {
  const titleMap: Record<string, string> = {
    'benefits': '상품 특징 및 장점',
    'specs': '상품 스펙',
    'usage': '사용 방법',
    'detail': '상세 설명',
    'target': '타겟 고객',
    'differentiation': '차별화 포인트',
    'faq': '자주 묻는 질문',
    'warranty': '품질 보증 및 교환/반품',
    'shipping': '배송 안내',
    'care': '세탁 및 보관 방법',
    'caution': '주의사항',
    'origin': '원산지 정보',
    'materials': '소재 정보',
    'features': '기능 및 특징',
    'introduction': '상품 소개',
    'package': '구성품',
    'comparison': '비교 분석',
    'testimonials': '고객 후기'
  };
  
  return titleMap[sectionId] || sectionId;
};

export const getSectionIdsLocal = (category: ProductCategory): string[] => {
  return getSectionIdsFromManager(category);
};

export const getSectionTokenLimitLocal = (sectionId: string): number => {
  return getSectionTokenLimitFromManager(sectionId);
};

export const getSectionInstruction = (sectionId: string, productData: ProductData): string => {
  const instructions: Record<string, string> = { /* ... */ };
  return instructions[sectionId] || `${productData.name}에 대한 정보를 제공해주세요.`;
};

export const parseSectionsFromText = (responseText: string, sectionIds: string[]): Record<string, ProductDetailSection> => {
  const sectionsRecord: Record<string, ProductDetailSection> = {};
  const sectionRegex = /\[([^\]]+)\]\s*\n([\s\S]*?)(?=\n\[[^\]]+\]|\n###|$)/g;
  let match;
  while ((match = sectionRegex.exec(responseText)) !== null) {
    const sectionTitle = match[1].trim();
    const content = match[2].trim();
    const sectionId = sectionIds.find(id => {
      const title = getKoreanTitleLocal(id); 
      return sectionTitle === title || sectionTitle.includes(title) || title.includes(sectionTitle);
    });
    if (sectionId) {
      sectionsRecord[sectionId] = { id: sectionId, content: content };
    }
  }
  return sectionsRecord;
};

export async function generateProductDetailContent(productData: ProductData): Promise<ProductDetailContent> {
  try {
    // 캐시 키 생성 (productData 기반)
    const cacheKey = apiCache.generateKey({
      name: productData.name,
      category: productData.category,
      description: productData.description,
      keywords: productData.keywords,
      price: productData.price,
      targetCustomers: productData.targetCustomers
    });
    
    // 캐시 확인
    const cachedResult = apiCache.get<ProductDetailContent>(cacheKey);
    if (cachedResult) {
      console.log('캐시된 제품 상세 콘텐츠 사용:', productData.name);
      return cachedResult;
    }
    
    // 기본 섹션 설정
    const sectionIds = getSectionIdsLocal(productData.category);
    const genAI = createGeminiApi();
    
    // 개발 환경에서만 로그 출력
    const isDev = process.env.NODE_ENV === 'development';
    const logInfo = isDev ? console.info : () => {};
    
    // 섹션별 콘텐츠 생성
    const sectionPromises = sectionIds.map(async (sectionId) => {
      try {
        // FAQ 섹션을 위한 특별 처리
        if (sectionId === 'faq') {
          // FAQ 특화 프롬프트 생성
          const faqPrompt = `
### 상품 기본 정보
- 제품 이름: ${productData.name}
- 카테고리: ${productData.category}
- 설명: ${productData.description || ""}
- 키워드: ${Array.isArray(productData.keywords) ? productData.keywords.join(", ") : ""}
- 타겟 고객: ${productData.targetCustomers || ""}

### 작업 지침
자주 묻는 질문(FAQ) 섹션을 작성해주세요.
반드시 다음 지침을 따라주세요:

1. 내용 지침:
- ${productData.category} 카테고리의 제품에 맞는 질문과 답변을 5-7개 작성하세요
- 제품과 관련 없는 질문은 절대 포함하지 마세요
- 제품의 사용, 관리, 성능, 특징 등에 관련된 실질적인 질문을 포함하세요

2. 형식 지침:
- 질문-답변 형식을 Q: 와 A: 로 시작하여 구분하세요
- 예시:
  Q: 이 제품은 어떻게 사용하나요?
  A: 제품을 사용하는 방법은...

- 각 질문과 답변 쌍 사이에는 빈 줄을 넣으세요
- Q와 질문 사이에 쉼표나 다른 구분자를 사용하지 마세요
- 반드시 제품 특성에 맞는 질문만 작성하세요
- ${productData.category} 카테고리와 무관한 질문은 포함하지 마세요
`;

          const result = await genAI.generateContent(faqPrompt, {
            generationConfig: {
              temperature: 0.8,
              maxOutputTokens: 1500,
            }
          });
          
          let content = "";
          try {
            content = result.response.text();
          } catch (error) {
            if (isDev) console.error(`Error extracting text for FAQ section:`, error);
            content = `[FAQ 생성 실패]`;
          }
          
          // FAQ 형식 정리
          content = cleanFaqContent(content, sectionId);
          
          // 형식 검증 및 수정
          if (!content.includes('Q:') || !content.includes('A:')) {
            // 올바르지 않은 형식일 경우 기본 형식으로 변환
            content = content.split('\n\n').reduce((acc, para, idx) => {
              if (idx % 2 === 0) {
                return acc + `Q: ${para.replace(/^Q[\s:]*|^\d+[\s.]*/, '')}\n\n`;
              } else {
                return acc + `A: ${para.replace(/^A[\s:]*/, '')}\n\n`;
              }
            }, "").trim();
          }
          
          // 답변 형식 쉼표 검사
          content = content.replace(/Q\s+(.*?)\s*,\s*(.*?)(?=\n*Q\s+|$)/g, 'Q: $1\n\nA: $2\n\n');
          
          return {
            id: sectionId,
            content: content
          };
        }
        
        // 다른 섹션은 기존 로직 사용
        const prompt = createPrompt({
          productData,
          sectionId,
          isRegeneration: false
        });
        
        // 개발 환경에서만 로그 출력
        logInfo(`Generating content for section: ${sectionId}`);
        
        const result = await genAI.generateContent(prompt, {
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024,
          }
        });
        
        // 최신 Gemini API (0.24.0) 응답 형식에 맞게 수정
        let content = "";
        try {
          content = result.response.text();
        } catch (error) {
          if (isDev) console.error(`Error extracting text for section ${sectionId}:`, error);
          content = `[${sectionId} 생성 실패]`;
        }
        
        // 개발 환경에서만 로그 출력
        logInfo(`Content generated for section: ${sectionId}`);
        
        return {
          id: sectionId,
          content: cleanSectionContent(content.trim(), sectionId)
        };
      } catch (error) {
        if (isDev) console.error(`Error generating section ${sectionId}:`, error);
        return {
          id: sectionId,
          content: `[${sectionId} 생성 실패]`
        };
      }
    });
    
    const sections = await Promise.all(sectionPromises);
    const rawContent = sections.map(s => `---섹션시작:${s.id}---\n${s.content}\n---섹션끝---`).join('\n\n');
    
    // HTML 형식으로 변환
    const htmlContent = generateHtmlContent(sections, productData.name);
    
    // Markdown 형식으로 변환
    const markdownContent = generateMarkdownContent(sections, productData.name);
    
    // 최종 결과 캐싱 (1시간 TTL)
    const result: ProductDetailContent = {
      sections,
      cacheName: `${productData.name}_${new Date().toISOString()}`,
      rawContent,
      html: htmlContent,
      markdown: markdownContent,
      updatedAt: new Date().toISOString()
    };
    
    // 결과 캐싱 (1시간 유효)
    apiCache.set(cacheKey, result, 60 * 60 * 1000);
    
    return result;
  } catch (error) {
    console.error("generateProductDetailContent 오류:", error);
    throw error;
  }
}

// HTML 형식으로 변환하는 함수
function generateHtmlContent(sections: ProductDetailSection[], productName: string): string {
  let html = `<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${productName} - 상세페이지</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap');
    
    /* 기본 스타일 */
    body { 
      font-family: 'Noto Sans KR', sans-serif; 
      line-height: 1.8; 
      color: #333; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 24px;
      background-color: #fafafa;
      word-break: keep-all;
      letter-spacing: -0.3px;
    }
    
    /* 제목 스타일 */
    h1, h2, h3 { 
      color: #222; 
      letter-spacing: -0.5px;
    }
    
    /* 섹션 제목 */
    h2 { 
      font-size: 24px; 
      margin-top: 48px; 
      padding-bottom: 12px; 
      border-bottom: 2px solid #ff68b4; 
      color: #333;
      font-weight: 700;
    }
    
    /* 문단 스타일 */
    p { 
      margin: 16px 0; 
      font-size: 16px;
      line-height: 1.8;
    }
    
    /* 리스트 스타일 */
    ul { 
      padding-left: 24px; 
      margin: 20px 0;
    }
    
    li { 
      margin-bottom: 12px; 
      position: relative;
      list-style-type: none;
    }
    
    li:before {
      content: "•";
      color: #ff68b4;
      font-weight: bold;
      display: inline-block; 
      width: 1em;
      margin-left: -1em;
    }
    
    /* 섹션 컨테이너 */
    .section { 
      margin-bottom: 40px; 
      background-color: white;
      padding: 24px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    }
    
    /* 상품 타이틀 */
    .product-title { 
      font-size: 32px; 
      font-weight: bold; 
      margin-bottom: 36px; 
      color: #ff68b4; 
      text-align: center;
      padding: 20px 0;
    }
    
    /* 강조 텍스트 */
    .highlight {
      color: #ff68b4;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="product-detail">
    <h1 class="product-title">${productName}</h1>\n`;

  for (const section of sections) {
    const koreanTitle = getKoreanTitleLocal(section.id);
    html += `    <div class="section" id="${section.id}">
      <h2>${koreanTitle}</h2>
      <div>${formatHtmlContent(section.content)}</div>
    </div>\n`;
  }

  html += `  </div>
</body>
</html>`;

  return html;
}

// Markdown 형식으로 변환하는 함수
function generateMarkdownContent(sections: ProductDetailSection[], productName: string): string {
  let markdown = `# ${productName}\n\n`;

  for (const section of sections) {
    const koreanTitle = getKoreanTitleLocal(section.id);
    markdown += `## ${koreanTitle}\n\n${formatMarkdownContent(section.content)}\n\n`;
  }

  return markdown;
}

// HTML 콘텐츠 형식화 (텍스트를 HTML로)
function formatHtmlContent(content: string): string {
  if (!content) return '';
  
  // 줄바꿈을 <p> 태그로 변환
  let formattedContent = content
    .split('\n\n')
    .map(paragraph => {
      // 빈 줄 제외
      if (!paragraph.trim()) return '';
      
      // 불렛 포인트 처리
      if (paragraph.trim().startsWith('•')) {
        const items = paragraph.split('\n')
          .filter(line => line.trim())
          .map(line => {
            if (line.trim().startsWith('•')) {
              return `<li>${enhanceText(line.trim().substring(1).trim())}</li>`;
            }
            return `<li>${enhanceText(line.trim())}</li>`;
          })
          .join('');
        return `<ul>${items}</ul>`;
      }
      
      // 괄호로 강조된 부분을 하이라이트로 변환
      return `<p>${enhanceText(paragraph)}</p>`;
    })
    .join('');
  
  // 번호가 매겨진 리스트 처리
  formattedContent = formattedContent.replace(/<p>(\d+)\.\s+(.*?)<\/p>/g, '<ol start="$1"><li>$2</li></ol>');
  
  return formattedContent;
}

// 텍스트 강조 처리
function enhanceText(text: string): string {
  // ** 태그 제거
  text = text.replace(/\*\*/g, '');
  
  // 콜론이나 세미콜론으로 분리된 레이블과 콘텐츠를 강조
  let enhanced = text.replace(/(\w+[\s]?)(:|：)(\s+)/g, '<strong class="highlight">$1</strong>: ');
  
  // Q: 와 A: 스타일의 텍스트 처리
  enhanced = enhanced.replace(/^(Q|질문):(.+)/gim, '<strong class="highlight">Q:</strong>$2');
  enhanced = enhanced.replace(/^(A|답변):(.+)/gim, '<strong class="highlight">A:</strong>$2');
  
  return enhanced;
}

// Markdown 콘텐츠 형식화
function formatMarkdownContent(content: string): string {
  if (!content) return '';
  
  // 텍스트를 마크다운 형식으로 정리
  return content
    .split('\n')
    .map(line => {
      // 불렛 포인트 처리
      if (line.trim().startsWith('•')) {
        line = line.trim().substring(1).trim();
        
        // ** 태그 모두 제거
        line = line.replace(/\*\*/g, '');
        
        // 콜론이나 세미콜론으로 분리된 레이블과 콘텐츠 처리
        line = processLabelsAndColons(line);
        
        return `- ${line}`;
      }
      
      // 숫자 리스트 처리
      if (/^\d+\.\s+/.test(line)) {
        const match = line.match(/^(\d+\.\s+)(.+)$/);
        if (match) {
          const [, number, text] = match;
          // ** 태그 제거
          let cleanedText = text.replace(/\*\*/g, '');
          // 콜론 처리
          cleanedText = processLabelsAndColons(cleanedText);
          return `${number}${cleanedText}`;
        }
      }
      
      // ** 태그 제거
      line = line.replace(/\*\*/g, '');
      
      // 콜론이나 세미콜론으로 분리된 레이블과 콘텐츠 처리
      line = processLabelsAndColons(line);
      
      return line;
    })
    .join('\n');
}

/**
 * 콜론으로 구분된 레이블 처리
 */
function processLabelsAndColons(text: string): string {
  // Q: 와 A: 스타일의 텍스트 처리
  if (text.match(/^(Q|질문):/i)) {
    text = text.replace(/^(Q|질문):/i, '**Q**:');
  } else if (text.match(/^(A|답변):/i)) {
    text = text.replace(/^(A|답변):/i, '**A**:');
  } else {
    // 콜론이나 세미콜론으로 분리된 레이블
    text = text.replace(/(\w+[\s]?)(:|：)(\s+)/g, '**$1**: ');
  }
  
  return text;
}
