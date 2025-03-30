import React, { useRef } from 'react';
import { Button } from '@/components/ui/button'; // Assuming path
import { Loader2, Download, AlertCircle, X, EyeIcon } from 'lucide-react';
import { type ProductDetailContent, type ProductDetailSection, type ProductCategory } from '@/types/product'; // Assuming path
import { getSectionOrder, getEmoji } from '../utils/sectionHelpers';
import { getKoreanTitle } from '@/lib/sections/section-manager'; // Assuming path
import { renderSection } from '../utils/renderHelpers';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  generatedContent: ProductDetailContent | null;
  hiddenSections: string[];
  sectionOrder: Record<string, number>;
  targetCustomers: string;
  productCategory: ProductCategory;
  onExportPdf: () => Promise<void>; // Function to trigger PDF export
  isExporting: boolean; // Flag indicating if PDF export is in progress
  productName: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  generatedContent,
  hiddenSections,
  sectionOrder,
  targetCustomers,
  productCategory,
  onExportPdf,
  isExporting,
  productName,
}) => {
  const previewRef = useRef<HTMLDivElement | null>(null); // Ref for the content area to potentially export

  if (!isOpen) {
    return null;
  }

  // Determine the content to render inside the modal
  const renderPreviewContent = () => {
    if (generatedContent?.html) {
      // Render HTML content if available
      return (
        <div
          className="generated-html-preview prose prose-sm max-w-none" // Basic typography styling
          dangerouslySetInnerHTML={{ __html: generatedContent.html }}
          style={{
            fontSize: '16px', // Example styles, adjust as needed
            lineHeight: '1.6',
            color: '#333'
          }}
        />
      );
    } else if (generatedContent?.sections && generatedContent.sections.length > 0) {
      // Render sections if HTML is not available but sections are
      const sectionsToRender = (generatedContent.sections as ProductDetailSection[])
        .filter(section => section && !hiddenSections.includes(section.id)) // Ensure section exists before filtering
        .sort((a, b) => {
          const orderA = sectionOrder[a.id] ?? getSectionOrder(a.id);
          const orderB = sectionOrder[b.id] ?? getSectionOrder(b.id);
          return orderA - orderB;
        });

      return (
        <div className="generated-sections-preview max-w-3xl mx-auto space-y-10"> {/* 섹션 간격 증가 */}
          {sectionsToRender.map((section) => (
            <div key={section.id} className={`section-container p-6 mb-8 rounded-xl shadow-sm ${section.id === 'faq' ? 'bg-white' : 'bg-white'} border-0 hover:shadow-md transition-all`}>
              {/* Section Header - 애플 스타일 적용 */}
              <div className="section-header flex items-center mb-6 pb-4">
                <span className="mr-3 text-xl bg-[#f5f5f7] p-2.5 rounded-xl text-[#1d1d1f]">{getEmoji(section.id)}</span>
                <h3 className="text-xl font-semibold text-[#1d1d1f]">
                  {getKoreanTitle(section.id)}
                </h3>
              </div>
              {/* Section Content - 여백 증가 */}
              <div className="section-content px-3 pt-2">
                {renderSection(section.content, targetCustomers, productCategory)}
              </div>
            </div>
          ))}
        </div>
      );
    } else {
      // Render fallback message if no content is available
      return (
        <div className="flex flex-col items-center justify-center p-10 text-center">
          <AlertCircle className="h-12 w-12 text-yellow-500 mb-4" />
          <p className="text-xl font-medium text-gray-700 mb-2">
            미리보기할 콘텐츠가 없습니다
          </p>
          <p className="text-gray-500">
            상세페이지 생성을 먼저 진행해주세요.
          </p>
        </div>
      );
    }
  };

  return (
    // Modal backdrop and container
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl h-[90vh] w-full flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-gray-100/80 bg-gradient-to-r from-[#fff8fc] via-white to-white flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-gradient-to-r from-pink-500 to-pink-400 p-2 rounded-lg mr-3 text-white shadow-sm">
              <EyeIcon className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              미리보기
              <span className="ml-2 text-xs font-normal px-2 py-0.5 bg-pink-50 text-pink-600 rounded-md">
                {productName}
              </span>
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button 
              onClick={onExportPdf} 
              disabled={isExporting}
              variant="outline" 
              size="sm"
              className="border-pink-100 hover:border-pink-300 bg-white hover:bg-pink-50/80 text-gray-700 text-sm shadow-sm rounded-lg px-3 h-9 transition-colors duration-200"
            >
              {isExporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin text-pink-500" />
                  생성 중...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2 text-pink-500" />
                  PDF 저장
                </>
              )}
            </Button>
            <Button 
              onClick={onClose}
              size="sm" 
              variant="ghost" 
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100/70 rounded-lg h-9 w-9 p-0 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">닫기</span>
            </Button>
          </div>
        </div>

        <div 
          ref={previewRef} 
          className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-gray-50/50"
          style={{
            scrollbarWidth: 'thin',
            scrollbarColor: '#f0f0f0 transparent'
          }}
        >
          {generatedContent ? (
            generatedContent.html ? (
              // HTML 콘텐츠가 있는 경우
              <div 
                className="prose prose-pink max-w-4xl mx-auto bg-white p-8 shadow-md rounded-xl border border-gray-100/80"
                dangerouslySetInnerHTML={{ __html: generatedContent.html }}
              />
            ) : generatedContent.sections && generatedContent.sections.length > 0 ? (
              // 섹션 콘텐츠가 있는 경우
              <div className="max-w-4xl mx-auto space-y-8 bg-white p-8 shadow-md rounded-xl border border-gray-100/80">
                {/* 제품 헤더 */}
                <div className="pb-4 mb-6 border-b border-gray-100">
                  <div className="flex items-center mb-3">
                    <span className="px-2 py-0.5 text-xs font-medium bg-pink-50 text-pink-600 rounded-md mr-2">
                      {productCategory}
                    </span>
                    <span className="text-gray-500 text-sm">{targetCustomers}</span>
                  </div>
                  <h1 className="text-2xl font-bold text-gray-800">{productName || '제품명'}</h1>
                </div>
                
                {/* 섹션 컨텐츠 */}
                {generatedContent.sections
                  .filter(section => !hiddenSections.includes(section.id))
                  .sort((a, b) => {
                    const aOrder = sectionOrder[a.id] || 999;
                    const bOrder = sectionOrder[b.id] || 999;
                    return aOrder - bOrder;
                  })
                  .map(section => (
                    <div key={section.id} className="mt-8 first:mt-0">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-gradient-to-r from-pink-500 to-pink-400 rounded-lg text-white shadow-sm">
                          {getEmoji(section.id)}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-800">
                          {section.title}
                        </h2>
                      </div>
                      <div className="prose prose-pink max-w-none mt-4">
                        {renderSection(section.content, targetCustomers, productCategory)}
                      </div>
                    </div>
                  ))
                }
              </div>
            ) : (
              // 콘텐츠가 없는 경우
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="bg-pink-50 p-4 rounded-full mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-pink-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-lg font-semibold text-gray-700 mb-2">생성된 내용이 없습니다</p>
                <p className="text-sm text-gray-500">콘텐츠를 생성한 후 다시 시도해 주세요.</p>
              </div>
            )
          ) : (
            // 로딩 중 상태
            <div className="flex flex-col items-center justify-center h-full py-12">
              <Loader2 className="h-10 w-10 animate-spin text-pink-400 mb-4" />
              <p className="text-sm text-gray-500">미리보기를 준비하고 있습니다...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
