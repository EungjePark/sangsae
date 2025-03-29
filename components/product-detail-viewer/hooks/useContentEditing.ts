import { useState, useRef } from 'react';
import { type ProductDetailContent, type ProductDetailSection, type ProductCategory, type ProductInfo } from '@/types/product';
import { cleanupColons } from '../utils/contentFormatters';
import { regenerateSectionApi } from '@/lib/api/productService';
import { ToastActionElement } from '@/components/ui/toast';

// Define the structure for the editing interface
export interface EditingStates {
  [sectionId: string]: boolean | 'regenerating';
}

export interface EditedContents {
  [sectionId: string]: string;
}

export interface TextareaRefs {
  [sectionId: string]: HTMLTextAreaElement | null;
}

// Toast 함수 타입 정의
export interface ToastProps {
  title: string;
  description: string;
  variant?: "default" | "destructive";
  action?: ToastActionElement;
}

export function useContentEditing(
  generatedContent: ProductDetailContent | null,
  setGeneratedContent: (content: ProductDetailContent | null) => void,
  productName: string,
  productCategory: ProductCategory,
  productDescription: string,
  targetCustomers: string,
  additionalInfo: string,
  productKeywords: string[],
  shippingInfo: string,
  returnPolicy: string,
  toast: (props: ToastProps) => void
) {
  const [isEditing, setIsEditing] = useState<EditingStates>({});
  const [editedContent, setEditedContent] = useState<EditedContents>({});
  const textareaRefs = useRef<TextareaRefs>({});

  const handleStartEdit = (sectionId: string, currentContent: string) => {
    setIsEditing(prev => ({ ...prev, [sectionId]: true }));
    // Apply initial cleanup when starting edit
    setEditedContent(prev => ({ ...prev, [sectionId]: cleanupColons(currentContent) }));

    // Focus and adjust textarea height after a short delay
    setTimeout(() => {
      const textarea = textareaRefs.current[sectionId];
      if (textarea) {
        textarea.focus();
        textarea.style.height = 'auto'; // Reset height
        textarea.style.height = `${textarea.scrollHeight}px`; // Set to scroll height
      }
    }, 50);
  };

  const handleCancelEdit = (sectionId: string) => {
    setIsEditing(prev => {
      const newState = { ...prev };
      delete newState[sectionId];
      return newState;
    });
    // 편집한 콘텐츠도 삭제 (선택 사항)
    setEditedContent(prev => {
      const newState = { ...prev };
      delete newState[sectionId];
      return newState;
    });
  };

  const handleSaveEdit = (sectionId: string) => {
    if (!generatedContent || !editedContent[sectionId]) return;

    const updatedSections = (generatedContent.sections as ProductDetailSection[]).map(section => {
      if (section.id === sectionId) {
        // Use the edited content directly
        return { ...section, content: editedContent[sectionId] };
      }
      return section;
    });

    setGeneratedContent({ ...generatedContent, sections: updatedSections });

    // Exit editing mode
    setIsEditing(prev => {
      const newState = { ...prev };
      delete newState[sectionId];
      return newState;
    });

    toast({ title: "편집 완료", description: "섹션 내용이 업데이트 되었습니다." });
  };

  const handleRegenerateSection = async (sectionId: string) => {
    if (!generatedContent) return;

    setIsEditing(prev => ({ ...prev, [sectionId]: 'regenerating' }));

    try {
      const currentSection = (generatedContent.sections as ProductDetailSection[]).find(s => s.id === sectionId);
      if (!currentSection) throw new Error('섹션을 찾을 수 없습니다.');

      // Prepare structured content, cleaning up existing content
      const structuredContent: { sections: Record<string, { content: string }> } = { sections: {} };
      (generatedContent.sections as ProductDetailSection[]).forEach(section => {
        structuredContent.sections[section.id] = { content: cleanupColons(section.content) };
      });

      // Prepare product data for the API request
      const productData: ProductInfo = {
        name: productName,
        category: productCategory,
        description: productDescription,
        additionalInfo: `대상 고객층: ${targetCustomers}\n\n${additionalInfo}`, // Combine info
        keywords: productKeywords,
        shippingInfo: shippingInfo,
        returnPolicy: returnPolicy,
        targetCustomers
      };

      // 서비스 레이어 함수 호출
      const result = await regenerateSectionApi(
        sectionId,
        productData,
        structuredContent,
        generatedContent.cacheName
      );

      // 오류 처리
      if (result.error) {
        toast({ 
          title: "재생성 실패", 
          description: result.error, 
          variant: "destructive" 
        });
        throw new Error(result.error);
      }

      // 성공 처리
      if (result.data && result.data.sections && result.data.sections[sectionId]) {
        const newSectionContent = result.data.sections[sectionId].content;
        // Clean the regenerated content before applying
        const cleanedNewContent = cleanupColons(newSectionContent);

        const updatedSections = (generatedContent.sections as ProductDetailSection[]).map(section =>
          section.id === sectionId ? { ...section, content: cleanedNewContent } : section
        );

        setGeneratedContent({ ...generatedContent, sections: updatedSections });
        toast({ title: "섹션 재생성 완료", description: "새로운 내용이 적용되었습니다" });
      } else {
        console.error('API 응답에 예상된 섹션 데이터가 없습니다:', result.data);
        toast({ 
          title: "재생성 실패", 
          description: "재생성 결과 형식이 올바르지 않습니다", 
          variant: "destructive" 
        });
        throw new Error('재생성 결과 형식이 올바르지 않습니다');
      }

    } catch (error: unknown) {
      console.error('섹션 재생성 중 오류 발생:', error);
      // 에러 메시지 추출 및 표시
      const errorMessage = error instanceof Error ? error.message : "알 수 없는 오류";
      
      // 이미 표시된 에러가 아닌 경우에만 토스트 표시
      if (!errorMessage.includes('할당량') && !errorMessage.includes('재생성 실패')) {
        toast({ 
          title: "재생성 오류", 
          description: errorMessage, 
          variant: "destructive" 
        });
      }
    } finally {
      // Ensure editing state is reset regardless of success or failure
      setIsEditing(prev => {
        const newState = { ...prev };
        delete newState[sectionId];
        return newState;
      });
    }
  };

  return {
    isEditing,
    editedContent,
    textareaRefs,
    handleStartEdit,
    handleCancelEdit,
    handleSaveEdit,
    handleRegenerateSection,
    setEditedContent // Expose setter if direct manipulation is needed outside
  };
}
