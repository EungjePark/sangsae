import { ProductDetailContent } from '@/lib/gemini';
import { formatForClipboard } from './content-formatter';
import { toast } from '@/hooks/use-toast';

/**
 * 한국어 섹션 제목 매핑
 * @param sectionId 섹션 ID
 * @returns 한국어 섹션 제목
 */
export const getKoreanTitle = (sectionId: string): string => {
  const titleMap: Record<string, string> = {
    main_feature: '주요 특징',
    usage: '사용 방법',
    target_customer: '이런 분들께 추천해요',
    product_spec: '상품 스펙',
    caution: '주의사항',
    faq: '자주 묻는 질문',
    shipping_return: '배송/교환/반품 안내',
  };
  return titleMap[sectionId] || sectionId;
};

/**
 * 생성된 콘텐츠를 클립보드에 복사
 * @param generatedContent 생성된 콘텐츠
 * @returns Promise<void>
 */
export const copyToClipboard = async (generatedContent: ProductDetailContent): Promise<void> => {
  if (!generatedContent || !generatedContent.sections) {
    console.error('복사할 콘텐츠가 없습니다.');
    return;
  }
  
  try {
    // 모든 섹션을 하나의 텍스트로 결합
    const text = generatedContent.sections.map(section => {
      const koreanTitle = getKoreanTitle(section.id);
      return formatForClipboard(section.content, koreanTitle);
    }).join('');
    
    // 클립보드에 복사
    await navigator.clipboard.writeText(text);
    
    // 성공 알림
    if (typeof toast === 'function') {
      toast({
        title: "복사 완료!",
        description: "클립보드에 모든 내용이 복사되었습니다.",
      });
    }
  } catch (err) {
    console.error('클립보드 복사 실패:', err);
    
    // 오류 알림
    if (typeof toast === 'function') {
      toast({
        title: "복사 실패",
        description: "클립보드 복사 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  }
};
