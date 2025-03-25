import { ProductCategory, ProductDetailSection, ProductData } from '@/types/product';

// 섹션 ID별 한글 제목 매핑
const sectionTitleMap: Record<string, string> = {
  'title_block': '제품 제목 및 소개',
  'hero_section': '주요 특징 소개',
  'main_feature': '핵심 기능 및 특징',
  'product_info': '제품 상세 정보',
  'taste_description': '맛 설명',
  'how_to_use': '사용 방법',
  'ingredients': '원재료 및 성분',
  'material_care': '소재 및 관리 방법',
  'size_fit': '사이즈 및 핏 가이드',
  'benefits': '제품 효과 및 장점',
  'faq': '자주 묻는 질문',
  'review_highlights': '리뷰 하이라이트',
  'usage_scenarios': '활용 시나리오',
  'purchase_benefits': '구매 혜택',
  'shipping_returns': '배송 및 반품 안내',
};

// 각 제품 카테고리별 필수 섹션 정의
const commonSections = [
  'title_block',
  'hero_section',
  'main_feature',
  'product_info',
  'how_to_use',
  'faq'
];

// 각 카테고리별 추가 섹션 정의
const categorySpecificSections: Record<ProductCategory, string[]> = {
  'FASHION': ['material_care', 'size_fit', 'usage_scenarios'],
  'BEAUTY': ['ingredients', 'benefits', 'usage_scenarios'],
  'BABY': ['material_care', 'benefits', 'size_fit'],
  'FOOD': ['taste_description', 'ingredients', 'benefits'],
  'KITCHEN': ['material_care', 'usage_scenarios', 'benefits'],
  'HOME_LIVING': ['material_care', 'usage_scenarios', 'benefits'],
  'ELECTRONICS': ['benefits', 'usage_scenarios', 'shipping_returns'],
  'SPORTS': ['material_care', 'size_fit', 'usage_scenarios'],
  'PET': ['material_care', 'how_to_use', 'benefits'],
  'BOOKS': ['product_info', 'review_highlights', 'purchase_benefits'],
  'TOYS': ['how_to_use', 'benefits', 'age_recommendations'],
  'STATIONERY': ['material_care', 'usage_scenarios', 'review_highlights'],
  'HEALTH': ['ingredients', 'benefits', 'usage_scenarios'],
  'OTHER': commonSections,
};

// 각 섹션별 토큰 제한 설정
const sectionTokenLimits: Record<string, number> = {
  'title_block': 100,
  'hero_section': 250,
  'main_feature': 400,
  'product_info': 500,
  'taste_description': 300,
  'how_to_use': 350,
  'ingredients': 300,
  'material_care': 300,
  'size_fit': 300,
  'benefits': 400,
  'faq': 600,
  'review_highlights': 300,
  'usage_scenarios': 400,
  'purchase_benefits': 200,
  'shipping_returns': 250,
};

// 제품 카테고리에 기반하여 필요한 섹션 ID 목록 반환
export function getSectionIds(category: ProductCategory): string[] {
  // 해당 카테고리에 대한 추가 섹션 확인
  const additionalSections = categorySpecificSections[category] || [];
  
  // 공통 섹션과 추가 섹션 결합
  return [...commonSections, ...additionalSections];
}

// 섹션 ID에 해당하는 한글 제목 반환
export function getKoreanTitle(sectionId: string): string {
  return sectionTitleMap[sectionId] || sectionId;
}

// 섹션의 토큰 제한 반환
export function getSectionTokenLimit(sectionId: string): number {
  return sectionTokenLimits[sectionId] || 300; // 기본값 300
}

// 텍스트에서 섹션 파싱
export function parseSectionsFromText(text: string): ProductDetailSection[] {
  // 섹션 구분 정규식
  const sectionRegex = /^##\s(.*?)\s\(([a-z_]+)\)$/gm;
  
  const sections: ProductDetailSection[] = [];
  let match;
  let lastIndex = 0;
  
  // 모든 섹션 찾기
  while ((match = sectionRegex.exec(text)) !== null) {
    const title = match[1].trim();
    const id = match[2].trim();
    const startIndex = match.index;
    
    // 이전 섹션의 내용 저장
    if (sections.length > 0) {
      const prevSection = sections[sections.length - 1];
      const sectionContent = text.substring(lastIndex, startIndex).trim();
      sections[sections.length - 1] = {
        ...prevSection,
        content: sectionContent
      };
    }
    
    // 새 섹션 추가
    sections.push({
      id,
      title,
      content: ''
    });
    
    lastIndex = startIndex + match[0].length;
  }
  
  // 마지막 섹션의 내용 저장
  if (sections.length > 0) {
    const prevSection = sections[sections.length - 1];
    const sectionContent = text.substring(lastIndex).trim();
    sections[sections.length - 1] = {
      ...prevSection,
      content: sectionContent
    };
  }
  
  return sections;
}

// 가격 포맷팅 함수
export function formatPrice(price: string | undefined): string {
  if (!price) return '';
  
  // 숫자만 추출
  const numericValue = price.replace(/[^\d]/g, '');
  
  if (!numericValue) return price;
  
  // 천 단위로 콤마 추가
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + '원';
}

// 각 섹션별 프롬프트 생성
export function getSectionInstruction(sectionId: string, productData: ProductData): string {
  const koreanTitle = getKoreanTitle(sectionId);
  const category = productData.category;
  
  // 공통 지침
  let instruction = `"${koreanTitle}" 섹션을 작성해주세요. `;
  
  // 섹션별 추가 지침
  switch (sectionId) {
    case 'title_block':
      instruction += `${productData.name} 제품을 간결하고 매력적으로 소개하는 제목과 부제목을 작성해주세요. 가격은 ${formatPrice(productData.price)}입니다. 매력적인 부제목을 만들어서 소비자의 관심을 끌어주세요.`;
      break;
      
    case 'hero_section':
      instruction += `${productData.name} 제품의 핵심 가치와 차별점을 강조하는 매력적인 헤드라인과 주요 특징 3-4가지를 간결하게 작성해주세요.`;
      break;
      
    case 'main_feature':
      instruction += `${productData.name} 제품의 주요 기능과 특징을 자세히 설명해주세요. 특히 ${productData.mainBenefits || productData.features || '제품의 주요 특징'}에 중점을 두고 설명해주세요.`;
      break;
      
    case 'product_info':
      instruction += `${productData.name} 제품의 상세 정보를 구체적으로 설명해주세요. ${productData.description || '제품 설명'}을 바탕으로 소재, 구성, 특징 등을 포함하세요.`;
      break;
      
    case 'how_to_use':
      instruction += `${productData.name} 제품의 사용 방법을 단계별로 명확하게 설명해주세요. ${productData.usageTips || '사용 방법'}을 참고하여 효과적인 사용법을 안내하세요.`;
      break;
      
    case 'taste_description':
      instruction += `${productData.name} 제품의 맛과 풍미를 생생하게 묘사해주세요. 식품의 맛, 향, 식감 등을 구체적으로 표현하세요.`;
      break;
      
    case 'ingredients':
      instruction += `${productData.name} 제품의 원재료와 성분을 명확하게 설명해주세요. 주요 성분의 효능이나 특징도 함께 설명하세요.`;
      break;
      
    case 'material_care':
      instruction += `${productData.name} 제품의 소재와 관리 방법을 상세히 설명해주세요. ${productData.materialInfo || '소재 정보'}에 관한 내용과 세탁, 보관 방법 등을 안내하세요.`;
      break;
      
    case 'size_fit':
      instruction += `${productData.name} 제품의 사이즈 가이드와 핏 정보를 제공해주세요. ${productData.sizeInfo || '사이즈 정보'}를 토대로 정확한 치수와 착용감을 설명하세요.`;
      break;
      
    case 'benefits':
      instruction += `${productData.name} 제품을 사용했을 때 얻을 수 있는 효과와 장점을 구체적으로 설명해주세요. ${productData.mainBenefits || '주요 혜택'}에 초점을 맞춰 소비자가 얻을 수 있는 가치를 강조하세요.`;
      break;
      
    case 'faq':
      instruction += `${productData.name} 제품에 관해 소비자들이 자주 묻는 질문과 그에 대한 답변을 5-7개 정도 작성해주세요. 제품 사용법, 관리 방법, 배송, 교환/환불 등 다양한 주제를 다루세요.`;
      break;
      
    case 'review_highlights':
      instruction += `${productData.name} 제품에 대한 사용자 리뷰 하이라이트를 작성해주세요. ${productData.reviewContent || '제품의 장점'}을 바탕으로 긍정적인 사용자 경험과 만족도를 강조하세요.`;
      break;
      
    case 'usage_scenarios':
      instruction += `${productData.name} 제품을 활용할 수 있는 다양한 상황과 시나리오를 구체적으로 설명해주세요. 실생활에서 어떻게 활용할 수 있는지 예시를 들어 설명하세요.`;
      break;
      
    case 'purchase_benefits':
      instruction += `${productData.name} 제품을 구매할 때 얻을 수 있는 특별한 혜택이나 프로모션을 소개해주세요. 할인, 사은품, 적립금 등의 혜택을 강조하세요.`;
      break;
      
    case 'shipping_returns':
      instruction += `${productData.name} 제품의 배송 정보와 반품/교환 정책을 상세히 안내해주세요. ${productData.shippingInfo || '배송 정보'}와 ${productData.returnPolicy || '반품/교환 정책'}에 관한 내용을 명확하게 설명하세요.`;
      break;
      
    default:
      instruction += `${productData.name} 제품에 관한 정보를 매력적으로 작성해주세요.`;
  }
  
  return instruction;
} 