import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { ProductDetailContent, ProductDetailSection } from '@/types/product';

interface ProductDetailFormProps {
  productData: any;
  generatedContent: ProductDetailContent;
  setGeneratedContent: React.Dispatch<React.SetStateAction<ProductDetailContent>>;
}

/**
 * 상품 상세 페이지 폼 컴포넌트
 */
export default function ProductDetailForm({
  productData,
  generatedContent,
  setGeneratedContent
}: ProductDetailFormProps) {
  const { toast } = useToast();
  // 섹션별 로딩 상태 관리
  const [sectionLoadingState, setSectionLoadingState] = useState<Record<string, boolean>>({});

  // 섹션 재생성 시도
  const handleRegenerateSection = async (sectionId: string) => {
    try {
      setSectionLoadingState(prevState => ({
        ...prevState,
        [sectionId]: true
      }));

      const response = await fetch('/api/regenerate-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sectionId,
          productData: productData,
          currentContent: generatedContent
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // 에러 응답 처리
        const errorMessage = data.error || '섹션 재생성 중 오류가 발생했습니다';
        const errorCode = data.errorCode || 'UNKNOWN_ERROR';
        
        // 에러 메시지 표시
        toast({
          title: '재생성 실패',
          description: errorMessage,
          variant: 'destructive',
        });
        
        console.error(`섹션 재생성 실패: ${errorMessage} (코드: ${errorCode})`);
        return;
      }

      // 성공적으로 재생성된 콘텐츠로 업데이트
      if (data.sections) {
        setGeneratedContent(prevContent => ({
          ...prevContent,
          sections: prevContent.sections.map(section => {
            // 재생성된 섹션 찾기
            if (section.id === sectionId && data.sections[sectionId]) {
              return {
                ...section,
                content: data.sections[sectionId].content
              };
            }
            return section;
          })
        }));

        toast({
          title: '섹션 재생성 완료',
          description: '새로운 콘텐츠가 생성되었습니다',
        });
      }
    } catch (error) {
      console.error('섹션 재생성 중 오류:', error);
      toast({
        title: '재생성 실패',
        description: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
        variant: 'destructive',
      });
    } finally {
      setSectionLoadingState(prevState => ({
        ...prevState,
        [sectionId]: false
      }));
    }
  };

  // 상세 페이지 섹션들 렌더링
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">생성된 상세 페이지</h2>
      
      {generatedContent.sections.map((section) => (
        <div key={section.id} className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-medium">{section.id}</h3>
            
            <button
              onClick={() => handleRegenerateSection(section.id)}
              disabled={sectionLoadingState[section.id]}
              className="text-sm px-3 py-1 bg-blue-50 text-blue-700 rounded hover:bg-blue-100 
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sectionLoadingState[section.id] ? '재생성 중...' : '재생성'}
            </button>
          </div>
          
          <div className="whitespace-pre-wrap text-gray-700">
            {section.content}
          </div>
        </div>
      ))}
    </div>
  );
} 