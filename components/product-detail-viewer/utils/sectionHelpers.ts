import { getKoreanTitle } from '@/lib/sections/section-manager';

// 디버깅 헬퍼 로그 함수 추가
const logSection = (sectionId: string) => {
  // 로그 출력 제거
};

export const getSectionOrder = (sectionId: string): number => {
  // 숫자만 있는 경우 그 숫자 값 사용
  if (/^\d+$/.test(sectionId)) {
    const numericOrder = parseInt(sectionId, 10) * 10;
    return numericOrder;
  }
  
  const orderMap: Record<string, number> = {
    'title_block': 10,
    'hero_section': 20,
    'main_feature': 30,
    'product_info': 40,
    'how_to_use': 50,
    'ingredients': 60,
    'material_care': 70,
    'size_fit': 80,
    'benefits': 90,
    'shipping_returns': 100,
    'faq': 110,
    'review_highlights': 120,
    'usage_scenarios': 130,
    'purchase_benefits': 140,
    'closing_info': 150,
    'sub_features': 35,
    'specifications': 45,
    'warranty_info': 105,
    'style_guide': 71,
    'material_details': 72,
    'size_chart': 81,
    'care_instructions': 73,
    'coordination_suggestions': 74,
    'effect_description': 91,
    'recommended_skin_type': 92,
    'safety_features': 46,
    'age_recommendation': 47,
    'taste_description': 61,
    'nutrition_facts': 62,
    'storage_instructions': 63,
    'serving_suggestions': 64,
    'size_specifications': 82,
    'installation_guide': 51,
    'tech_specifications': 48,
    'unique_technology': 49,
    'compatibility_info': 52,
    'performance_features': 36,
    'content_summary': 15,
    'author_artist_info': 16,
    'edition_details': 17,
    'highlight_features': 31,
    'creative_possibilities': 53,
    'full_content': 500,
    'error': 999,
    'hook_intro': 5,
    'selling_points': 25,
    'product_detail': 41,
    'trust_elements': 115,
    'target_customers': 1,
  };
  
  const result = orderMap[sectionId] || 999; // 알 수 없는 섹션은 999로 설정
  return result;
};

export const getSectionClass = (sectionId: string, isDragged: boolean): string => {
  let className = "mb-6 rounded-lg border overflow-hidden transition-all duration-200";
  if (isDragged) {
    className += " border-[#ff68b4] shadow-xl opacity-95 scale-[1.02] z-50";
  } else {
    className += " border-pink-100 bg-white shadow-sm hover:shadow-md hover:border-pink-200";
  }
  return className;
};

export const getEmoji = (sectionId: string): string => {
  const emojiMap: Record<string, string> = {
    'product_intro': '📦',
    'title_block': '✨',
    'hero_section': '🌟',
    'main_feature': '💡',
    'product_info': '📋',
    'how_to_use': '📝',
    'ingredients': '🧪',
    'material_care': '🧵',
    'size_fit': '📏',
    'benefits': '✅',
    'faq': '❓',
    'review_highlights': '⭐',
    'usage_scenarios': '🔍',
    'purchase_benefits': '🎁',
    'shipping_returns': '🚚',
    'sub_features': '📌',
    'specifications': '📊',
    'warranty_info': '🔐',
    'warranty': '🔐',
    'style_guide': '👗',
    'material_details': '🧶',
    'size_chart': '📐',
    'care_instructions': '🧼',
    'coordination_suggestions': '👚',
    'effect_description': '✨',
    'closing_info': '📍',
    'recommended_skin_type': '👩‍🦰',
    'hook_intro': '🪝',
    'selling_points': '🏷️',
    'product_detail': '📃',
    'trust_elements': '🛡️',
    'target_customers': '🎯',
  };
  
  return emojiMap[sectionId] || '📄';
};

export const generateSectionLink = (id: string) => `section-${id}`;

// 새로 추가된 함수 export
export { logSection };
