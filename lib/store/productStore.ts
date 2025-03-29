import { create } from 'zustand';
import { ProductDetailContent, ProductDetailSection } from '@/types/product';

interface ProductState {
  generatedContent: ProductDetailContent | null;
  isGenerating: boolean;
  hiddenSections: string[];
  error: string | null;
  targetCustomers: string;
  productCategory: string;
  
  // 액션
  setGeneratedContent: (content: ProductDetailContent) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  hideSection: (sectionId: string) => void;
  showSection: (sectionId: string) => void;
  setError: (error: string | null) => void;
  setTargetCustomers: (targetCustomers: string) => void;
  setProductCategory: (productCategory: string) => void;
  updateSectionContent: (sectionId: string, content: string) => void;
  updateSectionOrder: (newOrder: string[]) => void;
  reset: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  // 초기 상태
  generatedContent: null,
  isGenerating: false,
  hiddenSections: [],
  error: null,
  targetCustomers: '',
  productCategory: '',
  
  // 액션
  setGeneratedContent: (content) => set({ generatedContent: content }),
  
  setIsGenerating: (isGenerating) => set({ isGenerating }),
  
  hideSection: (sectionId) => set((state) => ({ 
    hiddenSections: [...state.hiddenSections, sectionId] 
  })),
  
  showSection: (sectionId) => set((state) => ({ 
    hiddenSections: state.hiddenSections.filter(id => id !== sectionId) 
  })),
  
  setError: (error) => set({ error }),
  
  setTargetCustomers: (targetCustomers) => set({ targetCustomers }),
  
  setProductCategory: (productCategory) => set({ productCategory }),
  
  updateSectionContent: (sectionId, content) => set((state) => {
    if (!state.generatedContent?.sections) return state;
    
    const updatedSections = state.generatedContent.sections.map(section => 
      section.id === sectionId ? { ...section, content } : section
    );
    
    return {
      generatedContent: {
        ...state.generatedContent,
        sections: updatedSections,
      }
    };
  }),
  
  updateSectionOrder: (newOrder) => set((state) => {
    if (!state.generatedContent?.sections) return state;
    
    // 변경된 순서에 따라 섹션 재정렬
    const orderedSections = [...state.generatedContent.sections].sort((a, b) => {
      const indexA = newOrder.indexOf(a.id);
      const indexB = newOrder.indexOf(b.id);
      return indexA - indexB;
    });
    
    return {
      generatedContent: {
        ...state.generatedContent,
        sections: orderedSections,
      }
    };
  }),
  
  reset: () => set({
    generatedContent: null,
    isGenerating: false,
    hiddenSections: [],
    error: null,
  }),
})); 