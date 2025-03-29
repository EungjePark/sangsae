import React, { useRef } from 'react';
import { Button } from '@/components/ui/button'; // Assuming path
import { Loader2, Download, AlertCircle, X } from 'lucide-react';
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
                {renderSection(section, targetCustomers, productCategory)}
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
      <div className="bg-white rounded-lg shadow-xl max-w-4xl h-[90vh] w-full flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-gray-800 truncate pr-4">
            {productName || '상품 상세 미리보기'}
          </h2>
          <div className="flex items-center space-x-2">
            {/* PDF Download Button */}
            <Button
              onClick={onExportPdf}
              disabled={isExporting || !generatedContent} // Disable if exporting or no content
              className="bg-[#ff68b4] hover:bg-[#ff45a8] text-white"
              size="sm"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>PDF 생성 중...</span>
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  <span>PDF 다운로드</span>
                </>
              )}
            </Button>
            {/* Close Button */}
            <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
               <X className="h-5 w-5 text-gray-500"/>
            </Button>
          </div>
        </div>

        {/* Modal Body - Scrollable Content */}
        <div className="p-6 overflow-y-auto flex-grow">
          <div ref={previewRef}> {/* Attach ref to the content wrapper */}
            {renderPreviewContent()}
          </div>
        </div>
      </div>
    </div>
  );
};
