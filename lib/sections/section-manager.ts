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

// 숫자 ID에 대한 한글 제목 매핑
const numericSectionTitleMap: Record<string, string> = {
  '0': '제품 소개',
  '1': '주요 특징',
  '2': '기능 및 장점',
  '3': '제품 상세 정보',
  '4': '사용 방법',
  '5': '배송 및 반품 안내',
  '6': '자주 묻는 질문'
};

// 각 제품 카테고리별 필수 섹션 정의
const commonSections = [
  'title_block',
  'hero_section',
  'main_feature',
  'product_info',
  'how_to_use',
  'shipping_returns',
  'faq'
];

// 각 카테고리별 추가 섹션 정의
const categorySpecificSections: Record<ProductCategory, string[]> = {
  'fashion': ['material_care', 'size_fit', 'usage_scenarios'],
  'cosmetics': ['ingredients', 'benefits', 'usage_scenarios'],
  'baby': ['material_care', 'benefits', 'size_fit'],
  'food': ['taste_description', 'ingredients', 'benefits'],
  'home': ['material_care', 'usage_scenarios', 'benefits'],
  'electronics': ['benefits', 'usage_scenarios', 'shipping_returns'],
  'sports': ['material_care', 'size_fit', 'usage_scenarios'],
  'pet': ['material_care', 'how_to_use', 'benefits'],
  'books': ['product_info', 'review_highlights', 'purchase_benefits'],
  'toys': ['how_to_use', 'benefits', 'age_recommendations'],
  'stationery': ['material_care', 'usage_scenarios', 'review_highlights'],
  'health': ['ingredients', 'benefits', 'usage_scenarios'],
  'furniture': ['material_care', 'usage_scenarios', 'benefits'],
  'outdoor': ['material_care', 'usage_scenarios', 'benefits'],
  'digital': ['benefits', 'usage_scenarios', 'shipping_returns'],
  'craft': ['material_care', 'how_to_use', 'usage_scenarios'],
  'etc': commonSections,
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
  if (category && categorySpecificSections[category]) {
    return [...commonSections, ...categorySpecificSections[category]];
  }
  return commonSections; // 카테고리가 없거나 매핑이 없는 경우
}

// 섹션 ID에 해당하는 한글 제목 반환
export function getKoreanTitle(sectionId: string): string {
  // 숫자만 있는 경우 숫자 ID용 매핑 사용
  if (/^\d+$/.test(sectionId)) {
    return numericSectionTitleMap[sectionId] || `섹션 ${sectionId}`;
  }
  
  // 기존 매핑에 있는 경우 매핑 결과 반환
  if (sectionTitleMap[sectionId]) {
    return sectionTitleMap[sectionId];
  }
  
  // 그 외의 경우 ID 그대로 반환
  return sectionId;
}

// 섹션 순서 반환 (UI나 클립보드 복사 시 사용)
export function getSectionOrder(sectionId: string): number {
  const orderMap: Record<string, number> = {
    'title_block': 1,
    'hero_section': 2,
    'main_feature': 3,
    'product_info': 4,
    'taste_description': 5,
    'how_to_use': 6,
    'ingredients': 7,
    'material_care': 8,
    'size_fit': 9,
    'benefits': 10,
    'faq': 11,
    'review_highlights': 12,
    'usage_scenarios': 13,
    'purchase_benefits': 14,
    'shipping_returns': 15,
  };
  
  return orderMap[sectionId] || 99; // 알 수 없는 섹션은 맨 뒤로
}

// 섹션의 토큰 제한 반환
export function getSectionTokenLimit(sectionId: string): number {
  return sectionTokenLimits[sectionId] || 500; // 기본 500 토큰
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

// 각 섹션별 프롬프트 생성 - 업그레이드 버전
export function getSectionInstruction(sectionId: string, productData: ProductData): string {
  const koreanTitle = getKoreanTitle(sectionId);
  const category = productData.category;
  const keywords = Array.isArray(productData.keywords) ? productData.keywords.join(", ") : productData.keywords || "";
  
  // 공통 지침 (더 구체적인 형식 가이드)
  let instruction = `"${koreanTitle}" 섹션을 다음 가이드라인에 따라 최적화하여 작성해주세요:\n`;
  
  // 섹션별 추가 지침 (AIDA 원칙 적용 및 섹션별 최적화)
  switch (sectionId) {
    case 'title_block':
      instruction += `
1. [주의(Attention)] ${productData.name}의 가장 독특한 특징을 포착하는 짧고 강렬한 주제목을 작성하세요.
2. [흥미(Interest)] 소비자의 호기심을 자극하는 부제목을 추가하세요. 핵심 가치나 문제 해결을 언급하세요.
3. 상품의 본질과 주요 매력 포인트를 함축적으로 담아내세요.
4. 키워드를 자연스럽게 포함하되, 과하지 않게: ${keywords}
5. 가격은 이 섹션에서 언급하지 마세요.
6. 신뢰를 구축할 수 있는 요소(예: 품질 보증, 특허 기술 등)를 간결하게 포함하세요.

🎯 결과물: 두 줄 정도의 강렬한 주제목과 매력적인 부제목 (총 50-70자 내외)`;
      break;
      
    case 'hero_section':
      instruction += `
1. [주의+흥미(A+I)] ${productData.name}의 가장 강력한 USP(독특한 판매 포인트)로 시작하세요.
2. 타겟 고객의 핵심 문제와 이 제품이 해결하는 방식을 명확히 설명하세요.
3. 다음 요소를 포함한 3-4개의 핵심 특징을 불렛 포인트로 구성하세요:
   • 가장 차별화된 기능 (경쟁 제품과 비교)
   • 가장 강력한 혜택 (고객이 얻는 실질적 가치)
   • 기술적/품질적 우수성 (신뢰 구축 요소)
   • 감성적 연결점 (고객의 라이프스타일이나 가치관)
4. 각 포인트는 15-20자 내의 강력한 키워드로 시작하고, 1-2문장으로 부연 설명하세요.
5. ${category} 카테고리에 적합한 업계 전문 용어를 적절히 사용하세요.

🎯 결과물: 강력한 USP 문장 + 3-4개의 구조화된 핵심 특징 불렛 포인트`;
      break;
      
    case 'main_feature':
      instruction += `
1. [흥미+욕구(I+D)] ${productData.name}의 주요 기능과 특징을 스토리텔링 방식으로 설명하세요.
2. 다음 구조로 정보를 조직화하세요:
   • 기능 소개 → 작동 방식 → 고객 혜택 → 실제 사용 시나리오
3. 기술적 특징을 설명할 때는 전문용어와 일상 언어를 균형있게 사용하세요.
4. 각 특징을 설명할 때 감각적 표현(시각, 촉각, 청각 등)을 활용하여 생생하게 묘사하세요.
5. 특히 다음 특징에 초점을 맞추세요: ${productData.mainBenefits || productData.features || '제품의 주요 특징'}
6. 신뢰도를 높이는 요소(테스트 결과, 인증, 전문가 의견 등)를 자연스럽게 언급하세요.
7. 경쟁 제품과의 차별점을 암시적으로 강조하되, 직접적인 비교는 피하세요.

🎯 결과물: 스토리텔링 방식의 특징 설명 + 구체적인 사용 혜택 강조 (2-3개 단락)`;
      break;
      
    case 'product_info':
      instruction += `
1. [욕구(Desire)] ${productData.name}의 상세 사양을 구조화된 형식으로 제공하세요.
2. 상품의 물리적/기술적 특성을 다음 구조로 명확하게 설명하세요:
   • 제품 구성: 패키지에 포함된 모든 항목
   • 물리적 특성: 크기, 무게, 색상, 소재 등
   • 기술적 사양: 성능, 용량, 기능 등
   • 차별화 요소: 특허 기술, 독점 기능 등
3. 각 정보는 간결하고 명확하게 전달하되, 전문적인 신뢰감을 주는 용어를 사용하세요.
4. ${productData.description || '제품 설명'}을 참고하여 정확하고 상세한 정보를 제공하세요.
5. 구매 결정에 영향을 미치는 중요한 정보는 시각적으로 구분될 수 있도록 별도 문단이나 강조를 사용하세요.

🎯 결과물: 체계적으로 구조화된 제품 정보 + 핵심 사양의 명확한 표현`;
      break;
      
    case 'how_to_use':
      instruction += `
1. [욕구+행동(D+A)] ${productData.name}의 사용 방법을 단계별로 명확하게 설명하세요.
2. 다음 구조를 따르세요:
   • 시작하기 전 준비사항 (필요한 경우)
   • 단계별 사용법 (1, 2, 3... 형식으로 명확히 구분)
   • 효과적인 사용을 위한 팁이나 요령
   • 자주 발생하는 실수나 문제 해결 방법
3. 각 단계는 간결한 행동 지시문으로 시작하고, 필요시 1-2문장으로 추가 설명하세요.
4. ${productData.usageTips || '사용 방법'}을 참고하여 실용적이고 유용한 정보를 제공하세요.
5. 최상의 결과를 얻기 위한 구체적인 팁을 포함하세요.
6. 안전 주의사항이나 최적의 사용 조건이 있다면 반드시 언급하세요.

🎯 결과물: 명확한 번호 매기기가 된 단계별 사용법 + 유용한 팁 + 주의사항`;
      break;
      
    case 'taste_description':
      instruction += `
1. [흥미+욕구(I+D)] ${productData.name}의 맛과 풍미를 감각적이고 매력적으로 묘사하세요.
2. 다음 구조로 맛 경험을 단계별로 서술하세요:
   • 첫인상 (첫 맛/향)
   • 주요 풍미 프로필 (중심이 되는 맛)
   • 뒷맛과 여운
   • 음식 페어링 제안 (적절한 경우)
3. 맛을 묘사할 때 구체적인 비유와 감각적 형용사를 풍부하게 사용하세요.
4. 원재료와 맛의 연관성을 설명하고, 품질이나 신선도를 강조하세요.
5. 타겟 고객이 좋아할 만한 맛의 특성을 중점적으로 강조하세요.
6. 맛의 강도, 복합성, 균형 등을 전문적인 어휘로 설명하세요.

🎯 결과물: 감각적이고 생생한 맛 경험 묘사 + 구체적인 맛 프로필 설명`;
      break;
      
    case 'ingredients':
      instruction += `
1. [신뢰+욕구(Trust+D)] ${productData.name}의 원재료와 성분을 투명하고 신뢰감 있게 소개하세요.
2. 다음 요소를 포함하세요:
   • 핵심 성분 3-5가지와 그 효능/역할
   • 성분의 품질, 원산지, 특별한 조달 과정 (해당되는 경우)
   • 안전성, 테스트, 인증 관련 정보
   • 알레르기 정보 및 주의사항 (해당되는 경우)
3. 주요 성분의 과학적 효능이나 특징을 간략하게 설명하되, 지나친 과장은 피하세요.
4. 자연 유래 성분, 유기농, 무첨가 등 품질 관련 특징이 있다면 강조하세요.
5. 성분 목록과 함께 각 성분이 제품에서 하는 역할을 명확히 설명하세요.

🎯 결과물: 주요 성분 목록과 효능 + 품질/안전성 강조 요소 + 투명한 정보 제공`;
      break;
      
    case 'material_care':
      instruction += `
1. [유용성+신뢰(Utility+Trust)] ${productData.name}의 소재와 관리 방법을 전문적으로 안내하세요.
2. 다음 구조로 정보를 제공하세요:
   • 사용된 주요 소재와 각 소재의 특성/장점
   • 품질을 보장하는 제조 공정이나 기술 (해당되는 경우)
   • 일상적인 관리 방법 (세척, 보관 등)
   • 내구성 유지를 위한 팁과 주의사항
3. ${productData.materialInfo || '소재 정보'}를 참고하여 정확한 정보를 제공하세요.
4. 관리 방법은 명확한 지시문 형태로, 해야 할 것과 하지 말아야 할 것을 구분하여 설명하세요.
5. 소재의 내구성, 기능성, 미적 특성 등을 강조하세요.

🎯 결과물: 소재 특성의 전문적 설명 + 체계적인 관리 방법 안내`;
      break;
      
    case 'size_fit':
      instruction += `
1. [실용성+신뢰(Practicality+Trust)] ${productData.name}의 사이즈 정보와 핏 가이드를 정확하게 제공하세요.
2. 다음 요소를 포함하세요:
   • 정확한 치수 정보 (크기, 둘레, 길이 등)
   • 사이즈 선택 가이드 (체형이나 선호도에 따른 추천)
   • 실제 착용감이나 핏에 대한 설명
   • 사이즈 측정 방법 (필요한 경우)
3. ${productData.sizeInfo || '사이즈 정보'}를 바탕으로 객관적이고 정확한 정보를 제공하세요.
4. 다양한 체형이나 선호도를 고려한 맞춤형 추천을 포함하세요.
5. 불확실할 때 사이즈를 선택하는 팁을 제공하세요 (예: 평소보다 한 사이즈 크게/작게 선택).

🎯 결과물: 정확한 사이즈 정보 + 실용적인 선택 가이드 + 착용감 설명`;
      break;
      
    case 'benefits':
      instruction += `
1. [욕구+행동(D+A)] ${productData.name} 사용 시 얻을 수 있는 혜택과 효과를 설득력 있게 설명하세요.
2. 다음 구조로 혜택을 계층화하여 설명하세요:
   • 즉각적인 혜택 (바로 느낄 수 있는 효과)
   • 중기적 혜택 (지속적 사용 시 경험)
   • 장기적 혜택 (라이프스타일 개선이나 가치)
   • 부가적 혜택 (예상치 못한 긍정적 효과)
3. 각 혜택은 구체적인 결과와 그것이 의미하는 가치를 연결하세요 (기능 → 혜택 → 가치).
4. ${productData.mainBenefits || '주요 혜택'}에 초점을 맞추되, 고객의 감정적/실용적 니즈를 모두 충족시키는 방식으로 설명하세요.
5. 가능한 경우, 혜택을 뒷받침하는 증거(테스트 결과, 사용자 경험, 전문가 의견 등)를 포함하세요.
6. "당신"이라는 표현을 적절히 사용하여 고객 중심적 관점에서 혜택을 설명하세요.

🎯 결과물: 계층화된 혜택 구조 + 구체적 결과 설명 + 감정적/실용적 가치 연결`;
      break;
      
    case 'faq':
      instruction += `
1. [신뢰+행동(Trust+A)] ${productData.name}에 관한 가장 중요한 질문과 명확한 답변을 제공하세요.
2. 다음 주제 영역에서 5-7개의 질문을 선정하여 균형 있게 다루세요:
   • 제품 특성/기능 관련 질문 (1-2개)
   • 사용/관리 방법 관련 질문 (1-2개)
   • 구매 결정에 영향을 미치는 불확실성 해소 질문 (1-2개)
   • 배송/교환/환불 관련 실무적 질문 (1-2개)
   • 경쟁 제품과의 차별점에 관한 질문 (1개)
3. 질문은 실제 고객이 물을 법한 자연스러운 형태로 작성하세요.
4. 답변은 간결하면서도 완전하게, 실질적인 정보를 제공하세요.
5. 불확실한 사항에 대해서는 과장된 답변보다 정직하고 유용한 정보를 제공하세요.
6. 구매를 망설이는 고객의 우려를 해소할 수 있는 질문을 반드시 포함하세요.

🎯 결과물: 균형 잡힌 5-7개의 Q&A 세트 + 명확하고 유용한 답변`;
      break;
      
    case 'review_highlights':
      instruction += `
1. [사회적 증거+욕구(Social Proof+D)] ${productData.name}에 대한 긍정적인 사용자 경험과 리뷰를 재구성하세요.
2. 다음 구조로 리뷰 하이라이트를 구성하세요:
   • 제품의 다양한 측면(품질, 기능성, 가치 등)에 대한 다양한 리뷰
   • 다양한 고객 프로필(초보자/전문가, 연령대, 용도 등)의 관점
   • 구체적인 사용 경험과 결과를 언급한 리뷰
   • 처음에 우려했으나 만족한 경험에 관한 리뷰
3. ${productData.reviewContent || '제품의 장점'}을 바탕으로 신뢰할 수 있는 리뷰를 구성하세요.
4. 각 리뷰는 구체적이고 진정성 있게 작성하되, 지나치게 완벽하여 인위적으로 느껴지지 않도록 주의하세요.
5. 별점이나 평가 점수를 포함하여 신뢰성을 높이세요.

🎯 결과물: 다양한 관점의 3-5개 리뷰 하이라이트 + 구체적 사용 경험 + 별점/평가`;
      break;
      
    case 'usage_scenarios':
      instruction += `
1. [흥미+욕구+행동(I+D+A)] ${productData.name}의 실제 활용 시나리오를 생생하게 묘사하세요.
2. 다음 구조로 시나리오를 구성하세요:
   • 다양한 상황/환경에서의 활용 사례 (3-4가지)
   • 각 시나리오별 제품의 주요 기능과 그 가치
   • 잠재적 문제 해결 방식
   • 기대 이상의 결과나 경험
3. 시나리오는 타겟 고객의 일상과 연결하여 공감을 이끌어내는 방식으로 작성하세요.
4. 각 시나리오는 구체적인 상황, 문제, 해결책, 결과를 포함하는 미니 스토리 형태로 작성하세요.
5. 제품을 활용한 창의적이고 예상치 못한 사용법도 1-2가지 포함하세요.
6. 다양한 고객 프로필을 고려한 시나리오를 제시하세요.

🎯 결과물: 3-4가지 구체적 활용 시나리오 + 생생한 상황 묘사 + 창의적 활용법`;
      break;
      
    case 'purchase_benefits':
      instruction += `
1. [행동(Action)] ${productData.name} 구매 시 얻을 수 있는 특별한 혜택을 설득력 있게 제시하세요.
2. 다음 혜택 유형을 균형 있게 포함하세요:
   • 경제적 혜택 (할인, 적립금, 무이자 할부 등)
   • 부가 혜택 (사은품, 무료 배송, VIP 서비스 등)
   • 보증/보장 혜택 (품질 보증, 환불 보장 등)
   • 커뮤니티/서비스 혜택 (전용 커뮤니티, A/S, 전문가 상담 등)
3. 각 혜택은 구체적인 조건과 가치를 명확히 설명하세요.
4. 시즌별 프로모션이나 한정 혜택이 있다면 긴급성/희소성을 강조하세요.
5. 정확한 숫자와 구체적인 조건을 사용하여 신뢰성을 높이세요.
6. 구매 행동을 촉진하는 명확한 CTA(구매 유도 문구)로 마무리하세요.

🎯 결과물: 다양한 혜택 유형 설명 + 구체적 조건과 가치 + 설득력 있는 CTA`;
      break;
      
    case 'shipping_returns':
      instruction += `
1. [신뢰+안심(Trust+Assurance)] ${productData.name}의 배송 및 반품/교환 정책을 투명하고 명확하게 설명하세요.
2. 다음 정보를 체계적으로 제공하세요:
   • 배송 방식, 예상 소요 시간, 비용
   • 주문 처리 및 배송 추적 방법
   • 반품/교환 가능 조건 및 기간
   • 반품/교환 절차 및 책임 사항
   • 특별한 배송 옵션이나 서비스 (해당되는 경우)
3. ${productData.shippingInfo || '배송 정보'}와 ${productData.returnPolicy || '반품/교환 정책'}을 참고하여 정확한 정보를 제공하세요.
4. 정보는 명확한 불렛 포인트나 단락으로 구성하고, 법적 조건이나 예외 사항을 포함하세요.
5. 고객 입장에서 가장 우려할 만한 사항(배송 지연, 반품 거부 조건 등)에 대한 명확한 안내를 제공하세요.

🎯 결과물: 체계적인 배송 정보 + 명확한 반품/교환 정책 + 투명한 조건 설명`;
      break;
      
    default:
      instruction += `
1. ${productData.name} 제품에 관한 정보를 매력적이고 설득력 있게 작성하세요.
2. 다음 요소를 균형 있게 포함하세요:
   • 제품의 주요 특징과 기능
   • 소비자가 얻을 수 있는 핵심 혜택
   • 신뢰를 구축할 수 있는 요소 (품질, 기술, 전문성 등)
   • 감성적 연결을 만들 수 있는 요소
3. 정보는 명확하고 간결하게 전달하되, 구매 욕구를 자극하는 매력적인 표현을 사용하세요.
4. ${keywords} 키워드를 자연스럽게 활용하세요.

🎯 결과물: 균형 잡힌 제품 정보 + 구체적 혜택 설명 + 매력적인 표현`;
  }
  
  return instruction;
} 