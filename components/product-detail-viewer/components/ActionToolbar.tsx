import React from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Eye, Download, Loader2 } from 'lucide-react';
import { type ProductDetailContent } from '@/types/product';
import { toast } from '@/hooks/use-toast'; // toast 함수 임포트

interface ActionToolbarProps {
  handleRegenerate: () => void;
  handleOpenPreview: () => void;
  handleExportPdf: () => void;
  isExporting: boolean;
  generatedContent: ProductDetailContent;
  toast: typeof toast; // toast 함수의 타입으로 정의
}

export const ActionToolbar: React.FC<ActionToolbarProps> = ({
  handleRegenerate,
  handleOpenPreview,
  handleExportPdf,
  isExporting,
  generatedContent,
  toast
}) => {
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-3">
          <Button
            onClick={handleRegenerate}
            variant="outline"
            size="sm"
            className="h-9 px-3 text-gray-600 hover:text-[#ff68b4] hover:bg-[#fff8fb] hover:border-pink-200 transition-colors shadow-sm"
            title="상세페이지를 새로 생성합니다"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            전체 재생성
          </Button>
          
          <Button
            onClick={handleOpenPreview}
            variant="outline"
            size="sm"
            className="h-9 px-3 text-gray-600 hover:text-[#ff68b4] hover:bg-[#fff8fb] hover:border-pink-200 transition-colors shadow-sm"
            title="전체 상세페이지를 한 번에 봅니다"
          >
            <Eye className="h-4 w-4 mr-2" />
            미리보기
          </Button>
        </div>
        
        <div>
          <Button
            onClick={handleExportPdf}
            variant="outline"
            size="sm"
            className="h-9 px-3 text-gray-600 hover:text-[#ff68b4] hover:bg-[#fff8fb] hover:border-pink-200 transition-colors shadow-sm"
            disabled={isExporting}
            title="상세페이지를 PDF 파일로 저장합니다"
          >
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                내보내는 중...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                PDF 내보내기
              </>
            )}
          </Button>
        </div>
      </div>
      
      {generatedContent.tokenUsage && (
        <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
          <div className="flex items-center space-x-4 text-xs text-gray-400">
            <div>
              <span className="font-medium text-gray-500">처리 토큰:</span> {generatedContent.tokenUsage.input + generatedContent.tokenUsage.output}
            </div>
            {/* generationTime 속성이 없을 수 있으므로 조건부로 렌더링 */}
            {(generatedContent as any).generationTime && (
              <div>
                <span className="font-medium text-gray-500">소요 시간:</span> {((generatedContent as any).generationTime).toFixed(2)}초
              </div>
            )}
          </div>
          
          <div className="text-xs text-gray-400">
            <a 
              href="https://docs.google.com/forms/d/e/1FAIpQLScF-kgXGVNxNSD4ZQA4XVQQXtZ6NwMQqQZt-GAyf8VMdDcLYg/viewform?usp=sf_link" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#ff68b4] hover:underline transition-colors"
            >
              피드백 보내기
            </a>
          </div>
        </div>
      )}
    </div>
  );
};
