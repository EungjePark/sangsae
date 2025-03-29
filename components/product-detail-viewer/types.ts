import { type ProductDetailContent, type ProductDetailSection, type ProductCategory } from '@/types/product';

// Props for the main GeneratedContentViewer component
export interface GeneratedContentViewerProps {
  generatedContent: ProductDetailContent | null;
  setGeneratedContent: (content: ProductDetailContent | null) => void;
  isGenerating: boolean;
  error: string | null;
  hiddenSections: string[];
  setHiddenSections: (sections: string[]) => void;
  sectionOrder: Record<string, number>;
  setSectionOrder: (order: Record<string, number>) => void;
  draggedSection: string | null;
  setDraggedSection: (sectionId: string | null) => void;
  productName: string;
  productCategory: ProductCategory;
  productDescription: string;
  additionalInfo: string;
  shippingInfo: string;
  returnPolicy: string;
  productKeywords: string[];
  targetCustomers: string;
  handleRegenerate: () => void; // Function to trigger full regeneration
  handleDownloadPDF?: () => Promise<void>; // Make PDF handler optional as it's handled internally now
}

// Type for Table of Contents items
export interface TocItem {
  id: string;
  title: string; // 확실하게 string 타입 명시
}
