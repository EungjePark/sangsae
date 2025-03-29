import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { type ProductDetailContent, type ProductDetailSection, type ProductCategory } from '@/types/product';
import { getSectionOrder, getEmoji } from './utils/sectionHelpers';
import { Separator } from '@/components/ui/separator';
import { getKoreanTitle } from '@/lib/sections/section-manager';

// Import child components and hooks
import { ProductSection } from './components/ProductSection';
import { ActionToolbar } from './components/ActionToolbar';
import { PreviewModal } from './components/PreviewModal';
import { LoadingIndicator } from './components/LoadingIndicator';
import { ProductInfoSidebar } from './components/ProductInfoSidebar';
import { MobileInfoPanel } from './components/MobileInfoPanel';
import { ErrorMessage } from './components/ErrorMessage';

import { useSectionManagement } from './hooks/useSectionManagement';
import { useContentEditing } from './hooks/useContentEditing';
import { useLoading } from './hooks/useLoading';
import { usePdfExport } from './hooks/usePdfExport';

import { type GeneratedContentViewerProps, type TocItem } from './types';

const GeneratedContentViewer: React.FC<GeneratedContentViewerProps> = ({
  generatedContent,
  setGeneratedContent,
  isGenerating,
  error,
  hiddenSections,
  setHiddenSections,
  sectionOrder,
  setSectionOrder,
  draggedSection,
  setDraggedSection,
  productName,
  productCategory,
  productDescription,
  additionalInfo,
  shippingInfo,
  returnPolicy,
  productKeywords,
  targetCustomers,
  handleRegenerate,
}) => {
  const { toast } = useToast();
  const contentContainerRef = useRef<HTMLDivElement | null>(null);
  const contentScrollRef = useRef<HTMLDivElement | null>(null);
  const previewContentRef = useRef<HTMLDivElement | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [tocSections, setTocSections] = useState<TocItem[]>([]);
  const [headerShadow, setHeaderShadow] = useState(false);

  // --- Custom Hooks ---
  const {
    handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop, handleHideSection,
  } = useSectionManagement(draggedSection, setDraggedSection, hiddenSections, setHiddenSections, sectionOrder, setSectionOrder, toast);

  const {
    isEditing, editedContent, textareaRefs, handleStartEdit, handleCancelEdit, handleSaveEdit, handleRegenerateSection, setEditedContent
  } = useContentEditing(generatedContent, setGeneratedContent, productName, productCategory, productDescription, targetCustomers, additionalInfo, productKeywords, shippingInfo, returnPolicy, toast);

  // Internal loading state specifically for section regeneration might be useful
  const { loadingProgress, loadingMessage } = useLoading(isGenerating, generatedContent);

  const { isExporting, exportElementToPdf } = usePdfExport({ toast, fileName: `${productName || '상품'}_상세페이지.pdf` });

  // --- Effects ---
  useEffect(() => {
    if (Array.isArray(generatedContent?.sections)) {
      const newTocSections = (generatedContent.sections as ProductDetailSection[])
        .filter(s => s && s.id && s.id !== 'faq')
        .map(s => ({ id: s.id, title: s.title || s.id }));
      setTocSections(newTocSections);
    } else {
      setTocSections([]);
    }
  }, [generatedContent]);

  // 스크롤 이벤트 핸들러 추가
  useEffect(() => {
    const handleScroll = () => {
      if (contentScrollRef.current) {
        const scrollTop = contentScrollRef.current.scrollTop;
        if (scrollTop > 10) {
          setHeaderShadow(true);
        } else {
          setHeaderShadow(false);
        }
      }
    };

    const scrollContainer = contentScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);

  // --- Event Handlers ---
  const handleOpenPreview = () => {
    if (!generatedContent || (!generatedContent.html && !generatedContent.sections)) {
      toast({ title: "미리보기를 표시할 수 없습니다", description: "생성된 콘텐츠가 없습니다.", variant: "destructive" }); return;
    }
    setIsPreviewOpen(true);
  };

  const handleTriggerPdfExport = async () => {
    // Export the scrollable content area
    const elementToExport = contentScrollRef.current;
    if (!elementToExport) {
        toast({ title: "PDF 내보내기 오류", description: "내보낼 콘텐츠 영역을 찾을 수 없습니다.", variant: "destructive" }); return;
    }
    await exportElementToPdf(elementToExport);
  };

  const handleScrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(`section-${sectionId}`);
    const contentArea = contentScrollRef.current;
    if (element && contentArea) {
      const offset = 20; // Offset within the scrollable container
      const elementPosition = element.offsetTop;
      contentArea.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      element.classList.add('highlight-section');
      setTimeout(() => element.classList.remove('highlight-section'), 1500);
    }
  };

  // --- Render Logic ---
  const sortedVisibleSections = React.useMemo(() => {
    if (!generatedContent?.sections || !Array.isArray(generatedContent.sections)) return [];
    return (generatedContent.sections as ProductDetailSection[])
      .filter(section => section && section.id && !hiddenSections.includes(section.id))
      .sort((a, b) => (sectionOrder[a.id] ?? getSectionOrder(a.id)) - (sectionOrder[b.id] ?? getSectionOrder(b.id)));
  }, [generatedContent?.sections, hiddenSections, sectionOrder]);

  // 섹션을 그룹화하여 목차와 콘텐츠에서 사용
  const sortedSections = React.useMemo(() => {
    if (!tocSections || tocSections.length === 0) return [];
    return [...tocSections].sort((a, b) => {
       const orderA = getSectionOrder(a.id);
       const orderB = getSectionOrder(b.id);
       return orderA - orderB;
    });
  }, [tocSections]);

  // Render nothing if handled by parent (e.g., initial placeholder, parent error)
  if (!generatedContent || error) {
     return null;
  }

  return (
    <div ref={contentContainerRef} className="flex flex-col h-[1800px]">
      {/* Main Card container for the entire right column content */}
      <Card className="shadow-lg rounded-lg overflow-hidden bg-white border border-gray-200/80 flex flex-col h-full">
        {/* Loading Indicator */}
        {isGenerating && loadingProgress < 100 && (
          <LoadingIndicator progress={loadingProgress} message={loadingMessage} />
        )}

        {/* Sticky Header Area */}
        <div className={`sticky top-0 z-10 bg-white transition-all duration-300 ${headerShadow ? 'shadow-md' : ''}`}>
          {/* Product Info Header */}
          <CardHeader className="p-4 pb-3 bg-gradient-to-r from-[#fff8fb] to-white border-b border-gray-100">
            <div className="flex items-start">
              <div className="bg-[#ff68b4] p-2 rounded-full mr-4 text-white flex-shrink-0">
                {getEmoji('product_intro') || '📦'}
              </div>
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-800">{productName}</CardTitle>
                <CardDescription className="text-sm text-gray-500 mt-1 flex items-center">
                  <span className="inline-block px-2 py-0.5 rounded-full bg-pink-50 text-pink-700 text-xs font-medium mr-2">
                    {productCategory}
                  </span>
                  <span className="text-gray-400">|</span>
                  <span className="ml-2">{targetCustomers}</span>
                </CardDescription>
                
                {/* 제품 설명 요약 */}
                {productDescription && (
                  <p className="text-sm text-gray-600 mt-2 mb-1 line-clamp-2">
                    {productDescription.length > 100 
                      ? `${productDescription.substring(0, 100)}...` 
                      : productDescription}
                  </p>
                )}
              </div>
            </div>

            {/* 키워드 태그 */}
            {productKeywords && productKeywords.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                <div className="flex items-center text-xs mr-1.5 text-gray-500 font-medium">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  키워드:
                </div>
                {productKeywords.map((keyword, index) => (
                  <span 
                    key={index} 
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-gradient-to-r from-pink-50 to-pink-100 text-pink-700 border border-pink-100"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            )}
          </CardHeader>

          {/* 목차 영역 - 디자인 개선 */}
          <div className="px-4 py-3 bg-white border-b border-gray-100">
            <div className="flex items-center mb-2">
              <div className="flex items-center bg-[#ff68b4] bg-opacity-10 text-[#ff68b4] px-2 py-0.5 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
                <span className="text-xs font-semibold">목차</span>
              </div>
            </div>
            
            {/* 목차 그리드 - 최적화된 레이아웃 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-1.5">
              {sortedSections.map((section) => (
                <a
                  key={section.id}
                  href={`#section-${section.id}`}
                  onClick={(e) => handleScrollToSection(e, section.id)}
                  className="flex items-center p-1.5 rounded-md bg-white hover:bg-pink-50 border border-gray-100 hover:border-pink-200 transition-all group text-xs"
                  title={getKoreanTitle(section.id)}
                >
                  <span className="text-[#ff68b4] mr-1.5 text-sm group-hover:scale-110 transition-transform">{getEmoji(section.id)}</span>
                  <span className="font-medium truncate text-gray-700 group-hover:text-[#ff68b4]">
                    {getKoreanTitle(section.id)}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Action Toolbar - 디자인 개선 */}
          <div className="px-4 py-3 bg-white border-b border-gray-100">
            <ActionToolbar
              handleRegenerate={handleRegenerate}
              handleOpenPreview={handleOpenPreview}
              handleExportPdf={handleTriggerPdfExport}
              isExporting={isExporting}
              generatedContent={generatedContent}
              toast={toast}
            />
          </div>
        </div>

        {/* Scrollable Content - 고정 높이와 자동 스크롤 설정 */}
        <div 
          ref={contentScrollRef} 
          className="p-4 space-y-6 overflow-y-auto flex-grow styled-scrollbar"
          style={{ 
            height: "calc(100% - 30px)",
            overflowY: 'auto',
            scrollbarWidth: 'thin',
            scrollBehavior: 'smooth'
          }}
        >
          {sortedVisibleSections.length === 0 ? (
            // 섹션이 없을 경우 빈 상태 표시
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-pink-50 p-4 rounded-full mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-lg font-semibold text-gray-700 mb-2">생성된 섹션이 없습니다</p>
              <p className="text-sm text-gray-500">섹션을 재생성하거나 새로운 상세페이지를 생성해 보세요.</p>
            </div>
          ) : (
            // 섹션 목록 표시
            sortedVisibleSections.map((section) => (
              <ProductSection
                key={section.id} section={section} isEditing={isEditing[section.id]}
                editedContent={editedContent[section.id]} textareaRef={(ref) => { textareaRefs.current[section.id] = ref; }}
                targetCustomers={targetCustomers} productCategory={productCategory} draggedSection={draggedSection}
                onDragStart={() => handleDragStart(section.id)} onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, section.id)} onDragLeave={(e) => handleDragLeave(e, section.id)}
                onDrop={(e) => handleDrop(e, section.id)} onHide={() => handleHideSection(section.id)}
                onStartEdit={() => handleStartEdit(section.id, section.content)} onCancelEdit={() => handleCancelEdit(section.id)}
                onSaveEdit={() => handleSaveEdit(section.id)} onEditChange={(content) => setEditedContent(prev => ({ ...prev, [section.id]: content }))}
                onRegenerate={() => handleRegenerateSection(section.id)}
                isFAQ={section.id === 'faq'}
              />
            ))
          )}
        </div>
      </Card>

      {/* Preview Modal */}
      <div ref={previewContentRef}>
        <PreviewModal
          isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)}
          generatedContent={generatedContent} hiddenSections={hiddenSections} sectionOrder={sectionOrder}
          targetCustomers={targetCustomers} productCategory={productCategory}
          onExportPdf={handleTriggerPdfExport} isExporting={isExporting} productName={productName}
        />
      </div>

      {/* Mobile Info Panel remains outside */}
      <MobileInfoPanel
        productName={productName} productCategory={productCategory} productDescription={productDescription}
        targetCustomers={targetCustomers} productKeywords={productKeywords}
      />
    </div>
  );
};

export default GeneratedContentViewer;
