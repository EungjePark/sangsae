import { getKoreanTitle } from '@/lib/sections/section-manager';

export const getSectionOrder = (sectionId: string): number => {
  const orderMap: Record<string, number> = {
    'title_block': 10,
    'hero_section': 20,
    'main_feature': 30,
    'product_info': 40,
    'how_to_use': 50,
    'ingredients': 60,
    'material_care': 70, // 예시, 실제 카테고리에 맞게 조정 필요
    'size_fit': 80,       // 예시, 실제 카테고리에 맞게 조정 필요
    'benefits': 90,       // 예시, 실제 카테고리에 맞게 조정 필요
    'shipping_returns': 100,
    'faq': 110,
    'review_highlights': 120, // 예시, 실제 카테고리에 맞게 조정 필요
    'usage_scenarios': 130,   // 예시, 실제 카테고리에 맞게 조정 필요
    'purchase_benefits': 140, // 예시, 실제 카테고리에 맞게 조정 필요
    'closing_info': 150,
    // 기존 GeneratedContentViewer.tsx에 있던 다른 ID들도 필요시 추가
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
    'full_content': 500, // 가장 마지막
    'error': 999, // 오류는 맨 뒤
    'hook_intro': 5,
    'selling_points': 25,
    'product_detail': 41,
    'trust_elements': 115,
    'target_customers': 1, // 가장 처음
  };
  return orderMap[sectionId] || 500; // 기본값은 뒤로
};

export const getSectionClass = (sectionId: string, isDragged: boolean): string => {
  let className = "mb-6 rounded-lg border border-gray-200 overflow-hidden transition-all duration-200";
  if (isDragged) {
    className += " border-[#ff68b4] shadow-xl opacity-95 scale-[1.02] z-50";
  } else {
    className += " bg-white shadow-sm hover:shadow-md";
  }
  return className;
};

export const getEmoji = (sectionId: string): string => {
  const emojiMap: Record<string, string> = {
    'title_block': '✨', 'hero_section': '👋', 'main_feature': '💡', 'sub_features': '🔍',
    'how_to_use': '📝', 'specifications': '📊', 'warranty_info': '🛡️', 'shipping_return': '🚚',
    'shipping_returns': '🚚', 'faq': '❓', 'style_guide': '👔', 'material_details': '🧵',
    'size_chart': '📏', 'care_instructions': '🧼', 'coordination_suggestions': '👚',
    'ingredients': '🧪', 'effect_description': '✨', 'recommended_skin_type': '👩‍🦰',
    'safety_features': '🔒', 'age_recommendation': '👶', 'taste_description': '😋',
    'nutrition_facts': '🥗', 'storage_instructions': '🧊', 'serving_suggestions': '🍽️',
    'size_specifications': '📐', 'installation_guide': '🔧', 'tech_specifications': '⚙️',
    'unique_technology': '🔬', 'compatibility_info': '🔄', 'performance_features': '⚡',
    'content_summary': '📑', 'author_artist_info': '🎨', 'edition_details': '📚',
    'highlight_features': '🌟', 'creative_possibilities': '💭', 'full_content': '📖',
    'error': '⚠️', 'hook_intro': '🎯', 'selling_points': '⭐', 'product_detail': '📋',
    'trust_elements': '🤝', 'target_customers': '👥', 'closing_info': '📌',
    // 추가된 orderMap 키에 대한 이모지 (필요시 추가)
    'material_care': '🧺',
    'size_fit': '👕',
    'benefits': '💖',
    'review_highlights': '💬',
    'usage_scenarios': '🖼️',
    'purchase_benefits': '🎁',
  };
  return emojiMap[sectionId] || '✨'; // 기본 이모지
};

export const generateSectionLink = (id: string) => `section-${id}`;

// getKoreanTitle 함수는 이미 lib/sections/section-manager.ts 에 있으므로 여기서 제거하고 import 해서 사용합니다.
// 만약 해당 파일이 없다면 여기에 getKoreanTitle 함수를 포함해야 합니다.
// export { getKoreanTitle }; // section-manager에서 가져온다고 가정
