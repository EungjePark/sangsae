import { ProductDetailSection } from './types/product';

interface ProductDetailContent {
  sections: ProductDetailSection[];
  cacheName: string;
  rawContent: string;
}

export function parseResponseText(responseText: string): ProductDetailContent {
  // 섹션 파싱 로직 개선
  const parsedSections = responseText
    .split('---섹션시작:')
    .slice(1)
    .map((section: string) => {
      const [idPart, content] = section.split('---섹션끝---');
      const [id] = idPart.split('---');
      return { 
        id: id.trim(), 
        content: content.trim() 
      };
    });

  // 섹션 데이터 유효성 검사
  if (!Array.isArray(parsedSections)) {
    throw new Error('Invalid section format from API');
  }

  // ProductDetailContent 형식에 맞게 변환
  const result: ProductDetailContent = {
    sections: parsedSections,
    cacheName: `generated-${Date.now()}`,
    rawContent: responseText
  }; 

  return result;
} 