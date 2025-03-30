import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { type ProductDetailContent, type ProductDetailSection, type ProductCategory } from '@/types/product';
import { getSectionOrder, getEmoji } from './utils/sectionHelpers';
import { Separator } from '@/components/ui/separator';
import { getKoreanTitle, getCategoryDisplayName } from '@/lib/sections/section-manager';
import { Loader2, FileText, AlertCircle, Copy, Check, Tag as TagIcon, Bookmark, Key, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ClipboardButton } from '@/components/ui/clipboard-button';

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
import { useProductStore } from '@/lib/store/productStore';
import { renderSection } from './utils/renderHelpers';
import { copyToClipboard } from './utils/clipboardUtils';

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
  const [copied, setCopied] = useState(false);

  // --- Custom Hooks ---
  const {
    handleDragStart, handleDragEnd, handleDragOver, handleDragLeave, handleDrop, handleHideSection,
  } = useSectionManagement(draggedSection, setDraggedSection, hiddenSections, setHiddenSections, sectionOrder, setSectionOrder, toast);

  // 새로운 useContentEditing 훅 사용 - 매개변수 없이 호출
  const {
    editedContent,
    isEditing,
    editingSection,
    startEditing,
    cancelEditing,
    updateEditedContent,
    saveEdit,
    regenerateSection,
  } = useContentEditing();

  // 로컬 편집 상태 관리 (기존 코드와의 호환을 위해)
  const [localEditedContent, setLocalEditedContent] = useState<Record<string, string>>({});

  // Internal loading state specifically for section regeneration might be useful
  const { loadingProgress, loadingMessage } = useLoading(isGenerating, generatedContent);

  const { isExporting, exportElementToPdf } = usePdfExport({ toast, fileName: `${productName || '상품'}_상세페이지.pdf` });

  // --- Effects ---
  useEffect(() => {
    if (generatedContent?.sections && Array.isArray(generatedContent.sections)) {
      // 섹션 ID를 한글 제목으로 직접 매핑
      const newTocSections = generatedContent.sections
        .filter(s => s && s.id && s.id !== 'faq')
        .map(s => {
          // 섹션 ID에서 숫자만 있는 경우를 처리
          const sectionId = s.id;
          const koreanTitle = getKoreanTitle(sectionId);
          
          return {
            id: sectionId,
            title: koreanTitle || s.title || `섹션 ${sectionId}` // 한글 제목 없으면 대체 텍스트 사용
          };
        });
      
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

  // 섹션 편집 시작 처리 - 새로운 훅 API에 맞게 업데이트
  const handleStartSectionEdit = (sectionId: string, content: string) => {
    startEditing(sectionId, content);
  };

  // 섹션 콘텐츠 변경 처리
  const handleEditChange = (content: string) => {
    updateEditedContent(content);
  };

  // 복사 버튼 처리 함수
  const handleCopy = (text: string) => {
    copyToClipboard(text);
    setCopied(true);
    toast({ 
      title: "복사 완료", 
      description: "내용이 클립보드에 복사되었습니다.", 
      variant: "default" 
    });
    
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  // 제품 상세 정보를 모두 합쳐 복사 가능한 텍스트 형태로 만듭니다
  const getAllContentText = () => {
    if (!generatedContent?.sections || !Array.isArray(generatedContent.sections)) return "";
    
    let allText = `${productName || '제품명'}\n`;
    allText += `카테고리: ${getCategoryDisplayName(productCategory)}\n`;
    if (productDescription) allText += `${productDescription}\n\n`;
    if (productKeywords && productKeywords.length > 0) allText += `키워드: ${productKeywords.join(', ')}\n\n`;
    
    generatedContent.sections
      .filter(section => section && section.id && !hiddenSections.includes(section.id))
      .sort((a, b) => (sectionOrder[a.id] ?? getSectionOrder(a.id)) - (sectionOrder[b.id] ?? getSectionOrder(b.id)))
      .forEach(section => {
        if (section.title) allText += `## ${section.title}\n`;
        if (section.content) allText += `${section.content}\n\n`;
      });
    
    return allText;
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
    <div ref={contentContainerRef} className="flex flex-col h-full">
      {/* Main Card container for the entire right column content */}
      <Card className="flex h-full flex-col overflow-hidden border-0 shadow-sm rounded-xl">
        {/* Card Header with Product Name & Action Buttons */}
        <CardHeader className={`bg-white p-5 border-b relative flex flex-row items-center justify-between gap-3 transition-shadow ${headerShadow ? 'shadow-md' : ''}`}>
          <div className="flex flex-col">
            <CardTitle className="text-xl font-bold text-gray-800">{productName}</CardTitle>
            <CardDescription className="text-sm text-gray-500 mt-1 flex items-center">
              <div className="px-4 py-2 rounded-lg text-gray-600 flex items-center gap-2">
                <div className="w-6 h-6 shrink-0 bg-pink-100 rounded-lg flex items-center justify-center">
                  <TagIcon className="w-3.5 h-3.5 text-[#ff68b4]" />
                </div>
                <span className="text-sm">{getCategoryDisplayName(productCategory)}</span>
              </div>
              <span className="text-gray-400">|</span>
              <span className="ml-2">{targetCustomers}</span>
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenPreview}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg border-gray-200"
            >
              <FileText className="h-4 w-4 text-gray-500" />
              <span className="sr-only">미리보기</span>
            </Button>
            
            <Button
              onClick={handleTriggerPdfExport}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-lg border-gray-200"
              disabled={isExporting}
            >
              {isExporting ? (
                <Loader2 className="h-4 w-4 text-gray-500 animate-spin" />
              ) : (
                <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 21H17C19.2091 21 21 19.2091 21 17V7C21 4.79086 19.2091 3 17 3H7C4.79086 3 3 4.79086 3 7V17C3 19.2091 4.79086 21 7 21Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 8V16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M8 12L12 16L16 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              <span className="sr-only">PDF 내보내기</span>
            </Button>
            
            <ClipboardButton 
              text={getAllContentText()}
              variant="outline"
              size="icon"
              className="h-8 w-8 p-0 rounded-lg border-gray-200"
            />
          </div>
        </CardHeader>

        {/* 제품 요약 정보 섹션 추가 */}
        <div className="bg-gradient-to-r from-pink-50 to-pink-100/50 px-6 py-4 border-b border-pink-100">
          <div className="flex flex-wrap gap-3 mb-3">
            {productKeywords && productKeywords.map((keyword, index) => (
              <Badge 
                key={index} 
                variant="outline" 
                className="bg-white text-pink-700 border-pink-200 hover:bg-pink-50 transition-colors px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap"
              >
                {keyword}
              </Badge>
            ))}
          </div>
          
          {productDescription && (
            <div className="relative mt-2 group">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-white rounded-lg shadow-sm flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-pink-500" />
                </div>
                <div className="relative flex-1">
                  <p className="text-gray-700 text-sm leading-relaxed font-medium italic">
                    "{productDescription}"
                  </p>
                  <ClipboardButton
                    text={productDescription}
                    variant="ghost" 
                    size="icon"
                    className="absolute -right-2 -top-2 h-7 w-7 p-0 rounded-full bg-white shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main content area with scrollable sections */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left sidebar with TOC */}
          <div className="w-52 border-r border-gray-100 bg-white hidden md:block">
            <ScrollArea className="h-full px-4 py-4">
              <h3 className="font-semibold text-gray-700 mb-3 text-sm">목차</h3>
              <ul className="space-y-1">
                {sortedSections.map((section, index) => (
                  <li key={index}>
                    <a
                      href={`#section-${section.id}`}
                      onClick={(e) => handleScrollToSection(e, section.id)}
                      className={`
                        block py-2 px-3 text-sm rounded-lg transition-colors
                        ${hiddenSections.includes(section.id) ? 'text-gray-400 line-through' : 'text-gray-700 hover:bg-pink-50/50 hover:text-pink-700'}
                      `}
                    >
                      {section.title}
                    </a>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>

          {/* Right content area with sections */}
          <div className="flex-1 relative">
            {isGenerating && (
              <LoadingIndicator
                progress={loadingProgress}
                message={loadingMessage}
              />
            )}

            <ScrollArea className="h-full" ref={contentScrollRef}>
              <div className="px-6 py-6 space-y-6">
                {sortedVisibleSections.length > 0 ? (
                  sortedVisibleSections.map((section) => (
                    <ProductSection
                      key={section.id}
                      section={section}
                      isEditing={editingSection === section.id ? (isEditing || false) : false}
                      editedContent={editingSection === section.id ? (editedContent || '') : ''}
                      targetCustomers={targetCustomers}
                      productCategory={productCategory}
                      draggedSection={draggedSection}
                      textareaRef={(ref) => {/* 더 이상 사용하지 않음 */}}
                      onDragStart={() => handleDragStart(section.id)} 
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => handleDragOver(e, section.id)} 
                      onDragLeave={(e) => handleDragLeave(e, section.id)}
                      onDrop={(e) => handleDrop(e, section.id)} 
                      onHide={() => handleHideSection(section.id)}
                      onStartEdit={() => handleStartSectionEdit(section.id, section.content)} 
                      onCancelEdit={cancelEditing}
                      onSaveEdit={() => saveEdit(section.id, generatedContent, setGeneratedContent)}
                      onEditChange={handleEditChange}
                      onRegenerate={() => regenerateSection(section.id, generatedContent, handleRegenerate)} 
                      isFAQ={section.id === 'faq'}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-10">
                    <div className="w-16 h-16 bg-pink-50 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-pink-300" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">섹션이 없습니다</h3>
                    <p className="text-sm text-gray-500 max-w-md text-center">
                      모든 섹션이 숨겨져 있습니다. 표시할 섹션을 설정하시려면 섹션 관리 옵션을 사용하세요.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </Card>

      {/* Preview modal */}
      <div ref={previewContentRef}>
        {isPreviewOpen && (
          <PreviewModal
            isOpen={isPreviewOpen} 
            onClose={() => setIsPreviewOpen(false)}
            generatedContent={generatedContent} 
            hiddenSections={hiddenSections} 
            sectionOrder={sectionOrder}
            targetCustomers={targetCustomers} 
            productCategory={productCategory}
            onExportPdf={handleTriggerPdfExport} 
            isExporting={isExporting} 
            productName={productName}
          />
        )}
      </div>

      {/* Mobile Info Panel remains outside */}
      <MobileInfoPanel
        productName={productName} 
        productCategory={productCategory} 
        productDescription={productDescription}
        targetCustomers={targetCustomers} 
        productKeywords={productKeywords}
      />
    </div>
  );
};

export default GeneratedContentViewer;
