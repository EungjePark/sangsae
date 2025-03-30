import { useState, useCallback } from 'react';
import { type ProductDetailContent, type ProductDetailSection, type ProductCategory, type ProductInfo } from '@/types/product';
import { cleanupColons } from '../utils/contentFormatters';
import { regenerateSectionApi } from '@/lib/api/productService';
import { ToastActionElement } from '@/components/ui/toast';
import { useProductStore } from '@/lib/store/productStore';
import { useToast } from '@/hooks/use-toast';
import { ApiErrorResponse } from '@/lib/api/error-handler';

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

export type ContentEditingHook = {
  editedContent: string | null;
  isEditing: boolean | 'regenerating' | null;
  editingSection: string | null;
  startEditing: (sectionId: string, initialContent: string) => void;
  cancelEditing: () => void;
  updateEditedContent: (content: string) => void;
  saveEdit: (sectionId: string, generatedContent: ProductDetailContent | null, setGeneratedContent?: (content: ProductDetailContent) => void) => Promise<void>;
  regenerateSection: (sectionId: string, generatedContent?: ProductDetailContent | null, handleRegenerate?: (sectionId: string) => void) => Promise<void>;
};

export function useContentEditing(): ContentEditingHook {
  // 로컬 상태
  const [editedContent, setEditedContent] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean | 'regenerating' | null>(null);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  
  // 토스트 훅 사용
  const { toast } = useToast();
  
  // Zustand 스토어에서 필요한 상태와 액션 가져오기 - 각각 개별적으로 가져오기
  const updateSectionContent = useProductStore(state => state.updateSectionContent); 
  const targetCustomers = useProductStore(state => state.targetCustomers);
  const productCategory = useProductStore(state => state.productCategory);
  const storeGeneratedContent = useProductStore(state => state.generatedContent);

  const startEditing = useCallback((sectionId: string, initialContent: string) => {
    setEditingSection(sectionId);
    setEditedContent(initialContent);
    setIsEditing(true);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingSection(null);
    setEditedContent(null);
    setIsEditing(null);
  }, []);

  const updateEditedContent = useCallback((content: string) => {
    setEditedContent(content);
  }, []);

  const saveEdit = useCallback(async (
    sectionId: string, 
    generatedContent: ProductDetailContent | null, 
    setGeneratedContent?: (content: ProductDetailContent) => void
  ) => {
    if (!sectionId || editedContent === null) return;
    
    try {
      // 만약 외부에서 전달받은 generatedContent와 setGeneratedContent가 있다면 직접 사용
      if (generatedContent && setGeneratedContent) {
        const updatedContent = { ...generatedContent };
        const sectionIndex = updatedContent.sections.findIndex(s => s.id === sectionId);
        
        if (sectionIndex !== -1) {
          updatedContent.sections[sectionIndex].content = editedContent;
          setGeneratedContent(updatedContent);
        }
      } else {
        // 그렇지 않으면 Zustand 스토어 사용
        updateSectionContent(sectionId, editedContent);
      }
      
      toast({
        title: '수정 완료',
        description: '섹션 내용이 업데이트되었습니다.',
        variant: 'default',
      });
      
      // 편집 상태 초기화
      cancelEditing();
    } catch (error) {
      toast({
        title: '수정 실패',
        description: '섹션 내용 업데이트 중 오류가 발생했습니다.',
        variant: 'destructive',
      });
    }
  }, [editedContent, updateSectionContent, cancelEditing, toast]);

  const regenerateSection = useCallback(async (
    sectionId: string,
    generatedContent?: ProductDetailContent | null,
    handleRegenerate?: (sectionId: string) => void
  ) => {
    // 외부에서 전달된 generatedContent가 없다면 스토어에서 가져옴
    const contentToUse = generatedContent || storeGeneratedContent;
    
    if (!contentToUse) {
      toast({
        title: '재생성 실패',
        description: '생성된 콘텐츠가 없습니다.',
        variant: 'destructive',
      });
      return;
    }
    
    setEditingSection(sectionId);
    setIsEditing('regenerating');
    
    try {
      // 외부에서 전달받은 핸들러가 있다면 사용
      if (handleRegenerate) {
        handleRegenerate(sectionId);
      } else {
        // 기존 로직 실행
        const cacheName = contentToUse.cacheName || '';
        const productName = cacheName.split('_')[0] || 'Product';
        
        // API 호출
        const response = await regenerateSectionApi({
          sectionId,
          productInfo: {
            name: productName,
            category: productCategory as any,
            targetCustomers,
          },
        });
        
        // 응답 처리 (API 응답 구조에 맞게 수정)
        if (response.data && response.data.sections && response.data.sections[sectionId]) {
          // Zustand 스토어를 통해 섹션 콘텐츠 업데이트
          updateSectionContent(sectionId, response.data.sections[sectionId].content);
          
          toast({
            title: '재생성 완료',
            description: '섹션 내용이 새롭게 생성되었습니다.',
            variant: 'default',
          });
        } else {
          throw new Error('섹션 재생성 실패');
        }
      }
    } catch (error) {
      console.error('섹션 재생성 오류:', error);
      const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다';
      
      toast({
        title: '재생성 실패',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsEditing(null);
      setEditingSection(null);
    }
  }, [storeGeneratedContent, productCategory, targetCustomers, updateSectionContent, toast]);

  return {
    editedContent,
    isEditing,
    editingSection,
    startEditing,
    cancelEditing,
    updateEditedContent,
    saveEdit,
    regenerateSection,
  };
}
