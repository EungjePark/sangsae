import { useState, useRef } from 'react';
import { ProductDetailSection, ProductCategory } from '@/types/product';
import { useToast } from "@/hooks/use-toast";

export interface SectionManagementState {
  hiddenSections: string[];
  sectionOrder: Record<string, number>;
  draggedSection: string | null;
  isEditing: Record<string, boolean>;
  editedContent: Record<string, string>;
}

export interface SectionManagementActions {
  getKoreanTitle: (sectionId: string) => string;
  getSectionClasses: (sectionId: string, hiddenSections: string[]) => string;
  getEmoji: (sectionId: string) => string;
  handleDragStart: (e: React.DragEvent, sectionId: string) => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent, targetSectionId: string) => void;
  handleDragEnd: () => void;
  toggleSection: (sectionId: string) => void;
  startEdit: (sectionId: string, content: string) => void;
  cancelEdit: (sectionId: string) => void;
  saveEdit: (sectionId: string, content: string, applyChanges: boolean) => void;
  makeContentFriendly: (content: string) => string;
}

// 프로퍼티로 상태와 액션을 결합한 타입
export type SectionManagementReturn = SectionManagementState & SectionManagementActions;

export function useSectionManagement(): SectionManagementReturn {
  const { toast } = useToast();
  
  // 섹션 상태 관리
  const [hiddenSections, setHiddenSections] = useState<string[]>([]);
  const [sectionOrder, setSectionOrder] = useState<Record<string, number>>({});
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<Record<string, boolean>>({});
  const [editedContent, setEditedContent] = useState<Record<string, string>>({});
  
  // 드래그 오버된 요소 참조
  const draggedOverRef = useRef<string | null>(null);
  
  // 섹션 ID를 한글 제목으로 변환하는 함수
  const getKoreanTitle = (sectionId: string): string => {
    const titleMap: Record<string, string> = {
      'title_block': '제품 타이틀',
      'hero_section': '제품 소개',
      'main_feature': '주요 특징',
      'sub_features': '추가 기능',
      'how_to_use': '사용 방법',
      'specifications': '제품 사양',
      'warranty_info': '보증 정보',
      'shipping_return': '배송 및 반품 정보',
      'faq': '자주 묻는 질문',
      'style_guide': '스타일 가이드',
      'material_details': '소재 정보',
      'size_chart': '사이즈 정보',
      'care_instructions': '관리 방법',
      'coordination_suggestions': '코디 제안',
      'ingredients': '성분 정보',
      'effect_description': '제품 효과',
      'recommended_skin_type': '추천 피부타입',
      'safety_features': '안전 기능',
      'age_recommendation': '연령 추천',
      'taste_description': '맛 설명',
      'nutrition_facts': '영양 정보',
      'storage_instructions': '보관 방법',
      'serving_suggestions': '섭취 방법',
      'size_specifications': '크기 정보',
      'installation_guide': '설치 가이드',
      'tech_specifications': '기술 사양',
      'unique_technology': '고유 기술',
      'compatibility_info': '호환성 정보',
      'performance_features': '성능 특징',
      'content_summary': '콘텐츠 요약',
      'author_artist_info': '작가/아티스트 정보',
      'edition_details': '에디션 정보',
      'highlight_features': '주요 특징',
      'creative_possibilities': '활용 방법',
      'full_content': '전체 내용',
      'error': '오류 발생',
      'hook_intro': '도입부',
      'selling_points': '판매 포인트',
      'product_detail': '제품 상세',
      'trust_elements': '신뢰 요소',
      'target_customers': '타겟 고객층',
      'closing_info': '마무리 정보'
    };
    
    return titleMap[sectionId] || sectionId;
  };

  // 섹션의 기본 순서를 반환하는 함수
  const getSectionOrder = (sectionId: string): number => {
    const orderMap: Record<string, number> = {
      'title_block': 10,
      'hero_section': 20, 
      'hook_intro': 30,
      'main_feature': 40,
      'selling_points': 50,
      'sub_features': 60,
      'how_to_use': 70,
      'product_detail': 80,
      'specifications': 90,
      'target_customers': 100,
      'trust_elements': 110,
      'warranty_info': 120,
      'closing_info': 130,
      'faq': 990,
      'shipping_return': 1000
    };
    return orderMap[sectionId] || 500;
  };

  // 섹션 클래스 가져오기 함수
  const getSectionClasses = (sectionId: string, hiddenSections: string[]): string => {
    let className = hiddenSections.includes(sectionId) 
      ? "hidden" 
      : "block";
    
    return className;
  };

  // 섹션 ID에 대한 이모지 반환
  const getEmoji = (sectionId: string): string => {
    const emojiMap: Record<string, string> = {
      'title_block': '✨',
      'hero_section': '👋',
      'main_feature': '💡',
      'sub_features': '🔍',
      'how_to_use': '📝',
      'specifications': '📊',
      'warranty_info': '🛡️',
      'shipping_return': '🚚',
      'faq': '❓',
      'style_guide': '👔',
      'material_details': '🧵',
      'size_chart': '📏',
      'care_instructions': '🧼',
      'coordination_suggestions': '👚',
      'ingredients': '🧪',
      'effect_description': '✨',
      'recommended_skin_type': '👩‍🦰',
      'safety_features': '🔒',
      'age_recommendation': '👶',
      'taste_description': '😋',
      'nutrition_facts': '🥗',
      'storage_instructions': '🧊',
      'serving_suggestions': '🍽️',
      'size_specifications': '📐',
      'installation_guide': '🔧',
      'tech_specifications': '⚙️',
      'unique_technology': '🔬',
      'compatibility_info': '🔄',
      'performance_features': '⚡',
      'content_summary': '📑',
      'author_artist_info': '🎨',
      'edition_details': '📚',
      'highlight_features': '🌟',
      'creative_possibilities': '💭',
      'full_content': '📖',
      'error': '⚠️',
      'hook_intro': '🎯',
      'selling_points': '⭐',
      'product_detail': '📋',
      'trust_elements': '🤝',
      'target_customers': '👥',
      'closing_info': '📌'
    };
    
    return emojiMap[sectionId] || '✨';
  };

  // 드래그 앤 드롭 관련 함수
  const handleDragStart = (e: React.DragEvent, sectionId: string) => {
    // FAQ와 배송 정보는 드래그 불가능하게 설정
    if (sectionId === 'faq' || sectionId === 'shipping_return') {
      return;
    }
    
    setDraggedSection(sectionId);
    const element = e.currentTarget;
    if (element) {
      element.classList.add('dragging');
    }
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    
    // 드래그 오버 효과 추가 가능
  };
  
  const handleDrop = (e: React.DragEvent, targetSectionId: string) => {
    e.preventDefault();
    
    // FAQ와 배송 정보 섹션으로는 드롭 불가능
    if (targetSectionId === 'faq' || targetSectionId === 'shipping_return') {
      handleDragEnd();
      return;
    }
    
    if (draggedSection && draggedSection !== targetSectionId) {
      // 섹션 위치 업데이트
      const currentOrder = { ...sectionOrder };
      
      // 드래그된 섹션의 기본 순서가 아닌 현재 할당된 순서를 사용
      const draggedOrder = currentOrder[draggedSection] !== undefined 
        ? currentOrder[draggedSection] 
        : getSectionOrder(draggedSection);
      
      const targetOrder = currentOrder[targetSectionId] !== undefined 
        ? currentOrder[targetSectionId] 
        : getSectionOrder(targetSectionId);
      
      // 드롭 위치에 따라 재정렬
      const rect = e.currentTarget.getBoundingClientRect();
      const cursorY = e.clientY;
      const isTopHalf = cursorY < rect.top + rect.height / 2;
      
      // 새로운 순서를 저장할 객체
      const newOrders: Record<string, number> = { ...currentOrder };
      
      // FAQ와 배송 정보는 항상 맨 아래에 고정
      Object.keys(newOrders).forEach(sectionId => {
        if (sectionId === 'faq') {
          newOrders[sectionId] = 990;
        } else if (sectionId === 'shipping_return') {
          newOrders[sectionId] = 1000;
        }
      });
      
      // 현재 드래그된 섹션의 새 순서 계산
      if (isTopHalf) {
        // 상단에 위치하도록
        newOrders[draggedSection] = targetOrder - 1;
      } else {
        // 하단에 위치하도록
        newOrders[draggedSection] = targetOrder + 1;
      }
      
      // FAQ와 반품 정보가 항상 맨 아래에 위치하도록 강제 설정
      if (!newOrders['faq']) newOrders['faq'] = 990;
      if (!newOrders['shipping_return']) newOrders['shipping_return'] = 1000;
      
      setSectionOrder(newOrders);
    }
    
    setDraggedSection(null);
  };
  
  const handleDragEnd = () => {
    setDraggedSection(null);
    const draggingElement = document.querySelector('.dragging');
    if (draggingElement) {
      draggingElement.classList.remove('dragging');
    }
  };

  // 섹션 토글(표시/숨김) 함수
  const toggleSection = (sectionId: string) => {
    if (hiddenSections.includes(sectionId)) {
      setHiddenSections(hiddenSections.filter(id => id !== sectionId));
    } else {
      setHiddenSections([...hiddenSections, sectionId]);
    }
  };
  
  // 섹션 편집 관련 함수들
  const startEdit = (sectionId: string, content: string) => {
    // 다른 섹션 편집 중인 경우 모두 취소
    const newIsEditing: Record<string, boolean> = {};
    for (const key in isEditing) {
      if (isEditing[key] && key !== sectionId) {
        // 다른 섹션 편집 취소
        newIsEditing[key] = false;
      }
    }
    
    // 현재 섹션 편집 시작
    newIsEditing[sectionId] = true;
    setIsEditing(newIsEditing);
    
    // 편집 내용 설정
    setEditedContent({
      ...editedContent,
      [sectionId]: content
    });
  };
  
  const cancelEdit = (sectionId: string) => {
    // 편집 취소
    setIsEditing({
      ...isEditing,
      [sectionId]: false
    });
    
    // 편집 내용 초기화
    const newEditedContent = { ...editedContent };
    delete newEditedContent[sectionId];
    setEditedContent(newEditedContent);
  };
  
  const saveEdit = (sectionId: string, content: string, applyChanges: boolean) => {
    if (applyChanges) {
      // 변경 사항 적용 로직은 상위 컴포넌트에서 처리 (콜백)
      toast({
        title: "편집 내용 저장됨",
        description: `${getKoreanTitle(sectionId)} 섹션의 변경사항이 적용되었습니다.`,
      });
    } else {
      toast({
        title: "편집 취소됨",
        description: `${getKoreanTitle(sectionId)} 섹션의 변경사항이 취소되었습니다.`,
      });
    }
    
    // 편집 모드 종료
    setIsEditing({
      ...isEditing,
      [sectionId]: false
    });
  };
  
  // 콘텐츠를 보기 좋게 만드는 함수
  const makeContentFriendly = (content: string): string => {
    if (!content) return '';
    
    // 제목 태그 제거 (예: [주요 특징])
    let formattedContent = content.replace(/^\[.*?\]\s*/g, '');
    
    // 마크다운 강조 표시(**) 제거 (다양한 패턴 처리)
    formattedContent = formattedContent
      // 줄 시작 부분의 별표 처리
      .replace(/^(\s*)\*\*([^*]+)\*\*/gm, '$1$2')
      // 줄 중간의 별표 처리
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      // 불렛 포인트 내의 별표 처리 (• **텍스트**)
      .replace(/•\s*\*\*([^*]+)\*\*/g, '• $1')
      // 번호 목록 내의 별표 처리 (1. **텍스트**)
      .replace(/(\d+\.)\s*\*\*([^*]+)\*\*/g, '$1 $2');
    
    // 불렛 포인트 및 번호 목록 포맷팅 개선
    formattedContent = formattedContent
      // 불렛 포인트 포맷팅
      .replace(/•\s*/g, '• ')
      .replace(/\n•/g, '\n• ')
      // 번호 목록 포맷팅
      .replace(/(\d+\.)\s*/g, '$1 ')
      // 더블 스페이스 제거
      .replace(/\s{2,}/g, ' ')
      // 콜론 뒤에 스페이스 추가
      .replace(/([^:]):([^\s])/g, '$1: $2')
      // 줄바꿈이 너무 많은 경우 정리
      .replace(/\n{3,}/g, '\n\n')
      // 문장 스타일 개선 (공식적 -> 친근한)
      .replace(/입니다\./g, '이에요.')
      .replace(/합니다\./g, '해요.')
      .replace(/됩니다\./g, '돼요.')
      .replace(/있습니다\./g, '있어요.')
      .replace(/습니다\./g, '어요.');
      
    return formattedContent;
  };
  
  // 객체로 모든 상태와 함수 반환
  return {
    // 상태
    hiddenSections,
    sectionOrder,
    draggedSection,
    isEditing,
    editedContent,
    
    // 유틸리티 함수
    getKoreanTitle,
    getSectionClasses,
    getEmoji,
    
    // 드래그 앤 드롭 관련 함수
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    
    // 편집 관련 함수
    toggleSection,
    startEdit,
    cancelEdit,
    saveEdit,
    makeContentFriendly
  };
} 